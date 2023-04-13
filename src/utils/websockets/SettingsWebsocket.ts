import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import {
  useActiveUserStore,
  type UserPreferences,
} from "@/stores/ActiveUserStore";

const loadSettingsWebsockets = () => {
  const preferences = storeToRefs(useActiveUserStore()).userPreferences;

  socket.on("settings:update", async (data: { settings: UserPreferences }) => {
    if (preferences.value) {
      preferences.value = data.settings;
    }
  });
};

export default loadSettingsWebsockets;
