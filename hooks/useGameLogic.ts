import { useState, useEffect, useCallback } from 'react';
import { GameState, Position, PieceType, PlayerColor, PlayerProfile, PowerUp, PowerUpType, Piece, PlayerState } from '../types';
import { INITIAL_BOARD_SETUP, AI_NAMES, GAME_TIMER_SECONDS, generateAvatarUrl, AVAILABLE_POWER_UPS } from '../constants';
import { movePiece, checkPromotion, getRandomMove, getAllLegalMoves, isKingInCheck, isInsufficientMaterial, isLegalMove } from '../services/chessService';
import { getBestMove } from '../services/geminiService';

const grantRandomPowerUp = (playerState: PlayerState) => {
    // New capacity is 3.
    if (playerState.powerUps.length >= 3) {
        return;
    }

    const hasEtherealEscape = playerState.powerUps.some(p => p.type === 'etherealEscape');
    
    // Filter out Ethereal Escape if the player already has it.
    const possiblePowerUps = hasEtherealEscape
        ? AVAILABLE_POWER_UPS.filter(p => p !== 'etherealEscape')
        : AVAILABLE_POWER_UPS;

    // If there are no possible power-ups to grant (edge case), do nothing.
    if (possiblePowerUps.length === 0) {
        return;
    }

    const randomPowerUpType = possiblePowerUps[Math.floor(Math.random() * possiblePowerUps.length)];
    
    playerState.powerUps.push({ id: `pu-${Date.now()}`, type: randomPowerUpType });
};


