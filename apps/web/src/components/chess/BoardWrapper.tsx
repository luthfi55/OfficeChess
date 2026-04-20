"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Board = dynamic(() => import("./Board"), { ssr: false });

const LOADING = (
  <div className="flex items-center justify-center h-[460px] text-sm text-gray-400">
    Loading session...
  </div>
);

interface BoardWrapperProps {
  hideMoveHistory?: boolean;
  onMovesChange?: (moves: string[]) => void;
}

export default function BoardWrapper({ hideMoveHistory, onMovesChange }: BoardWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return LOADING;

  return <Board hideMoveHistory={hideMoveHistory} onMovesChange={onMovesChange} />;
}
