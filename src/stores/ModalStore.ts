import { defineStore } from "pinia";
import { type Component, shallowReactive, ref } from "vue";

interface Option {
  condition: any;
  title: string;
  action: any;
  icon: Component;
}

export interface InteractModalData {
  show: boolean;
  options: Option[];
}

export interface ChannelModalData {
  show: boolean;
  channelID?: string;
  roomID: string;
}

export interface EditRoomModalData {
  roomID: string;
  show: boolean;
}

export interface NewFriendModalData {
  show: boolean;
}

export interface NewRoomModalData {
  show: boolean;
}

export interface UserModalData {
  show: boolean;
  userID: string;
}

export interface ConfirmModalData {
  show: boolean;
  title: string;
  callback: Function;
}

export const useModalStore = defineStore("modal", () => {
  const interactModalData = shallowReactive<InteractModalData>({
    show: false,
    options: [],
  });

  const channelModalData = ref<ChannelModalData>({
    show: false,
    channelID: undefined,
    roomID: "",
  });

  const editRoomModalData = ref<EditRoomModalData>({
    show: false,
    roomID: "",
  });

  const newFriendModalData = ref<NewFriendModalData>({
    show: false,
  });

  const newRoomModalData = ref<NewRoomModalData>({
    show: false,
  });

  const userModalData = ref<UserModalData>({
    show: false,
    userID: "",
  });

  const confirmModalData = ref<ConfirmModalData>({
    show: false,
    title: "",
    callback: () => {},
  });

  const showConfirmModal = (title: string, callback: Function) => {
    confirmModalData.value.show = true;
    confirmModalData.value.title = title;
    confirmModalData.value.callback = callback;
  };

  const showNewRoomModal = () => {
    newRoomModalData.value.show = true;
  };

  const showInteractModal = (options: Option[]) => {
    interactModalData.options = [];
    interactModalData.show = true;
    options.forEach((op) => {
      if (op.condition()) interactModalData.options.push(op);
    });
  };

  const showChannelModal = (roomID: string, channelID?: string) => {
    channelModalData.value.show = true;
    channelModalData.value.roomID = roomID;
    channelModalData.value.channelID = channelID;
  };

  const showEditRoomModal = (roomID: string) => {
    editRoomModalData.value.show = true;
    editRoomModalData.value.roomID = roomID;
  };

  const showNewFriendModal = () => {
    newFriendModalData.value.show = true;
  };

  const showUserModal = (userID: string) => {
    userModalData.value.show = true;
    userModalData.value.userID = userID;
  };

  const hideModal = (
    type:
      | "interact"
      | "channel"
      | "editRoom"
      | "newFriend"
      | "newRoom"
      | "user"
      | "confirm",
  ) => {
    switch (type) {
      case "interact":
        interactModalData.show = false;
        break;
      case "channel":
        channelModalData.value.show = false;
        break;
      case "editRoom":
        editRoomModalData.value.show = false;
        break;
      case "newFriend":
        newFriendModalData.value.show = false;
        break;
      case "newRoom":
        newRoomModalData.value.show = false;
        break;
      case "user":
        userModalData.value.show = false;
        break;
      case "confirm":
        confirmModalData.value.show = false;
        confirmModalData.value.callback = () => {};
        break;
    }
  };

  return {
    interactModalData,
    showInteractModal,
    hideModal,
    channelModalData,
    showChannelModal,
    editRoomModalData,
    showEditRoomModal,
    newFriendModalData,
    showNewFriendModal,
    showNewRoomModal,
    newRoomModalData,
    userModalData,
    showUserModal,
    confirmModalData,
    showConfirmModal,
  };
});
