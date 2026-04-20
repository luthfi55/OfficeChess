"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";
import type { Room, PlayerColor } from "@chess-online/types";

export type MultiplayerStatus =
  | "connecting"
  | "waiting"    // di room, belum ada lawan
  | "playing"
  | "game-over"
  | "error";

export interface MultiplayerState {
  status: MultiplayerStatus;
  room: Room | null;
  myColor: PlayerColor | null;
  errorMsg: string | null;
  drawOffered: boolean;
}

export function useMultiplayerGame(
  roomId: string | null,
  playerName: string,
  action: "create" | "join"
) {
  const [state, setState] = useState<MultiplayerState>({
    status: "connecting",
    room: null,
    myColor: null,
    errorMsg: null,
    drawOffered: false,
  });

  const myColorRef = useRef<PlayerColor | null>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!roomId && action === "join") return;

    const socket = getSocket();

    function onConnect() {
      connectedRef.current = true;
      if (action === "create") {
        socket.emit("room:create", { playerName });
      } else if (roomId) {
        socket.emit("room:join", { roomId, playerName });
      }
    }

    function onRoomCreated(room: Room) {
      myColorRef.current = "white";
      setState({ status: "waiting", room, myColor: "white", errorMsg: null, drawOffered: false });
    }

    function onRoomJoined(room: Room) {
      myColorRef.current = "black";
      setState({ status: "waiting", room, myColor: "black", errorMsg: null, drawOffered: false });
    }

    function onGameStarted(room: Room) {
      setState((prev) => ({ ...prev, status: "playing", room, drawOffered: false }));
    }

    function onGameMove(room: Room) {
      setState((prev) => ({ ...prev, room, drawOffered: false }));
    }

    function onRoomUpdated(room: Room) {
      setState((prev) => ({ ...prev, room }));
    }

    function onGameOver(room: Room) {
      setState((prev) => ({ ...prev, status: "game-over", room }));
    }

    function onDrawOffered() {
      setState((prev) => ({ ...prev, drawOffered: true }));
    }

    function onError(msg: string) {
      setState((prev) => ({ ...prev, status: "error", errorMsg: msg }));
    }

    socket.on("connect", onConnect);
    socket.on("room:created", onRoomCreated);
    socket.on("room:joined", onRoomJoined);
    socket.on("room:updated", onRoomUpdated);
    socket.on("game:started", onGameStarted);
    socket.on("game:move", onGameMove);
    socket.on("game:over", onGameOver);
    socket.on("game:draw-offered", onDrawOffered);
    socket.on("error", onError);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("room:created", onRoomCreated);
      socket.off("room:joined", onRoomJoined);
      socket.off("room:updated", onRoomUpdated);
      socket.off("game:started", onGameStarted);
      socket.off("game:move", onGameMove);
      socket.off("game:over", onGameOver);
      socket.off("game:draw-offered", onDrawOffered);
      socket.off("error", onError);
      socket.disconnect();
      connectedRef.current = false;
    };
  }, [roomId, playerName, action]);

  const sendMove = useCallback(
    (from: string, to: string, promotion?: string) => {
      if (!state.room) return;
      const socket = getSocket();
      socket.emit("game:move", { roomId: state.room.id, move: { from, to, promotion } });
    },
    [state.room]
  );

  const resign = useCallback(() => {
    if (!state.room) return;
    getSocket().emit("game:resign", { roomId: state.room.id });
  }, [state.room]);

  const offerDraw = useCallback(() => {
    if (!state.room) return;
    getSocket().emit("game:draw-offer", { roomId: state.room.id });
  }, [state.room]);

  const acceptDraw = useCallback(() => {
    if (!state.room) return;
    getSocket().emit("game:draw-accept", { roomId: state.room.id });
  }, [state.room]);

  return { ...state, sendMove, resign, offerDraw, acceptDraw };
}
