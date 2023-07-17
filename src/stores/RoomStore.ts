import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { APIInstance, mediaInstance } from "@/utils/Axios";
import { useChannelStore, type Channel } from "@/stores/ChannelStore";
import { useUserStore, type User } from "@/stores/UserStore";
import { useNotificationStore } from "./NotificationStore";
import router from "@/router";
import { useActiveUserStore } from "./ActiveUserStore";

export interface Room {
  id: string;
  name: string;
  profilePic: string;
  timeCreated: number;
  creatorID: string;
  members: string[];
  channels: string[];
  friendship?: {
    friendA: string;
    friendB: string;
  };
}

export const useRoomStore = defineStore("room", () => {
  const rooms = ref(new Map<string, Room>());

  const channelStore = useChannelStore();
  const userStore = useUserStore();
  const activeUserStore = useActiveUserStore();
  const notificationStore = useNotificationStore();

  setInterval(() => {
    // refresh images
    rooms.value.forEach((room) => {
      const raw = room.profilePic.split("?")[0];
      room.profilePic = raw;
    });
  }, 30000);

  const sortedRoom = computed(() => {
    return activeUserStore.activeUserData?.rooms;
  });

  const DMs = computed(() => {
    return activeUserStore.activeUserData?.DMs;
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

      notificationStore.pushAlert({
        type: "info",
        message: "Room deleted",
      });
      return true;
    } catch (err) {
      notificationStore.pushAlert({
        type: "error",
        message: "Failed to delete room",
      });
      return false;
    }
  };

  const leaveRoom = async (roomID: string) => {
    try {
      const res = await APIInstance.request({
        method: "POST",
        url: `/rooms/leave/${roomID}`,
      });

      notificationStore.pushAlert({
        type: "info",
        message: "Left room",
      });
      return true;
    } catch (err) {
      notificationStore.pushAlert({
        type: "error",
        message: "Failed to leave room",
      });
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
      return false;
    }

    rooms.value.set(roomID, {
      id: roomID,
      name: room.name,
      profilePic: room.profilePic,
      timeCreated: room.timeCreated,
      members: room.members,
      channels: room.channels,
      creatorID: room.creatorID,
      friendship: room.friendship ?? null,
    });

    return true;
  };

  const loadRoom = async (roomID: string) => {
    try {
      const room = rooms.value.get(roomID);
      if (!room) {
        notificationStore.pushAlert({
          type: "error",
          message: "Failed to load room",
        });
        throw "err";
      }

      const channelsRes = await APIInstance.request({
        method: "GET",
        url: `/channels/getRoomChannels/${roomID}`,
      });

      const channels: any[] = channelsRes.data;

      channels.forEach(async (channel) => {
        channelStore.channels.set(channel._id, {
          id: channel._id,
          name: channel.name ?? "",
          category: channel.category ?? "",
          messages: new Map(),
          description: channel.description ?? "",
          room: channel.room ?? "",
        });

        await channelStore.fetchMoreMessages(channel._id);
      });

      const usersRes = await APIInstance.request({
        method: "GET",
        url: `/users/getRoomMembers/${roomID}`,
      });
      const users: any[] = usersRes.data;

      users.forEach((user) => {
        userStore.users.set(user._id, {
          id: user._id,
          username: user.username ?? "",
          displayName: user.displayName ?? "",
          profilePic: user.profilePic ?? "",
          about: user.about ?? "",
          globalRoles: user.globalRoles ?? [],
        });
      });

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const getRoomChannels = (roomID: string) => {
    const room = rooms.value.get(roomID);

    const channels = new Map<string, Channel>();

    room?.channels.forEach((ch: string) => {
      channels.set(ch, {
        id: channelStore.channels.get(ch)?.id ?? "",
        name: channelStore.channels.get(ch)?.name ?? "",
        category: channelStore.channels.get(ch)?.category ?? "",
        messages: channelStore.channels.get(ch)?.messages ?? new Map(),
        description: channelStore.channels.get(ch)?.description ?? "",
        room: channelStore.channels.get(ch)?.room ?? "",
      });
    });
    return channels;
  };

  const getRoomMembers = (roomID: string) => {
    const members = new Map<string, User>();
    const room = rooms.value.get(roomID);

    room?.members.forEach((memberID) => {
      members.set(memberID, {
        id: userStore.users.get(memberID)?.id ?? "",
        username: userStore.users.get(memberID)?.username ?? "",
        displayName: userStore.users.get(memberID)?.displayName ?? "",
        profilePic: userStore.users.get(memberID)?.profilePic ?? "",
        about: userStore.users.get(memberID)?.about ?? "",
        globalRoles: userStore.users.get(memberID)?.globalRoles ?? [],
      });
    });

    return members;
  };

  const joinRoom = async (inviteCode: string) => {
    try {
      await APIInstance.request({
        method: "POST",
        url: `/rooms/join/${inviteCode}`,
      });
      notificationStore.pushAlert({
        type: "info",
        message: "Joined room",
      });
      return true;
    } catch (err) {
      notificationStore.pushAlert({
        type: "error",
        message: "Failed to join room",
      });
      return false;
    }
  };

  const init = async () => {
    try {
      const rms: string[] = (await fetchRooms()).concat(await fetchDMs());
      const promises = rms.map((el: string) => getOneRoom(el));
      await Promise.all(promises);

      // initial page load
      const activeRoom =
        window.location.href.split("channels/")[1]?.split("/")[0] ??
        window.location.href.split("me/")[1];
      if (
        window.location.href.includes("channels/") ||
        window.location.href.includes("me/")
      )
        if (!activeRoom || !rooms.value.get(activeRoom))
          await router.replace({ name: "Me" });

      rooms.value.forEach(async (rm, id) => {
        await loadRoom(id);
      });

      return true;
    } catch (errs: any) {
      return false;
    }
  };

  const createRoom = async (name: string, pfp: string) => {
    try {
      await APIInstance.request({
        method: "POST",
        url: `/rooms/create/`,
        data: {
          name: name,
          profilePic: pfp,
        },
      });
      notificationStore.pushAlert({
        type: "info",
        message: "Room created",
      });
      return true;
    } catch (err: any) {
      notificationStore.pushAlert({
        type: "error",
        message: "Failed to create room",
      });
      return false;
    }
  };

  const createDM = async (friendID: string) => {
    try {
      await APIInstance.request({
        method: "POST",
        url: `/rooms/createDM`,
        data: {
          friendID,
        },
      });
      notificationStore.pushAlert({
        type: "info",
        message: "DM created",
      });
    } catch (err) {
      notificationStore.pushAlert({
        type: "error",
        message: "Failed to create DM",
      });
      return false;
    }
  };

  const updateRoom = async (data: {
    roomID: string;
    name: string;
    profilePic?: FormData;
  }) => {
    try {
      await APIInstance.request({
        method: "POST",
        url: `/rooms/updateOne/${data.roomID}`,
        data: {
          name: data.name,
        },
      });

      if (data.profilePic) {
        await mediaInstance.request({
          method: "POST",
          url: `/roomPic/${data.roomID}`,
          data: data.profilePic,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      notificationStore.pushAlert({
        type: "info",
        message: "Room updated",
      });
      return true;
    } catch (err) {
      notificationStore.pushAlert({
        type: "error",
        message: "Failed to update room",
      });
      return false;
    }
  };

  const generateInvite = async (roomID: string) => {
    try {
      const res = await APIInstance.request({
        method: "POST",
        url: `/invites/create/${roomID}`,
      });
      const invite = res.data.invite;
      await navigator.clipboard.writeText(invite.code);
      useNotificationStore().pushAlert({
        type: "info",
        message: "Invite code copied to clipboard",
      });
    } catch (_) {
      useNotificationStore().pushAlert({
        type: "error",
        message: "Failed to create invite",
      });
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
    createDM,
    leaveRoom,
    joinRoom,
    fetchDMs,
    updateRoom,
    DMs,
    init,
    generateInvite,
  };
});
