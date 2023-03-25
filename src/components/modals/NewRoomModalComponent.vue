<script setup lang="ts">
import { ref } from "vue";

import { useRoomStore } from "@/stores/RoomStore";

const roomStore = useRoomStore();
const inputValue = ref("");
const waiting = ref(false);
const mode = ref<"create" | "join">("create");

const emit = defineEmits<{
  (e: "close"): void;
}>();

const props = defineProps<{
  show: boolean;
}>();

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
  inputValue.value = "";
};

const exit = () => {
  inputValue.value = "";
  waiting.value = false;

  emit("close");
};
</script>

<template>
  <Teleport to="#app">
    <Transition name="modal">
      <div class="new-room-modal modal" v-if="props.show">
        <div class="outside" @click="exit()"></div>
        <div class="master">
          <h3>{{ mode === "create" ? "Create a room" : "Join a room" }}</h3>
          <input
            class="input-common"
            v-model="inputValue"
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
                  (inputValue.length < 5 && mode === 'create') ||
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
  </Teleport>
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
    border-radius: 5px;
    padding: 0.5rem;
    row-gap: 0.5rem;
    width: 12rem;

    h3 {
      font-size: 0.7rem;
    }

    .nav {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      column-gap: 0.5rem;

      .toggle {
        font-size: 0.4rem;
        color: @accent;
        cursor: pointer;
      }
      .buttons {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        column-gap: 0.5rem;
        .exit {
          background: @accent;
        }
      }
    }
  }
}
</style>
