<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  min: number;
  max: number;
  step: number;
  default: number;
  showSteps?: true | boolean;
}>();

const emit = defineEmits<{
  (e: "input", value: number): void;
}>();

const trackEl = ref<HTMLElement>();
const thumbEl = ref<HTMLElement>();

const sliderVal = ref<number>();

let sliderStepsPx = 0;
let thumbPos = 0;
let thumbDragging = false;

const dragBuffer = 300;

const procesUpdate = (e: MouseEvent) => {
  const trackBounding = trackEl.value!.getBoundingClientRect();

  // width didnt work correctly
  if (
    e.clientX >
      trackBounding.x +
        sliderStepsPx * (Math.abs(props.max - props.min) / props.step) ||
    e.clientX < trackBounding.x
  )
    return;

  const mouseX = e.clientX - trackBounding.left;

  const val = props.min + props.step * Math.round(mouseX / sliderStepsPx);
  sliderVal.value = val;

  if (!thumbDragging) emit("input", sliderVal.value!);

  thumbPos = Math.round(mouseX / sliderStepsPx);

  const pos = thumbPos * sliderStepsPx - thumbEl.value!.offsetWidth / 2;
  thumbEl.value!.style.left = `${pos}px`;
};

const mouseUp = async (e: any) => {
  if (thumbDragging === true) {
    thumbDragging = false;
    // yes
    const wait = async () => {
      return new Promise((resolve) =>
        setTimeout(() => {
          emit("input", sliderVal.value!);
          resolve(true);
        }, dragBuffer),
      );
    };
    await wait();
  }
};

const mouseMove = (e: any) => {
  if (thumbDragging === true) {
    procesUpdate(e);
  }
};

onMounted(() => {
  sliderVal.value = props.default;

  sliderStepsPx =
    trackEl.value?.offsetWidth ??
    0 / (Math.abs(props.max - props.min) / props.step);

  thumbPos = Math.round((props.default - props.min) / props.step);

  const observer = new ResizeObserver((entries) => {
    sliderStepsPx =
      entries[0].contentRect.width /
      (Math.abs(props.max - props.min) / props.step);

    if (thumbEl.value)
      thumbEl.value!.style.left = `${
        thumbPos * sliderStepsPx - thumbEl.value!.offsetWidth / 2
      }px`;
  });
  observer.observe(trackEl.value!);

  document.addEventListener("mousemove", mouseMove);

  document.addEventListener("mouseup", mouseUp);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", mouseMove);
  document.removeEventListener("mouseup", mouseUp);
});
</script>

<template>
  <div class="slider-input" ref="trackEl">
    <div
      class="track"
      @mousedown="
        (e) => {
          thumbDragging = true;
          procesUpdate(e);
        }
      "
    >
      <div
        class="marker"
        v-for="(n, index) in Math.abs(props.max - props.min) / props.step + 1"
        :key="index"
        :class="{
          active: props.min + props.step * (n - 1) === sliderVal,
          invisible: !(
            props.showSteps ||
            props.min + props.step * (n - 1) === sliderVal ||
            index === 0 ||
            index === Math.abs(props.max - props.min) / props.step
          ),
        }"
      >
        {{ props.min + props.step * (n - 1) }}
      </div>
      <div class="thumb" ref="thumbEl"></div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/base.less";

.slider-input {
  padding: 1.2rem 0.5rem;
  .track {
    width: 100%;
    height: 0.3rem;
    content: "";
    display: flex;
    background: @special;
    border-radius: 5px;
    position: relative;
    cursor: pointer;
    transition: 0.2s ease all;
    justify-content: space-between;

    .active {
      color: @accent-s !important;
    }

    .invisible {
      opacity: 0;
    }

    .marker {
      margin-top: -1.1rem;
      font-size: 0.5rem;
      font-weight: 600;
      width: 0px;
      text-align: center;
      overflow: visible;
      display: flex;
      justify-content: center;
      transition: 0.2s ease all;
    }

    &:hover {
      opacity: 0.9;
    }

    .thumb {
      display: flex;
      position: absolute;
      content: "";
      height: 1rem;
      width: 0.35rem;
      border-radius: 10px;
      background: @accent;
      top: 50%;
      transform: translateY(-50%);
      opacity: 1;
      justify-content: center;
    }
  }
}
</style>
