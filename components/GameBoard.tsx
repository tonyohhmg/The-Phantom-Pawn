
import React, { useState } from 'react';
import { Board, Position, PlayerColor } from '../types';
import ChessPiece from './ChessPiece';
// Fix: Changed import from isValidMove to the correctly exported isLegalMove.
import { isLegalMove } from '../services/chessService';


interface GameBoardProps {
  board: Board;
  onMove: (from: Position, to: Position) => void;
  rotation: { x: number; y: number };
  currentPlayer: PlayerColor;
  disabled: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onMove, rotation, currentPlayer, disabled }) => {
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);

  const handleSquareClick = (row: number, col: number) => {
    if (disabled) return;
    
    if (selectedPiece) {
      // Fix: Use isLegalMove to validate the move.
      if (isLegalMove(board, selectedPiece, { row, col })) {
        onMove(selectedPiece, { row, col });
        setSelectedPiece(null);
      } else if (selectedPiece.row === row && selectedPiece.col === col) {
        // Deselect if clicking the same piece
        setSelectedPiece(null);
      } else {
        // If an invalid move is clicked, check if it's another of the player's pieces
        const piece = board[row][col];
        if (piece && piece.color === currentPlayer) {
            setSelectedPiece({ row, col });
        } else {
            setSelectedPiece(null);
        }
      }
    } else {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        setSelectedPiece({ row, col });
      }
    }
  };

  const getValidMoves = (from: Position) => {
    const moves: Position[] = [];
    if (!from) return moves;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        // Fix: Use isLegalMove to find valid moves.
        if (isLegalMove(board, from, { row: r, col: c })) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  };

  const validMoves = selectedPiece ? getValidMoves(selectedPiece) : [];

  return (
    <div className="flex items-center justify-center p-4" style={{ perspective: '1200px' }}>
      <div
        className="grid grid-cols-8 gap-0 transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          outline: '4px solid #4a044e',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        }}
      >
        {board.map((rowArr, row) =>
          rowArr.map((piece, col) => {
            const isLightSquare = (row + col) % 2 !== 0;
            const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;
            const isValidTarget = validMoves.some(m => m.row === row && m.col === col);

            let bgColor = isLightSquare ? 'bg-gray-600' : 'bg-gray-800';
            let overlayClass = '';

            if (isSelected) {
                overlayClass = 'bg-yellow-500/50';
            } else if (isValidTarget) {
                overlayClass = 'bg-green-500/50';
            }

            return (
              <div
                key={`${row}-${col}`}
                className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 ${bgColor} relative flex items-center justify-center`}
                onClick={() => handleSquareClick(row, col)}
              >
                {piece && <ChessPiece piece={piece} />}
                {/* Fix: Added classes for better visual feedback on valid move squares. */}
                {overlayClass && <div className={`absolute inset-0 ${overlayClass} rounded-full animate-pulse`}></div>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameBoard;
