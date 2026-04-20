"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import dynamic from "next/dynamic";
import MoveHistory from "@/components/chess/MoveHistory";
import { useMultiplayerGame } from "@/hooks/useMultiplayerGame";

const MultiplayerBoard = dynamic(
  () => import("@/components/chess/MultiplayerBoard"),
  { ssr: false }
);

type Colors = {
  bg: string; surface: string; border: string; borderLight: string;
  text: string; textMuted: string; textFaint: string; ctrl: string;
};

function useSessionTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  const rawRoomId = (params?.roomId as string) ?? "new";
  const isHost = searchParams.get("player") !== "guest";
  const nameParam = searchParams.get("name");
  const playerName = isHost ? "Luthfi" : (nameParam ?? "Jordan");
  const action = (rawRoomId === "new" || isHost) ? "create" : "join";
  const socketRoomId = rawRoomId === "new" ? null : rawRoomId;

  const { status, room, myColor, errorMsg, drawOffered, sendMove, resign, offerDraw, acceptDraw } =
    useMultiplayerGame(socketRoomId, playerName, action);

  const displayRoomId = room?.id ?? rawRoomId;
  const isPlaying = status === "playing";
  const timer = useSessionTimer(isPlaying);

  // Setelah room dibuat (host), update URL ke roomId yang nyata dari server
  useEffect(() => {
    if (action === "create" && room?.id && rawRoomId === "new") {
      router.replace(`/game/${room.id}?player=host`);
    }
  }, [room?.id, action, rawRoomId, router]);

  const c: Colors = theme === "dark"
    ? { bg: "#111827", surface: "#1F2937", border: "#374151", borderLight: "#2D3748", text: "#F3F4F6", textMuted: "#9CA3AF", textFaint: "#6B7280", ctrl: "#374151" }
    : { bg: "#F9FAFB", surface: "#FFFFFF", border: "#E5E7EB", borderLight: "#F3F4F6", text: "#111827", textMuted: "#6B7280", textFaint: "#9CA3AF", ctrl: "#E5E7EB" };

  // Tentukan giliran dari FEN (karakter ke-2 setelah spasi = 'w'/'b')
  const fenTurn = room?.fen?.split(" ")[1] ?? "w";
  const isMyTurn = isPlaying && myColor !== null && (fenTurn === "w") === (myColor === "white");

  // Susun move history dalam format SAN dari room.moves
  const moveHistory = room?.moves.map((m) => m.san) ?? [];

  // Last move dari server (mencakup gerakan lawan juga)
  const lastServerMove = room?.moves.at(-1) ?? null;
  const lastMove = lastServerMove ? { from: lastServerMove.from, to: lastServerMove.to } : null;

  // Nama player lawan
  const opponent = room?.players.find((p) => p.color !== myColor);
  const me = room?.players.find((p) => p.color === myColor);

  // Status display
  const statusLabel =
    status === "connecting" ? "Connecting..." :
    status === "waiting" ? "Waiting for opponent" :
    status === "playing" ? (isMyTurn ? "Your turn" : `${opponent?.name ?? "Opponent"}'s turn`) :
    status === "game-over" ? "Session ended" :
    status === "error" ? (errorMsg ?? "Error") : "";

  const gameOverResult = room?.status === "checkmate"
    ? `Checkmate — ${room.moves.length % 2 === 0 ? room.players.find(p => p.color === "black")?.name : room.players.find(p => p.color === "white")?.name} wins`
    : room?.status === "resigned"
    ? "Session closed by resignation"
    : room?.status === "draw"
    ? "Mutual resolution (draw)"
    : "";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: c.bg, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Top bar */}
      <header
        className="h-14 flex items-center justify-between px-4 shrink-0"
        style={{ backgroundColor: c.surface, borderBottom: `1px solid ${c.border}` }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: status === "playing" ? "#22C55E" : status === "waiting" ? "#F59E0B" : "#9CA3AF" }}
            />
            <span className="text-xs font-mono font-medium" style={{ color: c.textMuted }}>{displayRoomId}</span>
          </div>
          <div className="hidden sm:block h-4 w-px" style={{ backgroundColor: c.border }} />
          <span className="hidden sm:block text-sm font-medium" style={{ color: c.text }}>
            Q2 Sync — Week 3
          </span>
          {isPlaying && (
            <div
              className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded"
              style={{ backgroundColor: c.ctrl }}
            >
              <svg className="w-3 h-3" style={{ color: c.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-mono" style={{ color: c.text }}>{timer}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {room?.players.map((p) => (
              <div
                key={p.id}
                className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: p.color === "white" ? "#9CA3AF" : "#6B7280", fontSize: "8px", fontWeight: 700 }}
                title={p.name}
              >
                {getInitials(p.name)}
              </div>
            ))}
            <span className="text-xs ml-1" style={{ color: c.textFaint }}>{room?.players.length ?? 0}/2</span>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-xs px-3 py-1.5 rounded font-medium"
            style={{ border: `1px solid ${c.border}`, color: c.text, backgroundColor: "transparent" }}
          >
            Leave
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col items-center justify-start overflow-auto p-4 md:p-6">

          {/* Status banner */}
          {status === "connecting" && (
            <div className="w-full max-w-md mb-4 px-4 py-3 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#6B7280", borderTopColor: "transparent" }} />
              <span className="text-xs" style={{ color: c.textMuted }}>Connecting to session...</span>
            </div>
          )}

          {status === "waiting" && (
            <div className="w-full max-w-md mb-4 px-4 py-3 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#9CA3AF", borderTopColor: "transparent" }} />
              <div>
                <p className="text-xs font-medium" style={{ color: c.text }}>Waiting for participant</p>
                <p className="text-xs" style={{ color: c.textFaint }}>Share the Meeting ID to invite someone</p>
              </div>
              <button
                className="ml-auto text-xs px-2.5 py-1 rounded font-mono"
                style={{ backgroundColor: c.ctrl, color: c.text }}
                onClick={() => navigator.clipboard?.writeText(displayRoomId)}
              >
                {displayRoomId}
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="w-full max-w-md mb-4 px-4 py-3 rounded-lg"
              style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
              <p className="text-xs font-medium text-red-700">{errorMsg ?? "Connection error"}</p>
              <button onClick={() => router.push("/")} className="text-xs text-red-500 mt-1 underline">Back to lobby</button>
            </div>
          )}

          {/* Draw offer banner */}
          {drawOffered && status === "playing" && (
            <div className="w-full max-w-md mb-4 px-4 py-3 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: c.surface, border: `1px solid #FCD34D` }}>
              <span className="text-xs font-medium" style={{ color: c.text }}>Opponent offered Mark Resolved (draw)</span>
              <button
                onClick={acceptDraw}
                className="ml-auto text-xs px-3 py-1.5 rounded font-medium"
                style={{ backgroundColor: "#22C55E", color: "white" }}
              >
                Accept
              </button>
            </div>
          )}

          {/* Game over banner */}
          {status === "game-over" && (
            <div className="w-full max-w-md mb-4 px-4 py-4 rounded-lg"
              style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
              <p className="text-sm font-semibold mb-1" style={{ color: c.text }}>Session Completed</p>
              <p className="text-xs mb-3" style={{ color: c.textMuted }}>{gameOverResult}</p>
              <button
                onClick={() => router.push("/")}
                className="text-xs px-4 py-2 rounded font-medium"
                style={{ backgroundColor: "#2563EB", color: "white" }}
              >
                Back to Lobby
              </button>
            </div>
          )}

          {/* Board card */}
          <div className="w-full max-w-fit rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
            {/* Opponent row */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ backgroundColor: c.surface, borderBottom: `1px solid ${c.borderLight}` }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: opponent ? "#6B7280" : c.border, fontSize: "9px", fontWeight: 700 }}
                >
                  {opponent ? getInitials(opponent.name) : "?"}
                </div>
                <span className="text-xs font-medium" style={{ color: opponent ? c.text : c.textFaint }}>
                  {opponent?.name ?? "Waiting for opponent..."}
                </span>
              </div>
              <span className="text-xs" style={{ color: c.textFaint }}>
                {myColor === "white" ? "Black" : "White"}
              </span>
            </div>

            {/* Board */}
            <div style={{ backgroundColor: c.bg }} className="p-3">
              {status !== "error" && (
                <MultiplayerBoard
                  fen={room?.fen ?? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}
                  myColor={myColor ?? "white"}
                  isMyTurn={isMyTurn}
                  lastMove={lastMove}
                  onMove={sendMove}
                />
              )}
            </div>

            {/* My row */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ backgroundColor: c.surface, borderTop: `1px solid ${c.borderLight}` }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: "#9CA3AF", fontSize: "9px", fontWeight: 700 }}
                >
                  {getInitials(me?.name ?? playerName)}
                </div>
                <span className="text-xs font-medium" style={{ color: c.text }}>
                  {me?.name ?? playerName} <span style={{ color: c.textFaint, fontWeight: 400 }}>(you)</span>
                </span>
              </div>
              <span className="text-xs" style={{ color: c.textFaint }}>
                {myColor === "white" ? "White" : myColor === "black" ? "Black" : "—"}
              </span>
            </div>
          </div>

          {/* Game controls */}
          {isPlaying && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={offerDraw}
                className="text-xs px-3 py-1.5 rounded font-medium"
                style={{ border: `1px solid ${c.border}`, color: c.textMuted, backgroundColor: "transparent" }}
              >
                Mark Resolved
              </button>
              <button
                onClick={resign}
                className="text-xs px-3 py-1.5 rounded font-medium"
                style={{ backgroundColor: "#DC2626", color: "white" }}
              >
                Close Task
              </button>
            </div>
          )}
        </main>

        {/* Right panel */}
        <aside
          className="hidden lg:flex w-64 flex-col shrink-0"
          style={{ backgroundColor: c.surface, borderLeft: `1px solid ${c.border}` }}
        >
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.textFaint }}>Participants</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: c.ctrl, color: c.textMuted }}>
              {room?.players.length ?? 0}/2
            </span>
          </div>

          <div className="p-2 space-y-1 shrink-0">
            {room?.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: isMyTurn === (p.color === myColor) && isPlaying
                    ? (theme === "dark" ? "#1E3A5F" : "#EFF6FF")
                    : "transparent",
                  border: `1px solid ${isMyTurn === (p.color === myColor) && isPlaying
                    ? (theme === "dark" ? "#2563EB60" : "#BFDBFE")
                    : "transparent"}`,
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: p.color === "white" ? "#9CA3AF" : "#6B7280", fontSize: "9px", fontWeight: 700 }}
                >
                  {getInitials(p.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium leading-none" style={{ color: c.text }}>
                    {p.name} {p.color === myColor && <span style={{ color: c.textFaint, fontWeight: 400 }}>(you)</span>}
                  </p>
                  <p className="text-xs mt-0.5 leading-none" style={{ color: c.textFaint, fontSize: "10px" }}>
                    {p.color === "white" ? "White" : "Black"} · In session
                  </p>
                </div>
              </div>
            ))}
            {(room?.players.length ?? 0) < 2 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: c.ctrl }}>
                  <span className="text-xs" style={{ color: c.textFaint }}>?</span>
                </div>
                <p className="text-xs" style={{ color: c.textFaint }}>Waiting to join...</p>
              </div>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${c.border}`, margin: "4px 0" }} />

          <div className="flex-1 overflow-hidden">
            <MoveHistory moves={moveHistory} />
          </div>

          <div className="p-3 shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
            <p className="text-xs mb-1.5" style={{ color: c.textFaint }}>Meeting ID</p>
            <button
              className="w-full text-xs px-3 py-2 rounded font-mono text-left"
              style={{ backgroundColor: c.ctrl, color: c.text }}
              onClick={() => navigator.clipboard?.writeText(displayRoomId)}
            >
              {displayRoomId}
              <span className="float-right" style={{ color: c.textMuted }}>copy</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom control bar */}
      <div
        className="h-14 flex items-center justify-between px-4 shrink-0"
        style={{ backgroundColor: c.surface, borderTop: `1px solid ${c.border}` }}
      >
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <div className="flex rounded-md overflow-hidden text-xs" style={{ border: `1px solid ${c.border}` }}>
            <button
              onClick={() => theme === "dark" && toggleTheme()}
              className="flex items-center justify-center px-2.5 py-1.5"
              style={{ backgroundColor: theme === "light" ? c.border : "transparent", color: theme === "light" ? c.text : c.textFaint }}
              title="Light mode"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <button
              onClick={() => theme === "light" && toggleTheme()}
              className="flex items-center justify-center px-2.5 py-1.5"
              style={{ backgroundColor: theme === "dark" ? c.border : "transparent", color: theme === "dark" ? c.text : c.textFaint, borderLeft: `1px solid ${c.border}` }}
              title="Dark mode"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>

          {/* Copy ID (mobile) */}
          <button
            className="lg:hidden flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md"
            style={{ backgroundColor: c.ctrl, color: c.text }}
            onClick={() => navigator.clipboard?.writeText(displayRoomId)}
          >
            <span className="font-mono">{displayRoomId}</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        <div className="text-xs text-center" style={{ color: c.textFaint }}>
          {statusLabel}
          {isPlaying && <span style={{ color: c.textMuted }}> · {timer}</span>}
        </div>

        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md font-medium"
          style={{ backgroundColor: "#DC2626", color: "white" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B91C1C")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#DC2626")}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
          <span className="hidden sm:inline">End Meeting</span>
        </button>
      </div>
    </div>
  );
}
