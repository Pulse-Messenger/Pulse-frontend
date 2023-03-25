import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import { useRoomStore, type Room } from "@/stores/RoomStore";
import { useChannelStore } from "@/stores/ChannelStore";
import { useUserStore, type User } from "@/stores/UserStore";
import { useCommonStore } from "@/stores/CommonStore";
import router from "@/router";

const loadRoomWebsockets = () => {
  const rooms = storeToRefs(useRoomStore()).rooms;
  const users = storeToRefs(useUserStore()).users;
  const channels = storeToRefs(useChannelStore()).channels;
  const activeUser = storeToRefs(useCommonStore()).activeUserData;

  socket.on("rooms:deleteOne", async (data: { roomID: string }) => {
    await router.push({ name: "Me" });

    const room = rooms.value[data.roomID];
    room.channels.forEach((ch) => {
      delete channels.value[ch];
    });
    delete rooms.value[data.roomID];

    const newRooms: string[] = [];
    activeUser.value?.rooms.forEach((r) => {
      if (r != data.roomID) newRooms.push(r);
    });
    activeUser.value!.rooms = newRooms;
  });

  socket.on("rooms:create", async (data: { room: Room }) => {
    await useRoomStore().getOneRoom(data.room.id);
    activeUser.value?.rooms.push(data.room.id);
  });

  socket.on("rooms:join", async (data: { roomID: string; user: User }) => {
    const room = rooms.value[data.roomID];

    if (data.user.id === activeUser.value?.id) {
      try {
        await useRoomStore().getOneRoom(data.roomID);
        activeUser.value.rooms.push(data.roomID);
      } catch (_) {
        return;
      }
    } else {
      try {
        users.value[data.user.id] = { ...data.user };
        room.members.push(data.user.id);
      } catch (_) {
        return;
      }
    }
  });

  socket.on("rooms:leave", async (data: { roomID: string; userID: string }) => {
    const room = rooms.value[data.roomID];

    if (data.userID === activeUser.value?.id) {
      try {
        await router.push({ name: "Me" });

        const room = rooms.value[data.roomID];
        room.channels.forEach((ch) => {
          delete channels.value[ch];
        });
        delete rooms.value[data.roomID];

        const newRooms: string[] = [];
        activeUser.value?.rooms.forEach((r) => {
          if (r != data.roomID) newRooms.push(r);
        });

        activeUser.value!.rooms = newRooms;
      } catch (_) {
        return;
      }
    } else {
      try {
        const members: string[] = [];
        room.members.forEach((m) => {
          if (m != data.userID) members.push(m);
        });
        room.members = members;
      } catch (_) {
        return;
      }
    }
  });
};

export default loadRoomWebsockets;
