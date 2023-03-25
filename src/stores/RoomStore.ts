import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { APIInstance } from "@/utils/Axios";
import { useChannelStore, type Channel } from "@/stores/ChannelStore";
import { useUserStore, type User } from "@/stores/UserStore";
import { useCommonStore } from "@/stores/CommonStore";
import router from "@/router";

export interface Room {
  id: string;
  name: string;
  profilePic: string;
  timeCreated: number;
  creatorID: string;
  members: string[];
  channels: string[];
  loaded: boolean;
  dm: boolean;
}

export const useRoomStore = defineStore("room", () => {
  const rooms = ref<{
    [key: string]: Room;
  }>({});

  const channelStore = useChannelStore();
  const userStore = useUserStore();
  const commonStore = useCommonStore();

  const sortedRoom = computed(() => {
    return commonStore.activeUserData?.rooms;
  });

  const fetchRooms = async () => {
    const res = await APIInstance.request({
      method: "GET",
      url: "/rooms/get",
    });
    return res.data;
  };

  const fetchDMs = async () => {
    const res = await APIInstance.request({
      method: "GET",
      url: "/rooms/getDMs",
    });
    return res.data;
  };

  const deleteRoom = async (roomID: string) => {
    try {
      const res = await APIInstance.request({
        method: "DELETE",
        url: `/rooms/remove/${roomID}`,
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const leaveRoom = async (roomID: string) => {
    try {
      const res = await APIInstance.request({
        method: "POST",
        url: `/rooms/leave/${roomID}`,
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const getOneRoom = async (roomID: string) => {
    const res = await APIInstance.request({
      method: "GET",
      url: `/rooms/getOne/${roomID}`,
    });
    const room: any = res.data;

    if (!room) {
      throw ["Room does not exist"];
    }

    rooms.value[roomID] = {
      id: roomID,
      name: room.name,
      profilePic: room.profilePic,
      timeCreated: room.timeCreated,
      members: room.members,
      channels: room.channels,
      creatorID: room.creatorID,
      loaded: false,
      dm: room.dm,
    };

    return true;
  };

  const loadRoom = async (roomID: string) => {
    const room = rooms.value[roomID];
    if (!room) {
      return false;
    }

    const channelsRes = await APIInstance.request({
      method: "GET",
      url: `/channels/getRoomChannels/${roomID}`,
    });

    const channels: any[] = channelsRes.data;

    channels.forEach(async (channel) => {
      channelStore.channels[channel._id] = {
        id: channel._id,
        name: channel.name ?? "",
        category: channel.category ?? "",
        messages: {},
        description: channel.description ?? "",
        room: channel.room ?? "",
      };

      await channelStore.fetchMoreMessages(channel._id);
    });

    const usersRes = await APIInstance.request({
      method: "GET",
      url: `/users/getRoomMembers/${roomID}`,
    });
    const users: any[] = usersRes.data;

    users.forEach((user) => {
      if (user) {
        userStore.users[user._id] = {
          id: user._id,
          username: user.username ?? "",
          displayName: user.displayName ?? "",
          profilePic: user.profilePic ?? "",
          about: user.about ?? "",
          globalRoles: user.globalRoles ?? [],
        };
      }
    });
  };

  const getRoomChannels = (roomID: string) => {
    const room = rooms.value[roomID];

    const channels: { [key: string]: Channel } = {};

    room?.channels.forEach((ch: string) => {
      channels[ch] = {
        id: channelStore.channels[ch]?.id ?? "",
        name: channelStore.channels[ch]?.name ?? "",
        category: channelStore.channels[ch]?.category ?? "",
        messages: channelStore.channels[ch]?.messages ?? [],
        description: channelStore.channels[ch]?.description ?? "",
        room: channelStore.channels[ch]?.room ?? "",
      };
    });

    return channels;
  };

  const getRoomMembers = (roomID: string) => {
    const members: { [key: string]: User } = {};
    const room = rooms.value[roomID];

    room?.members.forEach((memberID) => {
      members[memberID] = {
        id: userStore.users[memberID]?.id ?? "",
        username: userStore.users[memberID]?.username ?? "",
        displayName: userStore.users[memberID]?.displayName ?? "",
        profilePic: userStore.users[memberID]?.profilePic ?? "",
        about: userStore.users[memberID]?.about ?? "",
        globalRoles: userStore.users[memberID]?.globalRoles ?? [],
      };
    });

    return members;
  };

  const joinRoom = async (inviteCode: string) => {
    try {
      const res = await APIInstance.request({
        method: "POST",
        url: `/rooms/join/${inviteCode}`,
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const init = async () => {
    try {
      const rms = (await fetchRooms()).concat(await fetchDMs());
      const promises = rms.map((el: string) => getOneRoom(el));
      await Promise.all(promises);

      // initial page load
      const activeRoom = window.location.href
        .split("channels/")[1]
        ?.split("/")[0];
      if (window.location.href.includes("channels/"))
        if (activeRoom && rooms.value[activeRoom]) {
          await loadRoom(activeRoom);
          rooms.value[activeRoom].loaded = true;
        } else router.replace({ name: "Me" });

      return true;
    } catch (errs: any) {
      return false;
    }
  };

  const createRoom = async (name: string, pfp: string) => {
    try {
      const res = await APIInstance.request({
        method: "POST",
        url: `/rooms/create/`,
        data: {
          name: name,
          profilePic: pfp,
        },
      });

      return true;
    } catch (err: any) {
      return false;
    }
  };

  return {
    rooms,
    sortedRoom,
    fetchRooms,
    getOneRoom,
    loadRoom,
    getRoomChannels,
    getRoomMembers,
    deleteRoom,
    createRoom,
    leaveRoom,
    joinRoom,
    fetchDMs,
    init,
  };
});
