import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import router from "@/router";

import "@/assets/main.less";
import "@/assets/highlight.less";

import { useAuthStore } from "@/stores/AuthStore";
import { useRoomStore } from "@/stores/RoomStore";
import loadMessageWebsockets from "@/utils/websockets/Websockets";
import setFullHeight from "./directives/FullHeightDirective";

const app = createApp(App);

app.use(router);
app.use(createPinia());

import "@/utils/Marked";

app.directive("full-height", setFullHeight);

const auth = useAuthStore();
const room = useRoomStore();

//@ts-ignore
self.authStore = auth;

const init = async () => {
  const res = await auth.init();
  if (res) {
    loadMessageWebsockets();
  }

  router.beforeEach((to, from, next) => {
    if (!auth.isLoggedIn && to.name !== "SignIn") next({ name: "SignIn" });
    else next();
  });

  await room.init();
};

init().then(() => {
  app.mount("#app");
});
