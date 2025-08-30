import { useState } from 'react';
import Login from '@/components/Login';
import GameSetup from '@/components/GameSetup';
import GamePlay from '@/components/GamePlay';
import { GameState, GameSettings, GamePuzzle } from '@/types/game';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentPuzzle: null,
    puzzleIndex: 0,
    showSolution: false,
    showStep: 0,
    timeRemaining: 0,
    isPlaying: false,
    isPaused: false,
    settings: {
      timeLimit: 0,
      players: []
    },
    stepsUsed: 0,
    currentPlayerIndex: 0,
    usedPuzzles: []
  });

  const handleStartGame = (settings: GameSettings, puzzle: GamePuzzle) => {
    setGameState(prev => ({
      ...prev,
      currentPuzzle: puzzle,
      settings,
      timeRemaining: settings.timeLimit,
      isPlaying: true,
      isPaused: false
    }));
    setGameStarted(true);
  };

  const handleUpdateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
    setGameState({
      currentPuzzle: null,
      puzzleIndex: 0,
      showSolution: false,
      showStep: 0,
      timeRemaining: 0,
      isPlaying: false,
      isPaused: false,
      settings: {
        timeLimit: 0,
        players: []
      },
      stepsUsed: 0,
      currentPlayerIndex: 0,
      usedPuzzles: []
    });
  };

  console.log('isLoggedIn:', isLoggedIn); // للتتبع
  
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (!gameStarted) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  return (
    <GamePlay
      gameState={gameState}
      onUpdateGameState={handleUpdateGameState}
      onBackToMenu={handleBackToMenu}
    />
  );
};

export default Index;
