<script setup lang="ts">
import { ref } from "vue";

import { useRoomStore } from "@/stores/RoomStore";
import { useModalStore } from "@/stores/ModalStore";
import { storeToRefs } from "pinia";

const newRoomData = storeToRefs(useModalStore()).newRoomModalData;
const roomStore = useRoomStore();
const inputValue = ref("");
const waiting = ref(false);
const mode = ref<"create" | "join">("create");

const toggle = () => {
  inputValue.value = "";
  if (mode.value === "create") mode.value = "join";
  else mode.value = "create";
};

const action = async () => {
  if (waiting.value) return;

  if (mode.value === "create") {
    waiting.value = true;
    const res = await roomStore.createRoom(inputValue.value, "");
    waiting.value = false;
    if (res) exit();
  } else {
    waiting.value = true;
    const res = await roomStore.joinRoom(inputValue.value);
    waiting.value = false;
    if (res) exit();
  }
};

const exit = () => {
  inputValue.value = "";
  waiting.value = false;

  useModalStore().hideModal("newRoom");
};
</script>

<template>
  <Transition name="modal">
    <div class="new-room-modal modal" v-show="newRoomData.show">
      <div class="outside" @click="exit()"></div>
      <div class="master">
        <h3>{{ mode === "create" ? "Create a room" : "Join a room" }}</h3>
        <input
          class="input-common"
          v-model.trim="inputValue"
          type="text"
          :placeholder="mode === 'create' ? 'Room name' : 'Invite code'"
        />

        <div class="nav">
          <span @click="toggle" class="toggle">{{
            mode === "create" ? "Join one instead" : "Create one instead"
          }}</span>
          <div class="buttons">
            <button class="button-small exit" @click="exit()">Cancel</button>
            <button
              class="button-small"
              :disabled="
                waiting ||
                ((inputValue.length < 5 || inputValue.length > 20) &&
                  mode === 'create') ||
                (inputValue.length === 0 && mode === 'join')
              "
              @click="action()"
            >
              {{ mode === "create" ? "Create" : "Join" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.new-room-modal {
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
    width: 12rem;

    h3 {
      font-size: @font-s-big;
    }

    .nav {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      column-gap: @gap-xlarge;

      .toggle {
        font-size: @font-s-tiny;
        color: @accent;
        cursor: pointer;
      }
      .buttons {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        column-gap: @gap-xlarge;
        .exit {
          background: @accent;
        }
      }
    }
  }
}
</style>
