<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean;
  class?: string | {};
}>();

const emit = defineEmits<{
  (e: "click", value: Event): void;
}>();
</script>

<template>
  <button
    @click.once="(event) => emit('click', event)"
    :class="props.class"
    :disabled="props.disabled"
  >
    <slot></slot>
  </button>
</template>

<style lang="less" scoped>
@import "@/assets/base.less";

button {
  border-radius: 5px;
  padding: 0.45rem;
  border: 2px solid @accent-s;
  width: 100%;
  transition: all 0.2s ease;
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

  font-weight: 500;
  font-size: 0.5rem;
  outline: none;
  background: none;
  color: @foreground;
}
</style>
