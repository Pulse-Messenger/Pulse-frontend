import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import {
  useChannelStore,
  type Channel,
  type Message,
} from "@/stores/ChannelStore";
import { useRoomStore } from "@/stores/RoomStore";

const loadChannelWebsockets = () => {
  const channels = storeToRefs(useChannelStore()).channels;
  const rooms = storeToRefs(useRoomStore()).rooms;

  socket.on("channels:new", (data: { channel: Channel }) => {
    channels.value[data.channel.id] = { ...data.channel };
    rooms.value[data.channel.room]?.channels.push(data.channel.id);
  });

  socket.on("channels:update", (data: { channel: Channel }) => {
    channels.value[data.channel.id] = { ...data.channel };
  });

  socket.on("channels:remove", (data: { channelID: string }) => {
    const roomID = channels.value[data.channelID].room;

    const roomChannels: string[] = [];
    rooms.value[roomID].channels.forEach((ch) => {
      if (ch !== data.channelID) roomChannels.push(ch);
    });
    rooms.value[roomID].channels = roomChannels;

    delete channels.value[data.channelID];
  });
};

export default loadChannelWebsockets;
