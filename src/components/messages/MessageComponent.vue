<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";

import { useUserStore } from "@/stores/UserStore";
import type { User } from "@/stores/UserStore";
import type { Message } from "@/stores/ChannelStore";
import { useModalStore } from "@/stores/ModalStore";

const modalStore = useModalStore();

const props = defineProps<{
  message: Message;
  continuing: boolean;
}>();

const sender = computed((): User => {
  return useUserStore().users.get(props.message.sender) ?? ({} as User);
});

const messageContent = computed(() => {
  const msg = props.message.content.replace(
    /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}])/gu,
    '<span class="emoji">$1</span>',
  );

  return marked(msg);
});
</script>

<template>
  <div class="message">
    <div
      class="profilePic"
      v-if="!continuing"
      @click.once="modalStore.showUserModal(sender.id)"
    >
      <img alt="pfp" :src="sender.profilePic ?? '/icons/User.svg'" />
    </div>
    <div class="main">
      <div class="head" v-if="!continuing">
        <span class="author" @click="modalStore.showUserModal(sender.id)">{{
          sender.displayName ?? "Deleted User"
        }}</span>
        <span class="timestamp">
          &nbsp;-&nbsp;
          {{
            new Date(message.timestamp).toLocaleDateString("en-us", {
              hour: "numeric",
              minute: "numeric",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          }}
        </span>
      </div>
      <div class="content" v-html="messageContent"></div>
    </div>
  </div>
</template>

<style lang="less">
@import "@/assets/main.less";

.message {
  display: flex;
  flex-direction: row;
  column-gap: 0.25rem;
  transition: 0.2s ease all;
  padding: 0.2rem 0.2rem !important;
  border-radius: 5px;

  &:hover {
    background: @background-light;
  }

  * {
    word-break: break-all;
  }

  .profilePic {
    width: 1.3rem;
    height: 1.3rem;
    min-width: 1.3rem;
    min-height: 1.3rem;
    border-radius: 1000px;
    background: @background-light;
    grid-area: profilePic;
    margin-top: 0.1rem;
    cursor: pointer;

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
      border-radius: 1000px;
    }
  }

  .main {
    display: flex;
    flex-direction: column;
    row-gap: 0.1rem;
    width: 100%;
    overflow: hidden;

    .head {
      display: flex;
      align-items: flex-end;

      .author {
        font-size: 0.45rem;
        font-weight: 600;
        color: @accent-s;
        cursor: pointer;
      }

      .timestamp {
        font-size: 0.39rem;
        font-weight: 600;
        color: @foreground-light;
      }
    }

    .content {
      width: 100%;
      font-size: 0.46rem;
      color: @foreground-light;
      overflow: hidden;
      position: relative;

      & > * {
        color: @foreground;
      }

      a {
        color: @accent !important;
      }

      del {
        text-decoration: line-through;
      }

      strong {
        font-weight: 600;
      }

      code {
        background: @background-light;
        padding: 0.5em;
        margin: 0.3em 0;
        border-radius: 5px;
        border: 1px solid @special;
        display: inline-block;
        overflow-y: scroll;

        &,
        & * {
          font-size: 1em !important;
          font-family: "Roboto Mono" !important;
          white-space: break-spaces;
        }
      }

      pre {
        code {
          display: block;
        }
      }

      .emoji {
        font-size: 1.2em;
      }

      h1 {
        font-size: 1rem;
      }
      h2 {
        font-size: 0.9rem;
      }
      h3 {
        font-size: 0.8rem;
      }
      h4 {
        font-size: 0.75rem;
      }
      h5 {
        font-size: 0.7rem;
      }
      h6 {
        font-size: 0.6rem;
      }

      img {
        display: block;
        /*
          height will be overwritten
          in the message parser once the image is loaded
          - we need to set a fixed height for autoscroll
        */
        height: 10rem;
        max-height: 10rem;
        max-width: 70%;
        border-radius: 5px;
        overflow: hidden;
      }

      table,
      th,
      td {
        border: 1px solid @special;
        border-collapse: collapse;
        text-align: center;
        padding: 0.2rem;
      }

      .hr {
        display: block;
        border: 1px solid @special;
        margin: 0.3rem 0;
      }
    }
  }
}
</style>
