"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import dynamic from "next/dynamic";

const BoardWrapper = dynamic(() => import("@/components/chess/BoardWrapper"), { ssr: false });

type ConnectionStatus = "connecting" | "waiting" | "ready";

type Colors = {
  bg: string; surface: string; border: string; borderLight: string;
  text: string; textMuted: string; textFaint: string; ctrl: string;
};

const MOCK_PARTICIPANTS = [
  { id: "host", name: "Luthfi", initials: "LF", color: "#6366F1", isHost: true, isYou: true },
  { id: "guest", name: "Jordan", initials: "JD", color: "#0EA5E9", isHost: false, isYou: false },
];

function useSessionTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function ParticipantTile({
  name, initials, color, isYou, isActive, isWaiting, c,
}: {
  name: string; initials: string; color: string;
  isYou: boolean; isActive: boolean; isWaiting: boolean; c: Colors;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
      style={{
        backgroundColor: isActive ? `${color}18` : "transparent",
        border: isActive ? `1px solid ${color}40` : "1px solid transparent",
      }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 relative"
        style={{ backgroundColor: isWaiting ? c.textMuted : color, fontSize: "9px", fontWeight: 700 }}
      >
        {initials}
        {isActive && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
            style={{ backgroundColor: "#22C55E", borderColor: c.surface }}
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium leading-none" style={{ color: isWaiting ? c.textFaint : c.text }}>
          {name} {isYou && <span style={{ color: c.textFaint, fontWeight: 400 }}>(you)</span>}
        </p>
        <p className="text-xs mt-0.5 leading-none" style={{ color: c.textFaint, fontSize: "10px" }}>
          {isWaiting ? "Waiting to join..." : isActive ? "In session" : "Connected"}
        </p>
      </div>
    </div>
  );
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const roomId = (params?.roomId as string) ?? "MEET-Q2-01";

  const c: Colors = theme === "dark"
    ? { bg: "#111827", surface: "#1F2937", border: "#374151", borderLight: "#2D3748", text: "#F3F4F6", textMuted: "#9CA3AF", textFaint: "#6B7280", ctrl: "#374151" }
    : { bg: "#F9FAFB", surface: "#FFFFFF", border: "#E5E7EB", borderLight: "#F3F4F6", text: "#111827", textMuted: "#6B7280", textFaint: "#9CA3AF", ctrl: "#E5E7EB" };

  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [activityLog] = useState([
    { time: "just now", text: "Luthfi joined the session" },
    { time: "0:04", text: "Session started" },
    { time: "0:00", text: "Meeting room opened" },
  ]);
  const timer = useSessionTimer();

  useEffect(() => {
    const t1 = setTimeout(() => setStatus("waiting"), 900);
    const t2 = setTimeout(() => setStatus("ready"), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const guestJoined = status === "ready";

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
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: status === "ready" ? "#22C55E" : "#F59E0B" }} />
            <span className="text-xs font-mono font-medium" style={{ color: c.textMuted }}>{roomId}</span>
          </div>
          <div className="hidden sm:block h-4 w-px" style={{ backgroundColor: c.border }} />
          <span className="hidden sm:block text-sm font-medium" style={{ color: c.text }}>
            Q2 Sync — Week 3
          </span>
          <div
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded"
            style={{ backgroundColor: c.ctrl }}
          >
            <svg className="w-3 h-3" style={{ color: c.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-mono" style={{ color: c.text }}>{timer}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "#6366F1", fontSize: "8px", fontWeight: 700 }}>LF</div>
            {guestJoined && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "#0EA5E9", fontSize: "8px", fontWeight: 700 }}>JD</div>
            )}
            <span className="text-xs ml-1" style={{ color: c.textFaint }}>{guestJoined ? "2" : "1"}/2</span>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-xs px-3 py-1.5 rounded font-medium transition-colors"
            style={{ backgroundColor: "#DC2626", color: "white" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B91C1C")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#DC2626")}
          >
            Leave
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">

        <main className="flex-1 flex flex-col items-center justify-start overflow-auto p-4 md:p-6">

          {status === "connecting" && (
            <div className="w-full max-w-md mb-4 px-4 py-3 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#6366F1", borderTopColor: "transparent" }} />
              <span className="text-xs" style={{ color: c.textMuted }}>Connecting to session...</span>
            </div>
          )}

          {status === "waiting" && (
            <div className="w-full max-w-md mb-4 px-4 py-3 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#F59E0B", borderTopColor: "transparent" }} />
              <div>
                <p className="text-xs font-medium" style={{ color: c.text }}>Waiting for participant</p>
                <p className="text-xs" style={{ color: c.textFaint }}>Share the Meeting ID to invite someone</p>
              </div>
              <button
                className="ml-auto text-xs px-2.5 py-1 rounded font-mono"
                style={{ backgroundColor: c.ctrl, color: c.text }}
                onClick={() => navigator.clipboard?.writeText(roomId)}
              >
                {roomId}
              </button>
            </div>
          )}

          {/* Board card */}
          <div className="w-full max-w-fit rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
            {/* Opponent */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ backgroundColor: c.surface, borderBottom: `1px solid ${c.borderLight}` }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white relative"
                  style={{ backgroundColor: guestJoined ? "#0EA5E9" : c.border, fontSize: "9px", fontWeight: 700 }}
                >
                  {guestJoined ? "JD" : "?"}
                  {guestJoined && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400" style={{ border: `1px solid ${c.surface}` }} />
                  )}
                </div>
                <span className="text-xs font-medium" style={{ color: guestJoined ? c.text : c.textFaint }}>
                  {guestJoined ? "Jordan" : "Waiting for opponent..."}
                </span>
              </div>
              <span className="text-xs" style={{ color: c.textFaint }}>Black</span>
            </div>

            {/* Board */}
            <div style={{ backgroundColor: c.bg }}>
              <BoardWrapper />
            </div>

            {/* You */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ backgroundColor: c.surface, borderTop: `1px solid ${c.borderLight}` }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white relative"
                  style={{ backgroundColor: "#6366F1", fontSize: "9px", fontWeight: 700 }}
                >
                  LF
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400" style={{ border: `1px solid ${c.surface}` }} />
                </div>
                <span className="text-xs font-medium" style={{ color: c.text }}>
                  Luthfi <span style={{ color: c.textFaint, fontWeight: 400 }}>(you)</span>
                </span>
              </div>
              <span className="text-xs" style={{ color: c.textFaint }}>White</span>
            </div>
          </div>
        </main>

        {/* Right panel */}
        {showActivity && (
          <aside
            className="hidden lg:flex w-64 flex-col shrink-0"
            style={{ backgroundColor: c.surface, borderLeft: `1px solid ${c.border}` }}
          >
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.textFaint }}>Participants</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: c.ctrl, color: c.textMuted }}>
                {guestJoined ? 2 : 1}/2
              </span>
            </div>

            <div className="p-2 space-y-1 shrink-0">
              {MOCK_PARTICIPANTS.map((p) => (
                <ParticipantTile
                  key={p.id}
                  name={p.name}
                  initials={p.initials}
                  color={p.color}
                  isYou={p.isYou}
                  isActive={p.id === "host" || guestJoined}
                  isWaiting={p.id === "guest" && !guestJoined}
                  c={c}
                />
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${c.border}`, margin: "4px 0" }} />

            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.textFaint }}>Activity</span>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-3">
              {activityLog.map((entry, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-xs font-mono shrink-0 mt-0.5" style={{ color: c.textFaint, fontSize: "10px" }}>{entry.time}</span>
                  <p className="text-xs leading-snug" style={{ color: c.textMuted }}>{entry.text}</p>
                </div>
              ))}
            </div>

            <div className="p-3 shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
              <p className="text-xs mb-1.5" style={{ color: c.textFaint }}>Meeting ID</p>
              <button
                className="w-full text-xs px-3 py-2 rounded font-mono text-left transition-colors"
                style={{ backgroundColor: c.ctrl, color: c.text }}
                onClick={() => navigator.clipboard?.writeText(roomId)}
              >
                {roomId}
                <span className="float-right" style={{ color: c.textMuted }}>copy</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom control bar */}
      <div
        className="h-14 flex items-center justify-between px-4 shrink-0"
        style={{ backgroundColor: c.surface, borderTop: `1px solid ${c.border}` }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md transition-colors"
            style={{ backgroundColor: isMuted ? "#DC2626" : c.ctrl, color: isMuted ? "white" : c.text }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMuted
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M9.172 16.172a4 4 0 015.656 0" />
              }
            </svg>
            <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
          </button>

          <button
            onClick={() => setShowActivity((v) => !v)}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md transition-colors"
            style={{ backgroundColor: showActivity ? c.border : c.ctrl, color: c.text }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Participants</span>
          </button>

          {/* Theme toggle */}
          <div className="hidden sm:flex rounded-md overflow-hidden text-xs" style={{ border: `1px solid ${c.border}` }}>
            <button
              onClick={() => theme === "dark" && toggleTheme()}
              className="flex items-center justify-center px-2.5 py-1.5 transition-colors"
              style={{
                backgroundColor: theme === "light" ? c.border : "transparent",
                color: theme === "light" ? c.text : c.textFaint,
              }}
              title="Light mode"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <button
              onClick={() => theme === "light" && toggleTheme()}
              className="flex items-center justify-center px-2.5 py-1.5 transition-colors"
              style={{
                backgroundColor: theme === "dark" ? c.border : "transparent",
                color: theme === "dark" ? c.text : c.textFaint,
                borderLeft: `1px solid ${c.border}`,
              }}
              title="Dark mode"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="text-xs text-center" style={{ color: c.textFaint }}>
          {status === "connecting" && "Connecting..."}
          {status === "waiting" && "Waiting for opponent"}
          {status === "ready" && <span style={{ color: "#22C55E" }}>Session active · {timer}</span>}
        </div>

        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
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
