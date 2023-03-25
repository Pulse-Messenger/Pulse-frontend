import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import { useChannelStore, type Message } from "@/stores/ChannelStore";

const loadMessageWebsockets = () => {
  const channels = storeToRefs(useChannelStore()).channels;

  socket.on("messages:new", (data: { message: Message }) => {
    channels.value[data.message.channel]!.messages[data.message.id] = {
      ...data.message,
    };
  });

  socket.on("messages:update", (data: { message: Message }) => {
    channels.value[data.message.channel]!.messages[data.message.id].content =
      data.message.content;
  });

  socket.on("messages:deleteOne", (data: { messageID: string }) => {
    for (const chID in channels.value) {
      if (channels.value[chID].messages[data.messageID]) {
        delete channels.value[chID].messages[data.messageID];
      }
    }
  });
};

export default loadMessageWebsockets;
