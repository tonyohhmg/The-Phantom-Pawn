import { Board, Piece, PieceType, PowerUpType } from './types';

const simpleHash = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const generateAvatarUrl = (seed: string): string => {
    // bottts-neutral provides cute, ghost-like robot heads.
    // We use a spooky color palette to generate a deterministic, ghostly avatar.
    const sanitizedSeed = encodeURIComponent(seed) || 'spooky-ghost';
    const spookyColors = [
        'd1d5db', // light gray
        '9ca3af', // medium gray
        '6b7280', // dark gray
        'a855f7', // purple
        'c084fc', // light purple
        'f3f4f6', // off-white
    ];

    const hash = simpleHash(sanitizedSeed);

    // Use the hash to deterministically select colors for a ghostly appearance
    const primaryColor = spookyColors[((hash >> 2) % 2) + 3]; // Purples
    const secondaryColor = spookyColors[((hash >> 4) % 3)];    // Grays
    
    // This style creates avatars that look like little ghosts.
    return `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${sanitizedSeed}&primaryColor=${primaryColor}&secondaryColor=${secondaryColor}&mouthProbability=75&sidesProbability=75`;
};

export const INITIAL_BOARD_SETUP: Board = [
  // Black pieces (top rows)
  [
    { id: 'b-rook-1', type: 'rook', color: 'black' }, { id: 'b-knight-1', type: 'knight', color: 'black' }, { id: 'b-bishop-1', type: 'bishop', color: 'black' }, { id: 'b-queen', type: 'queen', color: 'black' }, 
    { id: 'b-king', type: 'king', color: 'black' }, { id: 'b-bishop-2', type: 'bishop', color: 'black' }, { id: 'b-knight-2', type: 'knight', color: 'black' }, { id: 'b-rook-2', type: 'rook', color: 'black' }
  ],
  Array.from({ length: 8 }, (_, i) => ({ id: `b-pawn-${i}`, type: 'pawn', color: 'black' })),
  // Empty middle rows
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  // White pieces (bottom rows)
  Array.from({ length: 8 }, (_, i) => ({ id: `w-pawn-${i}`, type: 'pawn', color: 'white' })),
  [
    { id: 'w-rook-1', type: 'rook', color: 'white' }, { id: 'w-knight-1', type: 'knight', color: 'white' }, { id: 'w-bishop-1', type: 'bishop', color: 'white' }, { id: 'w-queen', type: 'queen', color: 'white' }, 
    { id: 'w-king', type: 'king', color: 'white' }, { id: 'w-bishop-2', type: 'bishop', color: 'white' }, { id: 'w-knight-2', type: 'knight', color: 'white' }, { id: 'w-rook-2', type: 'rook', color: 'white' }
  ],
];

export const PIECE_DATA: Record<PieceType, { label: string; symbol: { white: string; black: string } }> = {
    king: { 
        label: 'K', 
        symbol: { white: 'https://anthonyorsa.com/wp-content/uploads/2025/10/King-White.png', black: 'https://anthonyorsa.com/wp-content/uploads/2025/10/King-Black.png' } 
    },
    queen: { 
        label: 'Q', 
        symbol: { white: 'https://anthonyorsa.com/wp-content/uploads/2025/10/Queen-White.png', black: 'https://anthonyorsa.com/wp-content/uploads/2025/10/Queen-Black.png' } 
    },
    rook: { 
        label: 'R', 
        symbol: { white: 'https://anthonyorsa.com/wp-content/uploads/2025/10/Rook-White.png', black: 'https://anthonyorsa.com/wp-content/uploads/2025/10/Rook-Black.png' } 
    },
    bishop: { 
        label: 'B', 
        symbol: { white: 'https://anthonyorsa.com/wp-content/uploads/2025/10/Bishop-White.png', black: 'https://anthonyorsa.com/wp-content/uploads/2025/10/Bishop-Black.png' } 
    },
    knight: { 
        label: 'N', 
        symbol: { white: 'https://anthonyorsa.com/wp-content/uploads/2025/10/Knight-White.png', black: 'https://anthonyorsa.com/wp-content/uploads/2025/10/Knight-Black.png' } 
    },
    pawn: { 
        label: 'P', 
        symbol: { white: 'https://anthonyorsa.com/wp-content/uploads/2025/10/Pawn-White.png', black: 'https://anthonyorsa.com/wp-content/uploads/2025/10/Pawn-Black.png' } 
    },
};

export const AVAILABLE_POWER_UPS: PowerUpType[] = ['spectralMove', 'timeTwist', 'ghostlyPawn', 'ghastlyPossession', 'etherealEscape', 'seance'];

export const POWER_UP_DATA: Record<PowerUpType, { name: string; description: string; icon: string; }> = {
    spectralMove: {
        name: 'Spectral Move',
        description: 'Your next move with a Queen, Rook, or Bishop can pass through one piece.',
        icon: '👻',
    },
    timeTwist: {
        name: 'Time Twist',
        description: 'Instantly add 30 seconds to your timer.',
        icon: '⏳',
    },
    ghostlyPawn: {
        name: 'Ghostly Pawn',
        description: 'Summon a new pawn on any empty square in your second rank.',
        icon: '💀',
    },
    ghastlyPossession: {
        name: 'Ghastly Possession',
        description: "Briefly possess an opponent's Pawn or Knight, forcing it to make one legal, non-capturing move of your choice.",
        icon: '👿',
    },
    etherealEscape: {
        name: 'Ethereal Escape',
        description: 'Instantly teleport your King out of check to any adjacent, non-threatened square, ignoring intervening pieces.',
        icon: '💨',
    },
    seance: {
        name: 'Séance',
        description: 'Bring a piece stolen by a phantom back to an empty square on your first two ranks.',
        icon: '🕯️',
    }
};


// Fix: Added missing LEADERBOARD_DATA to resolve import error.
export const LEADERBOARD_DATA = [
    { rank: 1, name: 'Spectral King', score: 10500 },
    { rank: 2, name: 'The Poltergeist', score: 9800 },
    { rank: 3, name: 'Wraith Walker', score: 9750 },
    { rank: 4, name: 'Banshee Queen', score: 9200 },
    { rank: 5, name: 'Shadow Bishop', score: 8900 },
    { rank: 6, name: 'Phantom Knight', score: 8500 },
    { rank: 7, name: 'Ghostly Pawn', score: 8100 },
    { rank: 8, name: 'Spirit of the Board', score: 7600 },
    { rank: 9, name: 'Ectoplasmic Endgame', score: 7300 },
    { rank: 10, name: 'The Crypt Keeper', score: 7150 },
];

// Fix: Added missing constants that were causing import errors in other files.
export const AI_NAMES: string[] = [
    'The Ghostly Grandmaster',
    'Shadow Pawn',
    'Count Checkmate',
    'The Crypt Keeper',
    'Banshee Bishop',
    'Wraithful Rook',
];

export const GAME_TIMER_SECONDS = 10 * 60; // 10 minutes

export const LEVEL_THRESHOLDS = [
    1,   // Level 2
    3,   // Level 3
    6,   // Level 4
    10,  // Level 5
    15,  // Level 6
    25,  // Level 7
    40,  // Level 8
    60,  // Level 9
    100, // Level 10
];