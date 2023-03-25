import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import { useCommonStore } from "@/stores/CommonStore";
import { useUserStore } from "@/stores/UserStore";
import { useAuthStore } from "@/stores/AuthStore";

const loadUserWebsockets = () => {
  const activeUser = storeToRefs(useCommonStore()).activeUserData;
  const users = storeToRefs(useUserStore()).users;

  socket.on(
    "activeUser:update",
    async (data: {
      user: {
        displayName: string;
        about: string;
        email: string;
      };
    }) => {
      if (activeUser.value) {
        activeUser.value.about = data.user.about;
        activeUser.value.displayName = data.user.displayName;
        activeUser.value.email = data.user.email;
        const tempPFP = activeUser.value.profilePic;
        activeUser.value.profilePic = "";
        activeUser.value.profilePic = tempPFP;
      }
    }
  );

  socket.on(
    "users:update",
    async (data: {
      user: {
        userID: string;
        displayName: string;
        about: string;
      };
    }) => {
      const user = users.value[data.user.userID];
      if (user) {
        users.value[data.user.userID].about = data.user.about ?? "";
        users.value[data.user.userID].displayName = data.user.displayName ?? "";
        const tempPFP = users.value[data.user.userID].profilePic;
        users.value[data.user.userID].profilePic = "";
        users.value[data.user.userID].profilePic = tempPFP;
      }
    }
  );

  socket.on("session:delete", async () => {
    useAuthStore().clearLocal();
  });

  socket.on("session:update", async (data: { sessions: any }) => {
    if (activeUser.value) {
      activeUser.value.sessions = data.sessions;
    }
  });
};

export default loadUserWebsockets;
