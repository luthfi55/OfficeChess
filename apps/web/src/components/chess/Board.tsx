"use client";

import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState, useCallback, useEffect, useRef } from "react";
import type { Square, Piece } from "react-chessboard/dist/chessboard/types";
import { useStockfish, LEVEL_CONFIG, type BotLevel } from "@/hooks/useStockfish";
import MoveHistory from "./MoveHistory";
import TaskClosedView from "./TaskClosedView";
import { useTheme } from "@/context/ThemeContext";

const PIECE_LABELS: Record<string, string> = {
  wK: "K", wQ: "Q", wR: "R", wB: "B", wN: "N", wP: "P",
  bK: "k", bQ: "q", bR: "r", bB: "b", bN: "n", bP: "p",
};

function ChessPiece({ piece }: { piece: string }) {
  const isWhite = piece.startsWith("w");
  const label = PIECE_LABELS[piece] ?? piece;
  const { theme } = useTheme();
  return (
    <div className="w-full h-full flex items-center justify-center select-none">
      <span style={{
        fontSize: "clamp(16px, 4vw, 32px)",
        fontFamily: "monospace",
        fontWeight: isWhite ? "700" : "400",
        color: isWhite ? theme === "dark" ? "#FFFFFF" : "#1F2937" : theme === "dark" ? "#D1D5DB" : "#6B7280",
        lineHeight: 1,
        userSelect: "none",
      }}>
        {label}
      </span>
    </div>
  );
}

type Mode = "bot" | "pvp";

interface BoardProps {
  hideMoveHistory?: boolean;
  onMovesChange?: (moves: string[]) => void;
}

