"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Board = dynamic(() => import("./Board"), { ssr: false });

const LOADING = (
  <div className="flex items-center justify-center h-[460px] text-sm text-gray-400">
    Loading session...
  </div>
);

export default function BoardWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server + client initial render keduanya return LOADING
  // sehingga HTML cocok dan tidak ada hydration mismatch.
  // Setelah hydration selesai, Board dimuat via dynamic import.
  if (!mounted) return LOADING;

  return <Board />;
}
