// Fix: Implemented the full content of the App component to structure and render the application.
import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import GameUI from './components/GameUI';
import StartMenu from './components/StartMenu';
import Leaderboard from './components/Leaderboard';
import Modal from './components/Modal';
import PromotionChoice from './components/PromotionChoice';
import NameEntryModal from './components/NameEntryModal';
import { useGameLogic } from './hooks/useGameLogic';

type View = 'start' | 'game' | 'leaderboard';

const App: React.FC = () => {
  const [view, setView] = useState<View>('start');
  const [playerName, setPlayerName] = useState('Player');
  const { gameState, isAiThinking, aiMoveError, handleMove, resetGame, handlePromotion } = useGameLogic(playerName);

  const [rotation] = useState({ x: 0, y: 0 });
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNameEntryOpen, setIsNameEntryOpen] = useState(false);

  const handleStartGameRequest = () => {
    setIsNameEntryOpen(true);
  };
  
  const handleNameEntryStart = (name: string) => {
    setPlayerName(name);
    resetGame(name);
    setIsNameEntryOpen(false);
    setView('game');
  };

  const handleEndGame = () => {
    setView('start');
  };

  const handlePlayAgain = () => {
    resetGame(playerName);
  };

  const renderContent = () => {
    switch (view) {
      case 'leaderboard':
        return <Leaderboard onBack={() => setView('start')} />;
      case 'game':
        return (
          <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-gray-900">
            <GameUI 
                gameState={gameState} 
                onReset={handleStartGameRequest} 
                onEndGame={handleEndGame}
                onPlayAgain={handlePlayAgain}
                isAiThinking={isAiThinking} 
            />
            <GameBoard
              board={gameState.board}
              onMove={handleMove}
              rotation={rotation}
              currentPlayer={gameState.currentPlayer}
              disabled={gameState.currentPlayer === 'black' || gameState.gameover || !!gameState.promotionPending}
            />
            {gameState.promotionPending && (
                <PromotionChoice
                    color={gameState.promotionPending.color}
                    onPromote={handlePromotion}
                />
            )}
            {/* GameOverModal removed from here */}
          </div>
        );
      case 'start':
      default:
        return (
          <StartMenu
            onStartGame={handleStartGameRequest}
            onShowLeaderboard={() => setView('leaderboard')}
            onShowRules={() => setIsRulesModalOpen(true)}
            onShowSettings={() => setIsSettingsModalOpen(true)}
          />
        );
    }
  };

  return (
    <>
        {renderContent()}

        <NameEntryModal 
            isOpen={isNameEntryOpen}
            onClose={() => setIsNameEntryOpen(false)}
            onStart={handleNameEntryStart}
        />
        
        {/* Fix: Corrected the game rules to be accurate. */}
        <Modal title="Game Rules" isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)}>
            <div className="space-y-4 text-gray-300">
                <p><strong>Objective:</strong> Checkmate the opponent's King (🎃).</p>
                <p><strong>Checkmate:</strong> When the opponent's King is in check and cannot make any legal moves to escape.</p>
                <p><strong>Stalemate:</strong> If a player is not in check but has no legal moves, the game is a draw.</p>
                <p><strong>Time:</strong> Each player has 5 minutes. If your time runs out, you lose the game.</p>
                <p>Each piece has unique moves. White (your team, with orange outlines) moves first.</p>
                <p>If your pawn (💀) reaches the opposite end of the board, it can be promoted to a more powerful piece.</p>
                <p>The game ends by checkmate, stalemate, timeout, or after 50 moves (resulting in a draw).</p>
            </div>
        </Modal>

        <Modal title="Settings" isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)}>
            <p className="text-gray-300">Settings are not yet implemented. Stay tuned for spooky updates!</p>
        </Modal>
    </>
  );
};

export default App;