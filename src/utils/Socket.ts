import { io, Socket } from "socket.io-client";

export const connect = async (data: { token: string }) => {
  console.log("Connecting to socket...");

  socket = io(import.meta.env.VITE_API_PATH?.split("/api")[0], {
    auth: {
      token: data.token,
    },
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      console.error("Disconnected from server");
      console.log("Attempting to reconnect...");
      socket.connect();
    }
  });

  const res = await new Promise((resolve, reject) => {
    socket.on("connect_error", (err) => {
      console.error(err);
      reject(err);
    });
    socket.on("connect", () => {
      console.log("Connected to socket");
      resolve(true);
    });
  });

  return res;
};

export let socket: Socket;
