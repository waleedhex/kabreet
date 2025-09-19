import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, RotateCcw, Play, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Users } from 'lucide-react';
import Leaderboard from './Leaderboard';
import PlayerNameDialog from './PlayerNameDialog';

interface Transform {
  x: number;
  y: number;
  r: number;
  s: number;
}

interface Matchstick {
  id?: number;
  start: Transform;
  target: Transform;
  step?: number;
}

interface PuzzleData {
  version?: number;
  title: string;
  instructions: string;
  animation?: {
    duration: number;
    easing: string;
    blinkTimes: number;
    blinkInterval: number;
  };
  sticks: Matchstick[];
}

interface GameStats {
  moves: number;
  score: number;
  startTime: number;
}

const MatchstickGame: React.FC = () => {
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [currentSticks, setCurrentSticks] = useState<Matchstick[]>([]);
  const [selectedSticks, setSelectedSticks] = useState<number[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({ moves: 0, score: 1000, startTime: Date.now() });
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحميل ملف JSON
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: PuzzleData = JSON.parse(e.target?.result as string);
        setPuzzleData(data);
        setCurrentSticks(data.sticks.map((stick, i) => ({
          ...stick,
          id: i,
          start: { ...stick.start, s: stick.start.s || 1 },
          target: { ...stick.target, s: stick.target.s || 1 }
        })));
        setGameStats({ moves: 0, score: 1000, startTime: Date.now() });
        setIsPlaying(false);
        setGameCompleted(false);
        setSelectedSticks([]);
        toast({
          title: "تم تحميل اللغز بنجاح",
          description: data.title || "لغز كباريت جديد"
        });
      } catch (error) {
        toast({
          title: "خطأ في تحميل الملف",
          description: "تأكد من أن الملف بصيغة JSON صحيحة",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  }, [toast]);

  // بدء اللعبة
  const startGame = useCallback(() => {
    if (!puzzleData) return;
    setIsPlaying(true);
    setGameCompleted(false);
    setGameStats({ moves: 0, score: 1000, startTime: Date.now() });
    // إعادة تعيين الأعواد للوضع الأولي
    setCurrentSticks(puzzleData.sticks.map((stick, i) => ({
      ...stick,
      id: i,
      start: { ...stick.start },
      target: { ...stick.target }
    })));
    setSelectedSticks([]);
  }, [puzzleData]);

  // إعادة تعيين اللعبة
  const resetGame = useCallback(() => {
    if (!puzzleData) return;
    setCurrentSticks(puzzleData.sticks.map((stick, i) => ({
      ...stick,
      id: i,
      start: { ...stick.start },
      target: { ...stick.target }
    })));
    setSelectedSticks([]);
    setGameStats(prev => ({ ...prev, moves: 0, score: 1000 }));
  }, [puzzleData]);

  // تحريك الأعواد المحددة
  const moveSelectedSticks = useCallback((dx: number, dy: number) => {
    if (!isPlaying || selectedSticks.length === 0) return;

    setCurrentSticks(prev => prev.map((stick, index) => {
      if (selectedSticks.includes(index)) {
        return {
          ...stick,
          start: {
            ...stick.start,
            x: stick.start.x + dx,
            y: stick.start.y + dy
          }
        };
      }
      return stick;
    }));

    // تحديث النقاط (خصم نقاط مقابل كل حركة)
    setGameStats(prev => ({
      ...prev,
      moves: prev.moves + 1,
      score: Math.max(0, prev.score - 10)
    }));
  }, [isPlaying, selectedSticks]);

  // تدوير الأعواد المحددة
  const rotateSelectedSticks = useCallback((angle: number) => {
    if (!isPlaying || selectedSticks.length === 0) return;

    setCurrentSticks(prev => prev.map((stick, index) => {
      if (selectedSticks.includes(index)) {
        return {
          ...stick,
          start: {
            ...stick.start,
            r: stick.start.r + angle
          }
        };
      }
      return stick;
    }));

    setGameStats(prev => ({
      ...prev,
      moves: prev.moves + 1,
      score: Math.max(0, prev.score - 10)
    }));
  }, [isPlaying, selectedSticks]);

  // فحص الحل
  const checkSolution = useCallback(() => {
    if (!puzzleData || !isPlaying) return;

    let correctSticks = 0;
    currentSticks.forEach((stick, index) => {
      const target = puzzleData.sticks[index].target;
      const current = stick.start;
      
      const distance = Math.sqrt(
        Math.pow(current.x - target.x, 2) + 
        Math.pow(current.y - target.y, 2)
      );
      const rotationDiff = Math.abs(((current.r - target.r) + 540) % 360 - 180);
      const scaleDiff = Math.abs(current.s - target.s);

      if (distance < 16 && rotationDiff < 6 && scaleDiff < 0.05) {
        correctSticks++;
      }
    });

    if (correctSticks === currentSticks.length && currentSticks.length > 0) {
      setGameCompleted(true);
      setIsPlaying(false);
      const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - gameStats.startTime) / 1000));
      const finalScore = gameStats.score + timeBonus;
      
      toast({
        title: "🎉 ممتاز! تم حل اللغز",
        description: `النقاط النهائية: ${finalScore} (الحركات: ${gameStats.moves})`,
        variant: "default"
      });
    } else {
      toast({
        title: `تبقى ${currentSticks.length - correctSticks} عود`,
        description: "استمر في المحاولة!",
        variant: "default"
      });
    }
  }, [puzzleData, isPlaying, currentSticks, gameStats, toast]);

  // التحكم بالكيبورد
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isPlaying) return;

      const moveStep = 8;
      const rotateStep = 10;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          moveSelectedSticks(0, -moveStep);
          break;
        case 'ArrowDown':
          event.preventDefault();
          moveSelectedSticks(0, moveStep);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          moveSelectedSticks(-moveStep, 0);
          break;
        case 'ArrowRight':
          event.preventDefault();
          moveSelectedSticks(moveStep, 0);
          break;
        case 'q':
        case 'Q':
          event.preventDefault();
          rotateSelectedSticks(-rotateStep);
          break;
        case 'e':
        case 'E':
          event.preventDefault();
          rotateSelectedSticks(rotateStep);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, moveSelectedSticks, rotateSelectedSticks]);

  // رسم عود الكبريت SVG
  const renderMatchstick = (stick: Matchstick, index: number, isSelected: boolean) => {
    const transform = stick.start;
    const scale = transform.s || 1;
    
    return (
      <g
        key={index}
        transform={`translate(${transform.x} ${transform.y}) rotate(${transform.r} ${100 * scale} 0) scale(${scale})`}
        className={`cursor-pointer transition-all duration-200 ${
          isSelected ? 'filter drop-shadow-lg' : ''
        } ${isPlaying ? 'hover:brightness-110' : ''}`}
        onClick={() => {
          if (!isPlaying) return;
          setSelectedSticks(prev => 
            prev.includes(index) 
              ? prev.filter(i => i !== index)
              : [...prev, index]
          );
        }}
      >
        {/* جسم العود الخشبي */}
        <rect
          x="0"
          y="-6"
          width="200"
          height="12"
          rx="6"
          className="fill-matchstick-wood stroke-matchstick-shadow"
          strokeWidth="1"
        />
        
        {/* رأس الكبريت */}
        <rect
          x="-16"
          y="-9"
          width="28"
          height="18"
          rx="9"
          className="fill-matchstick-head"
        />
        
        {/* اللمعة */}
        <rect
          x="-10"
          y="-9"
          width="8"
          height="18"
          className="fill-matchstick-shine opacity-25"
        />
        
        {/* رقم الخطوة إذا كان موجود */}
        {stick.step && stick.step > 0 && (
          <text
            x="100"
            y="5"
            fill="white"
            fontSize="20"
            textAnchor="middle"
            className="font-bold"
          >
            {stick.step}
          </text>
        )}
        
        {/* هالة التحديد */}
        {isSelected && (
          <rect
            x="-20"
            y="-12"
            width="240"
            height="24"
            rx="12"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        )}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-game-bg p-4">
      <div className="max-w-7xl mx-auto">
        {/* الهيدر */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            ألغاز الكباريت
          </h1>
          <p className="text-muted-foreground">حرّك الأعواد لحل اللغز واكسب النقاط</p>
        </div>

        {/* لوحة التحكم العلوية */}
        <Card className="mb-6 p-4 bg-game-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="game"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                تحميل لغز
              </Button>
              
              {puzzleData && (
                <>
                  <Button
                    variant="success"
                    onClick={startGame}
                    disabled={isPlaying}
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    ابدأ اللعب
                  </Button>
                  
                  <Button
                    variant="control"
                    onClick={resetGame}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    إعادة تعيين
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className="gap-2"
                  >
                    <Users className="w-4 h-4" />
                    المتصدرين
                  </Button>
                </>
              )}
            </div>

            {/* إحصائيات اللعبة */}
            {isPlaying && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span>النقاط: {gameStats.score}</span>
                </div>
                <div>الحركات: {gameStats.moves}</div>
                <div>المحدد: {selectedSticks.length} عود</div>
              </div>
            )}
          </div>
        </Card>

        {puzzleData ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* لوحة اللعب */}
            <div className="lg:col-span-3">
              <Card className="p-4 bg-game-board">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">{puzzleData.title}</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{puzzleData.instructions}</p>
                </div>
                
                <div className="relative bg-gradient-board rounded-lg p-2 sm:p-4 min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
                  <svg
                    viewBox="0 0 960 540"
                    className="w-full h-full max-w-full max-h-[280px] sm:max-h-[480px]"
                    style={{ aspectRatio: '16/9' }}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* رسم الأعواد الهدف (خافت) */}
                    {isPlaying && currentSticks.map((stick, index) => {
                      const target = puzzleData.sticks[index].target;
                      const scale = target.s || 1;
                      return (
                        <g
                          key={`target-${index}`}
                          transform={`translate(${target.x} ${target.y}) rotate(${target.r} ${100 * scale} 0) scale(${scale})`}
                          className="opacity-20"
                        >
                          <rect
                            x="0"
                            y="-6"
                            width="200"
                            height="12"
                            rx="6"
                            fill="none"
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                          />
                        </g>
                      );
                    })}
                    
                    {/* رسم الأعواد الحالية */}
                    {currentSticks.map((stick, index) => 
                      renderMatchstick(stick, index, selectedSticks.includes(index))
                    )}
                  </svg>
                </div>

                {isPlaying && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="success"
                      onClick={checkSolution}
                      className="gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      فحص الحل
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* لوحة التحكم الجانبية */}
            <div className="space-y-4">
              {showLeaderboard && <Leaderboard 
                open={showLeaderboard}
                onOpenChange={setShowLeaderboard}
                players={[]}
                onClearLeaderboard={() => {}}
              />}
              {/* أزرار التحكم */}
              {isPlaying && (
                <Card className="p-4 bg-game-panel">
                  <h3 className="font-semibold mb-4">التحكم في الأعواد</h3>
                  
                  {selectedSticks.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        محدد: {selectedSticks.length} عود
                      </p>
                      
                      {/* أزرار الحركة */}
                      <div className="grid grid-cols-3 gap-2">
                        <div></div>
                        <Button
                          variant="control"
                          size="sm"
                          onClick={() => moveSelectedSticks(0, -8)}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <div></div>
                        
                        <Button
                          variant="control"
                          size="sm"
                          onClick={() => moveSelectedSticks(-8, 0)}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div className="text-xs text-center text-muted-foreground">حرّك</div>
                        <Button
                          variant="control"
                          size="sm"
                          onClick={() => moveSelectedSticks(8, 0)}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                        
                        <div></div>
                        <Button
                          variant="control"
                          size="sm"
                          onClick={() => moveSelectedSticks(0, 8)}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <div></div>
                      </div>

                      {/* أزرار التدوير */}
                      <div className="flex gap-2">
                        <Button
                          variant="control"
                          size="sm"
                          onClick={() => rotateSelectedSticks(-10)}
                          className="flex-1"
                        >
                          ↺ -10°
                        </Button>
                        <Button
                          variant="control"
                          size="sm"
                          onClick={() => rotateSelectedSticks(10)}
                          className="flex-1"
                        >
                          ↻ +10°
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      اختر عودًا أو أكثر للتحكم به
                    </p>
                  )}
                </Card>
              )}

              {/* تعليمات التحكم */}
              <Card className="p-4 bg-game-panel">
                <h3 className="font-semibold mb-2">التحكم بالكيبورد</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>الأسهم: تحريك الأعواد</div>
                  <div>Q/E: تدوير يسار/يمين</div>
                  <div>النقر: تحديد/إلغاء تحديد</div>
                </div>
              </Card>

              {gameCompleted && (
                <Card className="p-4 bg-success text-success-foreground text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-bold">تم حل اللغز!</h3>
                  <p className="text-sm">النقاط: {gameStats.score}</p>
                  <p className="text-sm">الحركات: {gameStats.moves}</p>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center bg-game-panel">
            <h2 className="text-xl font-semibold mb-4">مرحباً بك في ألغاز الكباريت</h2>
            <p className="text-muted-foreground mb-6">
              قم بتحميل ملف JSON للغز الكباريت لتبدأ اللعب
            </p>
            <Button
              variant="game"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              اختر ملف اللغز
            </Button>
          </Card>
        )}

        {/* Dialog لإدخال اسم اللاعب */}
        {showNameDialog && (
          <PlayerNameDialog
            open={showNameDialog}
            onOpenChange={setShowNameDialog}
            onSubmit={(name) => {
              setShowNameDialog(false);
              toast({
                title: "تم حفظ النتيجة!",
                description: "تحقق من لوحة المتصدرين"
              });
            }}
            score={gameStats.score}
            moves={gameStats.moves}
            timeSeconds={Math.floor((Date.now() - gameStats.startTime) / 1000)}
          />
        )}
      </div>
    </div>
  );
};

export default MatchstickGame;