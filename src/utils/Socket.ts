import { io, Socket } from "socket.io-client";

export const connect = (data: { token: string }) => {
  socket = io(import.meta.env.VITE_API_PATH.split("/api")[0], {
    auth: {
      token: data.token,
    },
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      socket.connect();
    }
  });
};

export let socket: Socket;
