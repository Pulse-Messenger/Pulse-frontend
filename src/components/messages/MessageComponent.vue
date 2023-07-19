<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { marked } from "marked";

import { useUserStore } from "@/stores/UserStore";
import type { User } from "@/stores/UserStore";
import type { Message } from "@/stores/ChannelStore";
import { useModalStore } from "@/stores/ModalStore";
import { useActiveUserStore } from "@/stores/ActiveUserStore";
import { loadVideoPlayers, loadAudioPlayers } from "@/utils/Players";
import { storeToRefs } from "pinia";

const modalStore = useModalStore();

const baseFontSize = storeToRefs(useActiveUserStore()).baseFontSize;

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

const mobileView = computed(() => {
  return baseFontSize.value !== 28;
});

onMounted(() => {
  // @ts-ignore
  loadVideoPlayers(contentRef);
  // @ts-ignore
  loadAudioPlayers(contentRef);
});
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
      <div
        class="content"
        :class="{ mobileView }"
        v-html="messageContent"
        ref="contentRef"
      ></div>
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
  }
}

.message {
  display: grid;
  grid-template-columns: 1.6rem auto;

  column-gap: @gap-small;
  transition: ease 0.2s transform;
  padding: 0 @padding-medium !important;
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

      &.mobileView {
        .video-container {
          video {
            min-width: unset !important;
          }

          .controls {
            #volume {
              #volume-bar {
                display: none;
              }
            }
          }
        }
      }

      .video-container {
        position: relative;
        width: fit-content;
        padding: @padding-tiny 0;

        video {
          display: block;
          height: 10rem;
          max-width: 20rem;
          min-width: 12rem;
          width: 100%;
          border-radius: @border-r-small;
          cursor: pointer;
          background: black;
        }

        &.fullscreen {
          video {
            height: 100vh;
            width: 100vw;
            border-radius: 0;
          }
        }

        &:hover {
          .controls {
            opacity: 1;
            padding-bottom: @padding-tiny;
          }
        }

        .controls {
          opacity: 0;
          position: absolute;
          z-index: 9;
          left: 0;
          bottom: @gap-tiny;
          padding: 0 @padding-small;
          background: linear-gradient(to bottom, transparent, hsl(0, 0%, 0%));
          transition: @transition-all-fast;
          width: 100%;
          display: grid;
          grid-template-columns: auto auto 1fr auto auto;
          align-items: center;
          column-gap: 0.5rem;

          #playpause {
            &:not(.playing) {
              .pause {
                display: none;
              }
            }
            &.playing {
              .play {
                display: none;
              }
            }
          }

          #time {
            color: #fff;
          }

          #progress {
            appearance: none;
            outline: none;

            width: 100%;
            height: 0.2rem;

            cursor: pointer;
            background: @background;
            border-radius: 4px;

            &::-webkit-slider-thumb {
              outline: none;
              appearance: none;
              -webkit-appearance: none;
              width: 0.5rem;
              height: 0.5rem;
              background: @accent-s;
              border-radius: 1000px;
              cursor: pointer;
            }
            &::-moz-range-thumb {
              outline: none;

              width: 0.5rem;
              height: 0.5rem;
              background: @accent-s;
              border-radius: 1000px;
              border: none;
              cursor: pointer;
            }
          }

          #playpause,
          #fullscreen {
            width: 0.6rem;
            height: 0.6rem;
            cursor: pointer;

            * {
              width: 0.6rem;
              height: 0.6rem;
              min-width: 0.6rem;
              min-height: 0.6rem;
              fill: @accent;
            }
          }

          #volume {
            display: flex;
            column-gap: @gap-tiny;
            cursor: pointer;
            align-items: center;

            &:not(.muted) {
              .muted {
                display: none;
              }
            }
            &.muted {
              .unmuted {
                display: none;
              }
            }

            #mute {
              width: 0.6rem;
              height: 0.6rem;
              svg {
                width: 0.6rem;
                height: 0.6rem;
                min-width: 0.6rem;
                min-height: 0.6rem;
                fill: @accent;
              }
            }

            #volume-bar {
              appearance: none;
              outline: none;

              width: 2.5rem;
              height: 0.2rem;

              cursor: pointer;
              background: @background;
              border-radius: 4px;

              &::-webkit-slider-thumb {
                outline: none;
                appearance: none;
                -webkit-appearance: none;
                width: 0.5rem;
                height: 0.5rem;
                background: @accent-s;
                border-radius: 1000px;
                cursor: pointer;
              }
              &::-moz-range-thumb {
                outline: none;

                width: 0.5rem;
                height: 0.5rem;
                background: @accent-s;
                border-radius: 1000px;
                border: none;
                cursor: pointer;
              }
            }
          }
        }
      }

      .audio-container {
        background: @background-light;
        padding: @padding-medium;
        border-radius: @border-r-small;
        width: clamp(6rem, 100%, 13rem);
        border: 1px solid @background;
        align-items: center;
        margin-bottom: 0.2rem;

        &.no-cover {
          #albumCover {
            width: 0 !important;
            img {
              opacity: 0 !important;
            }
          }

          .coverart-fix {
            margin-left: -@gap-small;
          }
        }

        .coverart-fix {
          margin-left: 0;
          transition: 0.3s ease margin-left;
        }

        .controls {
          width: 100%;
          display: grid;
          grid-template-columns: auto auto auto 1fr auto;
          grid-template-rows: 1fr 1fr 1fr 1fr;
          align-items: center;
          column-gap: @gap-small;

          #albumCover {
            height: 3.5rem;
            width: 3.5rem;
            grid-column: 1;
            grid-row: 1 / 5;
            transition: 0.3s ease width;

            img {
              transition: 0.3s cubic-bezier(0.55, 0.06, 0.68, 0.19) opacity;
              opacity: 1;
              display: block;
              height: 100%;
              width: 100%;
              object-fit: cover;
              border-radius: @border-r-small;
              overflow: hidden;
              margin-bottom: 0;
              cursor: unset;
            }
          }

          #title {
            grid-column: 2 / 6;
            grid-row: 1;
            font-weight: 700;
          }

          #author {
            grid-column: 2 / 6;
            grid-row: 2;
          }

          #playpause {
            grid-column: 2;
            grid-row: 4;

            &:not(.playing) {
              .pause {
                display: none;
              }
            }
            &.playing {
              .play {
                display: none;
              }
            }
          }

          #time {
            color: #fff;
            grid-column: 3;
            grid-row: 4;
          }

          #progress {
            appearance: none;
            outline: none;

            width: 100%;
            height: 0.2rem;

            cursor: pointer;
            background: @background;
            border-radius: 4px;
            grid-column: 2 / 6;
            grid-row: 3;

            &::-webkit-slider-thumb {
              outline: none;
              appearance: none;
              -webkit-appearance: none;
              width: 0.5rem;
              height: 0.5rem;
              background: @accent-s;
              border-radius: 1000px;
              cursor: pointer;
            }
            &::-moz-range-thumb {
              outline: none;

              width: 0.5rem;
              height: 0.5rem;
              background: @accent-s;
              border-radius: 1000px;
              border: none;
              cursor: pointer;
            }
          }

          #playpause,
          #fullscreen {
            width: 0.6rem;
            height: 0.6rem;
            cursor: pointer;

            * {
              width: 0.6rem;
              height: 0.6rem;
              min-width: 0.6rem;
              min-height: 0.6rem;
              fill: @accent;
            }
          }

          #volume {
            display: flex;
            column-gap: @gap-tiny;
            cursor: pointer;
            align-items: center;
            grid-column: 5;
            grid-row: 4;

            &:not(.muted) {
              .muted {
                display: none;
              }
            }
            &.muted {
              .unmuted {
                display: none;
              }
            }

            #mute {
              width: 0.6rem;
              height: 0.6rem;
              svg {
                width: 0.6rem;
                height: 0.6rem;
                min-width: 0.6rem;
                min-height: 0.6rem;
                fill: @accent;
              }
            }

            #volume-bar {
              appearance: none;
              outline: none;

              width: 2.5rem;
              height: 0.2rem;

              cursor: pointer;
              background: @background;
              border-radius: 4px;

              &::-webkit-slider-thumb {
                outline: none;
                appearance: none;
                -webkit-appearance: none;
                width: 0.5rem;
                height: 0.5rem;
                background: @accent-s;
                border-radius: 1000px;
                cursor: pointer;
              }
              &::-moz-range-thumb {
                outline: none;

                width: 0.5rem;
                height: 0.5rem;
                background: @accent-s;
                border-radius: 1000px;
                border: none;
                cursor: pointer;
              }
            }
          }
        }
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
