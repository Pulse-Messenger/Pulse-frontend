<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";

import type { Setting } from "@/stores/CommonStore";
import SubcategoryComponent from "@/components/settings/SubcategoryComponent.vue";
import { useActiveUserStore } from "@/stores/ActiveUserStore";

const preferences = storeToRefs(useActiveUserStore()).userPreferences;
const unsaved = storeToRefs(useActiveUserStore()).unsavedPreferences;

const waiting = ref(false);

const setTheme = (newTheme: "dark" | "light") => {
  preferences.value!.appearance.theme = newTheme;
};

const subcategories: { [key: string]: Setting[] } = {
  Theme: [
    {
      title: "Lavender",
      type: "pickMe",
      pickMeData: {
        active: () => preferences.value!.appearance.theme === "light",
        eventCallback: () => setTheme("light"),
      },
    },
    {
      title: "Eerie Black",
      type: "pickMe",
      pickMeData: {
        active: () => preferences.value!.appearance.theme === "dark",
        eventCallback: () => setTheme("dark"),
      },
    },
  ],
  Scale: [
    {
      title: "Global",
      type: "slider",
      sliderData: {
        eventCallback: (val: number) =>
          (preferences.value!.appearance.scale = val),
        max: 200,
        min: 50,
        step: 10,
        default: preferences.value?.appearance.scale ?? 100,
      },
    },
    // {
    //   title: "Chat",
    //   type: "slider",
    //   sliderData: {
    //     eventCallback: (val: number) =>
    //       (preferences.value!.appearance.chatScale = val),
    //     max: 200,
    //     min: 50,
    //     step: 10,
    //     default: preferences.value?.appearance.chatScale ?? 100,
    //   },
    // },
  ],
};

const save = async () => {
  waiting.value = true;
  const res = await useActiveUserStore().updatePreferences();
  waiting.value = false;
};
</script>

<template>
  <div class="category">
    <SubcategoryComponent :subcategories="subcategories"></SubcategoryComponent>
    <div class="buttons">
      <button
        class="button-small"
        :disabled="!unsaved || waiting"
        @click="save()"
      >
        Save
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.category {
  .buttons {
    display: flex;
    column-gap: 0.5rem;
  }
}
</style>
