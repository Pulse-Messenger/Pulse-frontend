<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import { useRoomStore } from "@/stores/RoomStore";
import { APIInstance } from "@/utils/Axios";
import { useNotificationStore } from "@/stores/NotificationStore";
import { useCommonStore } from "@/stores/CommonStore";
import ChannelModalComponent from "@/components/modals/ChannelModalComponent.vue";
import MenuIcon from "@/icons/MenuIcon.vue";
import UserIcon from "@/icons/UserIcon.vue";
import DeleteIcon from "@/icons/DeleteIcon.vue";
import ExitIcon from "@/icons/ExitIcon.vue";
import Hashtag from "@/icons/HashtagIcon.vue";
import { useChannelStore, type Channel } from "@/stores/ChannelStore";
import PencilIcon from "@/icons/PencilIcon.vue";
import CopyIcon from "@/icons/CopyIcon.vue";
import UserModalComponent from "@/components/modals/UserModalComponent.vue";
import EditRoomModalComponent from "@/components/modals/EditRoomModalComponent.vue";
import { useActiveUserStore } from "@/stores/ActiveUserStore";

const rooms = storeToRefs(useRoomStore()).rooms;
const commonStore = useCommonStore();
const activeUserStore = useActiveUserStore();

const roomID = computed(() => {
  return useRoute().params.roomID.toString();
});

const channels = computed(() => {
  const chs = useRoomStore().getRoomChannels(roomID.value);
  const categories: {
    [key: string]: {
      [id: string]: Channel;
    };
  } = {};

  chs.forEach((ch, chID) => {
    if (!categories[chs.get(chID)!.category])
      categories[chs.get(chID)!.category] = {};
    categories[chs.get(chID)!.category][chID] = chs.get(chID)!;
  });
  return categories;
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

const roomModal = ref({
  show: false,
  roomID: "",
});

const getProfilePic = (uid: string) => {
  return members.value.get(uid)?.profilePic ?? "/icons/User.svg";
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
    useRoomStore().rooms.get(roomID.value)?.creatorID ==
    activeUserStore.activeUserData?.id;

  commonStore.showModal([
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
      action: async () => (roomModal.value.show = true),
      icon: PencilIcon,
      title: "Edit room",
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
    useRoomStore().rooms.get(roomID.value)?.creatorID ==
    activeUserStore.activeUserData?.id;

  commonStore.showModal([
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
    useNotificationStore().pushAlert({
      type: "error",
      message: "Failed to create invite",
    });
  }
};
</script>

<template>
  <div class="room">
    <nav class="room-nav">
      <div class="head">
        <h2 class="name no-txt-overflow">{{ rooms.get(roomID)?.name }}</h2>
        <MenuIcon class="room-settings" @click="openRoomOptions"></MenuIcon>
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
        <div
          class="category"
          v-for="(cat, catIndex) in channels"
          :key="catIndex"
        >
          <h3>{{ catIndex ?? "none" }}</h3>
          <RouterLink
            :to="toChannel(channelIndex.toString())"
            class="channel no-txt-overflow"
            v-for="(channel, channelIndex) in cat"
            :key="channelIndex"
            :channelID="channelIndex"
            @contextmenu="openChannelOptions(channel.id)"
          >
            <Hashtag class="channel-tag"></Hashtag>
            {{ channel.name }}
          </RouterLink>
        </div>
      </div>
    </nav>
    <RouterView v-if="useRoute().params['channelID']"></RouterView>
    <div class="fill" v-else />
    <div class="room-members">
      <div
        class="member"
        v-for="(item, index) in members.values()"
        :key="index"
        :memberID="item.id"
        @click="
          () => {
            userModal.show = true;
            userModal.userID = item.id;
          }
        "
      >
        <div class="member-image">
          <img :src="getProfilePic(item.id)" />
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
    <EditRoomModalComponent
      :show="roomModal.show"
      :roomID="roomID"
      @close="roomModal.show = false"
    ></EditRoomModalComponent>
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

  ::-webkit-scrollbar {
    width: 2px;
  }

  ::-webkit-scrollbar-thumb {
    background: @special;
  }

  .room-nav {
    width: 7rem;
    height: 100vh;
    background: @background-light;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    box-shadow: 5px 3px 5px @background;
    z-index: 10;

    .head {
      padding: 0.3rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      column-gap: 0.5rem;
      box-shadow: 5px 3px 5px @background;
      height: 1.5rem;

      .room-settings {
        padding: 0.1rem;
        width: 1rem;
        height: 1rem;
        min-width: 1rem;
        min-height: 1rem;
        cursor: pointer;
      }

      .name {
        font-size: 0.5rem;
        font-weight: 600;
        height: fit-content;
      }
    }

    .channels {
      display: flex;
      flex-direction: column;
      padding: 0.3rem 0.2rem;

      .category {
        padding: 0.3rem 0;
        & > h3 {
          font-size: 0.45rem;
        }
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
