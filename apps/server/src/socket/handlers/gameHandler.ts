import type { Server, Socket } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "@chess-online/types";
import { RoomManager } from "../../game/RoomManager";

export function registerGameHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager
) {
  socket.on("game:move", ({ roomId, move }) => {
    const game = roomManager.getRoom(roomId);
    if (!game) { socket.emit("error", "Room Not Found"); return; }
    if (game.room.status !== "playing") { socket.emit("error", "Game Not In Progress"); return; }

    const player = game.room.players.find((p) => p.id === socket.id);
    if (!player) { socket.emit("error", "You are not in this room"); return; }
    if (player.color !== game.getTurn()) { socket.emit("error", "Not Your Turn"); return; }

    const result = game.makeMove(move.from, move.to, move.promotion);
    if (!result) { socket.emit("error", "Invalid Move"); return; }

    if (game.isGameOver()) {
      io.to(roomId).emit("game:over", game.room);
    } else {
      io.to(roomId).emit("game:move", game.room);
    }
  });

  socket.on("game:resign", ({ roomId }) => {
    const game = roomManager.getRoom(roomId);
    if (!game || game.isGameOver()) return;
    game.resign(socket.id);
    io.to(roomId).emit("game:over", game.room);
    console.log(`[game] resign in ${roomId}`);
  });

  socket.on("game:draw-offer", ({ roomId }) => {
    const game = roomManager.getRoom(roomId);
    if (!game || game.isGameOver()) return;
    game.offerDraw(socket.id);
    io.to(roomId).emit("game:draw-offered", socket.id);
  });

  socket.on("game:draw-accept", ({ roomId }) => {
    const game = roomManager.getRoom(roomId);
    if (!game || game.isGameOver()) return;
    const accepted = game.acceptDraw(socket.id);
    if (accepted) io.to(roomId).emit("game:over", game.room);
  });

  socket.on("disconnect", () => {
    const { roomId } = socket.data;
    if (!roomId) return;

    const game = roomManager.getRoom(roomId);
    if (!game) return;

    game.removePlayer(socket.id);
    console.log(`[game] player disconnected from ${roomId}`);

    if (game.room.players.length === 0) {
      roomManager.deleteRoom(roomId);
      console.log(`[room] deleted ${roomId} (empty)`);
    } else {
      io.to(roomId).emit("room:updated", game.room);
    }
  });
}
