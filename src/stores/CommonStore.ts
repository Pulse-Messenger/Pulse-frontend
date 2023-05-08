import { defineStore } from "pinia";
import { onMounted, onUnmounted, onUpdated, ref } from "vue";

export interface CommonData {
  channelScroll: { [key: string]: number };
  lastVisitedChannelInRoom: { [key: string]: string };
  fetchingMessages: { [key: string]: boolean };
  swipeData: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    swipedRight: boolean;
    swipedLeft: boolean;
  };
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
    swipeData: {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      swipedRight: false,
      swipedLeft: false,
    },
  });

  const clearSwipe = () => {
    commonData.value.swipeData.swipedRight = false;
    commonData.value.swipeData.swipedLeft = false;
  };

  const touchStart = (e: any) => {
    commonData.value.swipeData.startX = e.touches[0].clientX;
    commonData.value.swipeData.startY = e.touches[0].clientY;
    commonData.value.swipeData.endX = e.touches[0].clientX;
    commonData.value.swipeData.endY = e.touches[0].clientY;
  };

  const touchMove = (e: any) => {
    commonData.value.swipeData.endX = e.touches[0].clientX;
    commonData.value.swipeData.endY = e.touches[0].clientY;
  };

  const touchEnd = (e: any) => {
    // calculate distance traveled
    const distX =
      commonData.value.swipeData.endX - commonData.value.swipeData.startX;
    const distY =
      commonData.value.swipeData.endY - commonData.value.swipeData.startY;

    if (Math.abs(distX) < 60) return;

    if (
      commonData.value.swipeData.startX < window.innerWidth / 2 &&
      commonData.value.swipeData.endX > commonData.value.swipeData.startX &&
      Math.abs(distX) > 60 &&
      Math.abs(distY) < 75
    ) {
      commonData.value.swipeData.swipedRight = true;
      commonData.value.swipeData.swipedLeft = false;
    } else if (
      commonData.value.swipeData.startX > window.innerWidth / 2 &&
      commonData.value.swipeData.endX < commonData.value.swipeData.startX &&
      Math.abs(distX) > 60 &&
      Math.abs(distY) < 75
    ) {
      commonData.value.swipeData.swipedRight = false;
      commonData.value.swipeData.swipedLeft = true;
    } else if (
      commonData.value.swipeData.startX < window.innerWidth / 2 &&
      commonData.value.swipeData.endX < commonData.value.swipeData.startX &&
      Math.abs(distX) > 60 &&
      Math.abs(distY) < 75
    ) {
      commonData.value.swipeData.swipedRight = false;
      commonData.value.swipeData.swipedLeft = false;
    } else if (
      commonData.value.swipeData.startX > window.innerWidth / 2 &&
      commonData.value.swipeData.endX > commonData.value.swipeData.startX &&
      Math.abs(distX) > 60 &&
      Math.abs(distY) < 75
    ) {
      commonData.value.swipeData.swipedRight = false;
      commonData.value.swipeData.swipedLeft = false;
    }
  };

  onMounted(() => {
    document.addEventListener("touchstart", touchStart);
    document.addEventListener("touchend", touchEnd);
    document.addEventListener("touchmove", touchMove);
  });

  onUpdated(() => {
    clearSwipe();
  });

  return {
    commonData,
    clearSwipe,
  };
});
