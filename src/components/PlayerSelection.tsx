import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Player } from '@/types/game';
import { User, SkipForward, Trophy } from 'lucide-react';

interface PlayerSelectionProps {
  players: Player[];
  stepsUsed: number;
  totalMoves: number;
  onPlayerSelect: (playerId: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

const PlayerSelection = ({ 
  players, 
  stepsUsed, 
  totalMoves, 
  onPlayerSelect, 
  onSkip, 
  onClose 
}: PlayerSelectionProps) => {
  const finalPoints = Math.max(0, totalMoves - stepsUsed);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-lg lg:max-w-4xl h-[76vh] lg:h-[64vh] overflow-hidden flex flex-col
                     lg:grid lg:grid-cols-2 lg:gap-6">
        <CardHeader className="text-center lg:col-span-2">
          <CardTitle className="text-lg sm:text-xl flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            اختر اللاعب الذي حل اللغز
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 lg:col-span-2">
          {/* معلومات النقاط */}
          <div className="bg-muted/30 rounded-lg p-3 sm:p-4 text-center lg:col-span-2">
            <div className="text-lg sm:text-xl font-semibold text-primary">
              النقاط المتاحة: {finalPoints}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              إجمالي الحركات: {totalMoves} | المساعدات المستخدمة: {stepsUsed}
            </div>
          </div>

          {/* قائمة اللاعبين */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-60 lg:max-h-80 overflow-y-auto pr-2 lg:col-span-2">
            {players.map((player) => (
              <Button
                key={player.id}
                onClick={() => onPlayerSelect(player.id)}
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                <div className="flex-1 text-right">
                  <div className="font-medium text-sm sm:text-base">{player.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    النقاط الحالية: {player.score}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-2 pt-4 lg:col-span-2">
            <Button
              onClick={onSkip}
              variant="outline"
              className="flex-1"
            >
              <SkipForward className="h-4 w-4 ml-2" />
              تخطي (لا نقاط)
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerSelection;