import React, { useState, useEffect, useMemo } from 'react';
import { Board, Position, PlayerColor, Piece, GameState, PowerUpType } from '../types';
import ChessPiece from './ChessPiece';
import ParticleExplosion from './ParticleExplosion';
import { isLegalMove, isLegalPossessionMove, getEtherealEscapeMoves } from '../services/chessService';

// A new component to handle the piece's rendering and animation.
// This isolates the animation logic.
const AnimatedChessPiece: React.FC<{ piece: Piece; row: number; col: number; isHovered: boolean; }> = ({ piece, row, col, isHovered }) => {
    return (
        <div
            className="absolute w-[12.5%] h-[12.5%] transition-transform duration-300 ease-in-out"
            style={{
                transform: `translate(${col * 100}%, ${row * 100}%)`,
            }}
        >
            <div className={`w-full h-full transition-transform duration-150 ease-in-out ${isHovered ? 'scale-110' : ''}`}>
                <ChessPiece piece={piece} />
            </div>
        </div>
    );
};

interface GameBoardProps {
  gameState: GameState;
  onMove: (from: Position, to: Position) => void;
  rotation: { x: number; y: number };
  disabled: boolean;
  captureEffect: { position: Position, key: number } | null;
  onPlacePawn: (position: Position) => void;
  onPossessionMove: (from: Position, to: Position) => void;
  onEtherealEscape: (position: Position) => void;
  onPlaceStolenPiece: (position: Position) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onMove, rotation, disabled, captureEffect, onPlacePawn, onPossessionMove, onEtherealEscape, onPlaceStolenPiece }) => {
  const { board, currentPlayer, status, activePowerUp } = gameState;
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<Position | null>(null);
  const [activeEffects, setActiveEffects] = useState<{ position: Position, key: number }[]>([]);

  const pieces = useMemo(() => {
      const pieceList: { piece: Piece; row: number; col: number }[] = [];
      board.forEach((row, r) => {
          row.forEach((p, c) => {
              if (p) {
                  pieceList.push({ piece: p, row: r, col: c });
              }
          });
      });
      return pieceList;
  }, [board]);
  
  useEffect(() => {
      if (captureEffect) {
          setActiveEffects(prev => [...prev, captureEffect]);
          const timer = setTimeout(() => {
              setActiveEffects(prev => prev.filter(e => e.key !== captureEffect.key));
          }, 1000);
          return () => clearTimeout(timer);
      }
  }, [captureEffect]);
  
  // Reset selection when status changes
  useEffect(() => {
    setSelectedPiece(null);
  }, [status]);

  const handleSquareClick = (row: number, col: number) => {
    if (disabled && status !== 'placingPawn' && status !== 'possessingPiece' && status !== 'escapingCheck' && status !== 'placingStolenPiece') return;

    switch (status) {
        case 'placingPawn':
            const placementRank = currentPlayer === 'white' ? 6 : 1;
            if (row === placementRank && !board[row][col]) onPlacePawn({ row, col });
            break;
        case 'placingStolenPiece':
            if ((row === 6 || row === 7) && !board[row][col]) {
                onPlaceStolenPiece({ row, col });
            }
            break;
        case 'escapingCheck': {
            const validEscapes = getEtherealEscapeMoves(board, currentPlayer);
            if (validEscapes.some(m => m.row === row && m.col === col)) {
                onEtherealEscape({ row, col });
            }
            break;
        }
        case 'possessingPiece': {
            const piece = board[row][col];
            if (selectedPiece) {
                if (isLegalPossessionMove(board, selectedPiece, { row, col })) {
                    onPossessionMove(selectedPiece, { row, col });
                    setSelectedPiece(null);
                } else {
                    setSelectedPiece(null);
                }
            } else if (piece && piece.color !== currentPlayer && (piece.type === 'pawn' || piece.type === 'knight')) {
                setSelectedPiece({ row, col });
            }
            break;
        }
        default: // 'playing' or 'check'
            if (selectedPiece) {
                if (isLegalMove(board, selectedPiece, { row, col }, activePowerUp)) {
                    onMove(selectedPiece, { row, col });
                    setSelectedPiece(null);
                } else if (selectedPiece.row === row && selectedPiece.col === col) {
                    setSelectedPiece(null);
                } else {
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
            break;
    }
  };

  const getValidMovesForSelection = () => {
      if (!selectedPiece) return [];
      
      if (status === 'possessingPiece') {
        const moves: Position[] = [];
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (isLegalPossessionMove(board, selectedPiece, { row: r, col: c })) {
              moves.push({ row: r, col: c });
            }
          }
        }
        return moves;
      }
      
      // Default move logic
      const moves: Position[] = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (isLegalMove(board, selectedPiece, { row: r, col: c }, activePowerUp)) {
            moves.push({ row: r, col: c });
          }
        }
      }
      return moves;
  };

  const validMoves = useMemo(getValidMovesForSelection, [selectedPiece, board, status, activePowerUp]);
  const etherealEscapeMoves = useMemo(() => status === 'escapingCheck' ? getEtherealEscapeMoves(board, currentPlayer) : [], [status, board, currentPlayer]);

  const boardSizeClasses = 'w-[40rem] h-[40rem] md:w-[48rem] md:h-[48rem] lg:w-[56rem] lg:h-[56rem]';

  return (
    <div className="flex items-center justify-center p-4" style={{ perspective: '1200px' }}>
      <div
        className={`relative transition-transform duration-500 scale-[.4] sm:scale-[.5] md:scale-75 lg:scale-100 ${boardSizeClasses}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          outline: '8px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Render the board grid */}
        <div className="absolute inset-0 grid grid-cols-8">
            {Array.from({ length: 64 }).map((_, i) => {
                const row = Math.floor(i / 8);
                const col = i % 8;
                const piece = board[row][col];
                const isLightSquare = (row + col) % 2 !== 0;
                
                const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;
                const isValidTarget = validMoves.some(m => m.row === row && m.col === col);
                
                const isPawnPlacementTarget = status === 'placingPawn' && (currentPlayer === 'white' ? row === 6 : row === 1) && !piece;
                const isStolenPieceTarget = status === 'placingStolenPiece' && (row === 6 || row === 7) && !piece;
                const isPossessionTarget = status === 'possessingPiece' && piece && piece.color !== currentPlayer && (piece.type === 'pawn' || piece.type === 'knight');
                const isEscapeTarget = etherealEscapeMoves.some(m => m.row === row && m.col === col);
                
                const bgColor = isLightSquare ? 'bg-white/[0.85]' : 'bg-gray-900/[0.85]';
                let overlayClass = '';

                if (isSelected) {
                    overlayClass = status === 'possessingPiece' ? 'bg-purple-500/50' : 'bg-yellow-500/50';
                } else if (isValidTarget) {
                    overlayClass = status === 'possessingPiece' ? 'bg-purple-500/50' : 'bg-green-500/50';
                } else if (isPawnPlacementTarget || isPossessionTarget || isEscapeTarget || isStolenPieceTarget) {
                    overlayClass = 'bg-blue-500/50';
                }

                return (
                    <div
                        key={`square-${row}-${col}`}
                        className={`w-full h-full ${bgColor} relative`}
                        onClick={() => handleSquareClick(row, col)}
                        onMouseEnter={() => setHoveredSquare({ row, col })}
                        onMouseLeave={() => setHoveredSquare(null)}
                    >
                        {overlayClass && <div className={`absolute inset-0 ${overlayClass} rounded-full animate-pulse`}></div>}
                        {activePowerUp === 'spectralMove' && (
                            <div className="absolute inset-0 animate-spectral-glow"></div>
                        )}
                    </div>
                );
            })}
        </div>
        
        {/* Render the pieces on top of the grid */}
        <div className="absolute inset-0 pointer-events-none">
            {pieces.map(({ piece, row, col }) => {
                const isHovered = hoveredSquare?.row === row && hoveredSquare?.col === col;
                const canHover = piece.color === currentPlayer && !disabled && (status === 'playing' || status === 'check');
                return (
                    <AnimatedChessPiece 
                        key={piece.id} 
                        piece={piece} 
                        row={row} 
                        col={col}
                        isHovered={!!(isHovered && canHover)}
                    />
                );
            })}
        </div>

        {/* Render particle effects on top of the board */}
        {activeEffects.map(effect => (
          <div
            key={effect.key}
            className="absolute w-[12.5%] h-[12.5%]"
            style={{
              top: `${effect.position.row * 12.5}%`,
              left: `${effect.position.col * 12.5}%`,
              transform: `translateZ(1px)`,
            }}
          >
            <ParticleExplosion />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;