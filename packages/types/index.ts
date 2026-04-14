export type PlayerColor = "white" | "black";

export type GameStatus = "waiting" | "playing" | "draw" | "checkmate" | "resigned";

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
  san: string;       // Standard Algebraic Notation
  timestamp: number;
}

export interface Room {
  id: string;
  players: Player[];
  status: GameStatus;
  fen: string;       // Current board state
  moves: Move[];
  createdAt: number;
}

// Socket.io event payloads
export interface CreateRoomPayload {
  playerName: string;
}

export interface JoinRoomPayload {
  roomId: string;
  playerName: string;
}

export interface MakeMovePayload {
  roomId: string;
  move: { from: string; to: string; promotion?: string };
}

export interface ResignPayload {
  roomId: string;
}

export interface DrawOfferPayload {
  roomId: string;
}

// Socket.io events server → client
export interface ServerToClientEvents {
  "room:created": (room: Room) => void;
  "room:joined": (room: Room) => void;
  "room:updated": (room: Room) => void;
  "game:started": (room: Room) => void;
  "game:move": (room: Room) => void;
  "game:over": (room: Room) => void;
  "game:draw-offered": (byPlayerId: string) => void;
  error: (message: string) => void;
}

// Socket.io events client → server
export interface ClientToServerEvents {
  "room:create": (payload: CreateRoomPayload) => void;
  "room:join": (payload: JoinRoomPayload) => void;
  "game:move": (payload: MakeMovePayload) => void;
  "game:resign": (payload: ResignPayload) => void;
  "game:draw-offer": (payload: DrawOfferPayload) => void;
  "game:draw-accept": (payload: DrawOfferPayload) => void;
}
