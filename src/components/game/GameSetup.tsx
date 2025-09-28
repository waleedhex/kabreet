import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Users, Clock, Play, Plus, Trash2, Download } from 'lucide-react';
import PWAInstallDialog from '../PWAInstallDialog';
import { isPWAMode } from '@/utils/pwaUtils';

interface Player {
  id: string;
  name: string;
}

interface GameSetupProps {
  onStartGame: (players: Player[], timeLimit: number) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '' }
  ]);
  const [timeLimit, setTimeLimit] = useState([3]); // في دقائق
  const [showPWADialog, setShowPWADialog] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  // تحديد وضع PWA عند التحميل
  useEffect(() => {
    setIsPWA(isPWAMode());
  }, []);
  
  const addPlayer = () => {
    setPlayers([...players, { 
      id: Date.now().toString(), 
      name: '' 
    }]);
  };
  
  const removePlayer = (id: string) => {
    if (players.length > 1) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };
  
  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(p => 
      p.id === id ? { ...p, name: name.trim() } : p
    ));
  };
  
  const handleStartGame = () => {
    const validPlayers = players
      .filter(p => p.name.trim() !== '')
      .map((p, index) => ({ 
        ...p, 
        name: p.name.trim() || `لاعب ${index + 1}`
      }));
    
    if (validPlayers.length === 0) {
      validPlayers.push({ id: '1', name: 'لاعب 1' });
    }
    
    onStartGame(validPlayers, timeLimit[0]);
  };
  
  const formatTime = (minutes: number) => {
    if (minutes === 0) return 'بدون وقت';
    return minutes === 1 ? 'دقيقة واحدة' : `${minutes} دقائق`;
  };

  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-game-panel border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
            <Users className="w-8 h-8" />
            إعدادات لعبة الكبريت
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            أضف أسماء اللاعبين واختر مدة الجولة
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* قسم اللاعبين */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <Label className="text-lg font-semibold">اللاعبون</Label>
              <span className="text-sm text-muted-foreground">
                ({players.length})
              </span>
            </div>
            
            <div className="grid gap-3 max-h-80 overflow-y-auto pr-2">
              {players.map((player, index) => (
                <div key={player.id} className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {index + 1}
                  </div>
                  <Input
                    placeholder={`اسم اللاعب ${index + 1}`}
                    value={player.name}
                    onChange={(e) => updatePlayerName(player.id, e.target.value)}
                    className="flex-1 bg-game-bg border-border"
                    maxLength={20}
                  />
                  {players.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removePlayer(player.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={addPlayer}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة لاعب جديد
            </Button>
          </div>
          
          {/* قسم التوقيت */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <Label className="text-lg font-semibold">مدة كل جولة</Label>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">
                  {formatTime(timeLimit[0])}
                </span>
              </div>
              
              <Slider
                value={timeLimit}
                onValueChange={setTimeLimit}
                min={0}
                max={5}
                step={1}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>بدون وقت</span>
                <span>5 دقائق</span>
              </div>
            </div>
          </div>
          
          {/* أزرار الإعدادات */}
          <div className={isPWA ? "w-full" : "grid grid-cols-2 gap-3"}>
            {/* زر تحميل التطبيق - يظهر فقط إذا لم يكن PWA */}
            {!isPWA && (
              <Button
                onClick={() => setShowPWADialog(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                تحميل كتطبيق
              </Button>
            )}
            
            <Button
              onClick={handleStartGame}
              size="lg"
              variant="game"
              className={`flex items-center gap-2 ${isPWA ? 'w-full' : ''}`}
            >
              <Play className="w-5 h-5" />
              بدء اللعبة
            </Button>
          </div>
          
        </CardContent>
      </Card>
      
      {/* نافذة تعليمات PWA - تظهر فقط إذا لم يكن PWA */}
      {!isPWA && (
        <PWAInstallDialog 
          open={showPWADialog} 
          onClose={() => setShowPWADialog(false)} 
        />
      )}
    </div>
  );
};

export default GameSetup;