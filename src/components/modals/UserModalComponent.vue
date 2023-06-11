<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, onMounted, watch, onUnmounted, computed } from "vue";

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

const user = computed(() => users.value.get(modalData.value.userID)!);

const exit = () => {
  useModalStore().hideModal("user");
};

const note = ref("");

const copyUsername = async () => {
  try {
    await navigator.clipboard.writeText(
      "@" + users.value.get(modalData.value.userID)!.username,
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
  <Transition name="modal">
    <div class="user-modal modal" v-show="modalData.show">
      <div class="outside" @click="exit()"></div>
      <div class="master">
        <div class="head">
          <div class="pfp">
            <img :src="user?.profilePic" alt="pfp" />
          </div>
          <div class="info no-txt-overflow">
            <div class="names no-txt-overflow">
              <p class="display-name no-txt-overflow">
                {{ user?.displayName }}
              </p>
              <p class="username no-txt-overflow" @click="copyUsername">
                @{{ user?.username }}
              </p>
            </div>
            <div class="badges" v-if="user?.globalRoles?.length > 0">
              <VIPBadgeIcon
                v-if="user?.globalRoles.includes('vip')"
              ></VIPBadgeIcon>
              <DeveloperBadgeIcon
                v-if="user.globalRoles.includes('developer')"
              ></DeveloperBadgeIcon>
              <ModeratorBadgeIcon
                v-if="user?.globalRoles.includes('moderator')"
              ></ModeratorBadgeIcon>
              <AdminBadgeIcon
                v-if="user?.globalRoles.includes('admin')"
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
            <pre>{{ users.get(modalData.userID)?.about }}</pre>
          </div>
        </div>
      </div>
    </div>
  </Transition>
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
    border-radius: @border-r-small;
    padding: @padding-xlarge;
    row-gap: @gap-xlarge;
    width: 16rem;

    .head {
      display: flex;
      justify-content: center;
      column-gap: @gap-xlarge;
      align-items: center;
      width: 100%;

      .pfp {
        width: 4.5rem;
        height: 4.5rem;

        min-width: 4.5rem;
        min-height: 4.5rem;
        padding: @padding-xlarge;

        img {
          border-radius: @border-r-circle;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .info {
        display: flex;
        flex-direction: column;
        padding: 0.8rem;
        row-gap: @gap-tiny;
        justify-content: center;
        width: 100%;

        .note {
          display: flex;
          flex-direction: column;
          margin-top: 0.5rem;

          .title {
            font-size: @font-s-small;
            font-weight: @font-w-bolder;
          }

          textarea {
            margin-top: 0.1rem;
            background: transparent;
            outline: none;
            border: none;
            resize: none;
            font-size: @font-s-tiny;
            font-weight: @font-w-normal;
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
          padding: @padding-small;
          width: fit-content;
          max-width: 50%;
          border-radius: @border-r-big;
          column-gap: @gap-medium;
          overflow-x: auto !important;

          svg {
            height: 0.7rem;
            width: 0.7rem;
            min-width: 0.7rem;
            min-height: 0.7rem;
          }
        }

        .names {
          display: flex;
          flex-direction: column;
          width: 100%;
          .display-name {
            font-size: @font-s-xlarge;
            font-weight: @font-w-bolder;
          }

          .username {
            font-size: @font-s-medium;
            font-weight: @font-w-normal;
            color: @accent;
            cursor: pointer;
          }
        }

        &::before {
          position: absolute;
          top: 0;
          left: 0;
          content: "";
          height: 100%;
          width: 3px;
          border-radius: @border-r-big;
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
        border-radius: @border-r-small;
        padding: @padding-medium;
        font-size: @font-s-small;
        font-weight: @font-w-normal;
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
