<script setup lang="ts">
import { storeToRefs } from "pinia";

import { useModalStore } from "@/stores/ModalStore";
import { useNotificationStore } from "@/stores/NotificationStore";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useActiveUserStore } from "@/stores/ActiveUserStore";

const modalData = storeToRefs(useModalStore()).imageModalData;

const theme = storeToRefs(useActiveUserStore()).userPreferences.value
  ?.appearance.theme;

const exit = () => {
  useModalStore().hideModal("image");
};

const imageRef = ref<HTMLImageElement>();

const resize = () => {
  const scale = Math.min(
    (window.innerWidth * 0.8) / imageRef.value!.naturalWidth,
    (window.innerHeight * 0.8) / imageRef.value!.naturalHeight,
  );

  imageRef.value!.style.width = `${imageRef.value!.naturalWidth * scale}px`;
};

onMounted(() => {
  imageRef.value!.onload = () => {
    // calculate scale to fit image on screen 80%
    resize();
    imageRef.value!.style.display = "";
  };

  window.addEventListener("resize", resize);
});

onUnmounted(() => {
  window.removeEventListener("resize", resize);
});

const copyURL = async () => {
  try {
    await navigator.clipboard.writeText(modalData.value.image);
    useNotificationStore().pushAlert({
      type: "info",
      message: "Copied URL to clipboard!",
    });
  } catch (err) {
    useNotificationStore().pushAlert({
      type: "error",
      message: "Failed to copy URL to clipboard!",
    });
  }
};
</script>

<template>
  <Transition name="modal">
    <div class="new-friend-modal modal" v-show="modalData.show">
      <div class="outside" @click="exit()"></div>
      <div class="master">
        <img :src="modalData.image" alt="image" ref="imageRef" />

        <p class="copy" @click="copyURL">Copy URL</p>
      </div>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.new-friend-modal {
  display: flex;
  justify-content: center;
  align-items: center;

  .master {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    img {
      object-fit: contain;
      background: @background;
      width: 80vmin;
      border-radius: @border-r-small;
    }

    .copy {
      width: 100%;
      cursor: pointer;
      font-size: @font-s-small;
      text-align: right;
    }
  }
}
</style>
