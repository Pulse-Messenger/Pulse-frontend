<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";

import { useActiveUserStore } from "@/stores/ActiveUserStore";
import { useAuthStore } from "@/stores/AuthStore";
import { useModalStore } from "@/stores/ModalStore";
import { useCommonStore } from "@/stores/CommonStore";

const activeUser = storeToRefs(useActiveUserStore()).activeUserData;

const getTimeMessage = computed(() => {
  const currentTime = new Date().getHours();

  if (currentTime >= 0 && currentTime < 12) return "Good morning";
  else if (currentTime >= 12 && currentTime < 18) return "Good afternoon";
  else return "Good evening";
});
const categories = ["Profile", "Sessions", "Appearance", "Notifications"];

const gestureData = storeToRefs(useCommonStore()).commonData.value.swipeData;

const navRef = ref<HTMLElement>();

const baseFontSize = storeToRefs(useActiveUserStore()).baseFontSize;

const resize = () => {
  if (baseFontSize.value === 28) {
    navRef.value!.style.boxShadow = "none";
    navRef.value!.style.position = "static";

    document.querySelector<HTMLDivElement>(".settings")!.style.padding = "";
    document.querySelector<HTMLDivElement>(
      ".settings",
    )!.style.gridTemplateColumns = "";
  } else {
    document.querySelector<HTMLDivElement>(".settings")!.style.padding =
      "0 1rem";
    document.querySelector<HTMLDivElement>(
      ".settings",
    )!.style.gridTemplateColumns = "1fr";

    navRef.value!.style.position = "absolute";
    navRef.value!.style.top = "0";
    navRef.value!.style.left = "0";
    navRef.value!.style.marginTop = "0";
    navRef.value!.style.boxShadow = "";
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
  <div class="settings" v-full-height>
    <Transition name="left-comein">
      <div
        class="categories"
        ref="navRef"
        v-show="baseFontSize === 28 || gestureData.swipedRight"
      >
        <RouterLink
          :to="{ name: category }"
          @click="useCommonStore().clearSwipe()"
          class="category-link"
          v-for="(category, index) in categories"
          :key="index"
          >{{ category }}</RouterLink
        >
        <hr />
        <div
          class="category-link logout"
          @click="
            useModalStore().showConfirmModal(
              'Are you sure you want to log out?',
              () => useAuthStore().logout(),
            )
          "
        >
          Log Out
        </div>
      </div>
    </Transition>
    <div class="category-content" v-full-height>
      <h1 class="no-txt-overflow">
        {{ getTimeMessage + " " }}
        <br v-if="baseFontSize !== 28" />
        <span class="name">{{ activeUser?.displayName }}</span>
      </h1>
      <RouterView class="category"></RouterView>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.settings {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 1rem;
  justify-content: center;
  width: 100%;
  padding: 0 2rem 0 3rem;
  max-width: 50rem;

  .categories {
    padding-top: 6vh !important;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: @padding-small 0.2rem;
    width: 7rem;
    background: @background-light;
    z-index: 1;
    box-shadow: 5px 3px 5px @background;

    .category-link {
      width: 100%;
      padding: @padding-tiny 0.2rem;
      cursor: pointer;
      font-size: @font-s-large;
      border-radius: @border-r-small;
      transition: @transition-all-fast;
      display: flex;
      column-gap: 0.2rem;
      align-items: center;
      color: @foreground-light;

      &:hover {
        background: @background;
      }
    }
    .logout {
      color: @accent;
    }
    hr {
      border-color: @special;
      margin: 0.3rem 0;
    }
  }

  .category-content {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: auto;
    padding-bottom: 1rem;
    padding-top: 5vh;

    .category {
      height: 100%;
      width: 100%;
    }
  }
}
</style>
