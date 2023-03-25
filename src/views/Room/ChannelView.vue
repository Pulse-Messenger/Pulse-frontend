<script lang="ts" setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import { storeToRefs } from "pinia";

import MessageListComponent from "@/components/messages/MessageListComponent.vue";
import { useChannelStore } from "@/stores/ChannelStore";

const channelStore = storeToRefs(useChannelStore());
const route = useRoute();

const channelID = computed((): string => {
  return route.params.channelID.toString();
});

const getChannel = computed(() => {
  const channel = channelStore.channels.value[channelID.value];

  return channel;
});
</script>

<template>
  <div class="channel">
    <div class="head">
      <h2 class="name no-txt-overflow">{{ getChannel?.description }}</h2>
    </div>
    <MessageListComponent></MessageListComponent>
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

    .name {
      font-size: 0.5rem;
      font-weight: 500;
      width: 100%;
    }
  }

  ::-webkit-scrollbar-track {
    display: none;
  }
}
</style>
