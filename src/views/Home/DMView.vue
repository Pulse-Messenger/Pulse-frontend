<script lang="ts" setup>
import { useRoute } from "vue-router";
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import UserModalComponent from "@/components/modals/UserModalComponent.vue";
import MessageListComponent from "@/components/messages/MessageListComponent.vue";
import { useChannelStore } from "@/stores/ChannelStore";
import { useRoomStore } from "@/stores/RoomStore";
import { useCommonStore } from "@/stores/CommonStore";
import { useUserStore } from "@/stores/UserStore";

const channels = storeToRefs(useChannelStore()).channels;
const users = storeToRefs(useUserStore()).users;
const activeUserData = storeToRefs(useCommonStore()).activeUserData;
const rooms = storeToRefs(useRoomStore()).rooms;
const route = useRoute();

const DMID = computed((): string => {
  return route.params.DMID.toString();
});

const DMData = (id: string) => {
  const friend =
    rooms.value[id]?.friendship?.friendA === activeUserData.value?.id
      ? rooms.value[id]?.friendship?.friendB
      : rooms.value[id]?.friendship?.friendA;

  return friend ?? "";
};

const channel = computed(() => {
  const channel = channels.value[rooms.value[DMID.value].channels[0]] ?? {};

  return channel;
});

const userModal = ref({
  show: false,
  userID: users.value[DMData(DMID.value)].id,
});
</script>

<template>
  <div class="channel">
    <div class="head">
      <h2 class="name no-txt-overflow" @click="userModal.show = true">
        {{ users[DMData(DMID)].displayName }}
      </h2>
    </div>
    <MessageListComponent :channelID="channel.id"></MessageListComponent>
  </div>
  <UserModalComponent
    :show="userModal.show"
    :userID="userModal.userID"
    @close="
      () => {
        userModal.show = false;
      }
    "
  ></UserModalComponent>
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
      cursor: pointer;
    }
  }

  ::-webkit-scrollbar-track {
    display: none;
  }
}
</style>
