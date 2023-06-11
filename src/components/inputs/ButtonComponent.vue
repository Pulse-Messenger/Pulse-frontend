// custom button component for use in forms
<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean;
  class?: string | {};
}>();
</script>

<template>
  <button :class="props.class" :disabled="props.disabled">
    <slot></slot>
  </button>
</template>

<style lang="less" scoped>
@import "@/assets/base.less";

button {
  border-radius: @border-r-small;
  padding: @padding-large;
  border: 2px solid @accent-s;
  width: 100%;
  transition: @transition-all-fast;
  cursor: pointer;

  &:hover {
    border: 2px solid @accent;
  }

  &:disabled {
    border: 2px solid @background-light;
    cursor: auto;
  }

  @keyframes waitingAnim {
    0% {
      background-position: 10% 0%;
    }
    50% {
      background-position: 91% 100%;
    }
    100% {
      background-position: 10% 0%;
    }
  }

  &.waiting {
    animation: waitingAnim 3s ease-in-out infinite;
    background-size: 200% 200%;
    background-image: linear-gradient(90deg, @accent, @accent-s);
    border: none;
  }

  font-weight: @font-w-normal;
  font-size: @font-s-medium;
  outline: none;
  background: none;
  color: @foreground;
}
</style>
