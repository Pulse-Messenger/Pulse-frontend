<script setup lang="ts">
import XIcon from "@/icons/XIcon.vue";
import UploadIcon from "@/icons/UploadIcon.vue";
import { useChannelStore } from "@/stores/ChannelStore";

import { ref, onMounted, computed, nextTick } from "vue";
import { useNotificationStore } from "@/stores/NotificationStore";

const textarea = ref<HTMLTextAreaElement>();
const messageContent = ref("");

const autoGrow = () => {
  textarea.value!.style.height = "0.65rem";
  textarea.value!.style.height = `${textarea.value!.scrollHeight}px`;
};

const processMessage = async (evt: any) => {
  if (evt.which === 13 && evt.shiftKey) return;

  evt.preventDefault();

  if (messageContent.value.length > 2000 || messageContent.value.length === 0)
    return;

  if (!isEditing.value) {
    await useChannelStore().sendMessage(messageContent.value, props.channelID);
  } else {
    await useChannelStore().editMessage(messageContent.value, props.messageID!);
    emit("cancelEdit");
  }

  messageContent.value = "";
  await nextTick();
  autoGrow();
};

const insertTab = (evt: any) => {
  evt.preventDefault();
  messageContent.value += "    ";
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

const uploadFiles = async (files: FileList) => {
  if (files.length > 10) {
    useNotificationStore().pushAlert({
      type: "warn",
      message: "You can only upload 10 files at once",
    });
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) formData.append("files", files[i]);

  const fileRes = await useChannelStore().uploadFiles(formData);
  if (!fileRes) return;

  await useChannelStore().sendMessage(
    fileRes.files.join("\n"),
    props.channelID
  );
};

onMounted(() => {
  autoGrow();
});
</script>

<template>
  <div class="chatbox">
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
        ><XIcon @click="emit('cancelEdit')" class="close-edit"></XIcon>
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
        @keydown.esc="emit('cancelEdit')"
        @keydown.tab="(evt) => insertTab(evt)"
      ></textarea>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.chatbox {
  display: grid;
  grid-template-columns: auto 1fr auto;
  column-gap: 0.3rem;
  justify-content: center;
  align-items: center;
  padding: 0.4rem 0.2rem;
  margin: 0.2rem;
  border: 2px solid @background;
  background: @background-light;
  border-radius: 10px;

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

  .main {
    display: flex;
    flex-direction: column;
    .mode {
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: left;
      width: 100%;
      font-size: 0.4rem;

      .close-edit {
        width: 0.8rem;
        height: 0.8rem;
        cursor: pointer;
      }
    }

    textarea {
      width: 100%;
      font-size: 0.45rem;
      background: none;
      color: @foreground-light;
      resize: none;
      outline: none;
      border: none;
      font-weight: 500;
      max-height: 30vh;
      height: 0.45rem;
    }
  }
}
</style>
