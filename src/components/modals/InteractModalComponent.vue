<script setup lang="ts">
import { onMounted, watch, ref, nextTick, onUnmounted } from "vue";

import { useModalStore } from "@/stores/ModalStore";

const modalData = useModalStore().interactModalData;

const modal = ref<HTMLElement>();
const mousePos = ref({
  x: 0,
  y: 0,
});

watch(modalData, async () => {
  if (!modalData.show) return;

  await nextTick();

  const screen = { w: window.innerWidth, h: window.innerHeight };

  modal.value!.style.top = mousePos.value.y + "px";
  modal.value!.style.left = mousePos.value.x + "px";

  if (modal.value!.offsetWidth + modal.value!.offsetLeft > screen.w)
    modal.value!.style.left =
      mousePos.value.x - modal.value!.offsetWidth + "px";

  if (modal.value!.offsetHeight + modal.value!.offsetTop > screen.h)
    modal.value!.style.top =
      mousePos.value.y - modal.value!.offsetHeight + "px";
});

const mouseDown = (evt: any) => {
  mousePos.value.x = evt.clientX;
  mousePos.value.y = evt.clientY;

  if (!modalData.show) return;

  if (
    evt.clientX > modal.value!.offsetLeft + modal.value!.offsetWidth ||
    evt.clientX < modal.value!.offsetLeft ||
    evt.clientY > modal.value!.offsetTop + modal.value!.offsetHeight ||
    evt.clientY < modal.value!.offsetTop
  ) {
    useModalStore().hideModal("interact");
  }
};

const mouseMove = (evt: any) => {
  mousePos.value.x = evt.clientX;
  mousePos.value.y = evt.clientY;
};

onMounted(() => {
  document.addEventListener("mousedown", mouseDown);
  document.addEventListener("mousemove", mouseMove);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", mouseDown);
  document.removeEventListener("mousemove", mouseMove);
});
</script>

<template>
  <Transition>
    <div class="interact-modal" ref="modal" v-show="modalData.show">
      <div
        class="option"
        v-for="(option, index) in modalData.options"
        :key="index"
        @click="
          option.action();
          modalData.show = false;
        "
      >
        <div>{{ option.title }}</div>
        <component :is="option.icon"></component>
      </div>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.interact-modal {
  position: absolute;
  z-index: 1000;
  background: @background-light;
  display: flex;
  flex-direction: column;
  padding: 0.2rem;
  border-radius: 5px;
  box-shadow: 4px 4px 10px @special;
  width: 6rem;
  row-gap: 0.1rem;

  .option {
    padding: 0.2rem 0.2rem;
    text-align: left;
    font-size: 0.4rem;
    border-radius: 5px;
    cursor: pointer;
    transition: 0.2s ease all;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    :deep(svg) {
      width: 0.6rem;
      height: 0.6rem;
      min-width: 0.6rem;
      min-height: 0.6rem;

      * {
        fill: @accent;
      }
    }
  }

  .option:hover {
    background: @background;
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
