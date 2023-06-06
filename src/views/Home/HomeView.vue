<script setup lang="ts">
import { storeToRefs } from "pinia";
import { RouterLink, useRouter } from "vue-router";

import { useRoomStore } from "@/stores/RoomStore";
import SettingIcon from "@/icons/SettingIcon.vue";
import PlusIcon from "@/icons/PlusIcon.vue";
import HouseIcon from "@/icons/HouseIcon.vue";
import { useModalStore } from "@/stores/ModalStore";
import { useCommonStore } from "@/stores/CommonStore";
import { useActiveUserStore } from "@/stores/ActiveUserStore";
import UserIcon from "@/icons/UserIcon.vue";
import HashtagIcon from "@/icons/HashtagIcon.vue";
import PencilIcon from "@/icons/PencilIcon.vue";
import DeleteIcon from "@/icons/DeleteIcon.vue";
import ExitIcon from "@/icons/ExitIcon.vue";

const router = useRouter();
const activeUserStore = useActiveUserStore();
const modalStore = useModalStore();

const rooms = storeToRefs(useRoomStore()).rooms;

const toRoom = async (roomID: string) => {
  const channel = [...useRoomStore().getRoomChannels(roomID).keys()][0];
  if (channel)
    router.push({
      name: "Channel",
      params: {
        channelID: channel,
        roomID,
      },
    });
  else
    router.push({
      name: "Room",
      params: {
        roomID,
      },
    });
};

const showRoomOptions = (roomID: string) => {
  const roomOwner =
    useRoomStore().rooms.get(roomID)?.creatorID ==
    activeUserStore.activeUserData?.id;

  modalStore.showInteractModal([
    {
      condition: () => roomOwner,
      action: () => useRoomStore().generateInvite(roomID),
      icon: UserIcon,
      title: "Invite people",
    },
    {
      condition: () => roomOwner,
      action: async () => {
        modalStore.showChannelModal(roomID);
      },
      icon: HashtagIcon,
      title: "Create channel",
    },
    {
      condition: () => roomOwner,
      action: async () => modalStore.showEditRoomModal(roomID),
      icon: PencilIcon,
      title: "Edit room",
    },
    {
      condition: () => roomOwner,
      action: async () =>
        modalStore.showConfirmModal(
          "Are you sure you want to delete this room?",
          async () => await useRoomStore().deleteRoom(roomID),
        ),
      icon: DeleteIcon,
      title: "Delete room",
    },
    {
      condition: () => !roomOwner,
      action: async () =>
        modalStore.showConfirmModal(
          "Are you sure you want to leave this room?",
          async () => await useRoomStore().leaveRoom(roomID),
        ),
      icon: ExitIcon,
      title: "Leave room",
    },
  ]);
};
</script>

<template>
  <main>
    <nav class="user-nav">
      <div class="rooms">
        <RouterLink
          class="home room-icon"
          name="home"
          :to="{ name: 'Me' }"
          @click="useCommonStore().clearSwipe()"
        >
          <HouseIcon></HouseIcon>
        </RouterLink>
        <div
          @click="
            toRoom(item);
            useCommonStore().clearSwipe();
          "
          @contextmenu="showRoomOptions(item)"
          class="room-icon"
          :class="{
            'router-link-active': $route.params.roomID === item,
          }"
          v-for="item in useRoomStore().sortedRoom"
          :key="item"
          :roomID="item"
        >
          <img
            alt="pfp"
            :src="rooms.get(item)?.profilePic ?? '/icons/Room.svg'"
          />
        </div>
      </div>
      <div class="options">
        <PlusIcon
          class="new-server"
          @click="useModalStore().showNewRoomModal()"
        ></PlusIcon>
        <RouterLink
          :to="{ name: 'Profile' }"
          name="settings"
          @click="useCommonStore().clearSwipe()"
        >
          <SettingIcon></SettingIcon>
        </RouterLink>
      </div>
    </nav>
    <RouterView></RouterView>
  </main>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

main {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  background: @background-light;

  .user-nav {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    row-gap: 0.1rem;
    box-shadow: 0 5px 5px @background;
    max-height: 100vh;
    min-width: 2.3rem;
    z-index: 11;
    background: @background-light;

    .options {
      display: flex;
      flex-direction: column;
      row-gap: 0.2rem;
      justify-content: center;
      align-items: center;
      padding: 0 0.2rem 0.2rem 0.2rem;

      & > * {
        width: 1.4rem;
        height: 1.4rem;
        cursor: pointer;
        background: @background;
        padding: 0.35em;
        border-radius: 1000px;
        display: flex;
        justify-content: center;
      }
    }

    ::-webkit-scrollbar {
      display: none;
    }

    .rooms {
      padding: 0.3rem 0.3rem 0rem 0.3rem;
      display: flex;
      flex-direction: column;
      row-gap: 0.2rem;
      overflow-y: auto;
      height: 100%;
      width: 100%;

      .home {
        padding: 0.4rem;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      @keyframes roomActive {
        0% {
          transform: translateY(-50%) scale(0.5);
          opacity: 0.5;
        }
        100% {
          transform: translateY(-50%) scale(1);
          opacity: 1;
        }
      }

      .router-link-active::after {
        width: 0.15rem;
        height: 1.4rem;
        border-radius: 0 5px 5px 0;
        background: @accent;
        left: -0.3rem;
        content: "";
        position: absolute;
        z-index: 100;
        top: 50%;
        transform: translateY(-50%);
        animation: roomActive 0.2s ease;
      }

      .room-icon {
        width: 1.6rem;
        height: 1.6rem;
        min-width: 1.6rem;
        min-height: 1.6rem;
        border-radius: 10px;
        background: @background;
        cursor: pointer;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
        }
      }
    }
  }
}
</style>
