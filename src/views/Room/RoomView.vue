<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { useRoomStore } from "@/stores/RoomStore";
import { APIInstance } from "@/utils/Axios";
import { useNotificationStore } from "@/stores/NotificationStore";
import { useCommonStore } from "@/stores/CommonStore";
import ChannelModalComponent from "@/components/modals/ChannelModalComponent.vue";
import SettingIcon from "@/icons/SettingIcon.vue";
import UserIcon from "@/icons/UserIcon.vue";
import DeleteIcon from "@/icons/DeleteIcon.vue";
import ExitIcon from "@/icons/ExitIcon.vue";
import Hashtag from "@/icons/HashtagIcon.vue";
import { useChannelStore } from "@/stores/ChannelStore";
import PencilIcon from "@/icons/PencilIcon.vue";
import CopyIcon from "@/icons/CopyIcon.vue";
import UserModalComponent from "@/components/modals/UserModalComponent.vue";

const rooms = storeToRefs(useRoomStore()).rooms;
const commonData = useCommonStore();

const roomID = computed(() => {
  return useRoute().params.roomID.toString();
});

const channels = computed(() => {
  return useRoomStore().getRoomChannels(roomID.value);
});

const channelsRef = ref();

const members = computed(() => {
  return useRoomStore().getRoomMembers(roomID.value);
});

const toChannel = (channelID: string) => {
  return {
    name: "Channel",
    params: { channelID },
  };
};

const userModal = ref({
  show: false,
  userID: "",
});

const channelModal = ref({
  show: false,
  channelID: "",
});

onMounted(() => {});

const getProfilePic = (uid: string) => {
  return members.value[uid].profilePic ?? "/icons/User.svg";
};

const copyChannel = async (channelID: string) => {
  try {
    await navigator.clipboard.writeText(
      (document.querySelector(`[channelid="${channelID}"]`) as HTMLElement)
        .innerText
    );
    useNotificationStore().pushAlert({
      type: "info",
      message: "Channel copied to clipboard",
    });
  } catch {
    useNotificationStore().pushAlert({
      type: "error",
      message: "Couldn't copy channel to clipboard",
    });
    return;
  }
};

const openRoomOptions = () => {
  const roomOwner =
    useRoomStore().rooms[roomID.value].creatorID ==
    commonData.activeUserData?.id;

  useCommonStore().showModal([
    {
      condition: () => roomOwner,
      action: generateInvite,
      icon: UserIcon,
      title: "Invite people",
    },
    {
      condition: () => roomOwner,
      action: async () => {
        channelModal.value.show = true;
      },
      icon: Hashtag,
      title: "Create channel",
    },
    {
      condition: () => roomOwner,
      action: async () => await useRoomStore().deleteRoom(roomID.value),
      icon: DeleteIcon,
      title: "Delete room",
    },
    {
      condition: () => !roomOwner,
      action: async () => await useRoomStore().leaveRoom(roomID.value),
      icon: ExitIcon,
      title: "Leave room",
    },
  ]);
};

const openChannelOptions = (channelID: string) => {
  const roomOwner =
    useRoomStore().rooms[roomID.value].creatorID ==
    commonData.activeUserData?.id;

  useCommonStore().showModal([
    {
      condition: () => true,
      action: async () => await copyChannel(channelID),
      icon: CopyIcon,
      title: "Copy channel name",
    },
    {
      condition: () => roomOwner,
      action: async () => {
        channelModal.value.channelID = channelID;
        channelModal.value.show = true;
      },
      icon: PencilIcon,
      title: "Edit channel",
    },
    {
      condition: () => roomOwner,
      action: async () => await useChannelStore().deleteChannel(channelID),
      icon: DeleteIcon,
      title: "Delete channel",
    },
  ]);
};

const generateInvite = async () => {
  try {
    const res = await APIInstance.request({
      method: "POST",
      url: `/invites/create/${roomID.value}`,
    });
    const invite = res.data.invite;
    await navigator.clipboard.writeText(invite.code);
    useNotificationStore().pushAlert({
      type: "info",
      message: "Invite code copied to clipboard",
    });
  } catch (_) {
    return;
  }
};
</script>

