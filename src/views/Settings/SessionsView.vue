<script setup lang="ts">
import { storeToRefs } from "pinia";

import { useActiveUserStore } from "@/stores/ActiveUserStore";
import { useCommonStore } from "@/stores/CommonStore";

const activeUser = storeToRefs(useActiveUserStore()).activeUserData;
</script>

<template>
  <div class="category">
    <div class="head">
      <h3>Devices</h3>
      <button
        class="button-small logout"
        @click="useActiveUserStore().deleteAllSessions()"
      >
        Logout everywhere
      </button>
    </div>
    <div
      v-for="(session, index) in activeUser?.sessions"
      :key="index"
      class="session"
    >
      <div class="info no-txt-oveflow">
        <p class="ip">{{ session.ip }}</p>
        <p class="useragent no-txt-oveflow">{{ session.useragent }}</p>
      </div>
      <button
        class="button-small logout"
        @click="useActiveUserStore().deleteSession(session.id)"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/base.less";

.category {
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .session {
    background: @background;
    border-radius: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.3rem;

    .info {
      .ip {
        font-weight: 600;
        font-size: 0.5rem;
      }

      .useragent {
        font-size: 0.45rem;
      }
    }
  }
  .logout {
    background: @accent;
  }
}
</style>
