import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import { useChannelStore, type Message } from "@/stores/ChannelStore";
import { useNotificationStore } from "@/stores/NotificationStore";
import { useRoomStore } from "@/stores/RoomStore";
import { useUserStore } from "@/stores/UserStore";
import { useCommonStore } from "@/stores/CommonStore";

const loadMessageWebsockets = () => {
  const channels = storeToRefs(useChannelStore()).channels;
  const rooms = storeToRefs(useRoomStore()).rooms;
  const users = storeToRefs(useUserStore()).users;
  const notificationStore = useNotificationStore();
  const activeUser = storeToRefs(useCommonStore()).activeUserData;

  socket.on("messages:new", (data: { message: Message }) => {
    channels.value[data.message.channel]!.messages[data.message.id] = {
      ...data.message,
    };

    if (activeUser.value?.id === data.message.sender) return;

    const room = rooms.value[channels.value[data.message.channel].room];

    notificationStore.pushAlert({
      type: "message",
      message: data.message.content,
      extra: {
        channel: !room.friendship
          ? room.name
          : users.value[data.message.sender].displayName + "'s DM",
        user: users.value[data.message.sender].displayName,
        userPfp: users.value[data.message.sender].profilePic,
      },
    });
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