<template>
  <div class="room">
    <nav class="room-nav">
      <div class="head">
        <h2 class="name no-txt-overflow">{{ rooms[roomID]?.name }}</h2>
        <SettingIcon
          class="room-settings"
          @click="openRoomOptions"
        ></SettingIcon>
        <ChannelModalComponent
          :channelID="channelModal.channelID"
          :roomID="roomID"
          :show="channelModal.show"
          @close="
            () => {
              channelModal.channelID = '';
              channelModal.show = false;
            }
          "
        ></ChannelModalComponent>
      </div>
      <div class="channels" ref="channelsRef">
        <RouterLink
          :to="toChannel(index.toString())"
          class="channel no-txt-overflow"
          v-for="(item, index) in channels"
          :key="index"
          :channelID="index"
          @contextmenu="openChannelOptions(item.id)"
        >
          <Hashtag class="channel-tag"></Hashtag>
          {{ item.name }}
        </RouterLink>
      </div>
    </nav>
    <RouterView v-if="useRoute().params['channelID']"></RouterView>
    <div class="fill" v-else />
    <div class="room-members">
      <div
        class="member"
        v-for="(item, index) in members"
        :key="index"
        :memberID="index"
        @click="
          () => {
            userModal.show = true;
            userModal.userID = item.id;
          }
        "
      >
        <div class="member-image">
          <img :src="getProfilePic(index.toString())" />
        </div>
        <span class="no-txt-overflow">
          {{ item.displayName }}
        </span>
      </div>
    </div>
    <UserModalComponent
      :show="userModal.show"
      :userID="userModal.userID"
      @close="
        () => {
          userModal.show = false;
          userModal.userID = '';
        }
      "
    ></UserModalComponent>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.room {
  display: grid;
  grid-template-columns: auto 1fr auto;
  width: 100%;
  height: 100%;
  margin: 0 auto;

  .room-nav {
    width: 7rem;
    background: @background-light;
    display: flex;
    flex-direction: column;
    box-shadow: 5px 3px 5px @background;
    z-index: 10;

    .head {
      padding: 0.3rem;
      display: flex;
      justify-content: space-between;
      column-gap: 0.5rem;
      box-shadow: 5px 3px 5px @background;
      height: 1.5rem;

      .room-settings {
        padding: 0.1rem;
        width: 0.8rem;
        height: 0.8rem;
        min-width: 0.8rem;
        min-height: 0.8rem;
        cursor: pointer;
      }

      .name {
        font-size: 0.5rem;
        font-weight: 600;
      }
    }

    .channels {
      display: flex;
      flex-direction: column;
      padding: 0.3rem 0.2rem;

      .channel {
        width: 100%;
        padding: 0.2rem 0.2rem;
        cursor: pointer;
        font-size: 0.49rem;
        border-radius: 5px;
        transition: 0.2s ease all;
        display: flex;
        column-gap: 0.2rem;
        align-items: center;
        color: @foreground;

        &:hover {
          background: @background;
        }

        .channel-tag {
          width: 0.5rem;
          height: 0.5rem;
          min-width: 0.5rem;
          min-height: 0.5rem;
        }
      }
    }
  }
  .room-members {
    width: 7.5rem;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 0.3rem 0.1rem;
    box-shadow: -5px 0px 5px @background;

    .member {
      padding: 0.1rem 0.2rem;
      cursor: pointer;
      font-size: 0.45rem;
      border-radius: 5px;
      display: flex;
      align-items: center;
      column-gap: 0.5em;
      transition: 0.2s ease all;

      .member-image {
        width: 1.1rem;
        height: 1.1rem;
        min-width: 1.1rem;
        min-height: 1.1rem;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 1000px;
        }
      }

      &:hover {
        background: @background;
      }
    }
  }
}
</style>
