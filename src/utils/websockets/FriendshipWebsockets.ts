import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import { useActiveUserStore, type Friendship } from "@/stores/ActiveUserStore";
import { useUserStore } from "@/stores/UserStore";

const loadFriendshipWebsockets = () => {
  const friendsData = storeToRefs(useActiveUserStore()).friendsData;

  socket.on("friendship:new", async (data: { friendship: Friendship }) => {
    const { friendship } = data;
    const id =
      friendship.creator === useActiveUserStore().activeUserData?.id
        ? friendship.friend
        : friendship.creator;
    await useUserStore().fetchUser(id);

    friendsData.value[id] = {
      friend: id,
      creator: friendship.creator,
      accepted: friendship.accepted,
    };
  });

  socket.on("friendship:remove", (data: { friendship: Friendship }) => {
    const { friendship } = data;

    if (friendsData.value[friendship.creator])
      delete friendsData.value[friendship.creator];
    else if (friendsData.value[friendship.friend])
      delete friendsData.value[friendship.friend];
  });

  socket.on("friendship:reject", (data: { friendship: Friendship }) => {
    const { friendship } = data;

    if (friendsData.value[friendship.creator])
      delete friendsData.value[friendship.creator];
    else if (friendsData.value[friendship.friend])
      delete friendsData.value[friendship.friend];
  });

  socket.on("friendship:accept", (data: { friendship: Friendship }) => {
    const { friendship } = data;

    if (friendsData.value[friendship.creator])
      friendsData.value[friendship.creator].accepted = true;
    else if (friendsData.value[friendship.friend])
      friendsData.value[friendship.friend].accepted = true;
  });
};

export default loadFriendshipWebsockets;
