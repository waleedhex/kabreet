import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Clock, User } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  score: number;
  solvedPuzzles: number;
}

interface PlayerSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  score: number;
  moves: number;
  timeSeconds: number;
  onSelectPlayer: (playerId: string) => void;
}

const PlayerSelectionDialog: React.FC<PlayerSelectionDialogProps> = ({ 
  open, 
  onOpenChange, 
  players,
  score,
  moves,
  timeSeconds,
  onSelectPlayer
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}د ${remainingSeconds}ث` : `${remainingSeconds}ث`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-game-panel border-border landscape:max-w-md landscape:w-full landscape:mx-4 landscape:max-h-[85vh] landscape:overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            اختيار اللاعب المستحق للنقاط
          </DialogTitle>
          <DialogDescription>
            اختر اللاعب الذي يستحق النقاط لحل هذا اللغز
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* عرض تفاصيل النقاط */}
          <div className="bg-game-board rounded-lg p-3 landscape:p-2 space-y-2 landscape:space-y-1">
            <h3 className="font-semibold text-primary text-center text-sm landscape:text-xs">تفاصيل النقاط</h3>
            <div className="grid grid-cols-3 gap-3 landscape:gap-2 text-center">
              <div className="space-y-1 landscape:space-y-0">
                <Trophy className="w-4 h-4 landscape:w-3 landscape:h-3 mx-auto text-success" />
                <p className="text-lg landscape:text-sm font-bold text-success">{score}</p>
                <p className="text-xs landscape:text-[10px] text-muted-foreground">النقاط</p>
              </div>
              <div className="space-y-1 landscape:space-y-0">
                <Target className="w-4 h-4 landscape:w-3 landscape:h-3 mx-auto text-accent" />
                <p className="text-lg landscape:text-sm font-bold text-accent">{moves}</p>
                <p className="text-xs landscape:text-[10px] text-muted-foreground">الحركات</p>
              </div>
              <div className="space-y-1 landscape:space-y-0">
                <Clock className="w-4 h-4 landscape:w-3 landscape:h-3 mx-auto text-warning" />
                <p className="text-lg landscape:text-sm font-bold text-warning">{formatTime(timeSeconds)}</p>
                <p className="text-xs landscape:text-[10px] text-muted-foreground">الوقت</p>
              </div>
            </div>
          </div>

          {/* قائمة اللاعبين */}
          <div className="space-y-2 landscape:space-y-1">
            <h3 className="font-semibold text-foreground text-sm landscape:text-xs">اختر اللاعب:</h3>
            <div className="space-y-2 landscape:space-y-1 max-h-48 landscape:max-h-32 overflow-y-auto">
              {players.map((player) => (
                <Button
                  key={player.id}
                  onClick={() => onSelectPlayer(player.id)}
                  variant="outline"
                  className="w-full justify-start p-3 landscape:p-2 h-auto hover:bg-primary/10 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3 landscape:gap-2 w-full">
                    <div className="flex-shrink-0">
                      <User className="w-4 h-4 landscape:w-3 landscape:h-3 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm landscape:text-xs">{player.name}</p>
                      <div className="flex items-center gap-2 landscape:gap-1 mt-1 landscape:mt-0">
                        <Badge variant="secondary" className="text-xs landscape:text-[10px]">
                          {player.score} نقطة
                        </Badge>
                        <Badge variant="outline" className="text-xs landscape:text-[10px]">
                          {player.solvedPuzzles} حل
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Trophy className="w-3 h-3 landscape:w-2 landscape:h-2 text-muted-foreground" />
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* زر الإغلاق */}
          <div className="flex gap-2 landscape:gap-1 pt-2 landscape:pt-1">
            <Button 
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="sm"
              className="flex-1 text-xs landscape:text-[10px] landscape:h-8"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSelectionDialog;