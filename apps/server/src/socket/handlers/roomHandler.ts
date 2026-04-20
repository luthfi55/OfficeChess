import type { Server, Socket } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "@chess-online/types";
import { RoomManager } from "../../game/RoomManager";

export function registerRoomHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager
) {
  socket.on("room:create", ({ playerName }) => {
    const roomId = roomManager.generateRoomId();
    const game = roomManager.createRoom(roomId);
    const player = { id: socket.id, name: playerName, color: "white" as const };
    game.addPlayer(player);

    socket.join(roomId);
    socket.data.roomId = roomId;

    socket.emit("room:created", game.room);
    console.log(`[room] ${playerName} created ${roomId}`);
  });

  socket.on("room:join", ({ roomId, playerName }) => {
    const game = roomManager.getRoom(roomId);

    if (!game) { socket.emit("error", "Room Not Found"); return; }
    if (game.room.players.length >= 2) { socket.emit("error", "Room is Full"); return; }
    if (game.room.status !== "waiting") { socket.emit("error", "Game Already Started"); return; }

    const player = { id: socket.id, name: playerName, color: "black" as const };
    game.addPlayer(player);

    socket.join(roomId);
    socket.data.roomId = roomId;

    socket.emit("room:joined", game.room);
    io.to(roomId).emit("game:started", game.room);
    console.log(`[room] ${playerName} joined ${roomId}`);
  });
}