const createInitialGameState = (playerProfile: PlayerProfile): GameState => {
    const aiName = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
    const aiLevel = Math.max(1, Math.floor(playerProfile.level - 2 + Math.random() * 5)); // AI level is around player's level

    return {
        board: JSON.parse(JSON.stringify(INITIAL_BOARD_SETUP)), // Deep copy
        currentPlayer: 'white',
        movesRemaining: 50,
        players: {
            white: { 
                name: playerProfile.name, 
                color: 'white', 
                capturedPieces: [], 
                level: playerProfile.level,
                avatarUrl: playerProfile.avatarUrl,
                powerUps: [],
                powerUpsUsed: [],
                stolenPiece: null,
            },
            black: { 
                name: aiName, 
                color: 'black', 
                capturedPieces: [], 
                level: aiLevel,
                avatarUrl: generateAvatarUrl(aiName),
                powerUps: [],
                powerUpsUsed: [],
                stolenPiece: null,
            },
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
        activePowerUp: null,
        moveCount: 0,
        announcement: null,
    };
};

// This is now a pure function that doesn't rely on hook scope.
const endTurn = (
    board: GameState['board'],
    players: GameState['players'],
    currentPlayer: GameState['currentPlayer'],
    movesRemaining: GameState['movesRemaining'],
    movedPiece: Piece | null,
    capturedPiece: Piece | null
): Partial<GameState> => {
    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
    const isOpponentInCheck = isKingInCheck(board, nextPlayer);
    const opponentLegalMoves = getAllLegalMoves(board, nextPlayer, null);

    let newStatus: GameState['status'] = isOpponentInCheck ? 'check' : 'playing';
    let newGameover = false;
    let newWinner: PlayerColor | null = null;
    
    if (opponentLegalMoves.length === 0) {
        newGameover = true;
        if (isOpponentInCheck) {
            newStatus = 'checkmate';
            newWinner = currentPlayer;
        } else {
            newStatus = 'draw';
        }
    } else if (isInsufficientMaterial(board)) {
        newStatus = 'draw';
        newGameover = true;
    }

    let newMovesRemaining = movesRemaining;
    if ((movedPiece && movedPiece.type === 'pawn') || capturedPiece) {
        newMovesRemaining = 50;
    } else {
        newMovesRemaining = currentPlayer === 'black' ? newMovesRemaining - 1 : newMovesRemaining;
    }

    if (!newGameover && newMovesRemaining <= 0) {
        newStatus = 'draw';
        newGameover = true;
    }

    return {
        currentPlayer: nextPlayer,
        status: newStatus,
        gameover: newGameover,
        winner: newWinner,
        movesRemaining: newMovesRemaining,
        board,
        players,
        activePowerUp: null,
        promotionPending: null,
    };
};

const coordinateToPosition = (coord: string): Position => {
    const col = coord.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(coord.charAt(1), 10);
    return { row, col };
};


export const useGameLogic = (playerProfile: PlayerProfile) => {
    const [gameState, setGameState] = useState<GameState>(createInitialGameState(playerProfile));
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [aiMoveError, setAiMoveError] = useState<string | null>(null);

    const resetGame = useCallback((profile: PlayerProfile) => {
        setGameState(createInitialGameState(profile));
        setAiMoveError(null);
    }, []);

    // Timer logic
    useEffect(() => {
        if (gameState.gameover || gameState.status !== 'playing' && gameState.status !== 'check') {
            return;
        }

        const timerId = setTimeout(() => {
            setGameState(prev => {
                if (prev.gameover || prev.status !== 'playing' && prev.status !== 'check') {
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
            if (prev.gameover || prev.status !== 'playing' && prev.status !== 'check') return prev;
            
            const movedPiece = prev.board[from.row][from.col];
            const { newBoard, capturedPiece } = movePiece(prev.board, from, to);
            
            if (checkPromotion(newBoard, to)) {
                return {
                    ...prev,
                    board: newBoard,
                    status: 'promotion',
                    promotionPending: { position: to, color: prev.currentPlayer },
                    lastCapturePosition: capturedPiece ? { position: to, key: Date.now() } : prev.lastCapturePosition,
                }
            }
            
            const newPlayers = JSON.parse(JSON.stringify(prev.players));
            if (capturedPiece) {
                newPlayers[prev.currentPlayer].capturedPieces.push(capturedPiece);
                // Grant power-up on non-pawn capture
                if (capturedPiece.type !== 'pawn') {
                    grantRandomPowerUp(newPlayers[prev.currentPlayer]);
                }
            }
            
            // Consume active power-up
            if (prev.activePowerUp === 'spectralMove') {
                newPlayers[prev.currentPlayer].powerUpsUsed.push('spectralMove');
                const powerUpIndex = newPlayers[prev.currentPlayer].powerUps.findIndex(p => p.type === 'spectralMove');
                if (powerUpIndex > -1) {
                    newPlayers[prev.currentPlayer].powerUps.splice(powerUpIndex, 1);
                }
            }
            
            const turnEndState = endTurn(newBoard, newPlayers, prev.currentPlayer, prev.movesRemaining, movedPiece, capturedPiece);

            return {
                ...prev,
                ...turnEndState,
                lastCapturePosition: capturedPiece ? { position: to, key: Date.now() } : null,
                moveCount: prev.moveCount + 1,
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
            const turnEndState = endTurn(newBoard, prev.players, prev.currentPlayer, prev.movesRemaining, pieceToPromote, null);

            return {
                ...prev,
                ...turnEndState,
            };
        });
    }, []);

    const handleActivatePowerUp = useCallback((powerUp: PowerUp) => {
        setGameState(prev => {
            if (prev.gameover || prev.currentPlayer === 'black') return prev;

            if (prev.activePowerUp === powerUp.type) {
                return { ...prev, activePowerUp: null, status: 'playing' }; // Toggle off
            }

            switch (powerUp.type) {
                case 'timeTwist': {
                    const newTimers = { ...prev.timers };
                    newTimers[prev.currentPlayer] += 30;
                    const newPlayers = JSON.parse(JSON.stringify(prev.players));
                    newPlayers[prev.currentPlayer].powerUpsUsed.push('timeTwist');
                    newPlayers[prev.currentPlayer].powerUps = newPlayers[prev.currentPlayer].powerUps.filter(p => p.id !== powerUp.id);
                    return { ...prev, timers: newTimers, players: newPlayers };
                }
                case 'spectralMove':
                    return { ...prev, activePowerUp: 'spectralMove', status: 'playing' };

                case 'ghostlyPawn':
                    return { ...prev, activePowerUp: 'ghostlyPawn', status: 'placingPawn' };

                case 'ghastlyPossession':
                    return { ...prev, activePowerUp: 'ghastlyPossession', status: 'possessingPiece' };
                
                case 'etherealEscape':
                    if (prev.status !== 'check') return prev;
                    return { ...prev, activePowerUp: 'etherealEscape', status: 'escapingCheck' };

                case 'seance':
                    if (!prev.players.white.stolenPiece) return prev;
                    return { ...prev, activePowerUp: 'seance', status: 'placingStolenPiece' };
                
                default:
                    return prev;
            }
        });
    }, []);

    const handlePlacePawn = useCallback((position: Position) => {
        setGameState(prev => {
            if (prev.status !== 'placingPawn' || !prev.activePowerUp) return prev;
            
            const newBoard = prev.board.map(r => [...r]);
            const newPiece = {
                id: `gp-${prev.currentPlayer}-${Date.now()}`,
                type: 'pawn' as PieceType,
                color: prev.currentPlayer,
            };
            newBoard[position.row][position.col] = newPiece;

            const newPlayers = JSON.parse(JSON.stringify(prev.players));
            newPlayers[prev.currentPlayer].powerUpsUsed.push('ghostlyPawn');
            newPlayers[prev.currentPlayer].powerUps = newPlayers[prev.currentPlayer].powerUps.filter(p => p.type !== 'ghostlyPawn');

            const turnEndState = endTurn(newBoard, newPlayers, prev.currentPlayer, prev.movesRemaining, newPiece, null);

            return {
                ...prev,
                ...turnEndState,
            };
        });
    }, []);

    const handlePossessionMove = useCallback((from: Position, to: Position) => {
        setGameState(prev => {
            if (prev.status !== 'possessingPiece') return prev;
            const { newBoard } = movePiece(prev.board, from, to);
            
            const newPlayers = JSON.parse(JSON.stringify(prev.players));
            newPlayers.white.powerUpsUsed.push('ghastlyPossession');
            newPlayers.white.powerUps = newPlayers.white.powerUps.filter(p => p.type !== 'ghastlyPossession');
            
            const turnEndState = endTurn(newBoard, newPlayers, prev.currentPlayer, prev.movesRemaining, null, null);
            return { ...prev, ...turnEndState };
        });
    }, []);

    const handleEtherealEscape = useCallback((to: Position) => {
        setGameState(prev => {
            if (prev.status !== 'escapingCheck') return prev;
            let kingPos: Position | null = null;
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (prev.board[r][c]?.type === 'king' && prev.board[r][c]?.color === prev.currentPlayer) {
                        kingPos = { row: r, col: c };
                        break;
                    }
                }
            }
            if (!kingPos) return prev;

            const { newBoard } = movePiece(prev.board, kingPos, to);
            const newPlayers = JSON.parse(JSON.stringify(prev.players));
            newPlayers.white.powerUpsUsed.push('etherealEscape');
            newPlayers.white.powerUps = newPlayers.white.powerUps.filter(p => p.type !== 'etherealEscape');
            
            const turnEndState = endTurn(newBoard, newPlayers, prev.currentPlayer, prev.movesRemaining, null, null);
            return { ...prev, ...turnEndState };
        });
    }, []);
    
    const handlePlaceStolenPiece = useCallback((position: Position) => {
        setGameState(prev => {
            if (prev.status !== 'placingStolenPiece' || !prev.players.white.stolenPiece) return prev;
            
            const newBoard = prev.board.map(r => [...r]);
            const stolenPiece = prev.players.white.stolenPiece;
            newBoard[position.row][position.col] = stolenPiece;

            const newPlayers = JSON.parse(JSON.stringify(prev.players));
            newPlayers.white.stolenPiece = null;
            newPlayers.white.powerUpsUsed.push('seance');
            newPlayers.white.powerUps = newPlayers.white.powerUps.filter(p => p.type !== 'seance');

            const turnEndState = endTurn(newBoard, newPlayers, prev.currentPlayer, prev.movesRemaining, stolenPiece, null);

            return {
                ...prev,
                ...turnEndState,
            };
        });
    }, []);


    useEffect(() => {
        if (gameState.currentPlayer === 'black' && !gameState.gameover && !gameState.promotionPending) {
            const makeAiMove = async () => {
                setIsAiThinking(true);
                setAiMoveError(null);
                
                const legalMoves = getAllLegalMoves(gameState.board, 'black', null);
                if (legalMoves.length === 0) {
                    setIsAiThinking(false);
                    return;
                }

                const posToCoord = (pos: Position) => `${String.fromCharCode(97 + pos.col)}${8 - pos.row}`;
                const legalMovesNotation = legalMoves.map(move => `${posToCoord(move.from)}${posToCoord(move.to)}`);

                let move: { from: Position; to: Position } | null = null;
                
                try {
                    const moveString = await getBestMove(gameState.board, 'black', legalMovesNotation);
                    const from = coordinateToPosition(moveString.substring(0, 2));
                    const to = coordinateToPosition(moveString.substring(2, 4));
                    // The move is guaranteed to be legal by the service, so we just use it.
                    move = { from, to };
                } catch (error: any) {
                    console.error("AI move service failed, using random fallback.", error);
                    if (error?.message?.toLowerCase().includes('quota')) {
                        setAiMoveError("The spirits are overwhelmed (API quota exceeded). A random move was made.");
                    } else {
                        setAiMoveError("The spirits are confused... a random move was made.");
                    }
                    // Silently fall back to a random move.
                    move = getRandomMove(gameState.board, 'black');
                }
    
                if (!move) {
                    setIsAiThinking(false);
                    return;
                }
    
                const finalMove = move;
                setGameState(prev => {
                    let board = prev.board;
                    let players = JSON.parse(JSON.stringify(prev.players));
                    let timers = { ...prev.timers };
                    let announcement = null;
    
                    const timeTwist = players.black.powerUps.find(p => p.type === 'timeTwist');
                    if (timeTwist && timers.black < 180) {
                        timers.black += 30;
                        players.black.powerUpsUsed.push('timeTwist');
                        players.black.powerUps = players.black.powerUps.filter(p => p.id !== timeTwist.id);
                    }
    
                    const { newBoard, capturedPiece } = movePiece(board, finalMove.from, finalMove.to);
                    const movedPiece = board[finalMove.from.row][finalMove.from.col];
                    board = newBoard;
    
                    if (capturedPiece) {
                        players.black.capturedPieces.push(capturedPiece);
                        if (capturedPiece.type !== 'pawn') {
                            grantRandomPowerUp(players.black);
                        }
                    }
    
                    if (checkPromotion(board, finalMove.to)) {
                        const pieceToPromote = board[finalMove.to.row][finalMove.to.col];
                        if (pieceToPromote) pieceToPromote.type = 'queen';
                    }

                    const PHANTOM_THIEF_CHANCE = 0.1;
                    if (Math.random() < PHANTOM_THIEF_CHANCE && !players.white.stolenPiece) {
                        const eligiblePieces: {piece: Piece, pos: Position}[] = [];
                        for(let r = 0; r < 8; r++) {
                            for(let c = 0; c < 8; c++) {
                                const p = board[r][c];
                                if(p && p.color === 'white' && p.type !== 'king' && p.type !== 'pawn') {
                                    eligiblePieces.push({ piece: p, pos: { row: r, col: c }});
                                }
                            }
                        }

                        if (eligiblePieces.length > 0) {
                            const stolen = eligiblePieces[Math.floor(Math.random() * eligiblePieces.length)];
                            players.white.stolenPiece = stolen.piece;
                            board[stolen.pos.row][stolen.pos.col] = null;
                            announcement = { message: `A phantom has stolen your ${stolen.piece.type}!`, key: Date.now() };
                        }
                    }
                    
                    const turnEndState = endTurn(board, players, prev.currentPlayer, prev.movesRemaining, movedPiece, capturedPiece);

                    return {
                        ...prev,
                        ...turnEndState,
                        timers,
                        announcement,
                        lastCapturePosition: capturedPiece ? { position: finalMove.to, key: Date.now() } : null,
                        moveCount: prev.moveCount + 1,
                    };
                });
                
                setIsAiThinking(false);
            };
    
            const thinkingTimeout = setTimeout(makeAiMove, 1500);
            return () => clearTimeout(thinkingTimeout);
        }
    }, [gameState.currentPlayer, gameState.gameover, gameState.promotionPending, gameState.board]);

    return { gameState, isAiThinking, aiMoveError, handleMove, resetGame, handlePromotion, handleActivatePowerUp, handlePlacePawn, handlePossessionMove, handleEtherealEscape, handlePlaceStolenPiece };
};