<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref, watch } from "vue";

import FriendsIcon from "@/icons/FriendsIcon.vue";
import { useRoomStore } from "@/stores/RoomStore";
import { useUserStore } from "@/stores/UserStore";
import XIcon from "@/icons/XIcon.vue";
import { useActiveUserStore } from "@/stores/ActiveUserStore";
import { useModalStore } from "@/stores/ModalStore";
import { useCommonStore } from "@/stores/CommonStore";

const router = useRouter();
const route = useRoute();

const rooms = storeToRefs(useRoomStore()).rooms;
const DMs = storeToRefs(useRoomStore()).DMs;
const users = storeToRefs(useUserStore()).users;
const activeUserData = storeToRefs(useActiveUserStore()).activeUserData;
const gestureData = storeToRefs(useCommonStore()).commonData.value.swipeData;

const baseFontSize = storeToRefs(useActiveUserStore()).baseFontSize;

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

const navRef = ref<HTMLElement>();

const resize = () => {
  if (baseFontSize.value === 28) {
    navRef.value!.style.position = "static";
    document.querySelector<HTMLDivElement>(".me")!.style.display = "grid";
  } else {
    navRef.value!.style.position = "absolute";
    navRef.value!.style.top = "0px";
    navRef.value!.style.left = "0px";

    document.querySelector<HTMLDivElement>(".me")!.style.display = "flex";
  }
};

watch(baseFontSize, () => {
  resize();
});

onMounted(() => {
  resize();
});
</script>

<template>
  <div class="me">
    <Transition name="left-comein">
      <div
        class="nav"
        ref="navRef"
        v-full-height
        v-show="baseFontSize === 28 || gestureData.swipedRight"
      >
        <RouterLink
          :to="{ name: 'Friends' }"
          @click.stop="useCommonStore().clearSwipe()"
          >Friends<FriendsIcon></FriendsIcon
        ></RouterLink>
        <hr />
        <div class="DMs">
          <div
            class="DM"
            v-for="(DM, index) in DMs"
            :key="index"
            @click.stop="
              toDM(DM);
              useCommonStore().clearSwipe();
            "
            @contextmenu="
              useModalStore().showConfirmModal(
                'Are you sure you want to delete this DM?',
                () => removeDM(DM),
              )
            "
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
    </Transition>
    <RouterView></RouterView>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/base.less";

.me {
  display: grid;
  grid-template-columns: auto 1fr;
  .nav {
    width: 7rem;
    padding: @padding-small;
    box-shadow: 5px 3px 5px @background;
    overflow-y: auto;
    background: @background-light;
    z-index: 1;

    hr {
      margin: 0.2rem 0;
      border: 1px solid @special;
    }

    a {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: @padding-small 0.2rem;
      font-size: @font-s-medium;
      border-radius: @border-r-small;
      transition: @transition-all-fast;
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
      row-gap: @gap-tiny;

      .DM {
        padding: @padding-mini 0.2rem;
        cursor: pointer;
        font-size: @font-s-small;
        border-radius: @border-r-small;
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        column-gap: 0.5em;
        transition: @transition-all-fast;

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
            border-radius: @border-r-circle;
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
