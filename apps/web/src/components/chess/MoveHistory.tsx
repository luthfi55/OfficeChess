"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

interface MoveHistoryProps {
  moves: string[];
}

const COL_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "28px 1fr 1fr",
  alignItems: "center",
};

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const dark = theme === "dark";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [moves.length]);

  const rows: { index: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({ index: i / 2 + 1, white: moves[i], black: moves[i + 1] });
  }

  const headerBorder = dark ? "#374151" : "#F3F4F6";
  const headerBg = dark ? "#1F2937" : "#F9FAFB";
  const labelColor = dark ? "#6B7280" : "#9CA3AF";
  const rowBorder = dark ? "#1F2937" : "#F9FAFB";
  const highlightBg = dark ? "#374151" : "#F3F4F6";
  const numColor = dark ? "#4B5563" : "#D1D5DB";
  const whiteLatestColor = dark ? "#F9FAFB" : "#111827";
  const whiteNormalColor = dark ? "#D1D5DB" : "#374151";
  const blackLatestColor = dark ? "#D1D5DB" : "#374151";
  const blackNormalColor = dark ? "#6B7280" : "#6B7280";
  const blackNullColor = dark ? "#4B5563" : "#D1D5DB";

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Activity Log</span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{moves.length} entries</span>
      </div>

      {/* Column headers */}
      <div style={{ ...COL_STYLE, padding: "6px 12px", borderBottom: `1px solid ${headerBorder}`, background: headerBg }}>
        <span style={{ fontSize: "11px", color: labelColor, fontWeight: 600 }}>#</span>
        <span style={{ fontSize: "11px", color: labelColor, fontWeight: 600 }}>Luthfi</span>
        <span style={{ fontSize: "11px", color: labelColor, fontWeight: 600 }}>Jordan</span>
      </div>

      {/* Rows */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {moves.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-1.5 text-center px-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">No activity yet</p>
            <p className="text-xs text-gray-300 dark:text-gray-600">Updates will appear here</p>
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
                    borderBottom: `1px solid ${rowBorder}`,
                    backgroundColor: isLastRow ? highlightBg : undefined,
                    cursor: "default",
                  }}
                >
                  <span style={{ fontSize: "11px", color: numColor, fontFamily: "monospace" }}>
                    {row.index}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    fontFamily: "monospace",
                    fontWeight: 600,
                    color: whiteIsLatest ? whiteLatestColor : whiteNormalColor,
                    letterSpacing: "0.02em",
                  }}>
                    {row.white ?? "—"}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    fontFamily: "monospace",
                    fontWeight: 400,
                    color: blackIsLatest ? blackLatestColor : row.black ? blackNormalColor : blackNullColor,
                    letterSpacing: "0.02em",
                  }}>
                    {row.black ?? "·"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {moves.length > 0 && (
        <div className="shrink-0 px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>Move {Math.ceil(moves.length / 2)}</span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-gray-700 dark:bg-gray-300" />
              <span>Luthfi</span>
              <span className="ml-2 inline-block w-2 h-2 rounded-sm bg-gray-500 dark:bg-gray-500" />
              <span>Jordan</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
