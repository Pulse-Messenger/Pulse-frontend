<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  type?: string;
  placeholder?: string;
  name?: string;
}>();

defineEmits<{
  (e: "input", value: string): void;
}>();

const inputRef = ref();
</script>

<template>
  <input
    ref="inputRef"
    spellcheck="false"
    :type="type ?? 'text'"
    :placeholder="placeholder ?? ''"
    :name="name ?? ''"
    @input="
        (evt: any) => {
          $emit('input', evt)
        }
      "
  />
</template>

<style scoped lang="less">
@import (less) "@/assets/base.less";

input {
  border-radius: 5px;
  padding: 0.45rem;
  border: 2px solid @accent-s;
  width: 100%;
  transition: border 0.2s ease;

  &:hover,
  &:focus {
    border: 2px solid @accent;
  }

  font-weight: 500;
  font-size: 0.5rem;
  outline: none;
  background: none;
  color: @foreground;
}
</style>
