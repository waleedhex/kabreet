import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Target, Star } from 'lucide-react';

interface LeaderboardEntry {
  name: string;
  score: number;
  moves: number;
  timeSeconds: number;
}

interface LeaderboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: LeaderboardEntry[];
  onClearLeaderboard: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  open, 
  onOpenChange, 
  players, 
  onClearLeaderboard 
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // تحويل الوقت لصيغة قابلة للقراءة
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}د ${remainingSeconds}ث` : `${remainingSeconds}ث`;
  };

  // تحديد مستوى الأداء
  const getPerformanceLevel = (score: number, moves: number) => {
    if (score >= 900 && moves <= 5) return { level: 'ممتاز', color: 'text-success', icon: Star };
    if (score >= 700 && moves <= 10) return { level: 'جيد جداً', color: 'text-primary', icon: Trophy };
    if (score >= 500 && moves <= 15) return { level: 'جيد', color: 'text-warning', icon: Target };
    return { level: 'مقبول', color: 'text-muted-foreground', icon: Clock };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-game-panel border-border landscape:max-w-lg landscape:w-full landscape:mx-4 landscape:max-h-[85vh] landscape:overflow-auto">
        <DialogHeader className="landscape:pb-2">
          <DialogTitle className="flex items-center gap-2 text-base landscape:text-sm">
            <Trophy className="w-5 h-5 landscape:w-4 landscape:h-4 text-primary" />
            نتائج اللاعبين
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 landscape:space-y-2">
          {sortedPlayers.length === 0 ? (
            <div className="text-center py-6 landscape:py-4 text-muted-foreground">
              <Trophy className="w-10 h-10 landscape:w-8 landscape:h-8 mx-auto mb-3 landscape:mb-2 opacity-50" />
              <p className="text-sm landscape:text-xs">لا توجد نتائج بعد</p>
            </div>
          ) : (
            <div className="space-y-2 landscape:space-y-1 max-h-80 landscape:max-h-56 overflow-y-auto">
              {sortedPlayers.map((player, index) => {
                const performance = getPerformanceLevel(player.score, player.moves);
                const IconComponent = performance.icon;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 landscape:gap-2 p-3 landscape:p-2 rounded-lg border transition-all duration-200 ${
                      index === 0 ? 'bg-primary/10 border-primary/30' : 
                      index === 1 ? 'bg-accent/10 border-accent/30' : 
                      index === 2 ? 'bg-warning/10 border-warning/30' : 
                      'bg-game-board border-border'
                    }`}
                  >
                    {/* المرتبة */}
                    <div className="flex-shrink-0 w-7 h-7 landscape:w-6 landscape:h-6 rounded-full bg-game-bg flex items-center justify-center font-bold text-xs landscape:text-[10px]">
                      {index < 3 ? (
                        <span className={
                          index === 0 ? 'text-primary' :
                          index === 1 ? 'text-accent' :
                          'text-warning'
                        }>
                          {index + 1}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{index + 1}</span>
                      )}
                    </div>

                    {/* تفاصيل اللاعب */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 landscape:gap-1 mb-1 landscape:mb-0">
                        <h3 className="font-semibold text-sm landscape:text-xs truncate">{player.name}</h3>
                        <IconComponent className={`w-3 h-3 landscape:w-2 landscape:h-2 ${performance.color}`} />
                      </div>
                      <div className="flex items-center gap-3 landscape:gap-2 mt-1 landscape:mt-0 text-xs landscape:text-[10px]">
                        <div className="flex items-center gap-1 landscape:gap-0.5">
                          <Star className="w-3 h-3 landscape:w-2 landscape:h-2 text-primary" />
                          <span>{player.score} نقطة</span>
                        </div>
                        <div className="flex items-center gap-1 landscape:gap-0.5">
                          <Target className="w-3 h-3 landscape:w-2 landscape:h-2 text-accent" />
                          <span>{player.moves} ألغاز</span>
                        </div>
                      </div>
                    </div>

                    {/* مستوى الأداء */}
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-xs landscape:text-[10px] font-medium ${performance.color}`}>
                        {performance.level}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="flex gap-2 landscape:gap-1 mt-4 landscape:mt-3">
            <Button 
              onClick={onClearLeaderboard}
              variant="outline"
              size="sm"
              className="flex-1 text-xs landscape:text-[10px] landscape:h-8"
              disabled={sortedPlayers.length === 0}
            >
              إعادة تعيين النقاط
            </Button>
            <Button 
              onClick={() => onOpenChange(false)}
              variant="game"
              size="sm"
              className="flex-1 text-xs landscape:text-[10px] landscape:h-8"
            >
              إغلاق
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Leaderboard;