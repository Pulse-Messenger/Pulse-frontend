import { defineStore } from "pinia";
import { ref } from "vue";

import { APIInstance, mediaInstance } from "@/utils/Axios";
import { useNotificationStore } from "./NotificationStore";

export interface Channel {
  id: string;
  name: string;
  category: string;
  messages: Map<string, Message>;
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
  const channels = ref(new Map<string, Channel>());

  const getChannelMessages = (channelID: string) => {
    if (!channels.value.get(channelID)) return [];
    return [...channels.value.get(channelID)!.messages.keys()]
      .map((e) => channels.value.get(channelID)?.messages.get(e))
      .sort((a, b) => (a?.timestamp ?? 0) - (b?.timestamp ?? 0));
  };

  const fetchMoreMessages = async (channelID: string) => {
    const messages: [] =
      (
        await APIInstance.request({
          method: "GET",
          url: `/messages/getChannelMessages/${channelID}/${
            channels.value.get(channelID)?.messages.size ?? 0
          }`,
        })
      ).data ?? [];

    messages
      .sort((a: any, b: any) => a.timestamp - b.timestamp)
      .forEach((message: any) => {
        channels.value.get(channelID)!.messages.set(message._id, {
          id: message._id,
          content: message.content,
          sender: message.sender,
          timestamp: message.timestamp,
          channel: message.channel,
        });
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
      err.response.data.errors?.forEach((errMsg: string) => {
        useNotificationStore().pushAlert({
          type: "warn",
          message: errMsg,
        });
      });
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
          category:
            data.category ?? channels.value.get(data.channelID)?.category ?? "",
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
        method: "POST",
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
