<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed, watch } from "vue";

import { useChannelStore } from "@/stores/ChannelStore";
import { useModalStore } from "@/stores/ModalStore";

const channels = storeToRefs(useChannelStore()).channels;
const channelModal = storeToRefs(useModalStore()).channelModalData;

const inputValue = ref({
  name: "",
  description: "",
  category: "",
});
const waiting = ref(false);

watch(channelModal.value, () => {
  if (channelModal.value.show && !creating.value) {
    inputValue.value.name = channels.value.get(
      channelModal.value.channelID!,
    )!.name;
    inputValue.value.description = channels.value.get(
      channelModal.value.channelID!,
    )!.description;
    inputValue.value.category = channels.value.get(
      channelModal.value.channelID!,
    )!.category;
  }
});

const action = async () => {
  if (creating.value) {
    waiting.value = true;
    const res = await useChannelStore().createChannel({
      description: inputValue.value.description,
      name: inputValue.value.name,
      roomID: channelModal.value.roomID,
      category: inputValue.value.category.trim(),
    });
    waiting.value = false;

    if (res) {
      exit();
    }
  } else {
    waiting.value = true;
    const res = await useChannelStore().updateChannel({
      channelID: channelModal.value.channelID as string,
      description: inputValue.value.description,
      name: inputValue.value.name,
      category: inputValue.value.category.trim(),
    });
    waiting.value = false;

    if (res) {
      exit();
    }
  }
};

const exit = () => {
  useModalStore().hideModal("channel");

  setTimeout(() => {
    inputValue.value.description = "";
    inputValue.value.name = "";
    inputValue.value.category = "";
    channelModal.value.channelID = undefined;
    channelModal.value.roomID = "";
  }, 200);

  waiting.value = false;
};

const checkInput = computed(() => {
  return (
    inputValue.value.name.length >= 1 &&
    inputValue.value.name.length <= 32 &&
    inputValue.value.description.length >= 1 &&
    inputValue.value.description.length <= 50
  );
});

const creating = computed(() => {
  return !(
    channelModal.value.channelID && channelModal.value.channelID.length > 0
  );
});

const changed = computed(() => {
  return (
    channels.value.get(channelModal.value.channelID!)?.name !==
      inputValue.value.name ||
    channels.value.get(channelModal.value.channelID!)?.description !==
      inputValue.value.description ||
    channels.value.get(channelModal.value.channelID!)?.category !==
      inputValue.value.category
  );
});
</script>

<template>
  <Transition name="modal">
    <div class="channel-modal modal" v-show="channelModal.show">
      <div class="outside" @click="exit()"></div>
      <div class="master">
        <h3>{{ creating ? "Create a channel" : "Edit a channel" }}</h3>
        <input
          class="input-common"
          v-model.trim="inputValue.name"
          type="text"
          placeholder="Channel name"
        />
        <input
          class="input-common"
          v-model.trim="inputValue.description"
          type="text"
          placeholder="Channel Description"
        />
        <input
          class="input-common"
          v-model.trim="inputValue.category"
          type="text"
          placeholder="Channel category"
        />
        <div class="buttons">
          <button class="button-small exit" @click="exit()">Cancel</button>
          <button
            class="button-small"
            :disabled="waiting || !checkInput || !changed"
            @click.once="action()"
          >
            {{ creating ? "Create" : "Save" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
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
