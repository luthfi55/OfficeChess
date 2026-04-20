"use client";

import { Chessboard } from "react-chessboard";
import { useState, useCallback, useEffect, useRef } from "react";
import type { Square } from "react-chessboard/dist/chessboard/types";
import { Chess } from "chess.js";
import { useTheme } from "@/context/ThemeContext";
import type { PlayerColor } from "@chess-online/types";

const PIECE_LABELS: Record<string, string> = {
  wK: "K", wQ: "Q", wR: "R", wB: "B", wN: "N", wP: "P",
  bK: "k", bQ: "q", bR: "r", bB: "b", bN: "n", bP: "p",
};

function ChessPiece({ piece }: { piece: string }) {
  const isWhite = piece.startsWith("w");
  const { theme } = useTheme();
  return (
    <div className="w-full h-full flex items-center justify-center select-none">
      <span style={{
        fontSize: "clamp(16px, 4vw, 32px)",
        fontFamily: "monospace",
        fontWeight: isWhite ? "700" : "400",
        color: isWhite
          ? theme === "dark" ? "#FFFFFF" : "#1F2937"
          : theme === "dark" ? "#D1D5DB" : "#6B7280",
        lineHeight: 1,
        userSelect: "none",
      }}>
        {PIECE_LABELS[piece] ?? piece}
      </span>
    </div>
  );
}

interface MultiplayerBoardProps {
  fen: string;
  myColor: PlayerColor;
  isMyTurn: boolean;
  lastMove: { from: string; to: string } | null;
  onMove: (from: string, to: string, promotion?: string) => void;
}

export default function MultiplayerBoard({ fen, myColor, isMyTurn, lastMove, onMove }: MultiplayerBoardProps) {
  const { theme } = useTheme();
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(460);

  useEffect(() => {
    const measure = () => {
      const el = boardContainerRef.current;
      if (!el) return;
      const w = el.getBoundingClientRect().width;
      if (w > 0) setBoardWidth(Math.min(420, Math.max(240, Math.floor(w))));
    };
    const id = requestAnimationFrame(() => requestAnimationFrame(measure));
    const ro = new ResizeObserver(measure);
    if (boardContainerRef.current) ro.observe(boardContainerRef.current);
    return () => { cancelAnimationFrame(id); ro.disconnect(); };
  }, []);

  // Reset selection jika bukan giliran kita
  useEffect(() => {
    if (!isMyTurn) {
      setSelectedSquare(null);
      setOptionSquares({});
    }
  }, [isMyTurn]);

  const getOptionSquares = useCallback((square: Square, currentFen: string) => {
    const chess = new Chess(currentFen);
    const moves = chess.moves({ square, verbose: true });
    const squares: Record<string, React.CSSProperties> = {};
    moves.forEach((m) => {
      squares[m.to] = {
        background: "radial-gradient(circle, rgba(191,219,254,0.5) 30%, transparent 31%)",
        borderRadius: "50%",
      };
    });
    return squares;
  }, []);

  const handleSquareClick = useCallback((square: Square) => {
    if (!isMyTurn) return;

    const chess = new Chess(fen);
    const piece = chess.get(square);

    // Jika sudah ada selected square, coba move
    if (selectedSquare) {
      const moves = chess.moves({ square: selectedSquare, verbose: true });
      const isLegal = moves.find((m) => m.to === square);

      if (isLegal) {
        const needsPromotion = isLegal.flags.includes("p");
        onMove(selectedSquare, square, needsPromotion ? "q" : undefined);
        setSelectedSquare(null);
        setOptionSquares({});
        return;
      }
    }

    // Pilih piece baru (hanya milik kita)
    if (piece && (myColor === "white" ? piece.color === "w" : piece.color === "b")) {
      setSelectedSquare(square);
      setOptionSquares(getOptionSquares(square, fen));
    } else {
      setSelectedSquare(null);
      setOptionSquares({});
    }
  }, [isMyTurn, fen, selectedSquare, myColor, onMove, getOptionSquares]);

  const handlePieceDrop = useCallback((from: Square, to: Square, piece: string): boolean => {
    if (!isMyTurn) return false;

    const pieceColor = piece.startsWith("w") ? "white" : "black";
    if (pieceColor !== myColor) return false;

    const chess = new Chess(fen);
    const moves = chess.moves({ square: from, verbose: true });
    const isLegal = moves.find((m) => m.to === to);
    if (!isLegal) return false;

    const needsPromotion = isLegal.flags.includes("p");
    onMove(from, to, needsPromotion ? "q" : undefined);
    setSelectedSquare(null);
    setOptionSquares({});
    return true;
  }, [isMyTurn, fen, myColor, onMove]);

  const lastMoveColor = theme === "dark" ? "#374151" : "#F3F4F6";
  const customSquareStyles: Record<string, React.CSSProperties> = {
    ...optionSquares,
    ...(selectedSquare ? { [selectedSquare]: { backgroundColor: "#BFDBFE" } } : {}),
    ...(lastMove ? {
      [lastMove.from]: { backgroundColor: lastMoveColor },
      [lastMove.to]: { backgroundColor: lastMoveColor },
    } : {}),
  };

  return (
    <div ref={boardContainerRef} className="w-full min-w-0">
      <Chessboard
        id="multiplayer-board"
        position={fen}
        onSquareClick={handleSquareClick}
        onPieceDrop={handlePieceDrop}
        boardOrientation={myColor === "black" ? "black" : "white"}
        boardWidth={boardWidth}
        customPieces={Object.fromEntries(
          Object.keys(PIECE_LABELS).map((p) => [p, ({ squareWidth }: { squareWidth: number }) => (
            <div style={{ width: squareWidth, height: squareWidth }}>
              <ChessPiece piece={p} />
            </div>
          )])
        )}
        customSquareStyles={customSquareStyles}
        customDarkSquareStyle={theme === "dark" ? { backgroundColor: "black", outline: "1px solid grey" } : { backgroundColor: "white", outline: "1px solid #E5E7EB" }}
        customLightSquareStyle={theme === "dark" ? { backgroundColor: "black", outline: "1px solid grey" } : { backgroundColor: "white", outline: "1px solid #E5E7EB" }}
        arePiecesDraggable={isMyTurn}
      />
    </div>
  );
}
