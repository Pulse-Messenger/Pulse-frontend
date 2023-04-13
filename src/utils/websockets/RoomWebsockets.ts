import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import { useRoomStore, type Room } from "@/stores/RoomStore";
import { useChannelStore } from "@/stores/ChannelStore";
import { useUserStore, type User } from "@/stores/UserStore";
import router from "@/router";
import { useActiveUserStore } from "@/stores/ActiveUserStore";

const loadRoomWebsockets = () => {
  const rooms = storeToRefs(useRoomStore()).rooms;
  const users = storeToRefs(useUserStore()).users;
  const channels = storeToRefs(useChannelStore()).channels;
  const activeUser = storeToRefs(useActiveUserStore()).activeUserData;

  socket.on("rooms:deleteOne", async (data: { roomID: string }) => {
    await router.push({ name: "Me" });

    const room = rooms.value.get(data.roomID);
    room?.channels.forEach((ch) => {
      channels.value.delete(ch);
    });
    rooms.value.delete(data.roomID);

    const newRooms: string[] = [];
    activeUser.value?.rooms.forEach((r) => {
      if (r != data.roomID) newRooms.push(r);
    });
    activeUser.value!.rooms = newRooms;
  });

  socket.on("rooms:create", async (data: { room: Room }) => {
    const res = await useRoomStore().getOneRoom(data.room.id);
    if (res) {
      await useRoomStore().loadRoom(data.room.id);
      activeUser.value?.rooms.push(data.room.id);
    }
  });

  socket.on("rooms:update", async (data: { roomID: string; name: string }) => {
    rooms.value.get(data.roomID)!.name = data.name;
  });

  socket.on("DMs:create", async (data: { room: Room }) => {
    const res = await useRoomStore().getOneRoom(data.room.id);
    if (res) {
      await useRoomStore().loadRoom(data.room.id);
      activeUser.value?.DMs.push(data.room.id);
    }
  });

  socket.on("DMs:deleteOne", async (data: { roomID: string }) => {
    if (router.currentRoute.value.params.DMID)
      await router.push({ name: "Me" });

    const DM = rooms.value.get(data.roomID);
    DM?.channels.forEach((ch) => {
      channels.value.delete(ch);
    });
    rooms.value.delete(data.roomID);

    const newDMs: string[] = [];
    activeUser.value?.DMs.forEach((r) => {
      if (r != data.roomID) newDMs.push(r);
    });
    activeUser.value!.DMs = newDMs;
  });

  socket.on("rooms:join", async (data: { roomID: string; user: User }) => {
    const room = rooms.value.get(data.roomID);

    if (data.user.id === activeUser.value?.id) {
      const res = await useRoomStore().getOneRoom(data.roomID);
      if (res) {
        await useRoomStore().loadRoom(data.roomID);
        activeUser.value.rooms.push(data.roomID);
      }
    } else {
      users.value.set(data.user.id, { ...data.user });
      room?.members.push(data.user.id);
    }
  });

  socket.on("rooms:leave", async (data: { roomID: string; userID: string }) => {
    const room = rooms.value.get(data.roomID);

    if (data.userID === activeUser.value?.id) {
      await router.push({ name: "Me" });

      room?.channels.forEach((ch) => {
        channels.value.delete(ch);
      });
      rooms.value.delete(data.roomID);

      const newRooms: string[] = [];
      activeUser.value?.rooms.forEach((r) => {
        if (r != data.roomID) newRooms.push(r);
      });

      activeUser.value!.rooms = newRooms;
    } else {
      const members: string[] = [];
      room?.members.forEach((m) => {
        if (m != data.userID) members.push(m);
      });
      room!.members = members;
    }
  });
};

export default loadRoomWebsockets;
