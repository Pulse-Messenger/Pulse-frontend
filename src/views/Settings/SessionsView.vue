<script setup lang="ts">
import { storeToRefs } from "pinia";

// @ts-ignore
import UAParser from "ua-parser-js";

import { useActiveUserStore } from "@/stores/ActiveUserStore";
import { useModalStore } from "@/stores/ModalStore";

const modalStore = useModalStore();

const activeUser = storeToRefs(useActiveUserStore()).activeUserData;

const getBrowser = (ua: string) => {
  const parser = new UAParser(ua);
  const result = parser.getResult();
  return (
    result.browser.name +
    " - " +
    result.browser.version +
    " on " +
    result.os.name +
    " " +
    result.os.version
  );
};
</script>

<template>
  <div class="category">
    <div class="head">
      <h3>Devices</h3>
      <button
        class="button-small logout"
        @click="
          () =>
            modalStore.showConfirmModal(
              'Are you sure you want to log out everywhere?',
              () => useActiveUserStore().deleteAllSessions(),
            )
        "
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
        <p class="useragent no-txt-oveflow">
          {{ getBrowser(session.useragent) }}
        </p>
      </div>
      <button
        class="button-small logout"
        @click="
          modalStore.showConfirmModal(
            'Are you sure you want to log out this device?',
            () => useActiveUserStore().deleteSession(session.id),
          )
        "
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
    border-radius: @border-r-small;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    justify-content: space-between;
    padding: @padding-small;

    .info {
      .ip {
        font-weight: @font-w-bold;
        font-size: @font-s-medium;
        max-width: 10rem;
        word-break: break-all;
      }

      .useragent {
        font-size: @font-s-small;
      }
    }
  }
  .logout {
    background: @accent;
  }
}
</style>
