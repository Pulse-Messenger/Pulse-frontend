<script setup lang="ts">
import CircleIcon from "@/icons/CircleIcon.vue";

const props = defineProps<{
  active: boolean;
  title: string;
}>();

const emit = defineEmits<{
  (e: "select"): void;
}>();
</script>

<template>
  <div class="pickme" @click="emit('select')">
    <div>{{ title }}</div>
    <CircleIcon class="hit" :class="{ active }"></CircleIcon>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/base.less";

.pickme {
  cursor: pointer;
  background: @background;
  border-radius: @border-r-small;
  display: flex;
  justify-content: space-between;
  padding: @padding-tiny 0.5rem;
  font-size: @font-s-xlarge;
  color: @foreground;
  align-items: center;

  .hit {
    height: 0.8rem;
    width: 0.8rem;
  }

  :deep(.hit.active) {
    fill: @accent;
  }
}
</style>
