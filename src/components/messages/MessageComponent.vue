<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
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

const contentRef = ref<HTMLDivElement>();

const messageContent = computed(() => {
  // real
  const msg = props.message.content
    .replace(/\[![a-fA-F0-9]{24}\]/g, (userID) => {
      const user = useUserStore().users.get(userID.slice(2, -1));

      return `<span class="mention" onclick="window.postMessage({type: 'openProfile',userID: '${
        user?.id ?? "unknown"
      }'})">${user?.displayName ?? "Deleted User"}</span>`;
    })
    .replace(
      /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}])/gu,
      '<span class="emoji">$1</span>',
    );

  return marked(msg);
});

// watch(messageContent, async () => {
//   await nextTick();

//   contentRef.value
//     ?.querySelectorAll(".video-controls")
//     .forEach((controls) => {});
// });
</script>

<template>
  <div class="message" :class="{ continuing }">
    <div
      class="profilePic"
      v-if="!continuing"
      @click="modalStore.showUserModal(sender.id)"
    >
      <img alt="pfp" :src="sender.profilePic ?? '/icons/User.svg'" />
    </div>
    <p v-if="continuing" class="continuingTimestamp">
      {{
        new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      }}
    </p>
    <div class="main">
      <div class="head" v-if="!continuing">
        <span
          class="author no-txt-overflow"
          @click="modalStore.showUserModal(sender.id)"
          >{{ sender.displayName ?? "Deleted User" }}</span
        >
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
      <div class="content" v-html="messageContent" ref="contentRef"></div>
    </div>
  </div>
</template>

<style lang="less">
@import "@/assets/main.less";

.message {
  display: grid;
  grid-template-columns: 1.6rem auto;

  column-gap: 0.25rem;
  transition: 0.2s ease background;
  padding: 0 0.2rem !important;
  border-radius: 5px;

  * {
    word-break: break-all;
  }

  &:not(.continuing) {
    padding-top: 0.2rem !important;
  }

  &:last-child {
    padding-bottom: 0.2rem !important;
  }

  &:hover {
    background: @background-light;

    .continuingTimestamp {
      opacity: 1;
    }
  }

  .continuingTimestamp {
    width: 1.6rem;
    padding-top: 0.1rem;
    font-size: 0.33rem;
    font-weight: 600;
    opacity: 0;
    transition: 0.1s ease all;
    text-align: center;
  }

  .profilePic {
    width: 1.3rem;
    height: 1.3rem;
    min-width: 1.3rem;
    min-height: 1.3rem;
    margin: 0.1rem 0.3rem 0.1rem 0.1rem;
    border-radius: 1000px;
    background: @background-light;
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
    justify-content: space-between;
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
        max-width: 4rem;
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
        font-size: 0.7rem;
      }
      h2 {
        font-size: 0.67rem;
      }
      h3 {
        font-size: 0.65rem;
      }
      h4 {
        font-size: 0.63rem;
      }
      h5 {
        font-size: 0.6rem;
      }
      h6 {
        font-size: 0.57rem;
      }

      img {
        display: block;
        /*
          height will be overwritten
          in the message parser once the image is loaded
          - we need to set a fixed height for autoscroll
        */
        height: 10rem;
        max-height: 13rem;
        width: 100%;
        max-width: 13rem;
        object-fit: cover;
        border-radius: 5px;
        overflow: hidden;
        margin-bottom: 0.2rem;
        cursor: pointer;
      }

      video {
        height: 10rem;
        max-width: 100%;
        max-height: 100%;
        border-radius: 5px;
      }

      audio {
        width: 10rem;
        max-width: 100%;
        max-height: 100%;
        border-radius: 5px;
      }

      .file {
        display: grid;
        grid-template-columns: auto 1fr;
        background: @background-light;
        padding: 0.4rem;
        border-radius: 5px;
        max-width: 11rem;
        width: 100%;
        border: 1px solid @background;
        align-items: center;
        margin-bottom: 0.2rem;
        gap: 0.5rem;

        &:last-of-type {
          margin-bottom: 0;
        }

        .icon {
          display: flex;

          svg {
            height: 1rem;
            fill: @foreground;
            cursor: pointer;
          }
        }
      }

      .mention {
        color: @accent;
        padding: 0.05rem;
        transition: 0.2s ease all;
        border-radius: 4px;
        cursor: pointer;
        width: fit-content;

        &:hover {
          background: @special;
        }
      }

      table,
      th,
      td {
        border: 2px solid @special;
        border-collapse: collapse;
        text-align: center;
        padding: 0.2rem;
      }

      li::marker {
        font-weight: 600;
      }

      th {
        font-weight: 600;
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
