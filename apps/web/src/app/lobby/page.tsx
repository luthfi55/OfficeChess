"use client";

import { useState } from "react";
import Link from "next/link";

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
  const [meetingCode, setMeetingCode] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-4 flex items-center justify-between h-12 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">J</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">Jira</span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <span
                key={item.label}
                className={`px-3 py-1.5 text-xs rounded cursor-pointer transition-colors ${
                  item.active ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded px-2.5 py-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs text-gray-400">Search...</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">LF</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — hidden di mobile */}
        <aside className="hidden md:flex w-52 bg-white border-r border-gray-200 flex-col py-3 shrink-0">
          <div className="px-3 mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Workspace</p>
            {[
              { label: "Overview", href: "/" },
              { label: "Timeline", href: "/" },
              { label: "Board View", href: "/" },
              { label: "Team Sessions", href: "/lobby", active: true },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer mb-0.5 ${
                  item.active ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="px-3 mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Quick Actions</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab("create")}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                New Meeting
              </button>
              <button
                onClick={() => setActiveTab("join")}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Join Meeting
              </button>
            </div>
          </div>

          <div className="mt-auto px-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Team</p>
            {[
              { name: "Luthfi", initials: "LF", color: "#6366F1" },
              { name: "Jordan", initials: "JD", color: "#0EA5E9" },
              { name: "Alex", initials: "AL", color: "#10B981" },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer mb-0.5">
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
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-gray-600">Projects</Link>
            <span>/</span>
            <span>Q2 Planning</span>
            <span>/</span>
            <span className="text-gray-600 font-medium">Team Sessions</span>
          </div>

          {/* Page header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Team Sessions</h1>
              <p className="text-xs text-gray-400 mt-0.5">Schedule or join a sync meeting with your team</p>
            </div>
            <Link
              href="/"
              className="text-xs px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              ← Back to Board
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-5 items-start">

            {/* Left — Create / Join card */}
            <div className="w-full md:flex-1 md:max-w-md">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => setActiveTab("create")}
                    className={`flex-1 text-xs py-3 font-medium transition-colors ${
                      activeTab === "create"
                        ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    New Meeting
                  </button>
                  <button
                    onClick={() => setActiveTab("join")}
                    className={`flex-1 text-xs py-3 font-medium transition-colors ${
                      activeTab === "join"
                        ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Join Meeting
                  </button>
                </div>

                <div className="p-5">
                  {activeTab === "create" ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">Schedule a New Session</p>
                        <p className="text-xs text-gray-400">A unique Meeting ID will be generated for your session.</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1.5">Session Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Q2 Sync — Week 3"
                            className="w-full text-xs border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-700 placeholder-gray-300"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1.5">Assignee</label>
                          <select className="w-full text-xs border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-600 bg-white">
                            <option>Jordan</option>
                            <option>Alex</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1.5">Priority</label>
                          <div className="flex gap-2">
                            {["Low", "Medium", "High"].map((p) => (
                              <button
                                key={p}
                                className={`flex-1 text-xs py-1.5 rounded-md border transition-colors ${
                                  p === "Medium"
                                    ? "border-blue-300 bg-blue-50 text-blue-600 font-medium"
                                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        disabled
                        className="w-full text-xs py-2.5 rounded-md bg-blue-600 text-white font-medium opacity-60 cursor-not-allowed"
                        title="Coming soon"
                      >
                        Create Session
                        <span className="ml-2 text-blue-200 font-normal">(coming soon)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">Join an Existing Session</p>
                        <p className="text-xs text-gray-400">Enter the Meeting ID shared by your teammate.</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1.5">Meeting ID</label>
                          <input
                            type="text"
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                            placeholder="e.g. MEET-Q2-01"
                            className="w-full text-xs border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-700 placeholder-gray-300 font-mono tracking-wider"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1.5">Your Name</label>
                          <input
                            type="text"
                            placeholder="Display name"
                            className="w-full text-xs border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-700 placeholder-gray-300"
                          />
                        </div>
                      </div>

                      <button
                        disabled
                        className="w-full text-xs py-2.5 rounded-md bg-gray-800 text-white font-medium opacity-60 cursor-not-allowed"
                        title="Coming soon"
                      >
                        Join Session
                        <span className="ml-2 text-gray-400 font-normal">(coming soon)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right — Recent sessions + info */}
            <div className="flex-1 flex flex-col gap-3">

              {/* Recent Sessions */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Recent Sessions</p>
                  <span className="text-xs text-gray-400">{RECENT_SESSIONS.length} sessions</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {RECENT_SESSIONS.map((s) => (
                    <div key={s.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-700 font-mono">{s.id}</p>
                          <p className="text-xs text-gray-400">{s.participants}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s.status}</span>
                        <p className="text-xs text-gray-400 mt-0.5">{s.duration} · {s.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info card */}
              <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1.5">How it works</p>
                <div className="space-y-1.5">
                  {[
                    "Create a session to get a unique Meeting ID",
                    "Share the Meeting ID with your teammate",
                    "Both join and the session starts automatically",
                    "Session history is saved after completion",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs text-blue-400 font-mono shrink-0">{i + 1}.</span>
                      <span className="text-xs text-blue-600">{step}</span>
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
