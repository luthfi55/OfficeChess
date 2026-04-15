"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

const NAV_ITEMS = [
  { label: "Dashboard", active: false },
  { label: "My Tasks", active: false },
  { label: "Projects", active: true },
  { label: "Reports", active: false },
  { label: "Settings", active: false },
];

const RECENT_SESSIONS = [
  { id: "MEET-Q1-07", participants: "Luthfi, Jordan", status: "Completed", duration: "32 min", date: "Apr 13" },
  { id: "MEET-Q1-06", participants: "Luthfi, Alex", status: "Completed", duration: "18 min", date: "Apr 12" },
  { id: "MEET-Q1-05", participants: "Luthfi, Jordan", status: "Closed", duration: "45 min", date: "Apr 11" },
];

export default function LobbyPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [meetingCode, setMeetingCode] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "join" | "offline">("create");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between h-12 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">J</span>
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Jira</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <span
                key={item.label}
                className={`px-3 py-1.5 text-xs rounded cursor-pointer transition-colors ${
                  item.active
                    ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-medium"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {item.label}
              </span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-2.5 py-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs text-gray-400 dark:text-gray-500">Search...</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">LF</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — hidden di mobile */}
        <aside className="hidden md:flex w-52 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col py-3 shrink-0">
          <div className="px-3 mb-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Workspace</p>
            {[
              { label: "Overview", href: "/" },
              { label: "Timeline", href: "/" },
              { label: "Board View", href: "/offline-session" },
              { label: "Team Sessions", href: "/", active: true },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer mb-0.5 ${
                  item.active
                    ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="px-3 mb-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Quick Actions</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab("create")}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                New Meeting
              </button>
              <button
                onClick={() => setActiveTab("join")}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Join Meeting
              </button>
              <button
                onClick={() => setActiveTab("join")}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Offline
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="px-3 mb-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Preferences</p>
            <div className="px-2 py-1">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">Theme</p>
              <div className="flex rounded-md border border-gray-200 dark:border-gray-600 overflow-hidden text-xs">
                <button
                  onClick={() => theme === "dark" && toggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 transition-colors ${
                    theme === "light"
                      ? "bg-gray-800 text-white font-medium"
                      : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Light
                </button>
                <button
                  onClick={() => theme === "light" && toggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 transition-colors border-l border-gray-200 dark:border-gray-600 ${
                    theme === "dark"
                      ? "bg-gray-800 text-white font-medium"
                      : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Dark
                </button>
              </div>
            </div>
          </div>

          <div className="mt-auto px-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Team</p>
            {[
              { name: "Luthfi", initials: "LF", color: "#6366F1" },
              { name: "Jordan", initials: "JD", color: "#0EA5E9" },
              { name: "Alex", initials: "AL", color: "#10B981" },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer mb-0.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: m.color, fontSize: "9px", fontWeight: 700 }}
                >
                  {m.initials}
                </div>
                {m.name}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-3 md:p-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-300">Projects</Link>
            <span>/</span>
            <span>Q2 Planning</span>
            <span>/</span>
            <span className="text-gray-600 dark:text-gray-300 font-medium">Team Sessions</span>
          </div>

          {/* Page header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Team Sessions</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Schedule or join a sync meeting with your team</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5 items-start">

            {/* Left — Create / Join card */}
            <div className="w-full md:flex-1 md:max-w-md">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                  {(["create", "join", "offline"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 text-xs py-3 font-medium transition-colors ${
                        activeTab === tab
                          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {tab === "create" ? "New Meeting" : tab === "join" ? "Join Meeting" : "Offline"}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {activeTab === "create" ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">Schedule a New Session</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">A unique Meeting ID will be generated for your session.</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Session Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Q2 Sync — Week 3"
                            className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-white dark:bg-gray-700"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Assignee</label>
                          <select className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700">
                            <option>Jordan</option>
                            <option>Alex</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Priority</label>
                          <div className="flex gap-2">
                            {["Low", "Medium", "High"].map((p) => (
                              <button
                                key={p}
                                className={`flex-1 text-xs py-1.5 rounded-md border transition-colors ${
                                  p === "Medium"
                                    ? "border-blue-300 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                                    : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const id = `MEET-Q2-${String(Math.floor(Math.random() * 90) + 10).padStart(2, "0")}`;
                          router.push(`/game/${id}`);
                        }}
                        className="w-full text-xs py-2.5 rounded-md bg-gray-800 dark:bg-gray-600 text-white font-medium hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors"
                      >
                        Create Session
                      </button>
                    </div>
                  ) : activeTab === "join" ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">Join an Existing Session</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Enter the Meeting ID shared by your teammate.</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Meeting ID</label>
                          <input
                            type="text"
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                            placeholder="e.g. MEET-Q2-01"
                            className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 font-mono tracking-wider bg-white dark:bg-gray-700"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Your Name</label>
                          <input
                            type="text"
                            placeholder="Display name"
                            className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-white dark:bg-gray-700"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => meetingCode.trim() && router.push(`/game/${meetingCode.trim()}`)}
                        disabled={!meetingCode.trim()}
                        className="w-full text-xs py-2.5 rounded-md bg-gray-800 dark:bg-gray-600 text-white font-medium hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Join Session
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">Offline Meeting</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Play on the same device — no connection or Meeting ID required.</p>
                      </div>

                      <div className="space-y-2">
                        {[
                          { label: "vs Bot", desc: "Play against Stockfish AI", icon: "⚡" },
                          { label: "2 Players", desc: "Take turns on one screen", icon: "👥" },
                        ].map((opt) => (
                          <div
                            key={opt.label}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                          >
                            <span className="text-base">{opt.icon}</span>
                            <div>
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{opt.label}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{opt.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-400 dark:text-gray-500">Mode and bot level can be changed directly on the board.</p>

                      <button
                        onClick={() => router.push("/offline-session")}
                        className="w-full text-xs py-2.5 rounded-md bg-gray-800 dark:bg-gray-600 text-white font-medium hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors"
                      >
                        Start Offline Session
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right — Recent sessions + info */}
            <div className="flex-1 flex flex-col gap-3">

              {/* Recent Sessions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Recent Sessions</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{RECENT_SESSIONS.length} sessions</span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                  {RECENT_SESSIONS.map((s) => (
                    <div key={s.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-200 font-mono">{s.id}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{s.participants}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{s.status}</span>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.duration} · {s.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info card */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 p-4">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1.5">How it works</p>
                <div className="space-y-1.5">
                  {[
                    "Create a session to get a unique Meeting ID",
                    "Share the Meeting ID with your teammate",
                    "Both join and the session starts automatically",
                    "Session history is saved after completion",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs text-blue-400 dark:text-blue-500 font-mono shrink-0">{i + 1}.</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
