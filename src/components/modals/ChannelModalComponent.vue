<script setup lang="ts">
import { useChannelStore } from "@/stores/ChannelStore";

import { storeToRefs } from "pinia";
import { ref, computed, watch } from "vue";

const channels = storeToRefs(useChannelStore()).channels;

const inputValue = ref({
  name: "",
  description: "",
  category: "",
});
const waiting = ref(false);

const props = defineProps<{
  channelID?: string;
  roomID: string;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

watch(props, () => {
  if (props.show && !creating.value) {
    inputValue.value.name = channels.value[props.channelID!].name;
    inputValue.value.description = channels.value[props.channelID!].description;
    inputValue.value.category = channels.value[props.channelID!].category;
  }
});

const action = async () => {
  if (creating.value) {
    waiting.value = true;
    const res = await useChannelStore().createChannel({
      description: inputValue.value.description,
      name: inputValue.value.name,
      roomID: props.roomID,
      category: inputValue.value.category.trim(),
    });
    waiting.value = false;

    if (res) exit();
  } else {
    waiting.value = true;
    const res = await useChannelStore().updateChannel({
      channelID: props.channelID as string,
      description: inputValue.value.description,
      name: inputValue.value.name,
      category: inputValue.value.category.trim(),
    });
    waiting.value = false;

    if (res) exit();
  }
};

const exit = () => {
  inputValue.value.description = "";
  inputValue.value.name = "";
  inputValue.value.category = "";
  waiting.value = false;

  emit("close");
};

const checkInput = computed(() => {
  return (
    inputValue.value.name.trim().length >= 1 &&
    inputValue.value.name.trim().length <= 32 &&
    inputValue.value.description.trim().length >= 1 &&
    inputValue.value.description.trim().length <= 50
  );
});

const creating = computed(() => {
  return !(props.channelID && props.channelID.length > 0);
});
</script>

<template>
  <Teleport to="#app">
    <Transition name="modal">
      <div class="channel-modal modal" v-if="props.show">
        <div class="outside" @click="exit()"></div>
        <div class="master">
          <h3>{{ creating ? "Create a channel" : "Edit a channel" }}</h3>
          <input
            class="input-common"
            v-model="inputValue.name"
            type="text"
            placeholder="Channel name"
          />
          <input
            class="input-common"
            v-model="inputValue.description"
            type="text"
            placeholder="Channel Description"
          />
          <input
            class="input-common"
            v-model="inputValue.category"
            type="text"
            placeholder="Channel category"
          />

          <div class="buttons">
            <button class="button-small exit" @click="exit()">Cancel</button>
            <button
              class="button-small"
              :disabled="waiting || !checkInput"
              @click="action()"
            >
              {{ creating ? "Create" : "Save" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.channel-modal {
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
      width: 100%;
      display: flex;
      justify-content: flex-end;
      column-gap: 0.5rem;
      .exit {
        background: @accent;
      }
    }
  }
}
</style>
