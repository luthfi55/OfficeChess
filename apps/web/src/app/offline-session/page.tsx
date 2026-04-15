"use client";

import BoardWrapper from "@/components/chess/BoardWrapper";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

const NAV_ITEMS = [
  { label: "Dashboard", active: false },
  { label: "My Tasks", active: false },
  { label: "Projects", active: true },
  { label: "Reports", active: false },
  { label: "Settings", active: false },
];

const TEAM_MEMBERS = [
  { name: "Luthfi", initials: "LF", color: "#6366F1" },
  { name: "Jordan", initials: "JD", color: "#0EA5E9" },
];

function ThemeToggle({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  return (
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
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between h-12 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">J</span>
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Jira</span>
            </Link>
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
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-2.5 py-1.5">
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

        {/* Sidebar */}
        <aside className="hidden md:flex w-52 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col py-3 shrink-0">
          <div className="px-3 mb-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Workspace</p>
            {[
              { label: "Overview", href: "/" },
              { label: "Timeline", href: "/" },
              { label: "Board View", href: "/offline-session", active: true },
              { label: "Team Sessions", href: "/" },
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
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Tasks</p>
            {["In Progress (2)", "Under Review (1)", "Completed (8)"].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer mb-0.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                {item}
              </div>
            ))}
          </div>

          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          <div className="mt-auto px-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Team</p>
            {TEAM_MEMBERS.map((m) => (
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

          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-300">Projects</Link>
            <span>/</span>
            <span>Q2 Planning</span>
            <span>/</span>
            <span className="text-gray-600 dark:text-gray-300 font-medium">Board View</span>
          </div>

          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Q2 Planning Board</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Last updated today · 2 active sessions</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {TEAM_MEMBERS.map((m) => (
                  <div
                    key={m.name}
                    title={m.name}
                    className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white"
                    style={{ backgroundColor: m.color, fontSize: "9px", fontWeight: 700 }}
                  >
                    {m.initials}
                  </div>
                ))}
              </div>
              <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium">
                + New Task
              </button>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-5 items-start">

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 min-w-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Active Session</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-mono">MEET-Q2-01</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Session Time</span>
                </div>
              </div>
              <div className="p-4">
                <BoardWrapper />
              </div>
            </div>

            <div className="hidden xl:flex w-56 shrink-0 flex-col gap-3">

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">Details</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Priority", value: "Medium", dot: "bg-yellow-400" },
                    { label: "Sprint", value: "Q2 Week 3" },
                    { label: "Type", value: "Sync Meeting" },
                    { label: "Meeting ID", value: "MEET-Q2-01", mono: true },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{row.label}</span>
                      <div className="flex items-center gap-1">
                        {row.dot && <div className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />}
                        <span className={`text-xs text-gray-700 dark:text-gray-200 ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">Activity Log</p>
                <div className="space-y-2">
                  {[
                    { user: "LF", name: "Luthfi", action: "made an update", time: "just now", color: "#6366F1" },
                    { user: "JD", name: "Jordan", action: "joined session", time: "2m ago", color: "#0EA5E9" },
                    { user: "LF", name: "Luthfi", action: "opened session", time: "5m ago", color: "#6366F1" },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5" style={{ backgroundColor: entry.color, fontSize: "8px", fontWeight: 700 }}>
                        {entry.user}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 dark:text-gray-200 leading-snug">
                          <span className="font-medium">{entry.name}</span> {entry.action}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{entry.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">Shortcuts</p>
                <div className="space-y-1.5">
                  {[
                    { keys: ["Esc"], desc: "Hide / Resume board" },
                    { keys: ["←"], desc: "Previous move" },
                    { keys: ["→"], desc: "Next move" },
                    { keys: ["R"], desc: "Peek real pieces" },
                    { keys: ["Aa"], desc: "Letter mode toggle" },
                    { keys: ["♟"], desc: "Classic pieces toggle" },
                  ].map(({ keys, desc }) => (
                    <div key={desc} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{desc}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {keys.map((k) => (
                          <kbd key={k} className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 font-mono leading-none" style={{ fontSize: "10px" }}>
                            {k}
                          </kbd>
                        ))}
                      </div>
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
