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
  <div class="pickme" @click.once="emit('select')">
    <div>{{ title }}</div>
    <CircleIcon class="hit" :class="{ active }"></CircleIcon>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/base.less";

.pickme {
  cursor: pointer;
  background: @background;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  padding: 0.2rem 0.5rem;
  font-size: 0.6rem;
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
