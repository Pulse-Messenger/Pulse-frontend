<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, onMounted, watch } from "vue";

import { useUserStore } from "@/stores/UserStore";
import { useNotificationStore } from "@/stores/NotificationStore";
import { useNotesStore } from "@/stores/NoteStore";
import DeveloperBadgeIcon from "@/icons/DeveloperBadgeIcon.vue";
import ModeratorBadgeIcon from "@/icons/ModeratorBadgeIcon.vue";
import AdminBadgeIcon from "@/icons/AdminBadgeIcon.vue";
import VIPBadgeIcon from "@/icons/VIPBadgeIcon.vue";
import { useModalStore } from "@/stores/ModalStore";

const users = storeToRefs(useUserStore()).users;
const notes = storeToRefs(useNotesStore()).notes;
const modalData = storeToRefs(useModalStore()).userModalData;

const exit = () => {
  useModalStore().hideModal("user");
};

const note = ref("");

const copyUsername = async () => {
  try {
    await navigator.clipboard.writeText(
      users.value.get(modalData.value.userID)!.username,
    );

    useNotificationStore().pushAlert({
      type: "info",
      message: "Username copied to clipboard",
    });
  } catch {
    useNotificationStore().pushAlert({
      type: "error",
      message: "Failed to copy username to clipboard",
    });
    return;
  }
};

const saveNote = async () => {
  await useNotesStore().saveNote(modalData.value.userID, note.value);
};

onMounted(() => {
  note.value = notes.value?.[modalData.value.userID] ?? "";
});

watch(modalData.value, () => {
  note.value = notes.value?.[modalData.value.userID] ?? "";
});
</script>

<template>
  <Teleport to="#app">
    <Transition name="modal">
      <div class="user-modal modal" v-if="modalData.show">
        <div class="outside" @click="exit()"></div>
        <div class="master">
          <div class="head">
            <div class="pfp">
              <img :src="users.get(modalData.userID)?.profilePic" alt="pfp" />
            </div>
            <div class="info no-txt-overflow">
              <div class="names no-txt-overflow">
                <p class="display-name no-txt-overflow">
                  {{ users.get(modalData.userID)?.displayName }}
                </p>
                &nbsp;-&nbsp;
                <p class="username no-txt-overflow" @click="copyUsername">
                  @{{ users.get(modalData.userID)?.username }}
                </p>
              </div>
              <div
                class="badges"
                v-if="users.get(modalData.userID)!.globalRoles?.length > 0"
              >
                <VIPBadgeIcon
                  v-if="
                    users.get(modalData.userID)?.globalRoles.includes('vip')
                  "
                ></VIPBadgeIcon>
                <DeveloperBadgeIcon
                  v-if="
                    users
                      .get(modalData.userID)
                      ?.globalRoles.includes('developer')
                  "
                ></DeveloperBadgeIcon>
                <ModeratorBadgeIcon
                  v-if="
                    users
                      .get(modalData.userID)
                      ?.globalRoles.includes('moderator')
                  "
                ></ModeratorBadgeIcon>
                <AdminBadgeIcon
                  v-if="
                    users.get(modalData.userID)?.globalRoles.includes('admin')
                  "
                ></AdminBadgeIcon>
              </div>

              <div class="note">
                <span class="title">Note</span>
                <textarea
                  maxlength="250"
                  v-model.trim="note"
                  @focusout="saveNote()"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
          </div>
          <div class="body" v-if="users.get(modalData.userID)?.about">
            <div class="hr" />

            <div class="about">
              <pre>
              {{ users.get(modalData.userID)?.about }}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.user-modal {
  display: flex;
  justify-content: center;
  align-items: center;

  .master {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    background: @background;
    border-radius: 5px;
    padding: 0.5rem;
    row-gap: 0.5rem;
    width: 16rem;

    .head {
      display: flex;
      justify-content: center;
      column-gap: 0.5rem;
      align-items: center;
      width: 100%;

      .pfp {
        width: 4.5rem;
        height: 4.5rem;

        min-width: 4.5rem;
        min-height: 4.5rem;
        padding: 0.5rem;

        img {
          border-radius: 1000px;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .info {
        display: flex;
        flex-direction: column;
        padding: 0.8rem;
        justify-content: center;
        width: 100%;

        .note {
          display: flex;
          flex-direction: column;
          margin-top: 0.5rem;

          .title {
            font-size: 0.45rem;
            font-weight: 700;
          }

          textarea {
            margin-top: 0.1rem;
            background: transparent;
            outline: none;
            border: none;
            resize: none;
            font-size: 0.4rem;
            font-weight: 500;
            justify-content: space-between;
            color: @foreground;
            grid-column-start: 1;
            grid-column-end: 3;
            width: 100%;
            height: 1.9rem;
          }
        }

        ::-webkit-scrollbar {
          display: none;
        }

        .badges {
          display: flex;
          background: @background-light;
          padding: 0.3rem;
          width: fit-content;
          max-width: 50%;
          border-radius: 10px;
          column-gap: 0.3rem;
          overflow-x: auto !important;

          svg {
            height: 0.7rem;
            width: 0.7rem;
            min-width: 0.7rem;
            min-height: 0.7rem;
            cursor: pointer;
          }
        }

        .names {
          display: flex;
          align-items: center;

          .display-name {
            font-size: 0.6rem;
            font-weight: 700;
            width: fit-content;
          }

          .username {
            font-size: 0.5rem;
            font-weight: 500;
            color: @accent;
            cursor: pointer;
            width: fit-content;
          }
        }

        &::before {
          position: absolute;
          top: 0;
          left: 0;
          content: "";
          height: 100%;
          width: 3px;
          border-radius: 10px;
          background: linear-gradient(45deg, @accent, @accent-s);
        }
      }
    }

    .body {
      width: 100%;

      .hr {
        display: block;
        width: 100%;
        height: 1px;
        background: @special;
        margin-bottom: 0.6rem;
      }

      .about {
        background: @background-light;
        border-radius: 5px;
        padding: 0.4rem;
        font-size: 0.45rem;
        font-weight: 500;
        border: 1px solid @special;
        width: 100%;
        height: 100%;
        max-height: 5rem;
        overflow: auto;
        user-select: text;
      }

      ::-webkit-scrollbar {
        width: 4px;
      }
    }
  }
}
</style>
