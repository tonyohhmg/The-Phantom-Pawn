// Fix: Removed self-import which was causing a conflict with local type declarations.
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PlayerColor = 'white' | 'black';

export interface Piece {
  id: string;
  type: PieceType;
  color: PlayerColor;
}

export type Square = Piece | null;

export type Board = Square[][];

export type PowerUpType = 'spectralMove' | 'timeTwist' | 'ghostlyPawn' | 'ghastlyPossession' | 'etherealEscape' | 'seance';

export interface PowerUp {
    id: string;
    type: PowerUpType;
}

export interface PlayerState {
  name: string;
  color: PlayerColor;
  capturedPieces: Piece[];
  level: number;
  avatarUrl: string;
  powerUps: PowerUp[];
  powerUpsUsed: PowerUpType[];
  stolenPiece: Piece | null;
}

export interface GameState {
  board: Board;
  currentPlayer: PlayerColor;
  movesRemaining: number;
  players: {
    white: PlayerState;
    black: PlayerState;
  };
  status: 'playing' | 'check' | 'checkmate' | 'draw' | 'promotion' | 'timeout' | 'placingPawn' | 'possessingPiece' | 'escapingCheck' | 'placingStolenPiece';
  gameover: boolean;
  winner: PlayerColor | null;
  promotionPending: {
    position: Position;
    color: PlayerColor;
  } | null;
  timers: {
    white: number;
    black: number;
  };
  lastCapturePosition: { position: Position, key: number } | null;
  activePowerUp: PowerUpType | null;
  moveCount: number;
  announcement: { message: string; key: number } | null;
}

export type Position = {
  row: number;
  col: number;
};

export interface PlayerProfile {
    name: string;
    wins: number;
    level: number;
    avatarUrl: string;
    draws: number;
}