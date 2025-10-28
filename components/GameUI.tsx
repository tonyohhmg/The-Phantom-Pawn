import React from 'react';
import { GameState } from '../types';
import { PIECE_SYMBOLS } from '../constants';

interface GameUIProps {
  gameState: GameState;
  onReset: () => void;
  onEndGame: () => void;
  onPlayAgain: () => void;
}

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const PlayerDisplay: React.FC<{ playerState: GameState['players']['white'], isCurrent: boolean, isAiThinking: boolean, time: number }> = ({ playerState, isCurrent, isAiThinking, time }) => {
    return (
        <div className={`p-3 rounded-lg border-2 ${isCurrent ? 'border-orange-400 bg-gray-800' : 'border-gray-600 bg-gray-900'} transition-all w-full`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-bold truncate ${isCurrent ? 'text-orange-400' : 'text-gray-400'}`}>{playerState.name}</h3>
              <div className="flex items-center gap-2">
                {isCurrent && isAiThinking && <span className="text-sm text-purple-400 animate-pulse">thinking...</span>}
              </div>
            </div>
            <div className={`mt-1 text-2xl font-mono text-right ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
                {formatTime(time)}
            </div>
            <div className="mt-2 h-10 flex flex-wrap gap-1 items-center">
                {playerState.capturedPieces.map((p, i) => (
                    <span key={i} className="text-xl" title={p.type}>{PIECE_SYMBOLS[p.type].symbol}</span>
                ))}
            </div>
        </div>
    );
}

const GameUI: React.FC<GameUIProps & { isAiThinking: boolean }> = ({ gameState, onReset, onEndGame, onPlayAgain, isAiThinking }) => {
  
  const getGameOverMessage = () => {
    switch (gameState.status) {
      case 'checkmate':
        return 'Checkmate!';
      case 'draw':
        return 'Stalemate';
      case 'timeout':
        return "Time's Up!";
      default:
        return null;
    }
  };
  
  const gameOverMessage = getGameOverMessage();

  return (
    <div className="absolute inset-0 p-4 md:p-8 pointer-events-none grid grid-rows-[1fr_auto] grid-cols-[150px_1fr_150px] md:grid-cols-[200px_1fr_200px] gap-4">
        {/* Game Over Title */}
        {gameState.gameover && gameOverMessage && (
          <div className="col-start-2 row-start-1 self-center text-center pointer-events-auto">
            <h1 className="text-7xl font-creepster text-orange-500 animate-pulse drop-shadow-[0_5px_10px_rgba(249,115,22,0.7)]">
              {gameOverMessage}
            </h1>
          </div>
        )}

        {/* Left Center - Black Player */}
        <div className="col-start-1 row-start-1 self-center pointer-events-auto flex flex-col items-center gap-2">
            {gameState.currentPlayer === 'black' && gameState.status === 'check' && (
                <span className="text-4xl font-creepster text-red-500 animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    CHECK!
                </span>
            )}
            <PlayerDisplay 
                playerState={gameState.players.black} 
                isCurrent={gameState.currentPlayer === 'black'}
                isAiThinking={isAiThinking}
                time={gameState.timers.black}
            />
        </div>
        
        {/* Right Center - White Player */}
        <div className="col-start-3 row-start-1 self-center pointer-events-auto flex flex-col items-center gap-2">
            {gameState.currentPlayer === 'white' && gameState.status === 'check' && (
                <span className="text-4xl font-creepster text-red-500 animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    CHECK!
                </span>
            )}
            <PlayerDisplay 
                playerState={gameState.players.white} 
                isCurrent={gameState.currentPlayer === 'white'}
                isAiThinking={false} // White player is never the AI
                time={gameState.timers.white}
            />
        </div>

        {/* Bottom Center - Buttons */}
        <div className="col-start-2 row-start-2 self-end flex justify-center items-center gap-4 pointer-events-auto">
            {gameState.gameover && (
                <button
                    onClick={onPlayAgain}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-md border-b-4 border-orange-800 hover:border-orange-900 transition-all duration-200"
                >
                    Play Again
                </button>
            )}
            <button
                onClick={onEndGame}
                className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                End
            </button>
            <button
                onClick={onReset}
                className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                Reset
            </button>
        </div>
    </div>
  );
};

export default GameUI;