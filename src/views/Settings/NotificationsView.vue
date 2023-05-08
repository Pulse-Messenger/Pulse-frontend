<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";

import SubcategoryComponent from "@/components/settings/SubcategoryComponent.vue";
import { useActiveUserStore } from "@/stores/ActiveUserStore";
import type { Setting } from "@/stores/CommonStore";

const preferences = storeToRefs(useActiveUserStore()).userPreferences;
const unsaved = storeToRefs(useActiveUserStore()).unsavedPreferences;

const waiting = ref(false);

const subcategories: { [key: string]: Setting[] } = {
  "Do not disturb": [
    {
      title: "On",
      type: "pickMe",
      pickMeData: {
        active: () => preferences.value?.notifications.doNotDisturb,
        eventCallback: () =>
          (preferences.value!.notifications.doNotDisturb = true),
      },
    },
    {
      title: "Off",
      type: "pickMe",
      pickMeData: {
        active: () => !preferences.value?.notifications.doNotDisturb,
        eventCallback: () =>
          (preferences.value!.notifications.doNotDisturb = false),
      },
    },
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
