import { defineStore } from "pinia";
import { ref, shallowReactive, type Component } from "vue";

export interface CommonData {
  channelScroll: { [key: string]: number };
  lastVisitedChannelInRoom: { [key: string]: string };
  fetchingMessages: { [key: string]: boolean };
}

export interface InteractModalData {
  show: boolean;
  options: Option[];
}

export interface Setting {
  title: string;
  type: "pickMe" | "slider" | "toggle";
  toggleData?: {
    active: Function;
    eventCallback: Function;
  };
  pickMeData?: {
    active: Function;
    eventCallback: Function;
  };
  sliderData?: {
    max: number;
    min: number;
    step: number;
    default: number;
    eventCallback: Function;
  };
}

interface Option {
  condition: any;
  title: string;
  action: any;
  icon: Component;
}

export const useCommonStore = defineStore("common", () => {
  const commonData = ref<CommonData>({
    channelScroll: {}, // message IDs
    lastVisitedChannelInRoom: {}, // room IDs
    fetchingMessages: {}, // channel IDs
  });

  const interactModalData = shallowReactive<InteractModalData>({
    show: false,
    options: [],
  });

  const showModal = (options: Option[]) => {
    interactModalData.options = [];
    interactModalData.show = true;
    options.forEach((op) => {
      if (op.condition()) interactModalData.options.push(op);
    });
  };

  const hideModal = () => {
    interactModalData.show = false;
  };

  return {
    commonData,
    interactModalData,

    showModal,
    hideModal,
  };
});
