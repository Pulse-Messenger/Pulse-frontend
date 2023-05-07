<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";

import FriendsIcon from "@/icons/FriendsIcon.vue";
import { useRoomStore } from "@/stores/RoomStore";
import { useUserStore } from "@/stores/UserStore";
import XIcon from "@/icons/XIcon.vue";
import { useActiveUserStore } from "@/stores/ActiveUserStore";
import { useModalStore } from "@/stores/ModalStore";

const router = useRouter();
const route = useRoute();

const rooms = storeToRefs(useRoomStore()).rooms;
const DMs = storeToRefs(useRoomStore()).DMs;
const users = storeToRefs(useUserStore()).users;
const activeUserData = storeToRefs(useActiveUserStore()).activeUserData;

const DMData = (id: string) => {
  const friend =
    rooms.value.get(id)?.friendship?.friendA === activeUserData.value?.id
      ? rooms.value.get(id)?.friendship?.friendB
      : rooms.value.get(id)?.friendship?.friendA;

  return friend ?? "";
};

const removeDM = async (DMID: string) => {
  await useRoomStore().deleteRoom(DMID);
};

const toDM = async (DMID: string) => {
  router.push({
    name: "DM",
    params: { DMID },
  });
};
</script>

<template>
  <div class="me">
    <div class="nav">
      <RouterLink :to="{ name: 'Friends' }"
        >Friends<FriendsIcon></FriendsIcon
      ></RouterLink>
      <hr />
      <div class="DMs">
        <div
          class="DM"
          v-for="(DM, index) in DMs"
          :key="index"
          @click.stop="toDM(DM)"
        >
          <div class="member-image">
            <img
              alt="pfp"
              :src="users.get(DMData(DM))?.profilePic ?? '/icons/User.svg'"
            />
          </div>
          <span
            class="no-txt-overflow"
            :class="{ 'router-link-exact-active': route.params.DMID === DM }"
          >
            {{ users.get(DMData(DM))?.displayName ?? "Unknown user" }}
          </span>
          <XIcon
            @click.stop="
              useModalStore().showConfirmModal(
                'Are you sure you want to delete this DM?',
                () => removeDM(DM),
              )
            "
          ></XIcon>
        </div>
      </div>
    </div>
    <RouterView></RouterView>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/base.less";

.me {
  display: grid;
  grid-template-columns: auto 1fr;
  // overflow-y: auto;

  .nav {
    height: 100vh;
    width: 7rem;
    padding: 0.3rem;
    box-shadow: 5px 3px 5px @background;
    overflow-y: auto;

    hr {
      margin: 0.2rem 0;
      border: 1px solid @special;
    }

    a {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0.3rem 0.2rem;
      font-size: 0.49rem;
      border-radius: 5px;
      transition: all 0.2s ease;
      color: @foreground;

      &:hover {
        background: @background;
      }

      svg {
        height: 0.8rem;
        width: 0.8rem;
      }
    }

    .DMs {
      display: flex;
      flex-direction: column;

      .DM {
        padding: 0.1rem 0.2rem;
        cursor: pointer;
        font-size: 0.45rem;
        border-radius: 5px;
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        column-gap: 0.5em;
        transition: 0.2s ease all;

        &:hover {
          background: @background;
        }

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

        svg {
          display: none;
        }

        &:hover svg {
          display: unset;
          justify-self: flex-end;
          height: 0.6rem;
          width: 0.6rem;
        }
      }
    }
  }
}
</style>
