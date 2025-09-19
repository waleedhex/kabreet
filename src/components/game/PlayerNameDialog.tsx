import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy } from 'lucide-react';

interface PlayerNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
  score: number;
  moves: number;
  timeSeconds: number;
}

const PlayerNameDialog: React.FC<PlayerNameDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  score,
  moves,
  timeSeconds
}) => {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerName.trim() || 'لاعب مجهول';
    onSubmit(name);
    setPlayerName('');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}د ${remainingSeconds}ث` : `${remainingSeconds}ث`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-game-panel border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Trophy className="w-6 h-6 text-primary" />
            مبروك! تم حل اللغز
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* عرض النتائج */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-game-board rounded-lg">
              <div className="text-2xl font-bold text-primary">{score}</div>
              <div className="text-sm text-muted-foreground">النقاط</div>
            </div>
            <div className="p-3 bg-game-board rounded-lg">
              <div className="text-2xl font-bold text-accent">{moves}</div>
              <div className="text-sm text-muted-foreground">حركة</div>
            </div>
            <div className="p-3 bg-game-board rounded-lg">
              <div className="text-2xl font-bold text-warning">{formatTime(timeSeconds)}</div>
              <div className="text-sm text-muted-foreground">الوقت</div>
            </div>
          </div>

          {/* إدخال اسم اللاعب */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium mb-2">
                اسم اللاعب (اختياري)
              </label>
              <Input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="أدخل اسمك..."
                className="bg-game-bg border-border"
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="submit" 
                variant="success" 
                className="flex-1"
              >
                حفظ النتيجة
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onSubmit(playerName.trim() || 'لاعب مجهول')}
                className="flex-1"
              >
                تخطي
              </Button>
            </div>
          </form>
          
          <p className="text-xs text-muted-foreground text-center">
            سيتم حفظ نتيجتك في لوحة المتصدرين المحلية
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerNameDialog;