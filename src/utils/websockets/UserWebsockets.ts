import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import { useUserStore } from "@/stores/UserStore";
import { useAuthStore } from "@/stores/AuthStore";
import { useActiveUserStore } from "@/stores/ActiveUserStore";

const loadUserWebsockets = () => {
  const activeUser = storeToRefs(useActiveUserStore()).activeUserData;
  const users = storeToRefs(useUserStore()).users;

  socket.on(
    "activeUser:update",
    async (data: {
      user: {
        displayName: string;
        about: string;
      };
    }) => {
      if (activeUser.value) {
        activeUser.value.about = data.user.about;
        activeUser.value.displayName = data.user.displayName;
      }
    },
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
      const user = users.value.get(data.user.userID);
      if (user) {
        users.value.get(data.user.userID)!.about = data.user.about ?? "";
        users.value.get(data.user.userID)!.displayName =
          data.user.displayName ?? "";
        const tempPFP = users.value.get(data.user.userID)!.profilePic;
        users.value.get(data.user.userID)!.profilePic = "";
        users.value.get(data.user.userID)!.profilePic = tempPFP;
      }
    },
  );

  socket.on("session:delete", async () => {
    useAuthStore().clearLocal();
  });

  socket.on("session:update", async (data: { sessions: any }) => {
    if (activeUser.value) {
      activeUser.value.sessions = data.sessions.map((ses: any) => {
        return {
          id: ses._id,
          ip: ses.ip,
          useragent: ses.useragent,
        };
      });
    }
  });
};

export default loadUserWebsockets;
