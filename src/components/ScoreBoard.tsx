import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, ArrowRight } from 'lucide-react';
import { GameSettings } from '@/types/game';

interface ScoreBoardProps {
  settings: GameSettings;
  onClose: () => void;
}

const ScoreBoard = ({ settings, onClose }: ScoreBoardProps) => {
  const sortedPlayers = [...settings.players].sort((a, b) => b.score - a.score);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return <span className="h-6 w-6 flex items-center justify-center text-lg font-bold">{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      case 1:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30";
      case 2:
        return "bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/30";
      default:
        return "bg-muted/50 border-border";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-xs sm:max-w-md lg:max-w-2xl h-[80vh] sm:h-auto sm:max-h-[75vh] overflow-hidden flex flex-col">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg sm:text-2xl flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            لوحة النتائج
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-3 sm:p-6">
          {settings.players.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا يوجد لاعبون مسجلون</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto pr-2">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${getRankColor(index)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index)}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm truncate">{player.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          الترتيب: {index + 1}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-primary">
                        {player.score}
                      </div>
                      <div className="text-xs text-muted-foreground">نقطة</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="border-t pt-3 mt-4">
            <Button onClick={onClose} className="w-full" size="sm">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة للعبة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreBoard;