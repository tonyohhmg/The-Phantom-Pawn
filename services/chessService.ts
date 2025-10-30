

import { Board, Piece, PlayerColor, Position, PowerUpType, Square } from '../types';

export const FEN_PIECE_MAP: { [key in Piece['type']]: string } = {
  pawn: 'p',
  rook: 'r',
  knight: 'n',
  bishop: 'b',
  queen: 'q',
  king: 'k',
};

export const boardToFEN = (board: Board, currentPlayer: PlayerColor): string => {
  let fen = '';
  for (let i = 0; i < 8; i++) {
    let emptyCount = 0;
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        let pieceChar = FEN_PIECE_MAP[piece.type];
        if (piece.color === 'white') {
          pieceChar = pieceChar.toUpperCase();
        }
        fen += pieceChar;
      } else {
        emptyCount++;
      }
    }
    if (emptyCount > 0) {
      fen += emptyCount;
    }
    if (i < 7) {
      fen += '/';
    }
  }

  fen += ` ${currentPlayer === 'white' ? 'w' : 'b'}`;
  fen += ' KQkq - 0 1'; // Simplified castling, en passant, etc.
  return fen;
};

const isOutOfBounds = (row: number, col: number) => row < 0 || row >= 8 || col < 0 || col >= 8;

const isPathClear = (board: Board, from: Position, to: Position, rowStep: number, colStep: number, spectralMoveActive: boolean): boolean => {
    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;
    let piecesInPath = 0;
    while (currentRow !== to.row || currentCol !== to.col) {
        if (board[currentRow][currentCol] !== null) {
            piecesInPath++;
        }
        currentRow += rowStep;
        currentCol += colStep;
    }
    
    if (spectralMoveActive) {
        // With spectral move, the path can have at most one piece to pass through.
        return piecesInPath <= 1;
    } else {
        // For a normal move, the path must be completely clear.
        return piecesInPath === 0;
    }
};

// This function checks for pseudo-legal moves (ignores checks)
const isValidMovePattern = (board: Board, from: Position, to: Position, activePowerUp: PowerUpType | null): boolean => {
  if (isOutOfBounds(to.row, to.col)) return false;

  const piece = board[from.row][from.col];
  const targetPiece = board[to.row][to.col];

  if (!piece) return false;
  if (from.row === to.row && from.col === to.col) return false;
  
  if (targetPiece && targetPiece.color === piece.color) return false;

  const dRow = to.row - from.row;
  const dCol = to.col - from.col;
  const isSpectralMove = activePowerUp === 'spectralMove' && ['queen', 'rook', 'bishop'].includes(piece.type);

  switch (piece.type) {
    case 'pawn':
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;

      // Move forward
      if (dCol === 0) {
        // One step
        if (dRow === direction && !targetPiece) {
          return true;
        }
        // Two steps from start
        if (from.row === startRow && dRow === 2 * direction && !targetPiece && !board[from.row + direction][from.col]) {
          return true;
        }
      }
      // Capture
      if (Math.abs(dCol) === 1 && dRow === direction && targetPiece && targetPiece.color !== piece.color) {
        return true;
      }
      return false;

    case 'rook':
      if (dRow !== 0 && dCol !== 0) return false;
      const rowStepRook = dRow === 0 ? 0 : dRow > 0 ? 1 : -1;
      const colStepRook = dCol === 0 ? 0 : dCol > 0 ? 1 : -1;
      return isPathClear(board, from, to, rowStepRook, colStepRook, isSpectralMove);

    case 'knight':
      return (Math.abs(dRow) === 2 && Math.abs(dCol) === 1) || (Math.abs(dRow) === 1 && Math.abs(dCol) === 2);

    case 'bishop':
      if (Math.abs(dRow) !== Math.abs(dCol)) return false;
      const rowStepBishop = dRow > 0 ? 1 : -1;
      const colStepBishop = dCol > 0 ? 1 : -1;
      return isPathClear(board, from, to, rowStepBishop, colStepBishop, isSpectralMove);
      
    case 'queen':
      if ((dRow !== 0 && dCol !== 0) && (Math.abs(dRow) !== Math.abs(dCol))) return false;
      const rowStepQueen = dRow === 0 ? 0 : dRow > 0 ? 1 : -1;
      const colStepQueen = dCol === 0 ? 0 : dCol > 0 ? 1 : -1;
      return isPathClear(board, from, to, rowStepQueen, colStepQueen, isSpectralMove);

    case 'king':
      return Math.abs(dRow) <= 1 && Math.abs(dCol) <= 1;
  }

  return false;
};

