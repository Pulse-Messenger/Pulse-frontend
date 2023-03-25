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
}

export const useUserStore = defineStore("user", () => {
  const users = ref<{
    [key: string]: User;
  }>({});

  const fetchUser = async (userID: string) => {
    try {
      const { data } = await APIInstance.request({
        method: "GET",
        url: `/users/getOne/${userID}`,
      });

      users.value[data._id] = {
        about: data.about,
        displayName: data.displayName,
        globalRoles: data.globalRoles,
        id: data._id,
        profilePic: data.profilePic,
        username: data.username,
      };
      return true;
    } catch {
      return false;
    }
  };

  return { users, fetchUser };
});
