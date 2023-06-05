<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import XIcon from "@/icons/XIcon.vue";
import { useUserStore } from "@/stores/UserStore";
import { useModalStore } from "@/stores/ModalStore";
import { useRoomStore } from "@/stores/RoomStore";
import { useActiveUserStore, type Friendship } from "@/stores/ActiveUserStore";

const router = useRouter();

const friendships = storeToRefs(useActiveUserStore()).friendsData;
const users = storeToRefs(useUserStore()).users;
const roomStore = useRoomStore();

const friendQuery = ref("");

const filteredFriendships = computed((): { [id: string]: Friendship } => {
  const filtered: { [id: string]: Friendship } = {};

  Object.keys(friendships.value).forEach((id) => {
    const fr = friendships.value[id];
    const friendID =
      fr.friend === useActiveUserStore().activeUserData?.id
        ? fr.creator
        : fr.friend;

    const friend = users.value.get(friendID);

    // good enough for now
    if (
      friend?.displayName
        ?.toLowerCase()
        .includes(friendQuery.value.toLowerCase()) ||
      friend?.username?.toLowerCase().includes(friendQuery.value.toLowerCase())
    )
      filtered[id] = fr;
  });

  return filtered;
});

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
    let DMID;
    roomStore.rooms.forEach((v, id) => {
      if (roomStore.rooms.get(id)?.friendship)
        if (
          roomStore.rooms.get(id)?.friendship?.friendA === friendID ||
          roomStore.rooms.get(id)?.friendship?.friendB === friendID
        )
          DMID = id;
    });
    if (DMID) {
      return router.push({
        name: "DM",
        params: { DMID },
      });
    }

    return await roomStore.createDM(friendID);
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
</script>

<template>
  <div class="friendlist" v-full-height>
    <button
      class="new-friend button-small"
      @click="useModalStore().showNewFriendModal()"
    >
      Add friend
    </button>
    <input
      class="search-friend"
      placeholder="Search for a friend"
      @keyup="(e:any) => {friendQuery = e.target.value}"
    />
    <div v-if="Object.keys(friendships).length === 0">
      <p>No friends</p>
    </div>
    <div class="table">
      <div class="row" v-for="(friend, id) in filteredFriendships" :key="id">
        <div
          class="username no-txt-overflow"
          @click="useModalStore().showUserModal(id.toString())"
        >
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
            v-if="getStatus(id.toString()) === 'message'"
            @click="manageFriendship('message', id.toString())"
          >
            Message
          </button>
          <button
            class="button-small"
            v-if="getStatus(id.toString()) === 'accept'"
            @click="manageFriendship('accept', id.toString())"
          >
            Accept
          </button>
          <div v-if="getStatus(id.toString()) === 'pending'" class="pending">
            Pending
          </div>
          <div
            class="remove"
            @click="
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
  height: 100%;
  max-width: 30rem;
  overflow: auto;
  display: grid;

  grid-template-columns: 0.2fr 1fr;
  grid-template-rows: auto 1fr;
  column-gap: 0.3rem;

  .new-friend {
    margin: 0.5rem 0;
    min-width: 3.7rem;
    width: fit-content;
    height: fit-content;
    align-self: center;
  }

  .search-friend {
    outline: none;
    background: @background;
    border: 2px solid @special;
    border-radius: 5px;
    padding: 0.3rem;
    margin: 0.5rem 0;
    height: fit-content;
    width: 100%;
  }

  .table {
    display: flex;
    flex-direction: column;
    grid-column: 1 / 3;

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
        cursor: pointer;

        .pfp {
          width: 1.5rem;
          height: 1.5rem;
          cursor: pointer;

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
