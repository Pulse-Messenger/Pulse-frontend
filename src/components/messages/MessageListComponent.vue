<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick, onUnmounted } from "vue";
import { storeToRefs } from "pinia";

import MessageComponent from "@/components/messages/MessageComponent.vue";
import { useActiveUserStore } from "@/stores/ActiveUserStore";
import { useChannelStore } from "@/stores/ChannelStore";
import CopyIcon from "@/icons/CopyIcon.vue";
import PencilIcon from "@/icons/PencilIcon.vue";
import DeleteIcon from "@/icons/DeleteIcon.vue";
import { useRoomStore } from "@/stores/RoomStore";
import { useNotificationStore } from "@/stores/NotificationStore";
import ChatBoxComponent from "@/components/messages/ChatBoxComponent.vue";
import { useCommonStore } from "@/stores/CommonStore";
import { useModalStore } from "@/stores/ModalStore";

const messagesRef = ref<HTMLElement>();
const activeUserData = storeToRefs(useActiveUserStore());
const commonStore = useCommonStore();
const modalStore = useModalStore();
const roomStore = useRoomStore();
const channelStore = useChannelStore();

const channelData = computed(() => {
  return {
    channelID: props.channelID,
    messages: useChannelStore().getChannelMessages(props.channelID),
  };
});

const props = defineProps<{
  channelID: string;
}>();

const emits = defineEmits<{
  (e: "edit"): void;
}>();

const triggerInteract = (messageID: string) => {
  const roomOwner =
    roomStore.rooms.get(channelStore.channels.get(props.channelID)!.room)
      ?.creatorID === activeUserData.activeUserData.value?.id &&
    !roomStore.rooms.get(channelStore.channels.get(props.channelID)!.room)
      ?.friendship;

  const messageSender =
    useChannelStore().channels.get(props.channelID)?.messages.get(messageID)
      ?.sender == activeUserData.activeUserData.value?.id;

  modalStore.showInteractModal([
    {
      condition: () => roomOwner || messageSender,
      action: () =>
        modalStore.showConfirmModal(
          "Are you sure you want to delete this message?",
          async () => useChannelStore().deleteMessage(messageID),
        ),
      icon: DeleteIcon,
      title: "Delete Message",
    },
    {
      condition: () => true,
      action: async () => {
        try {
          await navigator.clipboard.writeText(
            channelStore.channels.get(props.channelID)!.messages.get(messageID)!
              .content,
          );
          useNotificationStore().pushAlert({
            type: "info",
            message: "Message copied to clipboard",
          });
        } catch {
          useNotificationStore().pushAlert({
            type: "error",
            message: "Couldn't copy message to clipboard",
          });
          return;
        }
      },
      icon: CopyIcon,
      title: "Copy message text",
    },
    {
      condition: () => messageSender,
      action: () => {
        chatBox.value.mode = "edit";
        chatBox.value.messageID = messageID;
        document.getElementById("chatbox")?.focus();
      },
      icon: PencilIcon,
      title: "Edit message",
    },
  ]);
};

const scrollMethod = async () => {
  commonStore.commonData.channelScroll[props.channelID] =
    messagesRef.value?.scrollTop ?? 0;

  if (
    !commonStore.commonData.fetchingMessages[props.channelID] &&
    (messagesRef.value?.scrollTop ?? 0) < 300
  ) {
    commonStore.commonData.fetchingMessages[props.channelID] = true;

    const oldHeight = messagesRef.value?.scrollHeight ?? 0;

    const newMessages = await useChannelStore().fetchMoreMessages(
      props.channelID,
    );

    if (newMessages) {
      const newHeight = messagesRef.value?.scrollHeight ?? 0;
      messagesRef.value!.scroll({
        top: (messagesRef.value?.scrollTop ?? 0) + (newHeight - oldHeight),
      });
      commonStore.commonData.fetchingMessages[props.channelID] = false;
    }
  }
};

onMounted(async () => {
  await nextTick();

  messagesRef.value!.scrollTop =
    commonStore.commonData.channelScroll[props.channelID] ??
    messagesRef.value!.scrollHeight ??
    0;
  messagesRef.value?.addEventListener("scroll", scrollMethod);

  watch(props, async () => {
    await nextTick();
    const scrollHeight = messagesRef.value?.scrollHeight ?? 0;

    messagesRef.value?.scroll({
      top:
        commonStore.commonData.channelScroll[props.channelID] ?? scrollHeight,
    });
  });

  watch(channelData, async (newM, oldM) => {
    if (newM.channelID != oldM.channelID) return;
    if (newM.messages.length < oldM.messages.length) return;

    const scrollHeight = messagesRef.value?.scrollHeight ?? 0;
    const scrollTop = messagesRef.value?.scrollTop ?? 0;
    const offsetHeight = messagesRef.value?.offsetHeight ?? 0;

    await nextTick();

    const scroll = scrollHeight - (scrollTop + offsetHeight);

    const bottom =
      commonStore.commonData.channelScroll[props.channelID] === undefined ||
      scroll < 1000;

    if (bottom)
      messagesRef.value?.scroll({
        top: scrollHeight,
      });
    else
      messagesRef.value?.scroll({
        top: commonStore.commonData.channelScroll[props.channelID],
      });
  });
});

onUnmounted(() => {
  messagesRef.value?.removeEventListener("scroll", scrollMethod);
});

const chatBox = ref({
  mode: "create" as "edit" | "create",
  messageID: "",
});
</script>

<template>
  <div class="messages" ref="messagesRef">
    <MessageComponent
      :message="item!"
      class="message"
      v-for="(item, index) in channelData.messages.values()"
      :continuing="false"
      :key="index"
      :messageID="item!.id"
      @contextmenu="triggerInteract(item!.id)"
    >
    </MessageComponent>
  </div>
  <ChatBoxComponent
    @cancelEdit="chatBox.mode = 'create'"
    :mode="chatBox.mode"
    :channelID="channelID"
    :messageID="chatBox.messageID"
  ></ChatBoxComponent>
</template>

<style lang="less" scoped>
@import "@/assets/base.less";

.messages {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-content: flex-start;
  row-gap: 0.1rem;
  height: 100%;
  padding: 0.3rem 0.2rem;
  overflow-y: auto;
  overflow-x: hidden;
  align-items: stretch;
  user-select: text !important;

  :deep(*) {
    user-select: text !important;
  }
}
</style>
