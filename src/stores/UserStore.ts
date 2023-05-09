import { APIInstance } from "@/utils/Axios";
import { defineStore } from "pinia";
import { ref } from "vue";

export interface User {
  id: string;
  username: string;
  displayName: string;
  profilePic: string;
  about: string;
  globalRoles: string[];
  active?: boolean;
}

export const useUserStore = defineStore("user", () => {
  const users = ref(new Map<string, User>());

  setInterval(() => {
    // refresh images
    users.value.forEach((user) => {
      const raw = user.profilePic.split("?")[0];
      user.profilePic = raw + "?" + Date.now();
    });
  }, 30000);

  const fetchUser = async (userID: string) => {
    try {
      const { data } = await APIInstance.request({
        method: "GET",
        url: `/users/getOne/${userID}`,
      });

      users.value.set(data._id, {
        about: data.about,
        displayName: data.displayName,
        globalRoles: data.globalRoles,
        id: data._id,
        profilePic: data.profilePic + "?" + Date.now(),
        username: data.username,
      });
      return true;
    } catch {
      return false;
    }
  };

  return { users, fetchUser };
});