export const movePiece = (board: Board, from: Position, to: Position): { newBoard: Board; capturedPiece: Piece | null } => {
  const newBoard = board.map(row => [...row].map(p => p ? {...p} : null)); // Deep copy
  const piece = newBoard[from.row][from.col];
  const capturedPiece = newBoard[to.row][to.col];

  if (piece) {
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;
  }

  return { newBoard, capturedPiece };
};

export const checkPromotion = (board: Board, to: Position): boolean => {
    const piece = board[to.row][to.col];
    if (!piece || piece.type !== 'pawn') return false;
    return (piece.color === 'white' && to.row === 0) || (piece.color === 'black' && to.row === 7);
};

export const isKingInCheck = (board: Board, kingColor: PlayerColor): boolean => {
    let kingPos: Position | null = null;
    // Find the king
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.type === 'king' && piece.color === kingColor) {
                kingPos = { row: r, col: c };
                break;
            }
        }
        if (kingPos) break;
    }

    if (!kingPos) return false; // Should not happen in a real game

    const opponentColor = kingColor === 'white' ? 'black' : 'white';
    // Check if any opponent piece can attack the king
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.color === opponentColor) {
                if (isValidMovePattern(board, { row: r, col: c }, kingPos, null)) {
                    return true;
                }
            }
        }
    }

    return false;
};

export const isLegalMove = (board: Board, from: Position, to: Position, activePowerUp: PowerUpType | null): boolean => {
    const piece = board[from.row][from.col];
    if (!piece) return false;

    // A king can never be captured. This is checked here instead of isValidMovePattern
    // to allow threat detection (isKingInCheck) to work correctly.
    const targetPiece = board[to.row][to.col];
    if (targetPiece && targetPiece.type === 'king') {
        return false;
    }

    // Check if the move pattern is valid first
    if (!isValidMovePattern(board, from, to, activePowerUp)) {
        return false;
    }

    // Simulate the move and check if the king is in check afterwards
    const { newBoard } = movePiece(board, from, to);
    return !isKingInCheck(newBoard, piece.color);
};

export const isLegalPossessionMove = (board: Board, from: Position, to: Position): boolean => {
    const piece = board[from.row][from.col];
    const targetPiece = board[to.row][to.col];

    if (!piece || (piece.type !== 'pawn' && piece.type !== 'knight')) return false;
    if (targetPiece) return false; // Cannot capture

    // Re-use isValidMovePattern, but ensure no capture for pawns
    if (piece.type === 'pawn') {
        const dCol = to.col - from.col;
        if (Math.abs(dCol) === 1) return false; // Pawn captures are diagonal
    }
    
    // For both pawns (forward) and knights, their normal "move" pattern is non-capturing
    // isValidMovePattern checks for targetPiece being null for pawn forward moves.
    // Knights can jump, so path is not an issue.
    // The only rule is that the destination square must be empty.
    return isValidMovePattern(board, from, to, null);
};


export const getAllLegalMoves = (board: Board, color: PlayerColor, activePowerUp: PowerUpType | null): { from: Position; to: Position }[] => {
  const moves: { from: Position; to: Position }[] = [];
  for (let rFrom = 0; rFrom < 8; rFrom++) {
    for (let cFrom = 0; cFrom < 8; cFrom++) {
      const piece = board[rFrom][cFrom];
      if (piece && piece.color === color) {
        for (let rTo = 0; rTo < 8; rTo++) {
          for (let cTo = 0; cTo < 8; cTo++) {
            if (isLegalMove(board, { row: rFrom, col: cFrom }, { row: rTo, col: cTo }, activePowerUp)) {
              moves.push({ from: { row: rFrom, col: cFrom }, to: { row: rTo, col: cTo } });
            }
          }
        }
      }
    }
  }
  return moves;
};

