<script lang="ts" setup>
import { useRoute } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

import MessageListComponent from "@/components/messages/MessageListComponent.vue";
import { useChannelStore, type Channel } from "@/stores/ChannelStore";
import { useRoomStore } from "@/stores/RoomStore";
import { useUserStore } from "@/stores/UserStore";
import { useActiveUserStore } from "@/stores/ActiveUserStore";
import { useModalStore } from "@/stores/ModalStore";

const channels = storeToRefs(useChannelStore()).channels;
const users = storeToRefs(useUserStore()).users;
const activeUserData = storeToRefs(useActiveUserStore()).activeUserData;
const rooms = storeToRefs(useRoomStore()).rooms;
const route = useRoute();

const DMID = computed((): string => {
  return route.params.DMID?.toString();
});

const DMData = (id: string) => {
  const friend =
    rooms.value.get(id)?.friendship?.friendA === activeUserData.value?.id
      ? rooms.value.get(id)?.friendship?.friendB
      : rooms.value.get(id)?.friendship?.friendA;

  return friend ?? "";
};

const channel = computed(() => {
  const channel =
    channels.value.get(rooms.value.get(DMID.value)?.channels[0] ?? "") ??
    ({} as Channel);

  return channel;
});
</script>

<template>
  <div class="channel" v-full-height>
    <div class="head">
      <h2
        class="name no-txt-overflow"
        @click="useModalStore().showUserModal(users.get(DMData(DMID))!.id)"
      >
        {{ users.get(DMData(DMID))?.displayName ?? "" }}
      </h2>
    </div>
    <MessageListComponent :channelID="channel.id"></MessageListComponent>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.channel {
  grid-column: 2;
  background: @background;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 100%;
  width: 100%;
  overflow: hidden;

  .head {
    width: 100%;
    padding: @padding-small;
    min-height: 1.5rem;
    background: @background-light;
    display: flex;

    .name {
      font-size: @font-s-medium;
      font-weight: @font-w-normal;
      cursor: pointer;
    }
  }

  ::-webkit-scrollbar-track {
    display: none;
  }
}
</style>
