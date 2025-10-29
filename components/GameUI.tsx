import React from 'react';
import { GameState, PlayerState, Piece, PlayerColor } from '../types';
import { PIECE_DATA } from '../constants';
import StatusEffects from './StatusEffects';

interface GameUIProps {
  gameState: GameState;
  isAiThinking: boolean;
  onReset: () => void;
  onEndGame: () => void;
  onPlayAgain: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const CapturedPieces: React.FC<{ pieces: Piece[] }> = ({ pieces }) => (
  <div className="flex flex-wrap gap-2 h-12 items-center text-2xl">
    {pieces.map((p, i) => (
      <span
        key={i}
        className={`${p.color === 'white' ? 'text-orange-400' : 'text-purple-600'}`}
        style={{ textShadow: '0 0 5px rgba(0, 0, 0, 0.15)' }}
        title={p.type}
      >
        {PIECE_DATA[p.type].symbol[p.color]}
      </span>
    ))}
  </div>
);

const PlayerInfo: React.FC<{ player: PlayerState; timer: number; isCurrent: boolean; isThinking?: boolean; inCheck?: boolean }> = ({ player, timer, isCurrent, isThinking, inCheck }) => {
    let containerClasses = 'p-4 rounded-lg transition-all duration-300 border-2 ';
    const avatarBorderColor = player.color === 'white' ? 'border-orange-400' : 'border-purple-600';

    if (isCurrent) {
        if (player.color === 'white') {
            containerClasses += 'bg-orange-900/50 border-orange-400 animate-active-player-glow-white';
        } else {
            containerClasses += 'bg-purple-800/50 border-purple-600 animate-active-player-glow-black';
        }
    } else {
        containerClasses += 'bg-gray-800/50 border-transparent';
    }

    return (
        <div className={containerClasses}>
            <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                    <img 
                        src={player.avatarUrl} 
                        alt={`${player.name}'s avatar`} 
                        className={`w-14 h-14 rounded-full border-2 ${avatarBorderColor} bg-gray-700 shadow-md flex-shrink-0`}
                    />
                    <div className="flex-grow">
                        <div className="flex flex-col items-start">
                           <h3 className="text-xl font-bold truncate">{player.name}</h3>
                           <span className="mt-1 bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                Lv. {player.level}
                            </span>
                        </div>
                        {inCheck && (
                            <span className="mt-1 inline-block bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                CHECK!
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-2xl font-mono bg-black/50 px-3 py-1 rounded-md ml-2 flex-shrink-0">{formatTime(timer)}</div>
            </div>
            {isCurrent && player.color === 'black' && (
                 <div className="my-2 text-lg text-center font-bold text-purple-400 animate-pulse h-7 flex items-center justify-center">
                    <span>{isThinking ? 'Phantom is thinking' : "PHANTOM'S TURN"}</span>
                    {isThinking && <span className="animate-ellipsis"></span>}
                </div>
            )}
            <div className="mt-2">
                <CapturedPieces pieces={player.capturedPieces} />
            </div>
        </div>
    );
};

const GameStatus: React.FC<{ status: GameState['status']; winner: GameState['winner']; whitePlayerName: string; blackPlayerName: string }> = ({ status, winner, whitePlayerName, blackPlayerName }) => {
    let message = '';
    const winnerName = winner === 'white' ? whitePlayerName : blackPlayerName;

    switch (status) {
        case 'check':
            // The "CHECK!" label is now on the player card, so this global message is redundant.
            return null;
        case 'checkmate':
            message = `Checkmate! ${winnerName} wins!`;
            break;
        case 'draw':
            message = "It's a draw!";
            break;
        case 'timeout':
            message = `Time's up! ${winnerName} wins!`;
            break;
        default:
            return null;
    }

    return (
        <div className="text-center my-2">
            <p className="text-2xl font-bold text-orange-400 animate-pulse">{message}</p>
        </div>
    );
};

const GameOverModal: React.FC<{ winner: GameState['winner']; whitePlayerName: string; onPlayAgain: () => void; onEndGame: () => void; }> = ({ winner, whitePlayerName, onPlayAgain, onEndGame }) => {
    const winnerName = winner === 'white' ? whitePlayerName : 'The Phantom';
    const message = winner ? `${winnerName} is Victorious!` : "The game is a draw!";

    return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 pointer-events-auto">
            <div className="text-center p-8 bg-gray-900 rounded-xl border-4 border-orange-500 shadow-2xl shadow-orange-500/50">
                <h2 className="text-5xl font-jolly-lodger mb-4">{message}</h2>
                <div className="flex gap-4 mt-6">
                    <button onClick={onPlayAgain} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md">
                        Play Again
                    </button>
                    <button onClick={onEndGame} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md">
                        Main Menu
                    </button>
                </div>
            </div>
        </div>
    );
};


const GameUI: React.FC<GameUIProps> = ({ gameState, isAiThinking, onReset, onEndGame, onPlayAgain }) => {
  const { players, timers, currentPlayer, status, gameover, winner } = gameState;

  const isPlayerInCheck = (playerColor: PlayerColor) => {
      return status === 'check' && currentPlayer === playerColor;
  }

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row p-4 md:p-8 pointer-events-none text-white">
      {(status === 'check' || status === 'checkmate') && <StatusEffects status={status} />}
      {/* Top Player (AI) */}
      <div className="w-full md:w-1/4 md:pr-8 flex flex-col justify-start space-y-4 order-1 md:order-1">
        <PlayerInfo 
            player={players.black} 
            timer={timers.black} 
            isCurrent={currentPlayer === 'black'}
            isThinking={isAiThinking}
            inCheck={isPlayerInCheck('black')}
        />
      </div>

      {/* Main content spacer and center status */}
      <div className="flex-1 flex flex-col justify-center items-center order-3 md:order-2">
         <GameStatus status={status} winner={winner} whitePlayerName={players.white.name} blackPlayerName={players.black.name} />
      </div>

      {/* Bottom Player (Human) */}
      <div className="w-full md:w-1/4 md:pl-8 flex flex-col justify-end space-y-4 order-2 md:order-3">
        <PlayerInfo 
            player={players.white} 
            timer={timers.white}
            isCurrent={currentPlayer === 'white'} 
            inCheck={isPlayerInCheck('white')}
        />
         <div className="flex flex-col space-y-2 pointer-events-auto">
            <button onClick={onEndGame} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                End Game
            </button>
        </div>
      </div>
      
      {gameover && (
        <GameOverModal 
            winner={winner} 
            whitePlayerName={players.white.name}
            onPlayAgain={onPlayAgain} 
            onEndGame={onEndGame} 
        />
      )}
    </div>
  );
};

export default GameUI;