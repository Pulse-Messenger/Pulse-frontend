<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { storeToRefs } from "pinia";

import { useRoomStore } from "@/stores/RoomStore";
import { useNotificationStore } from "@/stores/NotificationStore";
import { useModalStore } from "@/stores/ModalStore";

const roomStore = useRoomStore();
const modalData = storeToRefs(useModalStore()).editRoomModalData;
const name = ref("");
const profilePicURL = ref("");
const waiting = ref(false);

let file: FormData;

const action = async () => {
  if (waiting.value) return;

  waiting.value = true;
  const res = await roomStore.updateRoom({
    roomID: modalData.value.roomID,
    name: name.value,
    profilePic: file!,
  });
  waiting.value = false;
  if (res) exit();
};

watch(modalData.value, () => {
  name.value = roomStore.rooms.get(modalData.value.roomID)!.name;
  profilePicURL.value = roomStore.rooms.get(modalData.value.roomID)!.profilePic;
});

const exit = () => {
  waiting.value = false;
  name.value = "";
  profilePicURL.value = "";
  useModalStore().hideModal("editRoom");
};

const setImage = (fileData: File) => {
  const correctSize = fileData.size < 20_971_520; // 20MB
  if (!correctSize) {
    useNotificationStore().pushAlert({
      type: "error",
      message: "File must be less than 20MB in size",
    });
    return;
  }
  const correctType = fileData.type.startsWith("image/");
  if (!correctType) {
    useNotificationStore().pushAlert({
      type: "error",
      message: "Invalid file format",
    });
    return;
  }

  file = new FormData();
  file.append("file", fileData);
  profilePicURL.value = URL.createObjectURL(file.get("file") as any);
};

const changed = computed(() => {
  return (
    name.value !== roomStore.rooms.get(modalData.value.roomID)?.name ||
    profilePicURL.value !==
      roomStore.rooms.get(modalData.value.roomID)?.profilePic
  );
});
</script>

<template>
  <Transition name="modal">
    <div class="new-room-modal modal" v-show="modalData.show">
      <div class="outside" @click="exit()"></div>
      <div class="master">
        <h3>Edit a room</h3>
        <div class="pfp">
          <img alt="pfp" id="profilePic" :src="profilePicURL" />
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.gif"
            @input="(e: any) => setImage(e.target.files[0])"
          />
        </div>
        <input
          class="input-common"
          v-model.trim="name"
          type="text"
          placeholder="Room name"
        />

        <div class="buttons">
          <button class="button-small exit" @click="exit()">Cancel</button>
          <button
            class="button-small"
            :disabled="
              waiting || name.length < 5 || name.length > 20 || !changed
            "
            @click="action()"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.new-room-modal {
  display: flex;
  justify-content: center;
  align-items: center;

  .master {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: @background;
    border-radius: 5px;
    padding: 0.5rem;
    row-gap: 0.5rem;
    width: 12rem;

    h3 {
      font-size: 0.7rem;
      text-align: left;
      width: 100%;
    }

    .pfp {
      width: 5rem;
      height: 5rem;
      min-width: 5rem;
      min-height: 5rem;
      padding: 0.5rem;
      position: relative;

      img {
        border-radius: 1000px;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        border-radius: 1000px;

        cursor: pointer;
      }
    }

    .buttons {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      width: 100%;
      column-gap: 0.5rem;

      .exit {
        background: @accent;
      }
    }
  }
}
</style>
