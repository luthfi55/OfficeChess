import { Server } from "socket.io";
import type { Http2SecureServer } from "http2";
import type { Server as HttpServer } from "http";
import type { ServerToClientEvents, ClientToServerEvents } from "@chess-online/types";
import { RoomManager } from "../game/RoomManager";
import { registerRoomHandlers } from "./handlers/roomHandler";
import { registerGameHandlers } from "./handlers/gameHandler";

const roomManager = new RoomManager();

export function initSocket(httpServer: HttpServer | Http2SecureServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL ?? "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id}`);
    registerRoomHandlers(io, socket, roomManager);
    registerGameHandlers(io, socket, roomManager);
  });

  return io;
}
