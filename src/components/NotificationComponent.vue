<script setup lang="ts">
import type { Notification } from "@/stores/NotificationStore";

const props = defineProps<{
  notification: Notification;
}>();

const emit = defineEmits<{
  (e: "kill"): void;
}>();
</script>

<template>
  <div>
    <div
      class="notification"
      v-if="notification.type !== 'message'"
      :class="notification.type"
      @click="emit('kill')"
    >
      <h2 v-if="notification.type === 'warn'">Warning</h2>
      <h2 v-if="notification.type === 'info'">Info</h2>
      <h2 v-if="notification.type === 'error'">Error</h2>
      <p>{{ notification.message }}</p>
    </div>
    <div
      class="notification"
      v-if="notification.type === 'message'"
      :class="notification.type"
      @click="emit('kill')"
    >
      <div class="pfp">
        <img alt="pfp" :src="notification.extra?.userPfp" />
      </div>
      <div class="content">
        <span>
          <h2>{{ notification.extra?.user }}</h2>
          -
          {{ notification.extra?.channel }}
        </span>
        <p>{{ notification.message ?? "Content" }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.notification {
  background: @background-light;
  border-radius: 5px;
  padding: 0.2rem;
  display: flex;
  flex-direction: column;
  row-gap: 0.1em;
  cursor: pointer;
  width: 11rem;
  max-height: 4rem;
  z-index: 2000;

  * {
    color: @foreground-light;
  }

  h2 {
    font-size: 0.55rem;
  }

  p {
    font-size: 0.45rem;
  }

  &.info {
    border: 2px solid @info;
    h2 {
      color: @info;
    }
  }
  &.warn {
    border: 2px solid @warn;
    h2 {
      color: @warn;
    }
  }
  &.error {
    border: 2px solid @error;
    h2 {
      color: @error;
    }
  }

  &.message {
    display: flex;
    flex-direction: row;
    border: @accent 2px solid;
    column-gap: 0.3rem;
    padding: 0.2em;
    align-items: center;

    .content {
      display: flex;
      flex-direction: column;
      row-gap: 0.2rem;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;

      span {
        display: flex;
        flex-direction: row;
        align-items: center;
        column-gap: 0.5em;

        h2 {
          font-size: 0.45rem;
          font-weight: 600;
        }
        font-size: 0.45rem;
      }

      p {
        font-size: 0.45rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
    .pfp {
      width: 1.1rem;
      height: 1.1rem;
      min-height: 1.1rem;
      min-width: 1.1rem;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 1000px;
      }
    }
  }
}
</style>
