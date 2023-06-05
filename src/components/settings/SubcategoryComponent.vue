<script setup lang="ts">
import SliderComponent from "@/components/inputs/SliderComponent.vue";
import PickMeComponent from "@/components/settings/PickMeComponent.vue";
import { useActiveUserStore } from "@/stores/ActiveUserStore";
import type { Setting } from "@/stores/CommonStore";
import { storeToRefs } from "pinia";

const baseFontSize = storeToRefs(useActiveUserStore()).baseFontSize;

const props = defineProps<{
  subcategories: { [key: string]: Setting[] };
}>();
</script>

<template>
  <div
    v-for="(category, catIndex) in subcategories"
    :key="catIndex"
    class="subcategory"
  >
    <h3>{{ catIndex }}</h3>
    <div class="item" v-for="(item, index) in category" :key="index">
      <PickMeComponent
        :active="item.pickMeData?.active()"
        :title="item.title"
        @select="(e) => item.pickMeData?.eventCallback(e)"
        v-if="item.type === 'pickMe'"
      >
      </PickMeComponent>
      <h4 v-if="item.type === 'slider'">{{ item.title }}</h4>
      <SliderComponent
        v-if="item.type === 'slider' && item.sliderData"
        :min="item.sliderData.min"
        :max="item.sliderData.max"
        :step="item.sliderData.step"
        :default="item.sliderData.default"
        :show-steps="baseFontSize === 28"
        @input="(v) => item.sliderData?.eventCallback(v)"
      ></SliderComponent>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/base.less";

.subcategory {
  display: flex;
  flex-direction: column;
  padding-bottom: 1rem;
  border-bottom: 2px solid @special;
  row-gap: 0.3rem;

  h4 {
    font-size: 0.6rem;
    padding-bottom: 0.5rem;
  }
}
</style>
