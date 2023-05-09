<script setup lang="ts">
import { storeToRefs } from "pinia";

import { useModalStore } from "@/stores/ModalStore";

const modalData = storeToRefs(useModalStore()).imageModalData;

const exit = () => {
  useModalStore().hideModal("image");
};
</script>

<template>
  <Transition name="modal">
    <div class="new-friend-modal modal" v-show="modalData.show">
      <div class="outside" @click="exit()"></div>
      <div class="master">
        <div class="container">
          <img :src="modalData.image" alt="image" />
        </div>
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
    justify-content: center;
    align-items: center;
    max-width: 70vmin;
    max-height: 70vmin;

    .container {
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
}
</style>
