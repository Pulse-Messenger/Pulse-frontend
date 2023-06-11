<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { storeToRefs } from "pinia";

import XIcon from "@/icons/XIcon.vue";
import UploadIcon from "@/icons/UploadIcon.vue";
import { useChannelStore } from "@/stores/ChannelStore";
import { useNotificationStore } from "@/stores/NotificationStore";
import SendIcon from "@/icons/SendIcon.vue";
import { useActiveUserStore } from "@/stores/ActiveUserStore";
import { useUserStore } from "@/stores/UserStore";
import { useRoomStore } from "@/stores/RoomStore";

const channelStore = useChannelStore();
const users = storeToRefs(useUserStore()).users;

const textarea = ref<HTMLTextAreaElement>();
const messageContent = ref("");
let sendingMessage = false;

const autoGrow = () => {
  textarea.value!.style.height = "0.65rem";
  textarea.value!.style.height = `${textarea.value!.scrollHeight}px`;
};

const processMessage = async (evt: any) => {
  if (sendingMessage) return;

  if (useActiveUserStore().baseFontSize === 28) {
    if (evt.key === "Enter" && evt.shiftKey) {
      return;
    }
  } else {
    if (evt.key === "Enter") {
      return;
    }
  }
  evt.preventDefault();

  if (
    messageContent.value.trim().length > 2000 ||
    messageContent.value.trim().length === 0
  )
    return;

  sendingMessage = true;

  const roomMembers = useRoomStore().rooms.get(
    channelStore.channels.get(props.channelID)!.room,
  )!.members;

  let finalContent = messageContent.value;

  finalContent = messageContent.value.replace(
    /@[\w-]+(?=\s|$)/g,
    (username) => {
      let user;

      roomMembers.forEach((mem) => {
        if (users.value.get(mem)?.username === username.slice(1)) {
          user = `[!${mem}]`;
        }
      });

      return user ?? username;
    },
  );

  messageContent.value = "";

  if (!isEditing.value) {
    await channelStore.sendMessage(finalContent, props.channelID);
  } else {
    await channelStore.editMessage(finalContent, props.messageID!);
    emit("cancelEdit");
  }
  sendingMessage = false;

  await nextTick();
  autoGrow();
};

const insertTab = async (evt: any) => {
  evt.preventDefault();

  const cursorPos = textarea.value!.selectionStart;
  const textBeforeCursor = textarea.value!.value.substring(0, cursorPos);
  const textAfterCursor = textarea.value!.value.substring(
    textarea.value!.selectionEnd,
  );

  const tabCharacter = "\t";
  const newText = textBeforeCursor + tabCharacter + textAfterCursor;
  messageContent.value = newText;

  await nextTick();
  textarea.value!.setSelectionRange(
    cursorPos + tabCharacter.length,
    cursorPos + tabCharacter.length,
  );
};

const emit = defineEmits<{
  (e: "cancelEdit"): void;
}>();

const props = defineProps<{
  mode: "create" | "edit";
  messageID?: string;
  channelID: string;
}>();

const isEditing = computed(() => {
  return props.mode === "edit" && props.messageID;
});

const uploading = ref(false);

const uploadFiles = async (files: FileList) => {
  if (files.length > 10) {
    useNotificationStore().pushAlert({
      type: "warn",
      message: "You can only upload 10 files at once",
    });
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    if (files[i].size > 104_857_600) {
      useNotificationStore().pushAlert({
        type: "warn",
        message: "Max size for files is 100MB",
      });
      return;
    }
    formData.append("files", files[i]);
  }

  uploading.value = true;
  const fileRes = await channelStore.uploadFiles(formData);
  uploading.value = false;
  if (!fileRes) return;

  await channelStore.sendMessage(fileRes.files.join("\n"), props.channelID);
};

const focusInput = () => {
  textarea.value?.focus();
};

onMounted(() => {
  autoGrow();
});

const cancelEdit = async () => {
  messageContent.value = "";
  emit("cancelEdit");
  await nextTick();

  autoGrow();
};

watch(props, async () => {
  if (props.mode === "edit" && props.messageID)
    messageContent.value =
      channelStore.channels.get(props.channelID)?.messages.get(props.messageID)
        ?.content ?? "";

  await nextTick();
  autoGrow();
});
</script>

<template>
  <div class="chatbox" @click="focusInput()">
    <div class="upload">
      <UploadIcon> </UploadIcon>
      <label>
        <input
          type="file"
          multiple="true"
          @input="(e: any) => uploadFiles(e.target.files)"
        />
      </label>
    </div>

    <div class="main">
      <div class="mode" v-if="props.mode === 'edit'">
        <span>Editing message</span
        ><XIcon @click="cancelEdit" class="close-edit"></XIcon>
      </div>
      <div class="mode" v-if="uploading">
        <span>Uploading file(s)...</span>
      </div>
      <textarea
        id="chatbox"
        spellcheck="false"
        name="chatbox"
        ref="textarea"
        tabIndex="{-1}"
        @input="autoGrow"
        v-model="messageContent"
        @keypress.enter="
        (evt: Event) => {
          processMessage(evt);
        }
      "
        @keydown.esc="cancelEdit"
        @keydown.tab="(evt) => insertTab(evt)"
      ></textarea>
    </div>
    <SendIcon class="send" @click="processMessage"></SendIcon>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.chatbox {
  display: grid;
  grid-template-columns: auto 1fr auto;
  column-gap: @gap-medium;
  justify-content: center;
  align-items: center;
  padding: @padding-medium 0.2rem;
  margin: 0.2rem;
  border: 2px solid @background;
  background: @background-light;
  border-radius: @border-r-big;
  cursor: text;

  &,
  & * {
    box-sizing: content-box;
  }

  .upload {
    display: flex;
    position: relative;

    svg {
      height: 0.9rem;
      width: 0.9rem;
      min-width: 0.9rem;
      min-height: 0.9rem;
    }

    label {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;

      input {
        display: none;
      }
    }
  }

  .send {
    min-width: 0.8rem;
    width: 0.8rem;
    padding-right: 0.2rem;
    cursor: pointer;
  }

  .main {
    display: flex;
    flex-direction: column;
    .mode {
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: left;
      width: 100%;
      font-size: @font-s-tiny;

      .close-edit {
        width: 0.8rem;
        height: 0.8rem;
        cursor: pointer;
      }
    }

    textarea {
      width: 100%;
      font-size: @font-s-small;
      background: none;
      color: @foreground-light;
      resize: none;
      outline: none;
      border: none;
      font-weight: @font-w-normal;
      max-height: 30vh;
      height: 0.45rem;
    }
  }
}
</style>
