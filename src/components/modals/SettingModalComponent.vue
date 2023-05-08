<script setup lang="ts">
import { ref, computed } from "vue";

import { useAuthStore } from "@/stores/AuthStore";
import { useNotificationStore } from "@/stores/NotificationStore";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update", value: string): void;
}>();

const props = defineProps<{
  inputType?: string;
  show: boolean;
  placeholder: string;
  title: string;
  validate: Function; // function which receives 1 argument and returns a boolean
}>();

const input = ref("");
const oldPassword = ref("");

const exit = () => {
  input.value = "";
  oldPassword.value = "";
  emit("close");
};

const submit = async () => {
  if (props.inputType === "password") {
    if (input.value.length < 6) {
      useNotificationStore().pushAlert({
        type: "error",
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    const res = await useAuthStore().checkPassword(oldPassword.value);

    if (!res) {
      useNotificationStore().pushAlert({
        type: "error",
        message: "Wrong current password",
      });
      return;
    }
  }

  emit("update", input.value);
  input.value = "";
};

const valid = computed(() => {
  if (props.inputType === "password")
    return props.validate(input.value, oldPassword.value);
  else return props.validate(input.value);
});
</script>

<template>
  <Teleport to="#app">
    <Transition name="modal">
      <div class="modal setting-modal" v-if="props.show">
        <div class="outside" @click="exit()"></div>
        <div class="master">
          <h3>{{ props.title }}</h3>
          <input
            :type="props.inputType ?? 'text'"
            class="input-common"
            v-model="input"
            :placeholder="props.placeholder"
          />

          <input
            v-if="props.inputType === 'password'"
            type="password"
            class="input-common"
            v-model="oldPassword"
            placeholder="Current password"
          />

          <div class="buttons">
            <button class="button-small exit" @click="exit()">Cancel</button>
            <button
              class="button-small"
              :disabled="
                input.length === 0 ||
                !valid ||
                (inputType === 'password' && oldPassword.length === 0)
              "
              @click="submit()"
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.setting-modal {
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

    .buttons {
      display: flex;
      width: 100%;
      justify-content: flex-end;
      column-gap: 0.5rem;
      .exit {
        background: @accent;
      }
    }
  }
}
</style>
