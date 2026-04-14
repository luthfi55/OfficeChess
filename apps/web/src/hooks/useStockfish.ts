"use client";

import { useEffect, useRef, useCallback } from "react";

export type BotLevel = 1 | 2 | 3 | 4 | 5;

const LEVEL_CONFIG: Record<BotLevel, { skill: number; depth: number; movetime: number; minDelay: number; label: string }> = {
  1: { skill: 1,  depth: 5,  movetime: 100,  minDelay: 700, label: "Beginner" },
  2: { skill: 5,  depth: 8,  movetime: 300,  minDelay: 500,  label: "Easy"     },
  3: { skill: 10, depth: 12, movetime: 800,  minDelay: 0,  label: "Medium"   },
  4: { skill: 15, depth: 16, movetime: 1500, minDelay: 0,  label: "Hard"     },
  5: { skill: 20, depth: 20, movetime: 2500, minDelay: 0,    label: "Expert"   },
};

export { LEVEL_CONFIG };

export function useStockfish(
  level: BotLevel,
  enabled: boolean,
  onBestMove: (from: string, to: string, promotion?: string) => void
) {
  const workerRef = useRef<Worker | null>(null);
  const readyRef = useRef(false);
  const pendingFenRef = useRef<string | null>(null);
  const moveStartTimeRef = useRef<number>(0);
  const onBestMoveRef = useRef(onBestMove);
  onBestMoveRef.current = onBestMove;

  // Init worker sekali saat mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const worker = new Worker("/stockfish/stockfish.js");
    workerRef.current = worker;
    readyRef.current = false;

    worker.onmessage = (e: MessageEvent<string>) => {
      const msg = e.data;

      if (msg === "uciok") {
        readyRef.current = true;
        // Kalau ada pending FEN, jalankan sekarang
        if (pendingFenRef.current) {
          sendGo(pendingFenRef.current);
          pendingFenRef.current = null;
        }
        return;
      }

      if (msg.startsWith("bestmove")) {
        const parts = msg.split(" ");
        const move = parts[1];
        if (move && move !== "(none)") {
          const from = move.slice(0, 2);
          const to = move.slice(2, 4);
          const promotion = move.length === 5 ? move[4] : undefined;
          // Pastikan minimum delay terpenuhi agar gerakan terasa smooth
          const elapsed = Date.now() - moveStartTimeRef.current;
          const remaining = Math.max(0, LEVEL_CONFIG[level].minDelay - elapsed);
          setTimeout(() => {
            onBestMoveRef.current(from, to, promotion);
          }, remaining);
        }
      }
    };

    worker.postMessage("uci");

    return () => {
      worker.terminate();
      workerRef.current = null;
      readyRef.current = false;
    };
  }, []);

  function sendGo(fen: string) {
    const worker = workerRef.current;
    if (!worker) return;
    const cfg = LEVEL_CONFIG[level];
    moveStartTimeRef.current = Date.now();
    worker.postMessage("ucinewgame");
    worker.postMessage(`setoption name Skill Level value ${cfg.skill}`);
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${cfg.depth} movetime ${cfg.movetime}`);
  }

  const requestMove = useCallback((fen: string) => {
    if (!enabled) return;
    if (!readyRef.current) {
      // Worker belum siap, simpan FEN untuk dijalankan setelah ready
      pendingFenRef.current = fen;
      return;
    }
    sendGo(fen);
  }, [enabled, level]);

  return { requestMove };
}
