"use client";

import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState, useCallback, useEffect, useRef } from "react";
import type { Square, Piece } from "react-chessboard/dist/chessboard/types";
import { useStockfish, LEVEL_CONFIG, type BotLevel } from "@/hooks/useStockfish";
import MoveHistory from "./MoveHistory";
import TaskClosedView from "./TaskClosedView";

const PIECE_LABELS: Record<string, string> = {
  wK: "K", wQ: "Q", wR: "R", wB: "B", wN: "N", wP: "P",
  bK: "k", bQ: "q", bR: "r", bB: "b", bN: "n", bP: "p",
};

function ChessPiece({ piece }: { piece: string }) {
  const isWhite = piece.startsWith("w");
  const label = PIECE_LABELS[piece] ?? piece;
  return (
    <div className="w-full h-full flex items-center justify-center select-none">
      <span style={{
        fontSize: "clamp(16px, 4vw, 32px)",
        fontFamily: "monospace",
        fontWeight: isWhite ? "700" : "400",
        color: isWhite ? "#1F2937" : "#2563EB",
        lineHeight: 1,
        userSelect: "none",
      }}>
        {label}
      </span>
    </div>
  );
}

type Mode = "bot" | "pvp";

export default function Board() {
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

  const { requestMove } = useStockfish(level, mode === "bot", handleBestMove);

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
          ? "radial-gradient(circle, rgba(191,219,254,0.8) 85%, transparent 85%)"
          : "radial-gradient(circle, rgba(191,219,254,0.5) 25%, transparent 25%)",
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

  const customSquareStyles: Record<string, React.CSSProperties> = {
    ...(selectedSquare ? { [selectedSquare]: { backgroundColor: "#BFDBFE" } } : {}),
    ...(lastMove ? {
      [lastMove.from]: { backgroundColor: "#FEF9C3" },
      [lastMove.to]: { backgroundColor: "#FEF9C3" },
    } : {}),
    ...optionSquares,
  };

  const isGameOver = game.isGameOver();
  const isCheck = game.inCheck();
  const assignedTo = game.turn() === "w" ? "Luthfi" : (mode === "bot" ? `Bot (${LEVEL_CONFIG[level].label})` : "Jordan");

  const statusLabel = isGameOver
    ? game.isCheckmate() ? "Task Closed" : "Marked Resolved"
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
    <div className="space-y-3">

      {/* Game Over Dialog */}
      {gameOverDialog && gameOverType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          onClick={() => setGameOverDialog(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-gray-200 w-80 overflow-hidden"
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
                <span className="text-gray-400">Outcome</span>
                <span className="font-semibold text-gray-700">
                  {gameOverType === "checkmate"
                    ? `${gameOverWinner} wins`
                    : gameOverType === "stalemate" ? "Stalemate" : "Draw"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Total updates</span>
                <span className="font-semibold text-gray-700">{moveHistory.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Session type</span>
                <span className="font-semibold text-gray-700">
                  {mode === "bot" ? `vs Bot Lv.${level}` : "2 Players"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-4 flex gap-2">
              <button
                onClick={() => resetGame()}
                className="flex-1 text-xs py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors font-medium"
              >
                New Session
              </button>
              <button
                onClick={() => setGameOverDialog(false)}
                className="flex-1 text-xs py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
              >
                View Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status + controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
              style={{
                backgroundColor: game.turn() === "w" ? "#6366F1" : (mode === "bot" ? "#6B7280" : "#0EA5E9"),
                fontSize: "8px", fontWeight: 700
              }}>
              {game.turn() === "w" ? "LF" : (mode === "bot" ? "AI" : "JD")}
            </div>
            <div>
              <p className="text-xs text-gray-400 leading-none">Assigned to</p>
              <p className="text-xs font-semibold text-gray-700 leading-tight">{assignedTo}</p>
            </div>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <p className="text-xs text-gray-400 leading-none">Activity</p>
            <p className="text-xs font-semibold text-gray-700 leading-tight">{moveHistory.length} updates</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-md border border-gray-200 overflow-hidden text-xs">
            <button
              onClick={() => resetGame("bot")}
              className={`px-2.5 py-1 transition-colors ${mode === "bot" ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              vs Bot
            </button>
            <button
              onClick={() => resetGame("pvp")}
              className={`px-2.5 py-1 transition-colors border-l border-gray-200 ${mode === "pvp" ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              2 Players
            </button>
          </div>

          {/* Piece style toggle */}
          <div className="flex rounded-md border border-gray-200 overflow-hidden text-xs">
            <button
              onClick={() => setPieceStyle("letter")}
              className={`px-2.5 py-1 transition-colors ${pieceStyle === "letter" ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              title="Use letter pieces (office-friendly)"
            >
              Aa
            </button>
            <button
              onClick={() => setPieceStyle("image")}
              className={`px-2.5 py-1 transition-colors border-l border-gray-200 ${pieceStyle === "image" ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
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
              className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-300"
            >
              {(Object.entries(LEVEL_CONFIG) as [string, typeof LEVEL_CONFIG[BotLevel]][]).map(([lvl, cfg]) => (
                <option key={lvl} value={lvl}>
                  Lv.{lvl} — {cfg.label}
                </option>
              ))}
            </select>
          )}

          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            isGameOver ? "bg-gray-100 text-gray-500"
            : botThinking ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
            : isCheck ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
            : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          }`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Task Closed View */}
      {taskClosed && (
        <TaskClosedView
          totalMoves={moveHistory.length}
          winner={winner}
          onNewSession={() => resetGame()}
          onResume={() => setTaskClosed(false)}
        />
      )}

      {/* Board + Move History side by side */}
      <div className="flex gap-3 items-stretch" style={{ display: taskClosed ? "none" : "flex" }}>
        <div className="rounded-md overflow-hidden ring-1 ring-gray-200 shadow-sm shrink-0">
          <Chessboard
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
              customLightSquareStyle: { backgroundColor: "white", outline: "1px solid #E5E7EB" },
              customDarkSquareStyle: { backgroundColor: "white", outline: "1px solid #E5E7EB" },
            } : {
              customLightSquareStyle: { backgroundColor: "white", outline: "1px solid #E5E7EB" },
              customDarkSquareStyle: { backgroundColor: "white", outline: "1px solid #E5E7EB" },
            })}
            customSquareStyles={customSquareStyles}
            boardWidth={460}
            areArrowsAllowed={false}            
          />
        </div>

        {/* Move History panel */}
        <div className="flex-1 rounded-md border border-gray-200 shadow-sm bg-white overflow-hidden" style={{ maxHeight: "460px" }}>
          <MoveHistory moves={moveHistory} />
        </div>
      </div>

      {/* Review mode indicator */}
      {isReviewing && !taskClosed && (
        <div className="flex items-center justify-center gap-2 py-1 px-3 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs">
          <span>Reviewing move {viewIndex} of {fenHistory.length - 1}</span>
          <span className="text-amber-400">— ← → to navigate, → to return to live</span>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between pt-0.5" style={{ display: taskClosed ? "none" : "flex" }}>
        <div className="flex gap-2">
          <button
            onClick={() => resetGame()}
            className="text-xs px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-medium"
          >
            New Session
          </button>
          <button
            onClick={closeTask}
            className="text-xs px-3 py-1.5 rounded-md bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-all shadow-sm font-medium"
          >
            Close Task
          </button>
          <button className="text-xs px-3 py-1.5 rounded-md bg-white border border-blue-200 text-blue-500 hover:bg-blue-50 transition-all shadow-sm font-medium">
            Mark Resolved
          </button>
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${botThinking ? "bg-blue-400 animate-pulse" : "bg-emerald-400"}`} />
          {mode === "bot" ? `Stockfish Lv.${level}` : "2 Players"}
        </span>
      </div>
    </div>
  );
}