export const getEtherealEscapeMoves = (board: Board, kingColor: PlayerColor): Position[] => {
    const validMoves: Position[] = [];
    let kingPos: Position | null = null;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c]?.type === 'king' && board[r][c]?.color === kingColor) {
                kingPos = { row: r, col: c };
                break;
            }
        }
    }

    if (!kingPos) return [];

    for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dCol = -1; dCol <= 1; dCol++) {
            if (dRow === 0 && dCol === 0) continue;
            
            const toPos = { row: kingPos.row + dRow, col: kingPos.col + dCol };
            
            if (isOutOfBounds(toPos.row, toPos.col)) continue;
            
            const targetSquare = board[toPos.row][toPos.col];
            if (targetSquare && targetSquare.color === kingColor) continue; // Can't move onto own piece

            // Simulate the move and check for check
            const { newBoard } = movePiece(board, kingPos, toPos);
            if (!isKingInCheck(newBoard, kingColor)) {
                validMoves.push(toPos);
            }
        }
    }

    return validMoves;
};

export const getRandomMove = (board: Board, color: PlayerColor): { from: Position; to: Position } | null => {
    const allMoves = getAllLegalMoves(board, color, null); // AI won't use spectral move for now
    if (allMoves.length === 0) {
        return null; // No valid moves, could be checkmate or stalemate
    }
    const randomIndex = Math.floor(Math.random() * allMoves.length);
    return allMoves[randomIndex];
};

export const isInsufficientMaterial = (board: Board): boolean => {
    const pieceCounts = {
        white: { p: 0, n: 0, b: 0, r: 0, q: 0, total: 0 },
        black: { p: 0, n: 0, b: 0, r: 0, q: 0, total: 0 }
    };

    const bishops = {
        white: [] as Position[],
        black: [] as Position[],
    };
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const color = piece.color;
                pieceCounts[color].total++;
                switch (piece.type) {
                    case 'pawn': pieceCounts[color].p++; break;
                    case 'knight': pieceCounts[color].n++; break;
                    case 'rook': pieceCounts[color].r++; break;
                    case 'queen': pieceCounts[color].q++; break;
                    case 'bishop': 
                        pieceCounts[color].b++;
                        bishops[color].push({row: r, col: c});
                        break;
                }
            }
        }
    }
    
    // If any player has a pawn, rook, or queen, checkmate is generally possible.
    if (pieceCounts.white.p > 0 || pieceCounts.black.p > 0 || pieceCounts.white.r > 0 || pieceCounts.black.r > 0 || pieceCounts.white.q > 0 || pieceCounts.black.q > 0) {
        return false;
    }

    // Now, only kings, knights, and bishops are on the board.

    // K vs K
    if (pieceCounts.white.total === 1 && pieceCounts.black.total === 1) return true;

    // K+N vs K
    if (pieceCounts.white.total === 2 && pieceCounts.white.n === 1 && pieceCounts.black.total === 1) return true;
    if (pieceCounts.black.total === 2 && pieceCounts.black.n === 1 && pieceCounts.white.total === 1) return true;

    // K+B vs K
    if (pieceCounts.white.total === 2 && pieceCounts.white.b === 1 && pieceCounts.black.total === 1) return true;
    if (pieceCounts.black.total === 2 && pieceCounts.black.b === 1 && pieceCounts.white.total === 1) return true;
    
    // K+B vs K+B, with bishops on same color squares.
    if (pieceCounts.white.total === 2 && pieceCounts.white.b === 1 && pieceCounts.black.total === 2 && pieceCounts.black.b === 1) {
        const whiteBishopPos = bishops.white[0];
        const blackBishopPos = bishops.black[0];
        const whiteBishopSquareColor = (whiteBishopPos.row + whiteBishopPos.col) % 2;
        const blackBishopSquareColor = (blackBishopPos.row + blackBishopPos.col) % 2;

        if (whiteBishopSquareColor === blackBishopSquareColor) {
            return true;
        }
    }
    
    return false;
};