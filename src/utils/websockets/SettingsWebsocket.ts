import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import { useCommonStore, type UserPreferences } from "@/stores/CommonStore";

const loadSettingsWebsockets = () => {
  const preferences = storeToRefs(useCommonStore()).userPreferences;

  socket.on("settings:update", async (data: { settings: UserPreferences }) => {
    if (preferences.value) {
      preferences.value = data.settings;
    }
  });
};

export default loadSettingsWebsockets;
