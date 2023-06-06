<script lang="ts" setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import { storeToRefs } from "pinia";

import MessageListComponent from "@/components/messages/MessageListComponent.vue";
import { useChannelStore } from "@/stores/ChannelStore";
import { useModalStore } from "@/stores/ModalStore";

const channelStore = storeToRefs(useChannelStore());
const route = useRoute();

const channelID = computed((): string => {
  return route.params.channelID.toString();
});

const roomID = computed((): string => {
  return route.params.roomID.toString();
});

const getChannel = computed(() => {
  const channel = channelStore.channels.value.get(channelID.value);

  return channel;
});
</script>

<template>
  <div class="channel">
    <div class="head">
      <h2
        class="name no-txt-overflow"
        @click="useModalStore().showChannelModal(roomID, channelID)"
      >
        {{ getChannel?.description }}
      </h2>
    </div>
    <MessageListComponent :channelID="channelID"></MessageListComponent>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.channel {
  grid-column: 2;
  max-height: 100vh;
  background: @background;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 100%;
  overflow: hidden;

  .head {
    width: 100%;
    padding: 0.3rem;
    min-height: 1.5rem;
    background: @background-light;
    display: flex;
    box-shadow: 0 3px 5px @background;
    z-index: 1;

    .name {
      font-size: 0.5rem;
      font-weight: 500;
      width: fit-content;
      cursor: pointer;
    }
  }
}
</style>
