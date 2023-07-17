import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "@/App.vue";
import router from "@/router";
import { useAuthStore } from "./stores/AuthStore";

import "@/assets/main.less";
import "@/assets/highlight.less";

import setFullHeight from "./directives/FullHeightDirective";

const app = createApp(App);

app.use(router);
app.use(createPinia());

import "@/utils/Marked";
import loadWebsockets from "./utils/websockets/Websockets";
import { useRoomStore } from "./stores/RoomStore";

app.directive("full-height", setFullHeight);

(async () => {
  const auth = useAuthStore();
  const res = await auth.init();
  if (res) {
    loadWebsockets();
  }

  router.beforeEach((to, from, next) => {
    if (!auth.isLoggedIn && to.meta.requiresAuth) next({ name: "SignIn" });
    else if (auth.isLoggedIn && to.name === "SignIn") {
      next({ name: "Main" });
    } else next();
  });

  await useRoomStore().init();
})().then(() => app.mount("#app"));
