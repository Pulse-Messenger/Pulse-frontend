import axios, { type AxiosInstance } from "axios";

export const APIInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_PATH,
  headers: {},
});

export const mediaInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_MEDIA_PATH,
  headers: {},
});
