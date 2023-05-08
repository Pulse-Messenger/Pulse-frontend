import type { Directive } from "vue";

const resizeHandler = (el: HTMLDivElement) => {
  el.style.height = window.innerHeight + "px";
};

const setFullHeight: Directive<HTMLDivElement> = {
  mounted(el) {
    el.style.height = window.innerHeight + "px";
    window.addEventListener("resize", () => resizeHandler(el));
    window.addEventListener("orientationchange", () => resizeHandler(el));
  },
  updated(el) {
    el.style.height = window.innerHeight + "px";
    window.removeEventListener("resize", () => resizeHandler(el));
    window.removeEventListener("orientationchange", () => resizeHandler(el));
  },
};

export default setFullHeight;
