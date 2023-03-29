import { defineStore } from "pinia";
import { ref } from "vue";

import { APIInstance, mediaInstance } from "@/utils/Axios";
import { useNotificationStore } from "./NotificationStore";

export interface Channel {
  id: string;
  name: string;
  category: string;
  messages: { [key: string]: Message };
  description: string;
  room: string;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  channel: string;
}

export const useChannelStore = defineStore("channel", () => {
  const channels = ref<{
    [key: string]: Channel;
  }>({});

  const getChannelMessages = (channelID: string) => {
    if (!channels.value[channelID]) return [];
    return Object.keys(channels.value[channelID]?.messages)
      .map((e) => channels.value[channelID].messages[e])
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const fetchMoreMessages = async (channelID: string) => {
    const messages: [] =
      (
        await APIInstance.request({
          method: "GET",
          url: `/messages/getChannelMessages/${channelID}/${
            Object.keys(channels.value[channelID]!.messages).length ?? 0
          }`,
        })
      ).data ?? [];

    messages
      .sort((a: any, b: any) => a.timestamp - b.timestamp)
      .forEach((message: any) => {
        channels.value[channelID]!.messages[message._id] = {
          id: message._id,
          content: message.content,
          sender: message.sender,
          timestamp: message.timestamp,
          channel: message.channel,
        };
      });

    if (messages.length === 0) return false;
    return true;
  };

  const sendMessage = async (message: string, channelID: string) => {
    try {
      await APIInstance.request({
        method: "POST",
        url: `/messages/publish/`,
        data: {
          content: message,
          channelID: channelID,
        },
      });
      return true;
    } catch (err: any) {
      return false;
    }
  };

  const editMessage = async (message: string, messageID: string) => {
    try {
      await APIInstance.request({
        method: "POST",
        url: `/messages/editOne/${messageID}`,
        data: {
          content: message,
        },
      });
      return true;
    } catch (err: any) {
      return false;
    }
  };

  const deleteMessage = async (messageID: string) => {
    try {
      await APIInstance.request({
        method: "DELETE",
        url: `/messages/removeOne/${messageID}`,
      });
      return true;
    } catch (err: any) {
      return false;
    }
  };

  const createChannel = async (data: {
    name: string;
    description: string;
    roomID: string;
    category?: string;
  }) => {
    try {
      await APIInstance.request({
        method: "POST",
        url: `/channels/create/`,
        data: {
          ...data,
          category: data.category ?? "",
        },
      });
      return true;
    } catch (err: any) {
      return false;
    }
  };

  const deleteChannel = async (channelID: string) => {
    try {
      await APIInstance.request({
        method: "DELETE",
        url: `/channels/remove/${channelID}`,
      });
      return true;
    } catch (err: any) {
      return false;
    }
  };

  const updateChannel = async (data: {
    channelID: string;
    name: string;
    description: string;
    category?: string;
  }) => {
    try {
      await APIInstance.request({
        method: "POST",
        url: `/channels/updateOne/${data.channelID}`,
        data: {
          name: data.name,
          description: data.description,
          category: data.category ?? channels.value[data.channelID].category,
        },
      });
      return true;
    } catch (err: any) {
      return false;
    }
  };

  const uploadFiles = async (data: FormData) => {
    try {
      const res = await mediaInstance.request({
        method: "POSt",
        url: "/uploads",
        data: data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        files: [...(res.data.files ?? [])],
      };
    } catch {
      useNotificationStore().pushAlert({
        type: "error",
        message: "Failed to upload files",
      });
      return false;
    }
  };

  return {
    channels,
    fetchMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    createChannel,
    deleteChannel,
    updateChannel,
    getChannelMessages,
    uploadFiles,
  };
});
