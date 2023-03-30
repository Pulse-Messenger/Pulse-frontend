<script setup lang="ts">
import { useCommonStore } from "@/stores/CommonStore";
import { ref, computed } from "vue";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const props = defineProps<{
  show: boolean;
}>();

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
  const res = await useCommonStore().manageFriendship({
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

  emit("close");
};
</script>

<template>
  <Teleport to="#app">
    <Transition name="modal">
      <div class="new-friend-modal modal" v-if="props.show">
        <div class="outside" @click="exit()"></div>
        <div class="master">
          <h3>Add a friend</h3>
          <input
            class="input-common"
            v-model="inputValue"
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
  </Teleport>
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
    border-radius: 5px;
    padding: 0.5rem;
    row-gap: 0.5rem;
    width: 10rem;

    h3 {
      font-size: 0.7rem;
    }

    .buttons {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      column-gap: 0.5rem;

      .exit {
        background: @accent;
      }
    }
  }
}
</style>