export default function Board({ hideMoveHistory = false, onMovesChange }: BoardProps) {
  const { theme } = useTheme();
  const [game, setGame] = useState(new Chess());
  const [mode, setMode] = useState<Mode>("bot");
  const [level, setLevel] = useState<BotLevel>(1);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [taskClosed, setTaskClosed] = useState(false);
  const [fenHistory, setFenHistory] = useState<string[]>([new Chess().fen()]);
  const [viewIndex, setViewIndex] = useState(0);
  const [pieceStyle, setPieceStyle] = useState<"letter" | "image">("letter");
  const [peekImage, setPeekImage] = useState(false);
  const [gameOverDialog, setGameOverDialog] = useState(false);

  const effectivePieceStyle = pieceStyle === "letter" && peekImage ? "image" : pieceStyle;

  const isReviewing = viewIndex < fenHistory.length - 1;
  const fenHistoryRef = useRef(fenHistory);
  fenHistoryRef.current = fenHistory;  

  // Dynamic board width — pakai getBoundingClientRect setelah layout settled
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(460);
  useEffect(() => {
    const measure = () => {
      const el = boardContainerRef.current;
      if (!el) return;
      const w = el.getBoundingClientRect().width;
      if (w > 0) setBoardWidth(Math.min(420, Math.max(240, Math.floor(w))));
    };
    // Double RAF: tunggu layout + paint selesai
    const id = requestAnimationFrame(() => requestAnimationFrame(measure));
    const ro = new ResizeObserver(measure);
    if (boardContainerRef.current) ro.observe(boardContainerRef.current);
    return () => { cancelAnimationFrame(id); ro.disconnect(); };
  }, []);

  const isPlayerTurn = mode === "pvp" || game.turn() === "w";

  // Ref agar handleBestMove selalu pakai game terbaru tanpa functional updater
  const gameRef = useRef(game);
  gameRef.current = game;

  const handleBestMove = useCallback((from: string, to: string, promotion?: string) => {
    try {
      const next = new Chess(gameRef.current.fen());
      const result = next.move({ from, to, promotion: promotion ?? "q" });
      if (!result) { setBotThinking(false); return; }
      setGame(next);
      setLastMove({ from: from as Square, to: to as Square });
      setMoveHistory((h) => [...h, result.san]);
      const newFenHistory = [...fenHistoryRef.current, next.fen()];
      setFenHistory(newFenHistory);
      setViewIndex(newFenHistory.length - 1);
      setBotThinking(false);
    } catch {
      setBotThinking(false);
    }
  }, []);

  const { requestMove, isReady: stockfishReady } = useStockfish(level, mode === "bot", handleBestMove);

  // Trigger bot setiap giliran hitam di mode bot
  useEffect(() => {
    if (mode !== "bot") return;
    if (game.turn() !== "b") return;
    if (game.isGameOver()) return;
    setBotThinking(true);
    requestMove(game.fen());
  }, [game, mode, requestMove]);

  const applyMove = useCallback((from: string, to: string, promotion = "q"): boolean => {
    try {
      const next = new Chess(game.fen());
      const result = next.move({ from, to, promotion });
      if (!result) return false;
      setGame(next);
      setLastMove({ from: from as Square, to: to as Square });
      setMoveHistory((h) => [...h, result.san]);
      const newFenHistory = [...fenHistoryRef.current, next.fen()];
      setFenHistory(newFenHistory);
      setViewIndex(newFenHistory.length - 1);
      return true;
    } catch {
      return false;
    }
  }, [game]);

  const getMoveOptions = useCallback((square: Square) => {
    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) return {};
    const options: Record<string, React.CSSProperties> = {};
    moves.forEach((m) => {
      options[m.to] = {
        background: game.get(m.to)
          ? "radial-gradient(circle, rgba(156,163,175,0.8) 85%, transparent 85%)"
          : "radial-gradient(circle, rgba(156,163,175,0.5) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    });
    return options;
  }, [game]);
 
  function onSquareClick(square: Square) {
    if (isReviewing || !isPlayerTurn || botThinking || game.isGameOver()) return;

    if (selectedSquare) {
      const moved = applyMove(selectedSquare, square);
      if (moved) { setSelectedSquare(null); setOptionSquares({}); return; }
    }

    const piece = game.get(square);
    if (!piece || piece.color !== game.turn()) {
      setSelectedSquare(null); setOptionSquares({}); return;
    }
    setSelectedSquare(square);
    setOptionSquares(getMoveOptions(square));
  }

  function onPieceDrop(from: Square, to: Square, _piece: Piece) {
    if (isReviewing || !isPlayerTurn || botThinking || game.isGameOver()) return false;
    const moved = applyMove(from, to);
    if (moved) { setSelectedSquare(null); setOptionSquares({}); }
    return moved;
  }

  function resetGame(newMode?: Mode, newLevel?: BotLevel) {
    const fresh = new Chess();
    setGame(fresh);
    setMode(newMode ?? mode);
    setLevel(newLevel ?? level);
    setSelectedSquare(null);
    setOptionSquares({});
    setLastMove(null);
    setBotThinking(false);
    setMoveHistory([]);
    setTaskClosed(false);
    setFenHistory([fresh.fen()]);
    setViewIndex(0);
    setGameOverDialog(false);
  }

  function closeTask() {
    setBotThinking(false);
    setTaskClosed(true);
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

      if (e.key === "r" || e.key === "R") {
        if (pieceStyle === "letter") setPeekImage(true);
      } else if (e.key === "Escape") {
        taskClosed ? setTaskClosed(false) : closeTask();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setViewIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setViewIndex((i) => Math.min(fenHistory.length - 1, i + 1));
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "r" || e.key === "R") setPeekImage(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [taskClosed, fenHistory.length, pieceStyle]);

  const winner: "Luthfi" | "Jordan" | "Draw" | null = (() => {
    if (!taskClosed && !game.isGameOver()) return null;
    if (game.isCheckmate()) return game.turn() === "b" ? "Luthfi" : "Jordan";
    if (game.isDraw() || game.isStalemate()) return "Draw";
    return null; // manual close task
  })();

  // Tampilkan dialog saat game selesai secara natural
  useEffect(() => {
    if (game.isGameOver()) setGameOverDialog(true);
  }, [game]);

  useEffect(() => {
    onMovesChange?.(moveHistory);
  }, [moveHistory, onMovesChange]);

  const selectedColor = theme === "dark" ? "#4B5563" : "#E5E7EB";
  const lastMoveColor = theme === "dark" ? "#374151" : "#F3F4F6";
  const customSquareStyles: Record<string, React.CSSProperties> = {
    ...(selectedSquare ? { [selectedSquare]: { backgroundColor: selectedColor } } : {}),
    ...(lastMove ? {
      [lastMove.from]: { backgroundColor: lastMoveColor },
      [lastMove.to]: { backgroundColor: lastMoveColor },
    } : {}),
    ...optionSquares,
  };

  const isGameOver = game.isGameOver();
  const isCheck = game.inCheck();
  const assignedTo = game.turn() === "w" ? "Luthfi" : (mode === "bot" ? `Bot (${LEVEL_CONFIG[level].label})` : "Jordan");

  const statusLabel = isGameOver
    ? game.isCheckmate() ? "Task Closed" : "Marked Resolved"
    : (mode === "bot" && !stockfishReady) ? "Warming up..."
    : botThinking ? "Processing..."
    : isCheck ? "Pending Review ⚠"
    : "In Progress";

  const gameOverWinner = game.isCheckmate()
    ? (game.turn() === "b" ? "Luthfi" : (mode === "bot" ? `Bot (${LEVEL_CONFIG[level].label})` : "Jordan"))
    : null;
  const gameOverType = game.isCheckmate() ? "checkmate"
    : game.isStalemate() ? "stalemate"
    : game.isDraw() ? "draw"
    : null;
  const isPlayerWinner = gameOverWinner === "Luthfi";

  return (
    <div className={hideMoveHistory ? "min-w-0 overflow-hidden" : "space-y-3 min-w-0 overflow-hidden w-full"}>

      {/* Game Over Dialog */}
      {gameOverDialog && gameOverType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          onClick={() => setGameOverDialog(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header stripe */}
            <div
              className="px-5 py-4"
              style={{
                backgroundColor: gameOverType === "checkmate"
                  ? (isPlayerWinner ? "#F0FDF4" : "#FEF2F2")
                  : "#F8FAFC",
                borderBottom: "1px solid",
                borderColor: gameOverType === "checkmate"
                  ? (isPlayerWinner ? "#BBF7D0" : "#FECACA")
                  : "#E2E8F0",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{
                    backgroundColor: gameOverType === "checkmate"
                      ? (isPlayerWinner ? "#16A34A" : "#DC2626")
                      : "#64748B",
                    color: "white",
                  }}
                >
                  {gameOverType === "checkmate" ? (isPlayerWinner ? "✓" : "✗") : "="}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {gameOverType === "checkmate"
                      ? (isPlayerWinner ? "Session Completed" : "Session Closed")
                      : "Mutual Resolution"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {gameOverType === "checkmate"
                      ? `${gameOverWinner} resolved the critical path`
                      : gameOverType === "stalemate"
                      ? "No further actions available"
                      : "Both parties reached an agreement"}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 dark:text-gray-500">Outcome</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {gameOverType === "checkmate"
                    ? `${gameOverWinner} wins`
                    : gameOverType === "stalemate" ? "Stalemate" : "Draw"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 dark:text-gray-500">Total updates</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">{moveHistory.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 dark:text-gray-500">Session type</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {mode === "bot" ? `vs Bot Lv.${level}` : "2 Players"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-4 flex gap-2">
              <button
                onClick={() => resetGame()}
                className="flex-1 text-xs py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
              >
                New Session
              </button>
              <button
                onClick={() => setGameOverDialog(false)}
                className="flex-1 text-xs py-2 rounded-md border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                View Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status + controls — disembunyikan di online mode */}
      {!hideMoveHistory && <div className="flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
              style={{
                backgroundColor: game.turn() === "w" ? "#9CA3AF" : "#D1D5DB",
                color: game.turn() === "w" ? "white" : "#374151",
                fontSize: "8px", fontWeight: 700
              }}>
              {game.turn() === "w" ? "LF" : (mode === "bot" ? "AI" : "JD")}
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-none">Assigned to</p>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-tight">{assignedTo}</p>
            </div>
          </div>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-600" />
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-none">Activity</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-tight">{moveHistory.length} updates</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-md border border-gray-200 dark:border-gray-600 overflow-hidden text-xs">
            <button
              onClick={() => resetGame("bot")}
              className={`px-2.5 py-1 transition-colors ${mode === "bot" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium border-b-2 border-blue-500 dark:border-blue-400" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            >
              vs Bot
            </button>
            <button
              onClick={() => resetGame("pvp")}
              className={`px-2.5 py-1 transition-colors border-l border-gray-200 dark:border-gray-600 ${mode === "pvp" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium border-b-2 border-blue-500 dark:border-blue-400" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            >
              2 Players
            </button>
          </div>

          {/* Piece style toggle — hidden di mobile */}
          <div className="hidden sm:flex rounded-md border border-gray-200 dark:border-gray-600 overflow-hidden text-xs">
            <button
              onClick={() => setPieceStyle("letter")}
              className={`px-2.5 py-1 transition-colors ${pieceStyle === "letter" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              title="Use letter pieces (office-friendly)"
            >
              Aa
            </button>
            <button
              onClick={() => setPieceStyle("image")}
              className={`px-2.5 py-1 transition-colors border-l border-gray-200 dark:border-gray-600 ${pieceStyle === "image" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              title="Use classic chess pieces"
            >
              ♟
            </button>
          </div>

          {/* Level selector — hanya muncul di mode bot */}
          {mode === "bot" && (
            <select
              value={level}
              onChange={(e) => resetGame("bot", Number(e.target.value) as BotLevel)}
              className="text-xs border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
            >
              {(Object.entries(LEVEL_CONFIG) as [string, typeof LEVEL_CONFIG[BotLevel]][]).map(([lvl, cfg]) => (
                <option key={lvl} value={lvl}>
                  Lv.{lvl} — {cfg.label}
                </option>
              ))}
            </select>
          )}

          <span className={`hidden sm:inline text-xs px-2.5 py-1 rounded-full font-medium ${
            isGameOver ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            : botThinking ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-1 ring-gray-300 dark:ring-gray-600"
            : isCheck ? "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 ring-1 ring-gray-400 dark:ring-gray-500"
            : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800"
          }`}>
            {statusLabel}
          </span>
        </div>
      </div>}

      {/* Task Closed View */}
      {taskClosed && (
        <TaskClosedView
          totalMoves={moveHistory.length}
          winner={winner}
          onNewSession={() => resetGame()}
          onResume={() => setTaskClosed(false)}
        />
      )}

      {/* Board + Move History — side by side di desktop, stack di mobile */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch" style={{ display: taskClosed ? "none" : "flex" }}>
        {/* Board container — full width di mobile, auto di desktop */}
        <div ref={boardContainerRef} className="w-full min-w-0 sm:w-auto sm:shrink-0">
          <div className="rounded-md overflow-hidden ring-1 ring-gray-200 dark:ring-gray-600 shadow-sm">
            {boardWidth > 0 && <Chessboard
              position={isReviewing ? fenHistory[viewIndex] : game.fen()}
              onSquareClick={onSquareClick}
              onPieceDrop={onPieceDrop}
              isDraggablePiece={() => !isReviewing && isPlayerTurn && !botThinking && !isGameOver}
              {...(effectivePieceStyle === "letter" ? {
                customPieces: Object.fromEntries(
                  Object.keys(PIECE_LABELS).map((piece) => [
                    piece,
                    (_: { squareWidth: number }) => <ChessPiece piece={piece} />,
                  ])
                ),
                customLightSquareStyle: theme === "dark" ? { backgroundColor: "black", outline: "1px solid grey" } : { backgroundColor: "white", outline: "1px solid #E5E7EB" },
                customDarkSquareStyle: theme === "dark" ? { backgroundColor: "black", outline: "1px solid grey" } : { backgroundColor: "white", outline: "1px solid #E5E7EB" },
              } : {
                customLightSquareStyle: { backgroundColor: "#344766" },
                customDarkSquareStyle: { backgroundColor: "grey" },
              })}
              customSquareStyles={customSquareStyles}
              boardWidth={boardWidth}
              areArrowsAllowed={false}
            />}
          </div>
        </div>

        {/* Move History panel — disembunyikan jika hideMoveHistory */}
        {!hideMoveHistory && (
          <div
            className="flex-1 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 overflow-hidden"
            style={{ maxHeight: boardWidth }}
          >
            <MoveHistory moves={moveHistory} />
          </div>
        )}
      </div>

      {/* Navigation bar — undo/redo */}
      {!taskClosed && (
        <div className={`flex items-center justify-center gap-1${hideMoveHistory ? " pt-2" : ""}`}>
          {/* First */}
          <button
            onClick={() => setViewIndex(0)}
            disabled={viewIndex === 0}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="First move"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
            </svg>
          </button>

          {/* Prev */}
          <button
            onClick={() => setViewIndex((i) => Math.max(0, i - 1))}
            disabled={viewIndex === 0}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous move (←)"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>

          {/* Position indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 min-w-[80px] justify-center">
            {isReviewing && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            )}
            <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
              {viewIndex === fenHistory.length - 1 ? "Live" : `${viewIndex} / ${fenHistory.length - 1}`}
            </span>
          </div>

          {/* Next */}
          <button
            onClick={() => setViewIndex((i) => Math.min(fenHistory.length - 1, i + 1))}
            disabled={viewIndex === fenHistory.length - 1}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next move (→)"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>

          {/* Last / Live */}
          <button
            onClick={() => setViewIndex(fenHistory.length - 1)}
            disabled={viewIndex === fenHistory.length - 1}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Live position"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Action bar — disembunyikan di online mode */}
      {!hideMoveHistory && <div className="flex items-center justify-between pt-0.5" style={{ display: taskClosed ? "none" : "flex" }}>
        <div className="flex gap-2">
          <button
            onClick={() => resetGame()}
            className="text-xs px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all shadow-sm font-medium"
          >
            New Session
          </button>
          <button
            onClick={closeTask}
            className="text-xs px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm font-medium"
          >
            Close Task
          </button>
          <button className="text-xs px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm font-medium">
            Mark Resolved
          </button>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${botThinking ? "bg-gray-400 animate-pulse" : "bg-gray-500"}`} />
          {mode === "bot" ? `Stockfish Lv.${level}` : "2 Players"}
        </span>
      </div>}
    </div>
  );
}