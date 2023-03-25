import loadMessageWebsockets from "@/utils/websockets/MessageWebsockets";
import loadRoomWebsockets from "@/utils/websockets/RoomWebsockets";
import loadChannelWebsockets from "@/utils/websockets/ChannelWebsockets";
import loadUserWebsockets from "@/utils/websockets/UserWebsockets";
import loadSettingsWebsocets from "@/utils/websockets/SettingsWebsocket";
import loadNoteWebsockets from "@/utils/websockets/NoteWebsockets";
import loadFriendshipWebsockets from "@/utils/websockets/FriendshipWebsockets";

const loadWebsockets = () => {
  loadRoomWebsockets();
  loadMessageWebsockets();
  loadChannelWebsockets();
  loadUserWebsockets();
  loadSettingsWebsocets();
  loadNoteWebsockets();
  loadFriendshipWebsockets();
};

export default loadWebsockets;
