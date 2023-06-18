import { useNotificationStore } from "@/stores/NotificationStore";
import axios, { type AxiosInstance } from "axios";

export const APIInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_PATH,
  headers: {},
});

export const mediaInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_MEDIA_PATH,
  headers: {},
});

APIInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response.status === 429) {
      useNotificationStore().pushAlert({
        type: "warn",
        message:
          "Woah there! You're sending too many requests. Please slow down.",
      });
    }

    throw err;
  },
);
