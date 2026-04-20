import { GameState } from "./GameState";

export class RoomManager {
  private rooms = new Map<string, GameState>();

  createRoom(roomId: string): GameState {
    const game = new GameState(roomId);
    this.rooms.set(roomId, game);
    return game;
  }

  getRoom(roomId: string): GameState | undefined {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  generateRoomId(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let id = "MEET-";
    for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
    // Retry jika ID sudah dipakai
    return this.rooms.has(id) ? this.generateRoomId() : id;
  }
}
