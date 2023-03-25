<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, ref, watch, onMounted, nextTick, onUnmounted } from "vue";
import { storeToRefs } from "pinia";

import MessageComponent from "@/components/messages/MessageComponent.vue";
import { useCommonStore } from "@/stores/CommonStore";
import { useChannelStore } from "@/stores/ChannelStore";
import CopyIcon from "@/icons/CopyIcon.vue";
import PencilIcon from "@/icons/PencilIcon.vue";
import DeleteIcon from "@/icons/DeleteIcon.vue";
import { useRoomStore } from "@/stores/RoomStore";
import { useNotificationStore } from "@/stores/NotificationStore";
import ChatBoxComponent from "@/components/messages/ChatBoxComponent.vue";

const route = useRoute();

const channelID = computed((): string => {
  return route.params.channelID?.toString();
});

const messagesRef = ref<HTMLElement>();
const commonData = storeToRefs(useCommonStore());

const channelData = computed(() => {
  return {
    channelID: channelID.value,
    messages: useChannelStore().getChannelMessages(channelID.value),
  };
});

const emits = defineEmits<{
  (e: "edit"): void;
}>();

const triggerInteract = (messageID: string) => {
  const roomOwner =
    useRoomStore().rooms[useChannelStore().channels[channelID.value].room]
      .creatorID === commonData.activeUserData.value?.id;
  const messageSender =
    useChannelStore().channels[channelID.value].messages[messageID].sender ==
    commonData.activeUserData.value?.id;

  useCommonStore().showModal([
    {
      condition: () => roomOwner || messageSender,
      action: async () => await useChannelStore().deleteMessage(messageID),
      icon: DeleteIcon,
      title: "Delete Message",
    },
    {
      condition: () => true,
      action: async () => {
        try {
          await navigator.clipboard.writeText(
            (
              messagesRef.value?.querySelector(
                `[messageid="${messageID}"]`
              ) as HTMLElement
            ).innerText
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
  commonData.commonData.value.channelScroll[channelID.value] =
    messagesRef.value?.scrollTop ?? 0;

  if (
    !commonData.commonData.value.fetchingMessages[channelID.value] &&
    (messagesRef.value?.scrollTop ?? 0) < 300
  ) {
    commonData.commonData.value.fetchingMessages[channelID.value] = true;

    const oldHeight = messagesRef.value?.scrollHeight ?? 0;

    const newMessages = await useChannelStore().fetchMoreMessages(
      channelID.value
    );

    if (newMessages) {
      const newHeight = messagesRef.value?.scrollHeight ?? 0;
      messagesRef.value!.scroll({
        top: (messagesRef.value?.scrollTop ?? 0) + (newHeight - oldHeight),
      });
      commonData.commonData.value.fetchingMessages[channelID.value] = false;
    }
  }
};

onMounted(async () => {
  await nextTick();

  messagesRef.value!.scrollTop =
    commonData.commonData.value.channelScroll[channelID.value] ??
    messagesRef.value!.scrollHeight ??
    0;
  messagesRef.value?.addEventListener("scroll", scrollMethod);

  watch(channelID, async () => {
    await nextTick();
    const scrollHeight = messagesRef.value?.scrollHeight ?? 0;

    messagesRef.value?.scroll({
      top:
        commonData.commonData.value.channelScroll[channelID.value] ??
        scrollHeight,
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
      commonData.commonData.value.channelScroll[channelID.value] ===
        undefined || scroll < 1000;

    if (bottom)
      messagesRef.value?.scroll({
        top: scrollHeight,
      });
    else
      messagesRef.value?.scroll({
        top: commonData.commonData.value.channelScroll[channelID.value],
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
      :message="item"
      class="message"
      v-for="(item, index) in channelData.messages"
      :continuing="false"
      :key="index"
      :messageID="item.id"
      @contextmenu="triggerInteract(item.id)"
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
}
</style>
