import { APIInstance, mediaInstance } from "@/utils/Axios";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useNotificationStore } from "./NotificationStore";
import { useUserStore } from "./UserStore";

interface ActiveUserData {
  id: string;
  username: string;
  email: string;
  displayName: string;
  profilePic: string;
  rooms: string[];
  DMs: string[];
  about: string;
  sessions: [
    {
      id: string;
      ip: string;
      useragent: string;
    },
  ];
}

export interface UserPreferences {
  appearance: {
    scale: number;
    theme: "light" | "dark";
  };
  notifications: {
    doNotDisturb: boolean;
  };
}

export interface Friendship {
  creator: string;
  friend: string;
  accepted: boolean;
}

export const useActiveUserStore = defineStore("activeUser", () => {
  const baseFontSize = ref(window.innerWidth < 800 ? 25 : 28);

  window.addEventListener("resize", () => {
    baseFontSize.value = window.innerWidth < 800 ? 25 : 28;

    (document.querySelector(":root") as HTMLElement).style.fontSize =
      (baseFontSize.value * (userPreferences.value?.appearance.scale ?? 100)) /
        100 +
      "px";
  });

  const activeUserData = ref<ActiveUserData>();
  const friendsData = ref<{ [id: string]: Friendship }>({});

  const userPreferences = ref<UserPreferences>();
  const unsavedPreferences = ref(false);

  const loadUserPreferences = () => {
    const theme = userPreferences.value!.appearance.theme;
    if (theme === "dark") {
      document.querySelector("#app")?.classList.add("dark");
      document.querySelector("#app")?.classList.remove("light");
    } else {
      document.querySelector("#app")?.classList.remove("dark");
      document.querySelector("#app")?.classList.add("light");
    }

    (document.querySelector(":root") as HTMLElement).style.fontSize =
      (baseFontSize.value * (userPreferences.value?.appearance.scale ?? 100)) /
        100 +
      "px";
  };

  const fetchActiveUser = async () => {
    try {
      const user = await APIInstance.request({
        method: "GET",
        url: "/users/get",
      });

      activeUserData.value = {
        email: user.data.email,
        displayName: user.data.displayName,
        username: user.data.username,
        rooms: user.data.rooms,
        DMs: user.data.DMs,
        profilePic: user.data.profilePic,
        sessions: user.data.sessions.map(({ _id, ...ses }: any) => {
          return {
            id: _id,
            ...ses,
          };
        }),
        id: user.data._id,
        about: user.data.about,
      };

      const settings = await APIInstance.request({
        method: "GET",
        url: "/settings/get",
      });

      userPreferences.value = {
        appearance: {
          scale: settings.data.settings.appearance.scale ?? 100,
          theme: settings.data.settings.appearance.theme ?? "dark",
        },
        notifications: {
          doNotDisturb:
            settings.data.settings.notifications.doNotDisturb ?? false,
        },
      };

      loadUserPreferences();

      const friends = await APIInstance.request({
        method: "GET",
        url: "/friendships/get",
      });

      friends.data.friendships.forEach(async (f: any) => {
        const id =
          f.creator === activeUserData.value?.id ? f.friend : f.creator;
        await useUserStore().fetchUser(id);

        friendsData.value[id] = {
          creator: f.creator,
          friend: id,
          accepted: f.accepted,
        };
      });
      return true;
    } catch {
      return false;
    }
  };

  const updateUser = async (data: {
    profilePic?: FormData;
    displayName: string;
    about: string;
    password?: string;
  }) => {
    try {
      if (data.profilePic) {
        await mediaInstance.request({
          method: "POSt",
          url: "/profilePics",
          data: data.profilePic,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        activeUserData.value!.profilePic = URL.createObjectURL(
          data.profilePic.get("file") as any,
        );
      }

      await APIInstance.request({
        method: "POST",
        url: "/users/updateOne",
        data: {
          displayName: data.displayName,
          about: data.about,
          password: data.password,
        },
      });

      useNotificationStore().pushAlert({
        type: "info",
        message: "Profile updated",
      });
      return true;
    } catch {
      useNotificationStore().pushAlert({
        type: "warn",
        message: "Failed to update profile",
      });
      return false;
    }
  };

  const updatePreferences = async () => {
    try {
      await APIInstance.request({
        method: "POST",
        url: "/settings/update",
        data: { settings: userPreferences.value },
      });

      useNotificationStore().pushAlert({
        type: "info",
        message: "Preferences updated",
      });
      return true;
    } catch {
      useNotificationStore().pushAlert({
        type: "warn",
        message: "Failed to update preferences",
      });
      return false;
    }
  };

  const deleteAllSessions = async () => {
    try {
      await APIInstance.request({
        method: "DELETE",
        url: "/auth/logoutAll",
      });

      useNotificationStore().pushAlert({
        type: "info",
        message: "Log out successful",
      });

      return true;
    } catch {
      useNotificationStore().pushAlert({
        type: "error",
        message: "Failed to log out",
      });
      return false;
    }
  };

  const deleteSession = async (sessionID: string) => {
    try {
      await APIInstance.request({
        method: "DELETE",
        url: `/auth/logoutOne/${sessionID}`,
      });

      useNotificationStore().pushAlert({
        type: "info",
        message: "Log out successful",
      });

      return true;
    } catch {
      useNotificationStore().pushAlert({
        type: "error",
        message: "Failed to log out",
      });
      return false;
    }
  };

  const manageFriendship = async (data: {
    userID: string;
    action: "accept" | "create" | "reject" | "remove" | "cancel";
    success: string;
    error: string;
  }) => {
    try {
      await APIInstance.request({
        method: "POST",
        url: `/friendships/${data.action}/${data.userID}`,
      });

      useNotificationStore().pushAlert({
        type: "info",
        message: data.success,
      });

      return true;
    } catch {
      useNotificationStore().pushAlert({
        type: "error",
        message: data.error,
      });
      return false;
    }
  };

  watch(
    userPreferences,
    (oldV, newV) => {
      if (Object.is(oldV, newV)) unsavedPreferences.value = true;
      else unsavedPreferences.value = false;
      loadUserPreferences();
    },
    { deep: true },
  );

  return {
    activeUserData,
    userPreferences,
    loadUserPreferences,
    fetchActiveUser,
    updateUser,
    baseFontSize,
    updatePreferences,
    unsavedPreferences,
    deleteAllSessions,
    deleteSession,
    friendsData,
    manageFriendship,
  };
});
