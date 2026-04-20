import { Chess } from "chess.js";
import type { Room, Player, Move } from "@chess-online/types";

export class GameState {
  private chess: Chess;
  public room: Room;
  private drawOfferedBy: string | null = null;

  constructor(roomId: string) {
    this.chess = new Chess();
    this.room = {
      id: roomId,
      players: [],
      status: "waiting",
      fen: this.chess.fen(),
      moves: [],
      createdAt: Date.now(),
    };
  }

  addPlayer(player: Player): boolean {
    if (this.room.players.length >= 2) return false;
    this.room.players.push(player);
    if (this.room.players.length === 2) this.room.status = "playing";
    return true;
  }

  makeMove(from: string, to: string, promotion?: string): Move | null {
    try {
      const result = this.chess.move({ from, to, promotion: promotion ?? "q" });
      if (!result) return null;

      const move: Move = { from, to, promotion, san: result.san, timestamp: Date.now() };
      this.room.moves.push(move);
      this.room.fen = this.chess.fen();
      this.drawOfferedBy = null;

      if (this.chess.isCheckmate()) this.room.status = "checkmate";
      else if (this.chess.isDraw()) this.room.status = "draw";

      return move;
    } catch {
      return null;
    }
  }

  resign(playerId: string): void {
    this.room.status = "resigned";
  }

  offerDraw(playerId: string): void {
    this.drawOfferedBy = playerId;
  }

  acceptDraw(playerId: string): boolean {
    if (!this.drawOfferedBy || this.drawOfferedBy === playerId) return false;
    this.room.status = "draw";
    return true;
  }

  getTurn(): "white" | "black" {
    return this.chess.turn() === "w" ? "white" : "black";
  }

  isGameOver(): boolean {
    return ["checkmate", "draw", "resigned"].includes(this.room.status);
  }

  removePlayer(playerId: string): void {
    this.room.players = this.room.players.filter((p) => p.id !== playerId);
  }

  isInCheck(): boolean {
    return this.chess.inCheck();
  }
}
