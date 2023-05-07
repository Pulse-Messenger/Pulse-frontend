<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";

import { useActiveUserStore } from "@/stores/ActiveUserStore";
import { useAuthStore } from "@/stores/AuthStore";

const activeUser = storeToRefs(useActiveUserStore()).activeUserData;

const getTimeMessage = computed(() => {
  const currentTime = new Date().getHours();

  if (currentTime >= 0 && currentTime < 12) return "Good morning";
  else if (currentTime >= 12 && currentTime < 18) return "Good afternoon";
  else return "Good evening";
});
const categories = ["Profile", "Sessions", "Appearance", "Notifications"];
</script>

<template>
  <div class="settings">
    <div class="categories">
      <RouterLink
        :to="{ name: category }"
        class="category-link"
        v-for="(category, index) in categories"
        :key="index"
        >{{ category }}</RouterLink
      >
      <hr />
      <div class="category-link logout" @click="useAuthStore().logout()">
        Log Out
      </div>
    </div>
    <div class="category-content">
      <h1 class="no-txt-overflow">
        {{ getTimeMessage + " "
        }}<span class="name">{{ activeUser?.displayName }}</span>
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
  padding: 5vh 2rem 0 3rem;
  max-width: 50rem;

  .categories {
    display: flex;
    flex-direction: column;
    padding: 0.3rem 0.2rem;
    width: 7rem;

    .category-link {
      width: 100%;
      padding: 0.2rem 0.2rem;
      cursor: pointer;
      font-size: 0.55rem;
      border-radius: 5px;
      transition: 0.2s ease all;
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
    .category {
      height: 100%;
      padding-right: 1rem;
    }
  }
}
</style>
