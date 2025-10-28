// Fix: Removed self-import which was causing a conflict with local type declarations.
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PlayerColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PlayerColor;
}

export type Square = Piece | null;

export type Board = Square[][];

export interface PlayerState {
  name: string;
  color: PlayerColor;
  capturedPieces: Piece[];
}

export interface GameState {
  board: Board;
  currentPlayer: PlayerColor;
  movesRemaining: number;
  players: {
    white: PlayerState;
    black: PlayerState;
  };
  status: 'playing' | 'check' | 'checkmate' | 'draw' | 'promotion' | 'timeout';
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
}

export type Position = {
  row: number;
  col: number;
};