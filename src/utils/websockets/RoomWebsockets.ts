import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import { useRoomStore, type Room } from "@/stores/RoomStore";
import { useChannelStore } from "@/stores/ChannelStore";
import { useUserStore, type User } from "@/stores/UserStore";
import { useCommonStore } from "@/stores/CommonStore";
import router from "@/router";
import { useRoute } from "vue-router";

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
    const res = await useRoomStore().getOneRoom(data.room.id);
    if (res) activeUser.value?.rooms.push(data.room.id);
  });

  socket.on("DMs:create", async (data: { room: Room }) => {
    const res = await useRoomStore().getOneRoom(data.room.id);
    if (res) activeUser.value?.DMs.push(data.room.id);
  });

  socket.on("DMs:deleteOne", async (data: { roomID: string }) => {
    if (router.currentRoute.value.params.DMID)
      await router.push({ name: "Me" });

    const DM = rooms.value[data.roomID];
    DM.channels.forEach((ch) => {
      delete channels.value[ch];
    });
    delete rooms.value[data.roomID];

    const newDMs: string[] = [];
    activeUser.value?.DMs.forEach((r) => {
      if (r != data.roomID) newDMs.push(r);
    });
    activeUser.value!.DMs = newDMs;
  });

  socket.on("rooms:join", async (data: { roomID: string; user: User }) => {
    const room = rooms.value[data.roomID];

    if (data.user.id === activeUser.value?.id) {
      const res = await useRoomStore().getOneRoom(data.roomID);
      if (res) activeUser.value.rooms.push(data.roomID);
    } else {
      users.value[data.user.id] = { ...data.user };
      room.members.push(data.user.id);
    }
  });

  socket.on("rooms:leave", async (data: { roomID: string; userID: string }) => {
    const room = rooms.value[data.roomID];

    if (data.userID === activeUser.value?.id) {
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
    } else {
      const members: string[] = [];
      room.members.forEach((m) => {
        if (m != data.userID) members.push(m);
      });
      room.members = members;
    }
  });
};

export default loadRoomWebsockets;
