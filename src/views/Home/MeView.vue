<script setup lang="ts">
import FriendsIcon from "@/icons/FriendsIcon.vue";
import { useCommonStore } from "@/stores/CommonStore";
import { useRoomStore } from "@/stores/RoomStore";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

const DMs = storeToRefs(useCommonStore()).activeUserData.value?.DMs ?? [];
const rooms = storeToRefs(useRoomStore()).rooms;
</script>

<template>
  <div class="me">
    <div class="nav">
      <RouterLink :to="{ name: 'Friends' }"
        >Friends<FriendsIcon></FriendsIcon
      ></RouterLink>
      <hr />
      <div class="DMs">
        <div class="DM" v-for="(DM, index) in DMs" :key="index">
          {{ rooms[DM].members }}
        </div>
      </div>
    </div>
    <RouterView></RouterView>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/base.less";

.me {
  display: grid;
  grid-template-columns: auto 1fr;

  .nav {
    width: 7rem;
    padding: 0.3rem;
    box-shadow: 5px 3px 5px @background;

    hr {
      margin: 0.2rem 0;
      border: 1px solid @special;
    }

    a {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0.3rem 0.2rem;
      font-size: 0.49rem;
      border-radius: 5px;
      transition: 0.2s ease all;
      color: @foreground;

      &:hover {
        background: @background;
      }

      svg {
        height: 0.8rem;
        width: 0.8rem;
      }
    }

    .DMs {
    }
  }
}
</style>
