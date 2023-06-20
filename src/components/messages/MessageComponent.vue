<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { marked } from "marked";

import { useUserStore } from "@/stores/UserStore";
import type { User } from "@/stores/UserStore";
import type { Message } from "@/stores/ChannelStore";
import { useModalStore } from "@/stores/ModalStore";
import { useActiveUserStore } from "@/stores/ActiveUserStore";

const modalStore = useModalStore();

const props = defineProps<{
  message: Message;
  continuing: boolean;
}>();

const sender = computed((): User => {
  return useUserStore().users.get(props.message.sender) ?? ({} as User);
});

const contentRef = ref<HTMLDivElement>();
const pinged = computed(() => {
  let valid = false;

  const exp = /\[![a-fA-F0-9]{24}\]/g;
  const match = exp.exec(props.message.content);
  match?.forEach((userID) => {
    if (userID.slice(2, -1) === useActiveUserStore().activeUserData?.id) {
      valid = true;
    }
  });

  return valid;
});

// THIS IS THE REALEST CODE IN THIS PROJECT
const messageContent = computed(() => {
  let output = "";
  let inCodeBlock = false;

  for (let i = 0; i < props.message.content.length; i++) {
    let char = props.message.content[i];

    if (char === "`" && (i === 0 || props.message.content[i - 1] !== "\\")) {
      inCodeBlock = !inCodeBlock;
    }

    if (!inCodeBlock) {
      char = char.replace(/[&<>"']/g, (tag) => {
        return (
          {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&apos;",
            '"': "&quot;",
          }[tag] || tag
        );
      });
    }

    output += char;
  }

  // real
  const msg = output
    .replace(/\[![a-fA-F0-9]{24}\]/g, (userID) => {
      const user = useUserStore().users.get(userID.slice(2, -1));

      return `<span class="mention" onclick="window.postMessage({type: 'openProfile',userID: '${
        user?.id ?? "unknown"
      }'})">@${user?.displayName ?? "Deleted User"}</span>`;
    })
    .replace(
      /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}])/gu,
      '<span class="emoji">$1</span>',
    );

  return marked(msg);
});

// TODO
// watch(messageContent, async () => {
//   await nextTick();

//   contentRef.value
//     ?.querySelectorAll(".video-controls")
//     .forEach((controls) => {});
// });
</script>

<template>
  <div class="message" :class="{ continuing, pinged }">
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

@keyframes message-come-in {
  0% {
    opacity: 0;
    transform: translateY(-0.5em);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.message {
  display: grid;
  grid-template-columns: 1.6rem auto;

  column-gap: @gap-small;
  transition: ease 0.2s transform;
  padding: 0 0.2rem !important;
  border-radius: @border-r-small;
  animation: message-come-in 0.2s ease;

  * {
    word-break: break-all;
  }

  &:not(.continuing) {
    padding-top: 0.2rem !important;
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
    font-size: @font-s-mini;
    font-weight: @font-w-bold;
    opacity: 0;
    transition: ease 0.1s opacity;
    text-align: center;
  }

  &.pinged {
    background: hsl(40 0.8 * 86.4% 56.9% / 0.2);
    border-left: 2px solid @warn;
    margin-left: -2px;
  }

  .profilePic {
    width: 1.3rem;
    height: 1.3rem;
    min-width: 1.3rem;
    min-height: 1.3rem;
    margin: 0.1rem 0.3rem 0.1rem 0.1rem;
    border-radius: @border-r-circle;
    background: @background-light;
    cursor: pointer;

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
      border-radius: @border-r-circle;
    }
  }

  .main {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 100%;
    overflow: hidden;

    .head {
      display: flex;
      align-items: flex-end;

      .author {
        font-size: @font-s-small;
        font-weight: @font-w-bold;
        color: @accent-s;
        cursor: pointer;
        max-width: 4rem;
      }

      .timestamp {
        font-size: @font-s-tiny;
        font-weight: @font-w-bold;
        color: @foreground-light;
      }
    }

    .content {
      width: 100%;
      font-size: @font-s-small;
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
        font-weight: @font-w-bold;
      }

      code {
        background: @background-light;
        padding: 0.5em;
        margin: 0.3em 0;
        border-radius: @border-r-small;
        border: 1px solid @special;
        display: inline-block;
        overflow-y: scroll;

        &,
        & * {
          font-size: @font-s-small !important;
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
        height: 10rem;
        max-height: 13rem;
        width: 100%;
        max-width: 13rem;
        object-fit: cover;
        border-radius: @border-r-small;
        overflow: hidden;
        margin-bottom: 0.2rem;
        cursor: pointer;
      }

      video {
        height: 10rem;
        max-width: 100%;
        max-height: 100%;
        border-radius: @border-r-small;
      }

      audio {
        width: 10rem;
        max-width: 100%;
        max-height: 100%;
        border-radius: @border-r-small;
      }

      .file {
        display: grid;
        grid-template-columns: auto 1fr;
        background: @background-light;
        padding: @padding-medium;
        border-radius: @border-r-small;
        max-width: 11rem;
        width: 100%;
        border: 1px solid @background;
        align-items: center;
        margin-bottom: 0.2rem;
        gap: @gap-xlarge;

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
        transition: @transition-all-fast;
        border-radius: @border-r-small;
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
        padding: @padding-tiny;
      }

      li::marker {
        font-weight: @font-w-bold;
      }

      th {
        font-weight: @font-w-bold;
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
