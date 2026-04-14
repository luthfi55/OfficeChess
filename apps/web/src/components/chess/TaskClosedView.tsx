"use client";

interface TaskClosedViewProps {
  totalMoves: number;
  winner: "Luthfi" | "Jordan" | "Draw" | null;
  onNewSession: () => void;
  onResume: () => void;
}

// Generate fake bar chart data berdasarkan totalMoves agar terlihat dinamis
function generateChartData(seed: number) {
  const base = [65, 78, 55, 82, 91, 74, 88, 60, 95, 70, 85, 77];
  return base.map((v, i) => Math.min(100, Math.max(20, v + ((seed * (i + 1)) % 23) - 10)));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function TaskClosedView({ totalMoves, winner, onNewSession, onResume }: TaskClosedViewProps) {
  const chartData = generateChartData(totalMoves);
  const maxVal = Math.max(...chartData);
  const chartH = 80;
  const barW = 18;
  const gap = 6;
  const totalW = (barW + gap) * 12 - gap;

  const completionRate = Math.min(99, 60 + totalMoves * 2);
  const velocity = Math.round(totalMoves * 1.4);
  const resolved = Math.round(totalMoves * 0.7);

  return (
    <div className="space-y-3">

      {/* Status banner + actions dalam satu baris */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700">Task Closed</p>
          <p className="text-xs text-gray-400 truncate">
            {winner === "Draw"
              ? "Marked as resolved by both parties"
              : winner
              ? `Completed by ${winner} · ${totalMoves} entries`
              : `Session closed · ${totalMoves} entries logged`}
          </p>
        </div>
        {/* Actions langsung di header */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onResume}
            className="text-xs px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors font-medium"
          >
            Resume
          </button>
          <button
            onClick={onNewSession}
            className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
          >
            New Session
          </button>
        </div>
      </div>

      {/* Metric cards + chart — side by side di sm+, stack di mobile */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Metrics */}
        <div className="flex flex-row sm:flex-col gap-2 sm:w-36 sm:shrink-0">
          {[
            { label: "Completion", value: `${completionRate}%`, delta: "+4.2%", up: true, icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
            { label: "Story Points", value: velocity, delta: `${totalMoves} logged`, up: true, icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { label: "Resolved", value: resolved, delta: "this sprint", up: null, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          ].map((m) => (
            <div
              key={m.label}
              className="group bg-white rounded-lg border border-gray-200 px-3 py-2.5 cursor-default transition-all duration-150 hover:border-blue-200 hover:shadow-sm hover:bg-blue-50/30"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors">{m.label}</p>
                <svg
                  className="w-3 h-3 text-gray-300 group-hover:text-blue-400 transition-colors"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={m.icon} />
                </svg>
              </div>
              <p className="text-base font-bold text-gray-800 group-hover:text-gray-900 leading-tight">{m.value}</p>
              <p className={`text-xs mt-0.5 transition-colors ${m.up === true ? "text-emerald-600 group-hover:text-emerald-700" : "text-gray-400 group-hover:text-gray-500"}`}>
                {m.up === true && <span className="mr-0.5">↑</span>}{m.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Chart + summary */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Bar chart */}
          <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">Sprint Velocity</p>
              <span className="text-xs text-blue-500">Q2 2026</span>
            </div>
            <svg width="100%" viewBox={`0 0 ${totalW} ${chartH + 20}`} preserveAspectRatio="xMidYMid meet">
              {[0, 50, 100].map((pct) => (
                <line key={pct} x1={0} y1={chartH - (pct / 100) * chartH} x2={totalW} y2={chartH - (pct / 100) * chartH}
                  stroke="#F3F4F6" strokeWidth={1} />
              ))}
              {chartData.map((val, i) => {
                const x = i * (barW + gap);
                const h = (val / maxVal) * chartH;
                const y = chartH - h;
                const isHighlight = i === 3;
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={barW} height={h} fill={isHighlight ? "#3B82F6" : "#E5E7EB"} rx={2} />
                    <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fontSize={8} fill="#9CA3AF">{MONTHS[i]}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Summary table compact */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {[
              { label: "Assigned", value: "Luthfi, Jordan", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" },
              { label: "Sprint", value: "Q2 Week 3", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
              { label: "Updates", value: `${totalMoves} entries`, icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
              { label: "Status", value: "Archived", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className={`group flex items-center justify-between px-3 py-2 cursor-default transition-colors duration-100 hover:bg-gray-50 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-gray-300 group-hover:text-gray-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={row.icon} />
                  </svg>
                  <span className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors">{row.label}</span>
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
