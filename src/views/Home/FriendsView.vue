<script setup lang="ts">
import { storeToRefs } from "pinia";

import XIcon from "@/icons/XIcon.vue";
import { useUserStore } from "@/stores/UserStore";
import { useModalStore } from "@/stores/ModalStore";
import { useRoomStore } from "@/stores/RoomStore";
import { useActiveUserStore } from "@/stores/ActiveUserStore";
import { onMounted, watch } from "vue";

const friendships = storeToRefs(useActiveUserStore()).friendsData;
const users = storeToRefs(useUserStore()).users;
const roomStore = useRoomStore();

const baseFontSize = storeToRefs(useActiveUserStore()).baseFontSize;

watch(baseFontSize, () => {
  if (baseFontSize.value === 28) {
    document.querySelector<HTMLDivElement>(".friendlist")!.style.padding = "";
  } else {
    document.querySelector<HTMLDivElement>(".friendlist")!.style.padding =
      "1rem";
  }
});

onMounted(() => {
  if (baseFontSize.value === 28) {
    document.querySelector<HTMLDivElement>(".friendlist")!.style.padding = "";
  } else {
    document.querySelector<HTMLDivElement>(".friendlist")!.style.padding =
      "1rem";
  }
});

const getStatus = (friendshipID: string) => {
  const fr = friendships.value[friendshipID];

  if (useActiveUserStore().activeUserData?.id === fr.creator && !fr.accepted)
    return "pending";
  else if (
    useActiveUserStore().activeUserData?.id !== fr.creator &&
    !fr.accepted
  )
    return "accept";
  else return "message";
};

const manageFriendship = async (
  status: "accept" | "message" | "cancel" | "reject",
  friendID: string,
) => {
  if (status === "message") {
    await roomStore.createDM(friendID);
    return;
  }

  const data = {
    userID: friendID,
    action: status,
    success: "",
    error: "",
  };
  switch (status) {
    case "accept":
      data.success = "Friend request accepted";
      data.error = "Failed to accept friend request";
      break;
    case "cancel":
      data.success = "Friend removed";
      data.error = "Failed to remove friend";
      break;
    case "reject":
      data.success = "Friend request rejected";
      data.error = "Failed to reject friend request";
      break;
  }

  await useActiveUserStore().manageFriendship(data);
};

const dmExists = (friendID: string) => {
  let doesntExist = true;
  roomStore.rooms.forEach((v, id) => {
    if (roomStore.rooms.get(id)?.friendship)
      if (
        roomStore.rooms.get(id)?.friendship?.friendA === friendID ||
        roomStore.rooms.get(id)?.friendship?.friendB === friendID
      )
        doesntExist = false;
  });
  return doesntExist;
};
</script>

<template>
  <div class="friendlist">
    <button
      class="new-friend button-small"
      @click.once="useModalStore().showNewFriendModal()"
    >
      Add friend
    </button>
    <div v-if="Object.keys(friendships).length === 0">
      <p>No friends</p>
    </div>
    <div class="table">
      <div class="row" v-for="(friend, id) in friendships" :key="id">
        <div class="username no-txt-overflow">
          <div class="pfp">
            <img
              :src="users.get(id.toString())?.profilePic ?? '/icons/User.svg'"
              alt="pfp"
            />
          </div>
          <div class="no-txt-overflow">
            {{ users.get(id.toString())?.displayName }}
          </div>
        </div>
        <div class="status">
          <button
            class="button-small"
            v-if="
              getStatus(id.toString()) === 'message' && dmExists(id.toString())
            "
            @click.once="manageFriendship('message', id.toString())"
          >
            Message
          </button>
          <button
            class="button-small"
            v-if="getStatus(id.toString()) === 'accept'"
            @click.once="manageFriendship('accept', id.toString())"
          >
            Accept
          </button>
          <div v-if="getStatus(id.toString()) === 'pending'" class="pending">
            Pending
          </div>
          <div
            class="remove"
            @click.once="
              () => {
                if (getStatus(id.toString()) == 'pending')
                  useModalStore().showConfirmModal(
                    'Cancel friend request?',
                    () => manageFriendship('reject', id.toString()),
                  );
                else
                  useModalStore().showConfirmModal('Remove friend?', () =>
                    manageFriendship('cancel', id.toString()),
                  );
              }
            "
          >
            <XIcon></XIcon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/base.less";

.friendlist {
  padding: 1rem 2rem;
  width: 100%;
  max-width: 30rem;
  overflow: auto;

  .new-friend {
    margin: 0.5rem 0;
  }

  .table {
    display: flex;
    flex-direction: column;

    .row {
      font-size: 0.5rem;
      display: flex;
      justify-content: space-between;
      column-gap: 0.3rem;
      align-items: center;
      padding: 0.3rem 0;

      border-bottom: 1px solid @special;

      .status {
        display: flex;
        align-items: center;
        column-gap: 0.4rem;

        .pending {
          color: @warn;
        }

        .remove {
          display: flex;
          align-items: center;

          svg {
            height: 0.9rem;
            width: 0.9rem;
            cursor: pointer;
          }
        }
      }

      .username {
        display: flex;
        align-items: center;
        column-gap: 0.2rem;

        .pfp {
          width: 1.5rem;
          height: 1.5rem;

          img {
            border-radius: 1000px;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      td {
        color: @foreground;
      }
    }

    .row:last-child {
      border: none;
    }
  }
}
</style>
