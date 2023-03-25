import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import { useCommonStore, type Friendship } from "@/stores/CommonStore";
import { useRoomStore } from "@/stores/RoomStore";

const loadFriendshipWebsockets = () => {
  const friendsData = storeToRefs(useCommonStore()).friendsData;

  socket.on(
    "friendship:new",
    (data: {
      friendship: {
        id: string;
        creator: string;
        friend: string;
        accepted: boolean;
      };
    }) => {
      const { friendship } = data;
      const id =
        friendship.creator === useCommonStore().activeUserData?.id
          ? friendship.friend
          : friendship.creator;

      friendsData.value[id] = {
        friend: id,
        accepted: friendship.accepted,
      };
    }
  );

  socket.on(
    "friendship:remove",
    (data: {
      friendship: {
        id: string;
        creator: string;
        friend: string;
        accepted: boolean;
      };
    }) => {
      const { friendship } = data;

      if (friendsData.value[friendship.creator])
        delete friendsData.value[friendship.creator];
      else if (friendsData.value[friendship.friend])
        delete friendsData.value[friendship.friend];
    }
  );

  socket.on(
    "friendship:accept",
    (data: {
      friendship: {
        id: string;
        creator: string;
        friend: string;
        accepted: boolean;
      };
    }) => {
      const { friendship } = data;

      if (friendsData.value[friendship.creator])
        friendsData.value[friendship.creator].accepted = true;
      else if (friendsData.value[friendship.friend])
        friendsData.value[friendship.friend].accepted = true;
    }
  );
};

export default loadFriendshipWebsockets;
