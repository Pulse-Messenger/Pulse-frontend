import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import { useChannelStore, type Channel } from "@/stores/ChannelStore";
import { useRoomStore } from "@/stores/RoomStore";

const loadChannelWebsockets = () => {
  const channels = storeToRefs(useChannelStore()).channels;
  const rooms = storeToRefs(useRoomStore()).rooms;

  socket.on("channels:new", (data: { channel: Channel }) => {
    channels.value.set(data.channel.id, { ...data.channel });
    channels.value.get(data.channel.id)!.messages = new Map();
    rooms.value.get(data.channel.room)?.channels.push(data.channel.id);
  });

  socket.on("channels:update", (data: { channel: Channel }) => {
    channels.value.get(data.channel.id)!.category = data.channel.category;
    channels.value.get(data.channel.id)!.description = data.channel.description;
    channels.value.get(data.channel.id)!.name = data.channel.name;
  });

  socket.on("channels:remove", (data: { channelID: string }) => {
    const roomID = channels.value.get(data.channelID)!.room;

    const roomChannels: string[] = [];
    rooms.value.get(roomID)?.channels.forEach((ch) => {
      if (ch !== data.channelID) roomChannels.push(ch);
    });
    rooms.value.get(roomID)!.channels = roomChannels;

    channels.value.delete(data.channelID)!;
  });
};

export default loadChannelWebsockets;
