

import React, { useState, useEffect } from 'react';
import { GameState, PlayerState, Piece, PlayerColor, PowerUp, PowerUpType } from '../types';
import { PIECE_DATA, POWER_UP_DATA } from '../constants';
import StatusEffects from './StatusEffects';
import Popover from './Popover';

interface GameUIProps {
  gameState: GameState;
  isAiThinking: boolean;
  onReset: () => void;
  onEndGame: () => void;
  onPlayAgain: () => void;
  onConfirmForfeit: () => void;
  onActivatePowerUp: (powerUp: PowerUp) => void;
  aiMoveError: string | null;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const CapturedPieces: React.FC<{ pieces: Piece[]; stolenPiece: Piece | null; color: PlayerColor }> = ({ pieces, stolenPiece, color }) => (
    <div className="flex flex-col">
        <div className="flex flex-wrap gap-1 h-12 items-center">
            {pieces.map((p, i) => (
            <img
                key={i}
                src={PIECE_DATA[p.type].symbol[p.color]}
                title={p.type}
                alt={p.type}
                className="w-4 h-4 object-contain"
                style={{
                    filter: p.color === 'white' 
                        ? 'drop-shadow(0 0 2px #f97316)' 
                        : 'drop-shadow(0 0 2px #a855f7)',
                }}
            />
            ))}
        </div>
        {stolenPiece && (
            <div className="h-6 flex items-center text-sm text-red-400 font-bold animate-pulse">
                Stolen:
                <img
                    src={PIECE_DATA[stolenPiece.type].symbol[color]}
                    alt={stolenPiece.type}
                    className="ml-2 w-4 h-4 object-contain"
                    style={{
                        filter: color === 'white' 
                            ? 'drop-shadow(0 0 2px #f97316)' 
                            : 'drop-shadow(0 0 2px #a855f7)',
                    }}
                />
            </div>
        )}
  </div>
);

const PowerUpDisplay: React.FC<{ player: PlayerState; activePowerUp: GameState['activePowerUp']; onActivate: (powerUp: PowerUp) => void; inCheck?: boolean; }> = ({ player, activePowerUp, onActivate, inCheck }) => {
    if (player.powerUps.length === 0) return <div className="h-12"></div>;

    return (
        <div className="h-12 flex items-center gap-2">
            <span className="font-bold text-sm">Powers:</span>
            {player.powerUps.map(powerUp => {
                const data = POWER_UP_DATA[powerUp.type];
                const isActive = activePowerUp === powerUp.type;
                
                const isEtherealEscapeAndNotInCheck = powerUp.type === 'etherealEscape' && !inCheck;
                const isSeanceAndNotStolen = powerUp.type === 'seance' && !player.stolenPiece;
                const isDisabled = player.color === 'black' || isEtherealEscapeAndNotInCheck || isSeanceAndNotStolen;

                const buttonClasses = `w-10 h-10 text-2xl rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
                    isActive
                        ? 'bg-yellow-500 border-yellow-300 scale-110 shadow-lg shadow-yellow-500/50'
                        : isDisabled 
                            ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                            : 'bg-gray-700 border-gray-600 hover:bg-purple-600'
                }`;

                return (
                    <button
                        key={powerUp.id}
                        onClick={() => onActivate(powerUp)}
                        className={`relative group ${buttonClasses}`}
                        disabled={isDisabled}
                    >
                        {data.icon}

                        {/* Custom Tooltip */}
                        <div className="absolute bottom-full mb-2 w-48 bg-gray-900 text-white text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 left-1/2 -translate-x-1/2 shadow-lg border border-purple-500">
                            <h4 className="font-bold text-base text-purple-400">{data.name}</h4>
                            <p className="text-gray-300">{data.description}</p>
                            {isEtherealEscapeAndNotInCheck && <p className="text-xs text-red-400 mt-1">Can only be used when in check!</p>}
                            {isSeanceAndNotStolen && <p className="text-xs text-red-400 mt-1">You have no piece to bring back!</p>}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

const PlayerInfo: React.FC<{ player: PlayerState; timer: number; isCurrent: boolean; isThinking?: boolean; inCheck?: boolean; activePowerUp: GameState['activePowerUp']; onActivatePowerUp: (powerUp: PowerUp) => void; }> = ({ player, timer, isCurrent, isThinking, inCheck, activePowerUp, onActivatePowerUp }) => {
    let containerClasses = 'p-4 rounded-lg transition-all duration-300 border-2 pointer-events-auto ';
    const avatarBorderColor = player.color === 'white' ? 'border-orange-500' : 'border-purple-600';

    if (isCurrent) {
        if (player.color === 'white') {
            containerClasses += 'bg-orange-900/50 border-orange-500 animate-active-player-glow-white';
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
                        className={`w-16 h-16 rounded-full border-2 ${avatarBorderColor} bg-gray-700 shadow-md flex-shrink-0`}
                    />
                    <div className="flex-grow">
                        <div className="flex flex-col items-start">
                           <div className="flex items-center gap-2">
                               <h3 className="text-xl font-bold truncate">{player.name}</h3>
                               {inCheck && (
                                   <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                       CHECK!
                                   </span>
                               )}
                           </div>
                           <span className="mt-1 bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                Lv. {player.level}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-2xl font-mono bg-black/50 px-3 py-1 rounded-md ml-2 flex-shrink-0">{formatTime(timer)}</div>
            </div>
            <div className="mt-2">
                <CapturedPieces pieces={player.capturedPieces} stolenPiece={player.stolenPiece} color={player.color} />
            </div>
             <div className="mt-2 border-t border-white/10 pt-2">
                <PowerUpDisplay player={player} activePowerUp={activePowerUp} onActivate={onActivatePowerUp} inCheck={inCheck} />
            </div>
        </div>
    );
};

const GameStatus: React.FC<{ status: GameState['status']; winner: GameState['winner']; whitePlayerName: string; blackPlayerName: string }> = ({ status, winner, whitePlayerName, blackPlayerName }) => {
    let message = '';
    const winnerName = winner === 'white' ? whitePlayerName : blackPlayerName;

    switch (status) {
        case 'check':
            return null;
        case 'placingPawn':
             message = 'Place your Ghostly Pawn!';
             break;
        case 'possessingPiece':
             message = 'Possess an enemy piece!';
             break;
        case 'escapingCheck':
             message = 'Escape to a safe square!';
             break;
        case 'placingStolenPiece':
             message = 'Return your piece from the void!';
             break;
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
            <p className="text-2xl font-bold text-orange-500 animate-pulse">{message}</p>
        </div>
    );
};

const GameOverModal: React.FC<{ gameState: GameState; onPlayAgain: () => void; onEndGame: () => void; }> = ({ gameState, onPlayAgain, onEndGame }) => {
    const { winner, players, timers, moveCount } = gameState;

    const winnerName = winner === 'white' ? players.white.name : players.black.name;
    const message = winner ? `${winnerName} is Victorious!` : "The game is a draw!";

    const winnerStats = winner ? {
        timeRemaining: formatTime(timers[winner]),
        piecesCaptured: players[winner].capturedPieces.length,
        powerUpsUsed: players[winner].powerUpsUsed,
    } : null;

    return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 pointer-events-auto animate-fade-in">
            <div className="text-center p-8 bg-gray-900 rounded-xl border-4 border-purple-500 shadow-2xl shadow-purple-500/50 w-full max-w-lg">
                <h2 className="text-6xl font-sans mb-4 text-white">{message}</h2>
                
                {/* Stats Section */}
                {winner && winnerStats && (
                    <div className="my-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h3 className="text-2xl font-bold text-center mb-4 text-white">Match Stats</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-sm text-gray-400">Total Moves</div>
                                <div className="text-3xl font-bold text-white">{Math.ceil(moveCount / 2)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Pieces Captured</div>
                                <div className="text-3xl font-bold text-white">{winnerStats.piecesCaptured}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Time Remaining</div>
                                <div className="text-3xl font-bold text-white">{winnerStats.timeRemaining}</div>
                            </div>
                        </div>
                        <div className="text-center mt-4 pt-4 border-t border-gray-700/50">
                            <div className="text-sm text-gray-400">Power-ups Used</div>
                            <div className="mt-1 h-8 flex justify-center items-center gap-2 text-3xl">
                                {winnerStats.powerUpsUsed.length > 0 ? (
                                    winnerStats.powerUpsUsed.map((powerUpType, index) => (
                                        <span key={index} title={POWER_UP_DATA[powerUpType].name}>
                                            {POWER_UP_DATA[powerUpType].icon}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-lg text-gray-500">None</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 mt-8 justify-center">
                    <button 
                        onClick={onPlayAgain} 
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-md text-lg border-b-4 border-purple-800 hover:border-purple-900 transform hover:scale-105 transition-all"
                    >
                        Play Again
                    </button>
                    <button 
                        onClick={onEndGame} 
                        className="bg-transparent hover:bg-white/20 text-white font-bold py-3 px-8 rounded-md text-lg transition-all"
                    >
                        Main Menu
                    </button>
                </div>
            </div>
        </div>
    );
};


const GameUI: React.FC<GameUIProps> = ({ gameState, isAiThinking, onReset, onEndGame, onPlayAgain, onConfirmForfeit, onActivatePowerUp, aiMoveError }) => {
  const { players, timers, currentPlayer, status, gameover, winner, activePowerUp, announcement } = gameState;
  const [localAnnouncement, setLocalAnnouncement] = useState<{ message: string; key: number } | null>(null);

  useEffect(() => {
    if (announcement) {
        setLocalAnnouncement(announcement);
        const timer = setTimeout(() => {
            setLocalAnnouncement(null);
        }, 5000); // Display for 5 seconds
        return () => clearTimeout(timer);
    }
  }, [announcement]);

  const isPlayerInCheck = (playerColor: PlayerColor) => {
      // The player is in check if the status is 'check' AND it's their turn.
      // Or if the status is 'escapingCheck' which can only happen if they were in check.
      return (status === 'check' && currentPlayer === playerColor) || (status === 'escapingCheck' && playerColor === 'white');
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
            activePowerUp={activePowerUp}
            onActivatePowerUp={onActivatePowerUp}
        />
      </div>

      {/* Main content spacer and center status */}
      <div className="flex-1 flex flex-col justify-center items-center order-3 md:order-2">
         <GameStatus status={status} winner={winner} whitePlayerName={players.white.name} blackPlayerName={players.black.name} />
         {localAnnouncement && (
            <div key={localAnnouncement.key} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 p-4 rounded-lg border-2 border-red-500 text-red-400 text-xl font-bold animate-fade-in z-30 pointer-events-auto">
                {localAnnouncement.message}
            </div>
        )}
        {aiMoveError && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-24 bg-black/80 p-3 rounded-lg border-2 border-yellow-500 text-yellow-400 text-md font-bold animate-fade-in z-30 pointer-events-auto">
                {aiMoveError}
            </div>
        )}
      </div>

      {/* Bottom Player (Human) */}
      <div className="w-full md:w-1/4 md:pl-8 flex flex-col justify-end space-y-4 order-2 md:order-3">
        <PlayerInfo 
            player={players.white} 
            timer={timers.white}
            isCurrent={currentPlayer === 'white'} 
            inCheck={isPlayerInCheck('white')}
            activePowerUp={activePowerUp}
            onActivatePowerUp={onActivatePowerUp}
        />
         <div className="flex flex-col space-y-2 pointer-events-auto">
            <Popover
                trigger={
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        End Game
                    </button>
                }
            >
                {(close) => (
                    <div className="text-center text-white">
                        <p className="text-sm text-gray-300 mb-4">Are you sure you want to forfeit this match?</p>
                        <div className="flex justify-center gap-2">
                            <button 
                                onClick={() => {
                                    onConfirmForfeit();
                                    close();
                                }} 
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm"
                            >
                                Yes, Forfeit
                            </button>
                            <button 
                                onClick={close} 
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md text-sm"
                            >
                                No
                            </button>
                        </div>
                    </div>
                )}
            </Popover>
        </div>
      </div>
      
      {gameover && (
        <GameOverModal 
            gameState={gameState}
            onPlayAgain={onPlayAgain} 
            onEndGame={onEndGame} 
        />
      )}
    </div>
  );
};

export default GameUI;