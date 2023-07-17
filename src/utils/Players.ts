import type { Ref } from "vue";
import { storeToRefs } from "pinia";

import { useCommonStore } from "@/stores/CommonStore";

export const loadVideoPlayers = (messageContentRef: Ref<HTMLDivElement>) => {
  const { commonData } = storeToRefs(useCommonStore());

  messageContentRef.value
    ?.querySelectorAll<HTMLElement>(".video-container")
    .forEach((container) => {
      const video = container.querySelector<HTMLVideoElement>("video");
      const controls = container.querySelector<HTMLDivElement>(".controls");
      const time = controls!.querySelector<HTMLDivElement>("#time")!;
      const progress = controls!.querySelector<HTMLInputElement>("#progress")!;
      const volume = controls!.querySelector<HTMLDivElement>("#volume")!;
      const volumeBar =
        controls!.querySelector<HTMLInputElement>("#volume-bar")!;

      const mute = volume!.querySelector<HTMLDivElement>("#mute")!;

      video!.onloadeddata = () => {
        progress.max = Math.ceil(video!.duration).toString();

        const minutes = Math.floor(video!.currentTime / 60);
        const seconds = Math.floor(video!.currentTime - minutes * 60);
        const minuteValue = minutes < 10 ? "0" + minutes : minutes;
        const secondValue = seconds < 10 ? "0" + seconds : seconds;

        const mediaTime = minuteValue + ":" + secondValue;
        time.innerHTML = mediaTime;
      };

      video!.onload = () => {
        controls!.style.width = video!.clientWidth + "px";
      };

      video!.onplay = () => {
        controls!.querySelector("#playpause")!.classList.add("playing");
        video!.volume = commonData.value.preferedVolume;
        volumeBar!.value = commonData.value.preferedVolume.toString();
      };

      video!.onpause = () => {
        controls!.querySelector("#playpause")!.classList.remove("playing");
      };

      video!.onclick = () => {
        if (video?.paused) {
          video?.play();
        } else {
          video?.pause();
        }
      };

      controls!.querySelector<HTMLDivElement>("#playpause")!.onclick = () => {
        if (video?.paused) {
          video?.play();
        } else {
          video?.pause();
        }
      };

      video!.ontimeupdate = () => {
        const minutes = Math.floor(video!.currentTime / 60);
        const seconds = Math.floor(video!.currentTime - minutes * 60);
        const minuteValue = minutes < 10 ? "0" + minutes : minutes;
        const secondValue = seconds < 10 ? "0" + seconds : seconds;

        const mediaTime = minuteValue + ":" + secondValue;
        time.innerHTML = mediaTime;

        const value = video!.currentTime;
        progress.value = value.toString();
      };

      progress.oninput = (e: Event) => {
        video!.currentTime = (e.target as HTMLInputElement).valueAsNumber;
      };

      mute.onclick = () => {
        if (video?.muted) video.muted = false;
        else video!.muted = true;
      };

      video!.onvolumechange = () => {
        if (video?.muted) volume.classList.add("muted");
        else volume.classList.remove("muted");

        commonData.value.preferedVolume = video!.volume;
      };

      volumeBar.oninput = (e: Event) => {
        video!.volume = (e.target as HTMLInputElement).valueAsNumber;
      };

      controls!.querySelector<HTMLDivElement>("#fullscreen")!.onclick = () => {
        if (document!.fullscreenElement) {
          document.exitFullscreen();
        } else {
          container.requestFullscreen();
        }
      };

      container.onfullscreenchange = () => {
        container.classList.toggle("fullscreen");
      };
    });
};

export const loadAudioPlayers = (messageContentRef: Ref<HTMLDivElement>) => {
  const { commonData } = storeToRefs(useCommonStore());

  messageContentRef.value
    .querySelectorAll<HTMLElement>(".audio-container")
    .forEach((container) => {
      const audio = container.querySelector<HTMLVideoElement>("audio");
      const controls = container.querySelector<HTMLDivElement>(".controls");
      const time = controls!.querySelector<HTMLDivElement>("#time")!;
      const progress = controls!.querySelector<HTMLInputElement>("#progress")!;
      const volume = controls!.querySelector<HTMLDivElement>("#volume")!;
      const volumeBar =
        controls!.querySelector<HTMLInputElement>("#volume-bar")!;

      const mute = volume!.querySelector<HTMLDivElement>("#mute")!;

      audio!.onloadeddata = () => {
        progress.max = Math.ceil(audio!.duration).toString();

        const minutes = Math.floor(audio!.currentTime / 60);
        const seconds = Math.floor(audio!.currentTime - minutes * 60);
        const minuteValue = minutes < 10 ? "0" + minutes : minutes;
        const secondValue = seconds < 10 ? "0" + seconds : seconds;

        const mediaTime = minuteValue + ":" + secondValue;
        time.innerHTML = mediaTime;
      };

      audio!.onload = () => {
        controls!.style.width = audio!.clientWidth + "px";
      };

      audio!.onplay = () => {
        controls!.querySelector("#playpause")!.classList.add("playing");

        audio!.volume = commonData.value.preferedVolume;
        volumeBar!.value = commonData.value.preferedVolume.toString();
      };

      audio!.onpause = () => {
        controls!.querySelector("#playpause")!.classList.remove("playing");
      };

      audio!.onclick = () => {
        if (audio?.paused) {
          audio?.play();
        } else {
          audio?.pause();
        }
      };

      controls!.querySelector<HTMLDivElement>("#playpause")!.onclick = () => {
        if (audio?.paused) {
          audio?.play();
        } else {
          audio?.pause();
        }
      };

      audio!.ontimeupdate = () => {
        const minutes = Math.floor(audio!.currentTime / 60);
        const seconds = Math.floor(audio!.currentTime - minutes * 60);
        const minuteValue = minutes < 10 ? "0" + minutes : minutes;
        const secondValue = seconds < 10 ? "0" + seconds : seconds;

        const mediaTime = minuteValue + ":" + secondValue;
        time.innerHTML = mediaTime;

        const value = audio!.currentTime;
        progress.value = value.toString();
      };

      progress.oninput = (e: Event) => {
        audio!.currentTime = (e.target as HTMLInputElement).valueAsNumber;
      };

      mute.onclick = () => {
        if (audio?.muted) audio.muted = false;
        else audio!.muted = true;
      };

      audio!.onvolumechange = () => {
        if (audio?.muted) volume.classList.add("muted");
        else volume.classList.remove("muted");

        commonData.value.preferedVolume = audio!.volume;
      };

      volumeBar.oninput = (e: Event) => {
        audio!.volume = (e.target as HTMLInputElement).valueAsNumber;
      };
    });
};
