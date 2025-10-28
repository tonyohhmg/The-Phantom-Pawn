// Fix: Added 'PieceType' to the import from './types'.
import { Board, Piece, PieceType } from './types';

export const INITIAL_BOARD_SETUP: Board = [
  // Black pieces (top rows)
  [
    { type: 'rook', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'bishop', color: 'black' }, { type: 'queen', color: 'black' }, 
    { type: 'king', color: 'black' }, { type: 'bishop', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' }
  ],
  Array(8).fill({ type: 'pawn', color: 'black' }),
  // Empty middle rows
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  // White pieces (bottom rows)
  Array(8).fill({ type: 'pawn', color: 'white' }),
  [
    { type: 'rook', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'bishop', color: 'white' }, { type: 'queen', color: 'white' }, 
    { type: 'king', color: 'white' }, { type: 'bishop', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' }
  ],
];

export const PIECE_SYMBOLS: Record<PieceType, { symbol: string; label: string }> = {
    king: { symbol: '🎃', label: 'K' },
    queen: { symbol: '👻', label: 'Q' },
    rook: { symbol: '🏰', label: 'R' },
    bishop: { symbol: '🧙', label: 'B' },
    knight: { symbol: '🦇', label: 'N' },
    pawn: { symbol: '💀', label: 'P' },
};

export const LEADERBOARD_DATA = [
    { rank: 1, name: 'Vlad the Impaler', score: 6660 },
    { rank: 2, name: 'Ghastly Garry', score: 5800 },
    { rank: 3, name: 'Morticia Addams', score: 5500 },
    { rank: 4, name: 'Count Dracula', score: 4900 },
    { rank: 5, name: 'Witching Wesley', score: 4200 },
    { rank: 6, name: 'Spooky Spassky', score: 3800 },
    { rank: 7, name: 'Phantom Fischer', score: 3500 },
    { rank: 8, name: 'Franken-Stein', score: 3100 },
    { rank: 9, name: 'The Mummy', score: 2800 },
    { rank: 10, name: 'Jack Skellington', score: 2500 },
];

export const AI_NAMES = [
    'Grave Digger',
    'Specter',
    'The Phantom',
    'Warlock',
    'Bogeyman',
    'Headless Horseman',
    'Count Crypt',
    'Baron Von Bat',
    'Lord Skele-pawn',
    'The Bishop of Bones'
];

export const GAME_TIMER_SECONDS = 300; // 5 minutes per player
