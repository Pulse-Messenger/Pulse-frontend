import { socket } from "@/utils/Socket";
import { useChannelStore, type Message } from "@/stores/ChannelStore";
import { useNotificationStore } from "@/stores/NotificationStore";
import { useRoomStore } from "@/stores/RoomStore";
import { useUserStore } from "@/stores/UserStore";
import router from "@/router";
import { useActiveUserStore } from "@/stores/ActiveUserStore";

const loadMessageWebsockets = () => {
  const channelStore = useChannelStore();
  const roomStore = useRoomStore();
  const userStore = useUserStore();
  const notificationStore = useNotificationStore();
  const activeUserStore = useActiveUserStore();

  socket.on("messages:new", (data: { message: Message }) => {
    if (channelStore.channels.get(data.message.channel))
      channelStore.channels
        .get(data.message.channel)!
        .messages.set(data.message.id, {
          ...data.message,
        });

    if (
      activeUserStore.activeUserData?.id === data.message.sender ||
      channelStore.channels.get(
        router.currentRoute.value.params.channelID?.toString()
      )?.id === data.message.channel ||
      roomStore.rooms.get(router.currentRoute.value.params.DMID?.toString())
        ?.channels[0] === data.message.channel ||
      activeUserStore.userPreferences?.notifications.doNotDisturb
    )
      return;

    const room = roomStore.rooms.get(
      channelStore.channels.get(data.message.channel)!.room
    );

    notificationStore.pushAlert({
      type: "message",
      message: data.message.content,
      extra: {
        channel: !room?.friendship
          ? room?.name ?? ""
          : userStore.users.get(data.message.sender)?.displayName + "'s DM",
        user: userStore.users.get(data.message.sender)!.displayName,
        userPfp: userStore.users.get(data.message.sender)!.profilePic,
      },
    });
  });

  socket.on("messages:update", (data: { message: Message }) => {
    channelStore.channels
      .get(data.message.channel)!
      .messages.get(data.message.id)!.content = data.message.content;
  });

  socket.on(
    "messages:deleteOne",
    (data: { messageID: string; channelID: string }) => {
      channelStore.channels
        .get(data.channelID)
        ?.messages.delete(data.messageID);
    }
  );
};

export default loadMessageWebsockets;
