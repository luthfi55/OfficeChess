"use client";

import { useEffect, useRef } from "react";

interface MoveHistoryProps {
  moves: string[];
}

const COL_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "28px 1fr 1fr",
  alignItems: "center",
};

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moves.length]);

  const rows: { index: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({ index: i / 2 + 1, white: moves[i], black: moves[i + 1] });
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-gray-600">Activity Log</span>
        </div>
        <span className="text-xs text-gray-400 font-mono">{moves.length} entries</span>
      </div>

      {/* Column headers */}
      <div style={{ ...COL_STYLE, padding: "6px 12px", borderBottom: "1px solid #F3F4F6", background: "#F9FAFB" }}>
        <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>#</span>
        <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>Luthfi</span>
        <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>Jordan</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {moves.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-1.5 text-center px-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400">No activity yet</p>
            <p className="text-xs text-gray-300">Updates will appear here</p>
          </div>
        ) : (
          <div>
            {rows.map((row) => {
              const isLastRow = row.index === rows.length;
              const whiteIsLatest = isLastRow && moves.length % 2 !== 0;
              const blackIsLatest = isLastRow && moves.length % 2 === 0;

              return (
                <div
                  key={row.index}
                  style={{
                    ...COL_STYLE,
                    padding: "6px 12px",
                    borderBottom: "1px solid #F9FAFB",
                    backgroundColor: isLastRow ? "#EFF6FF" : undefined,
                    cursor: "default",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#D1D5DB", fontFamily: "monospace" }}>
                    {row.index}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    fontFamily: "monospace",
                    fontWeight: 600,
                    color: whiteIsLatest ? "#2563EB" : "#374151",
                    letterSpacing: "0.02em",
                  }}>
                    {row.white ?? "—"}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    fontFamily: "monospace",
                    fontWeight: 400,
                    color: blackIsLatest ? "#2563EB" : row.black ? "#6B7280" : "#D1D5DB",
                    letterSpacing: "0.02em",
                  }}>
                    {row.black ?? "·"}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Footer */}
      {moves.length > 0 && (
        <div className="shrink-0 px-3 py-2 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Move {Math.ceil(moves.length / 2)}</span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-gray-700" />
              <span>Luthfi</span>
              <span className="ml-2 inline-block w-2 h-2 rounded-sm bg-blue-400" />
              <span>Jordan</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
