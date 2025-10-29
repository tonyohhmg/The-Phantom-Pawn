import { useState, useEffect, useCallback } from 'react';
import { GameState, Position, PieceType, PlayerColor } from '../types';
import { INITIAL_BOARD_SETUP, AI_NAMES, GAME_TIMER_SECONDS } from '../constants';
import { movePiece, checkPromotion, getRandomMove, getAllLegalMoves, isKingInCheck } from '../services/chessService';

const createInitialGameState = (playerName: string): GameState => {
    const aiName = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
    return {
        board: JSON.parse(JSON.stringify(INITIAL_BOARD_SETUP)), // Deep copy
        currentPlayer: 'white',
        movesRemaining: 50,
        players: {
            white: { name: playerName, color: 'white', capturedPieces: [] },
            black: { name: aiName, color: 'black', capturedPieces: [] },
        },
        status: 'playing',
        gameover: false,
        winner: null,
        promotionPending: null,
        timers: {
            white: GAME_TIMER_SECONDS,
            black: GAME_TIMER_SECONDS,
        },
        lastCapturePosition: null,
    };
};

export const useGameLogic = (playerName: string) => {
    const [gameState, setGameState] = useState<GameState>(createInitialGameState(playerName));
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [aiMoveError, setAiMoveError] = useState<string | null>(null);

    const resetGame = useCallback((name: string) => {
        setGameState(createInitialGameState(name));
        setAiMoveError(null);
    }, []);

    // Timer logic
    useEffect(() => {
        if (gameState.gameover || gameState.status === 'promotion') {
            return;
        }

        const timerId = setTimeout(() => {
            setGameState(prev => {
                // Defensive check in case game state changed while timeout was pending
                if (prev.gameover || prev.status === 'promotion') {
                    return prev;
                }
                
                const newTimers = { ...prev.timers };
                newTimers[prev.currentPlayer] -= 1;

                if (newTimers[prev.currentPlayer] <= 0) {
                    return {
                        ...prev,
                        timers: newTimers,
                        gameover: true,
                        status: 'timeout',
                        winner: prev.currentPlayer === 'white' ? 'black' : 'white',
                    };
                }

                return { ...prev, timers: newTimers };
            });
        }, 1000);

        return () => clearTimeout(timerId);
    }, [gameState]);

    const handleMove = useCallback((from: Position, to: Position) => {
        setGameState(prev => {
            if (prev.gameover || prev.status === 'promotion') return prev;
            
            const { newBoard, capturedPiece } = movePiece(prev.board, from, to);
            
            if (checkPromotion(newBoard, to)) {
                return {
                    ...prev,
                    board: newBoard,
                    status: 'promotion',
                    promotionPending: { position: to, color: prev.currentPlayer },
                    lastCapturePosition: capturedPiece ? { position: to, key: Date.now() } : null,
                }
            }
            
            const newPlayers = JSON.parse(JSON.stringify(prev.players));
            if (capturedPiece) {
                newPlayers[prev.currentPlayer].capturedPieces.push(capturedPiece);
            }

            const nextPlayer: PlayerColor = prev.currentPlayer === 'white' ? 'black' : 'white';
            
            const isOpponentInCheck = isKingInCheck(newBoard, nextPlayer);
            const opponentLegalMoves = getAllLegalMoves(newBoard, nextPlayer);

            let newStatus: GameState['status'] = isOpponentInCheck ? 'check' : 'playing';
            let newGameover = false;
            let newWinner: PlayerColor | null = null;
            
            if (opponentLegalMoves.length === 0) {
                newGameover = true;
                if (isOpponentInCheck) {
                    newStatus = 'checkmate';
                    newWinner = prev.currentPlayer;
                } else {
                    newStatus = 'draw';
                }
            }

            const newMovesRemaining = prev.currentPlayer === 'black' ? prev.movesRemaining - 1 : prev.movesRemaining;
            if (!newGameover && newMovesRemaining <= 0) {
                newStatus = 'draw';
                newGameover = true;
            }

            return {
                ...prev,
                board: newBoard,
                currentPlayer: nextPlayer,
                movesRemaining: newMovesRemaining,
                players: newPlayers,
                status: newStatus,
                gameover: newGameover,
                winner: newWinner,
                promotionPending: null,
                lastCapturePosition: capturedPiece ? { position: to, key: Date.now() } : null,
            };
        });
    }, []);
    
    const handlePromotion = useCallback((pieceType: PieceType) => {
        setGameState(prev => {
            if (!prev.promotionPending) return prev;

            const newBoard = prev.board.map(r => r.map(p => p ? {...p} : null));
            const promotionPos = prev.promotionPending.position;
            const pieceToPromote = newBoard[promotionPos.row][promotionPos.col];

            if (pieceToPromote && pieceToPromote.type === 'pawn') {
                pieceToPromote.type = pieceType;
            }

            const nextPlayer: PlayerColor = prev.currentPlayer === 'white' ? 'black' : 'white';
            
            const isOpponentInCheck = isKingInCheck(newBoard, nextPlayer);
            const opponentLegalMoves = getAllLegalMoves(newBoard, nextPlayer);

            let newStatus: GameState['status'] = isOpponentInCheck ? 'check' : 'playing';
            let newGameover = false;
            let newWinner: PlayerColor | null = null;
            
            if (opponentLegalMoves.length === 0) {
                newGameover = true;
                if (isOpponentInCheck) {
                    newStatus = 'checkmate';
                    newWinner = prev.currentPlayer;
                } else {
                    newStatus = 'draw';
                }
            }

            const newMovesRemaining = prev.currentPlayer === 'black' ? prev.movesRemaining - 1 : prev.movesRemaining;
            if (!newGameover && newMovesRemaining <= 0) {
                newStatus = 'draw';
                newGameover = true;
            }

            return {
                ...prev,
                board: newBoard,
                currentPlayer: nextPlayer,
                movesRemaining: newMovesRemaining,
                status: newStatus,
                gameover: newGameover,
                winner: newWinner,
                promotionPending: null,
                lastCapturePosition: null, // No capture on promotion
            };
        });
    }, []);

    useEffect(() => {
        if (gameState.currentPlayer === 'black' && !gameState.gameover && !gameState.promotionPending) {
            setIsAiThinking(true);
            setAiMoveError(null);

            const timeoutId = setTimeout(() => {
                const move = getRandomMove(gameState.board, gameState.currentPlayer);
                if (move) {
                    handleMove(move.from, move.to);
                } else {
                    const isKingChecked = isKingInCheck(gameState.board, 'black');
                    setGameState(prev => ({
                        ...prev,
                        gameover: true,
                        status: isKingChecked ? 'checkmate' : 'draw',
                        winner: isKingChecked ? 'white' : null,
                    }));
                }
                setIsAiThinking(false);
            }, Math.random() * 1000 + 1500);

            return () => clearTimeout(timeoutId);
        }
    }, [gameState.currentPlayer, gameState.gameover, gameState.board, handleMove, gameState.promotionPending]);

    return { gameState, isAiThinking, aiMoveError, handleMove, resetGame, handlePromotion };
};