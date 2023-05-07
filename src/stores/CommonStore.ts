import { defineStore } from "pinia";
import { ref } from "vue";

export interface CommonData {
  channelScroll: { [key: string]: number };
  lastVisitedChannelInRoom: { [key: string]: string };
  fetchingMessages: { [key: string]: boolean };
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

export const useCommonStore = defineStore("common", () => {
  const commonData = ref<CommonData>({
    channelScroll: {}, // message IDs
    lastVisitedChannelInRoom: {}, // room IDs
    fetchingMessages: {}, // channel IDs
  });

  return {
    commonData,
  };
});
