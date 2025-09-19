import React, { useState, useEffect } from 'react';
import GameSetup from '@/components/game/GameSetup';
import MultiPlayerGame from '@/components/game/MultiPlayerGame';
import LoginScreen from '@/components/auth/LoginScreen';

interface Player {
  id: string;
  name: string;
  score: number;
  solvedPuzzles: number;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [timeLimit, setTimeLimit] = useState(3);

  // تنظيف أي حفظ سابق لحالة الدخول
  useEffect(() => {
    localStorage.removeItem('matchstick_auth');
    localStorage.removeItem('matchstick_auth_time');
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleStartGame = (setupPlayers: Array<{id: string; name: string}>, time: number) => {
    const gamePlayers: Player[] = setupPlayers.map(p => ({
      ...p,
      score: 0,
      solvedPuzzles: 0
    }));
    
    setPlayers(gamePlayers);
    setTimeLimit(time);
    setGameStarted(true);
  };

  const handleBackToSetup = () => {
    setGameStarted(false);
    setPlayers([]);
    setTimeLimit(3);
  };

  // عرض شاشة تسجيل الدخول إذا لم يتم التحقق من الهوية
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }
  // عرض شاشة الإعدادات أو اللعبة
  if (!gameStarted) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  return (
    <MultiPlayerGame 
      players={players}
      timeLimit={timeLimit}
      onBackToSetup={handleBackToSetup}
    />
  );
};

export default Index;
