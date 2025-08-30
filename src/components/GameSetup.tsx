import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, Play, Users, Smartphone } from 'lucide-react';
import { GameSettings, Player, GamePuzzle } from '@/types/game';
import { PuzzleService } from '@/services/puzzleService';
import PWAInstallPrompt from './PWAInstallPrompt';
import { toast } from 'sonner';

interface GameSetupProps {
  onStartGame: (settings: GameSettings, puzzle: GamePuzzle) => void;
}

const GameSetup = ({ onStartGame }: GameSetupProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [timeLimit, setTimeLimit] = useState([0]); // in minutes
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        score: 0
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      toast.success(`تم إضافة اللاعب ${newPlayerName}`);
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    toast.success('تم حذف اللاعب');
  };


  const handleStartGame = async () => {
    try {
      const puzzle = await PuzzleService.getRandomPuzzle([]);
      
      const settings: GameSettings = {
        timeLimit: timeLimit[0] * 60, // convert to seconds
        players: players
      };

      onStartGame(settings, puzzle);
      // toast.success('لنبدأ اللعب! 🔥'); // تم إلغاء التوست
    } catch (error) {
      toast.error('خطأ في تحميل اللغز. حاول مرة أخرى');
      console.error('Error loading puzzle:', error);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes === 0) return 'بدون وقت محدد';
    return `${minutes} دقيقة`;
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-card to-game-surface overflow-hidden">
      <Card className="w-full max-w-2xl game-card animate-scale-in max-h-[95vh] overflow-y-auto">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            لعبة ألغاز الكباريت
          </CardTitle>
          <p className="text-muted-foreground text-lg mt-2">
            اختبر ذكاءك وحل الألغاز بتحريك أعواد الكباريت
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Players Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <Label className="text-lg font-semibold">سجل أسماء اللاعبين أو الفرق</Label>
            </div>
            
            <div className="space-y-3">
              {players.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                  {players.map((player, index) => (
                    <div key={player.id} className="flex gap-2">
                      <div className="flex-1 bg-muted/50 rounded-md px-3 py-2 border">
                        <span className="text-sm font-medium">{player.name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removePlayer(player.id)}
                        className="shrink-0 border-destructive/20 hover:border-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="اسم اللاعب أو الفريق"
                  onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                  className="flex-1 text-base"
                  style={{ fontSize: '16px' }}
                />
                <Button
                  onClick={addPlayer}
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-primary/20 hover:border-primary hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4 text-primary" />
                </Button>
              </div>
              
              {players.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  لم يتم إضافة أي لاعبين بعد. يمكنك اللعب بدون تسجيل نقاط.
                </p>
              )}
            </div>
          </div>

          {/* Time Limit Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">الوقت المحدد للحل</Label>
            <div className="space-y-3">
              <Slider
                value={timeLimit}
                onValueChange={setTimeLimit}
                max={5}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">
                  {formatTime(timeLimit[0])}
                </span>
              </div>
            </div>
          </div>

          {/* Start Game Button */}
          <Button
            onClick={handleStartGame}
            size="lg"
            className="w-full text-lg font-semibold py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play className="h-6 w-6 ml-2" />
            ابدأ اللعب
          </Button>

          {/* PWA Install Button */}
          <Button
            onClick={() => setShowPWAPrompt(true)}
            variant="outline"
            size="lg"
            className="w-full text-lg font-semibold py-6 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300"
          >
            <Smartphone className="h-6 w-6 ml-2" />
            حفظ كتطبيق
          </Button>
        </CardContent>
      </Card>

      {/* PWA Install Prompt */}
      {showPWAPrompt && (
        <PWAInstallPrompt onClose={() => setShowPWAPrompt(false)} />
      )}
    </div>
  );
};

export default GameSetup;