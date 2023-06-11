<script setup lang="ts">
import { useModalStore } from "@/stores/ModalStore";
import { storeToRefs } from "pinia";

const modalData = storeToRefs(useModalStore()).confirmModalData;
</script>

<template>
  <Transition name="modal">
    <div class="confirm-modal modal" v-show="modalData.show">
      <div class="outside" @click="useModalStore().hideModal('confirm')"></div>
      <div class="master">
        <h3>{{ modalData.title }}</h3>
        <div class="buttons">
          <button
            class="button-small exit"
            @click="useModalStore().hideModal('confirm')"
          >
            Cancel
          </button>
          <button
            class="button-small"
            @click="
              () => {
                modalData.callback();
                useModalStore().hideModal('confirm');
              }
            "
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.confirm-modal {
  display: flex;
  justify-content: center;
  align-items: center;

  .master {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    background: @background;
    border-radius: @border-r-small;
    padding: @padding-xlarge;
    row-gap: @gap-big;
    width: 11rem;

    h3 {
      font-size: @font-s-xlarge;
    }

    .buttons {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      column-gap: @gap-xlarge;
      .exit {
        background: @accent;
      }
    }
  }
}
</style>
