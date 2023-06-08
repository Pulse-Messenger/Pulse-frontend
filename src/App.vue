<script setup lang="ts">
import { onBeforeMount } from "vue";
import { RouterView } from "vue-router";
import { storeToRefs } from "pinia";

import { useNotificationStore } from "@/stores/NotificationStore";
import NotificationComponent from "@/components/NotificationComponent.vue";
import InteractModalComponent from "./components/modals/InteractModalComponent.vue";
import ChannelModalComponent from "@/components/modals/ChannelModalComponent.vue";
import EditRoomModalComponent from "@/components/modals/EditRoomModalComponent.vue";
import NewFriendModalComponent from "@/components/modals/NewFriendModalComponent.vue";
import NewRoomModalComponent from "@/components/modals/NewRoomModalComponent.vue";
import UserModalComponent from "@/components/modals/UserModalComponent.vue";
import ConfirmModalComponent from "./components/modals/ConfirmModalComponent.vue";
import ImageModalComponent from "./components/modals/ImageModalComponent.vue";

const alerts = storeToRefs(useNotificationStore()).alerts;

onBeforeMount(() => {
  // opens custom context menu
  document.addEventListener("contextmenu", (evt) => {
    evt.preventDefault();
  });

  document.addEventListener("mousedown", (evt) => {
    if (evt.button === 2) evt.preventDefault();
  });
});
</script>

<template>
  <RouterView></RouterView>
  <div class="alerts">
    <TransitionGroup name="list" tag="div">
      <NotificationComponent
        v-for="(alert, index) in alerts"
        :key="index"
        :notification="alert"
        @kill="alert.kill = true"
      ></NotificationComponent>
    </TransitionGroup>
  </div>
  <InteractModalComponent></InteractModalComponent>
  <ChannelModalComponent></ChannelModalComponent>
  <EditRoomModalComponent></EditRoomModalComponent>
  <NewFriendModalComponent></NewFriendModalComponent>
  <NewRoomModalComponent></NewRoomModalComponent>
  <UserModalComponent></UserModalComponent>
  <ConfirmModalComponent></ConfirmModalComponent>
  <ImageModalComponent></ImageModalComponent>
</template>

<style lang="less" scoped>
.alerts {
  & > div > div {
    margin-bottom: 0.5rem;
  }

  position: absolute;
  z-index: 2000;
  top: 1rem;
  right: 0.5rem;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  transform: translateX(400px);
}

.list-leave-active {
  position: absolute;
}
</style>
