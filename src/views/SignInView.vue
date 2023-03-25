<script setup lang="ts">
import { ref } from "vue";
import router from "@/router";

import {
  useAuthStore,
  type RegisterData,
  type LoginData,
} from "@/stores/AuthStore";
import { useRoomStore } from "@/stores/RoomStore";
import InputComponent from "@/components/inputs/InputComponent.vue";
import { useNotificationStore } from "@/stores/NotificationStore";
import loadMessageWebsockets from "@/utils/websockets/Websockets";
import ButtonComponent from "@/components/inputs/ButtonComponent.vue";

const mode = ref("login");
const waitingForRes = ref(false);

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const registerData = ref<RegisterData>({
  username: "",
  email: "",
  password: "",
  repeatedPassword: "",
});

const loginData = ref<LoginData>({
  username: "",
  password: "",
});

const usernameCheck = /^[A-Z0-9_-]*$/i;
const mailCheck =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const testInput = async (type: "login" | "register") => {
  if (waitingForRes.value) return;

  if (type === "login") {
    waitingForRes.value = true;
    await login();
    waitingForRes.value = false;
  } else {
    if (!mailCheck.test(registerData.value.email)) {
      notificationStore.pushAlert({
        type: "warn",
        message: "Not a valid email address",
      });
      return;
    }

    if (!usernameCheck.test(registerData.value.username)) {
      notificationStore.pushAlert({
        type: "warn",
        message: "Username must contain only letters, number, _ and -",
      });
      return;
    }

    if (
      registerData.value.username.length > 20 ||
      registerData.value.username.length < 5
    ) {
      notificationStore.pushAlert({
        type: "warn",
        message: "Username must be between 5 and 20 characters",
      });
      return;
    }

    if (registerData.value.password !== registerData.value.repeatedPassword) {
      notificationStore.pushAlert({
        type: "warn",
        message: "Passwords do not match",
      });
      return;
    }
    waitingForRes.value = true;
    await register();
    waitingForRes.value = false;
  }
};

const register = async () => {
  try {
    await authStore.register(registerData.value);
    mode.value = "login";
  } catch (errs: any) {
    const { errors } = errs.response?.data.errors ?? errs;

    errors.forEach((err: any) => {
      notificationStore.pushAlert({
        type: "error",
        message: err.msg ?? err,
      });
    });
  }
};

const login = async () => {
  try {
    await authStore.login(loginData.value);

    const loggedIn = await authStore.init();
    if (!loggedIn) return;

    const roomStore = useRoomStore();
    await roomStore.init();

    loadMessageWebsockets();
    router.replace({ name: "Me" });
  } catch (errs: any) {
    notificationStore.pushAlert({
      type: "error",
      message: "Wrong username or password",
    });
  }
};
</script>

<template>
  <main>
    <template v-if="mode === 'register'">
      <h1>Register</h1>
      <form
        class="inputs"
        @submit="
          (e) => {
            e.preventDefault();
            testInput('register');
          }
        "
      >
        <InputComponent
          name="email"
          type="email"
          placeholder="email"
          @input="
        (evt: any) => {
          registerData.email = evt.target.value
        }
      "
        ></InputComponent>
        <InputComponent
          name="username"
          type="text"
          placeholder="username"
          @input="
        (evt: any) => {
          registerData.username = evt.target.value
        }
      "
        ></InputComponent>
        <InputComponent
          name="password"
          type="password"
          placeholder="password"
          @input="
        (evt: any) => {
          registerData.password = evt.target.value
        }
      "
        ></InputComponent>
        <InputComponent
          name="password-repeat"
          type="password"
          placeholder="repeat password"
          @input="
        (evt: any) => {
          registerData.repeatedPassword = evt.target.value
        }
      "
        ></InputComponent>
        <p class="switch-mode" @click="mode = 'login'">Login instead?</p>
        <ButtonComponent
          @click="testInput('register')"
          :disabled="
            registerData.email.length === 0 ||
            registerData.password.length === 0 ||
            registerData.username.length === 0 ||
            registerData.repeatedPassword.length === 0 ||
            waitingForRes
          "
          :class="{ waiting: waitingForRes }"
        >
          Register
        </ButtonComponent>
      </form>
    </template>
    <template v-if="mode === 'login'">
      <h1>Login</h1>
      <form
        class="inputs"
        @submit="
          (e) => {
            e.preventDefault();
            testInput('login');
          }
        "
      >
        <InputComponent
          name="username"
          placeholder="username"
          @input="
        (evt: any) => {
          loginData.username = evt.target.value
        }
      "
        ></InputComponent>
        <InputComponent
          name="password"
          type="password"
          placeholder="password"
          @input="
        (evt: any) => {
          loginData.password = evt.target.value
        }
      "
        ></InputComponent>
        <p class="switch-mode" @click="mode = 'register'">Register instead?</p>

        <ButtonComponent
          @click="testInput('login')"
          :disabled="
            loginData.username.length === 0 ||
            loginData.password.length === 0 ||
            waitingForRes
          "
          :class="{ waiting: waitingForRes }"
        >
          Login
        </ButtonComponent>
      </form>
    </template>
  </main>
</template>

<style scoped lang="less">
@import "@/assets/main.less";

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  @media screen and (max-height: 500px) {
    justify-content: flex-start;
  }
  row-gap: 1rem;

  h1 {
    color: @accent;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .inputs {
    width: 10rem;
    min-width: 10rem;
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
  }

  .switch-mode {
    color: @accent;
    font-size: 0.5rem;
    cursor: pointer;
    width: fit-content;
  }
}
</style>
