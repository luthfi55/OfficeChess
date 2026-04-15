import BoardWrapper from "@/components/chess/BoardWrapper";
import Link from "next/link";

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

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-4 flex items-center justify-between h-12 shrink-0">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">J</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">Jira</span>
          </div>

          {/* Nav links — hidden di mobile */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <span
                key={item.label}
                className={`px-3 py-1.5 text-xs rounded cursor-pointer transition-colors ${
                  item.active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </span>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded px-2.5 py-1.5">
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
              { label: "Board View", href: "/", active: true },
              { label: "Team Sessions", href: "/lobby" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer mb-0.5 ${
                  item.active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="px-3 mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tasks</p>
            {["In Progress (2)", "Under Review (1)", "Completed (8)"].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer mb-0.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-auto px-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Team</p>
            {TEAM_MEMBERS.map((m) => (
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
            <span>Projects</span>
            <span>/</span>
            <span>Q2 Planning</span>
            <span>/</span>
            <span className="text-gray-600 font-medium">Board View</span>
          </div>

          {/* Page header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Q2 Planning Board</h1>
              <p className="text-xs text-gray-400 mt-0.5">Last updated today · 2 active sessions</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {TEAM_MEMBERS.map((m) => (
                  <div
                    key={m.name}
                    title={m.name}
                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white"
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

          {/* Content area */}
          <div className="flex flex-col xl:flex-row gap-5 items-start">

            {/* Board card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 min-w-0">
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-semibold text-gray-700">Active Session</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">MEET-Q2-01</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Session Time</span>
                </div>
              </div>

              {/* Board */}
              <div className="p-4">
                <BoardWrapper />
              </div>
            </div>

            {/* Right panel — hidden di mobile/tablet, muncul di xl */}
            <div className="hidden xl:flex w-56 shrink-0 flex-col gap-3">

              {/* Details */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Details</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Priority", value: "Medium", dot: "bg-yellow-400" },
                    { label: "Sprint", value: "Q2 Week 3" },
                    { label: "Type", value: "Sync Meeting" },
                    { label: "Meeting ID", value: "MEET-Q2-01", mono: true },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{row.label}</span>
                      <div className="flex items-center gap-1">
                        {row.dot && <div className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />}
                        <span className={`text-xs text-gray-700 ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Log */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Activity Log</p>
                <div className="space-y-2">
                  {[
                    { user: "LF", name: "Luthfi", action: "made an update", time: "just now", color: "#6366F1" },
                    { user: "JD", name: "Jordan", action: "joined session", time: "2m ago", color: "#0EA5E9" },
                    { user: "LF", name: "Luthfi", action: "opened session", time: "5m ago", color: "#6366F1" },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                        style={{ backgroundColor: entry.color, fontSize: "8px", fontWeight: 700 }}
                      >
                        {entry.user}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 leading-snug">
                          <span className="font-medium">{entry.name}</span> {entry.action}
                        </p>
                        <p className="text-xs text-gray-400">{entry.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Shortcuts</p>
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
                      <span className="text-xs text-gray-500 truncate">{desc}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {keys.map((k) => (
                          <kbd
                            key={k}
                            className="text-xs text-gray-600 bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 font-mono leading-none"
                            style={{ fontSize: "10px" }}
                          >
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
