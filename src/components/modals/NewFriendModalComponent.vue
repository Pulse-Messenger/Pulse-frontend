<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";

import { useActiveUserStore } from "@/stores/ActiveUserStore";
import { useModalStore } from "@/stores/ModalStore";

const modalData = storeToRefs(useModalStore()).newFriendModalData;

const waiting = ref(false);
const inputValue = ref("");

const validInput = computed(() => {
  return (
    inputValue.value.length > 0 &&
    inputValue.value.length <= 20 &&
    !waiting.value
  );
});

const action = async () => {
  waiting.value = true;
  const res = await useActiveUserStore().manageFriendship({
    action: "create",
    success: "Friend request sent",
    error: "User not found",
    userID: inputValue.value,
  });
  waiting.value = false;
  if (res) exit();
};

const exit = () => {
  inputValue.value = "";
  useModalStore().hideModal("newFriend");
};
</script>

<template>
  <Transition name="modal">
    <div class="new-friend-modal modal" v-show="modalData.show">
      <div class="outside" @click="exit()"></div>
      <div class="master">
        <h3>Add a friend</h3>
        <input
          class="input-common"
          v-model.trim="inputValue"
          type="text"
          placeholder="Username"
        />
        <div class="buttons">
          <button class="button-small exit" @click="exit()">Cancel</button>
          <button
            class="button-small"
            :disabled="!validInput"
            @click="action()"
          >
            Add
          </button>
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
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    background: @background;
    border-radius: @border-r-small;
    padding: @padding-xlarge;
    row-gap: @gap-xlarge;
    width: 10rem;

    h3 {
      font-size: @font-s-big;
    }

    .buttons {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      column-gap: @gap-xlarge;

      .exit {
        background: @accent;
      }
    }
  }
}
</style>
