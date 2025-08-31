import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  RotateCcw, 
  Play, 
  Pause, 
  ChevronLeft,
  ArrowRight,
  Clock,
  SkipForward,
  Trophy,
  UserCheck
} from 'lucide-react';
import MatchstickCanvas from './MatchstickCanvas';
import ScoreBoard from './ScoreBoard';
import PlayerSelection from './PlayerSelection';
import { GameState, GamePuzzle } from '@/types/game';
import { PuzzleService } from '@/services/puzzleService';

interface GamePlayProps {
  gameState: GameState;
  onUpdateGameState: (updates: Partial<GameState>) => void;
  onBackToMenu: () => void;
}

// استخدام بيانات JSON الأصلية تماماً كما هي
const samplePuzzles: GamePuzzle[] = [
  {
    "version": 10,
    "title": "شكل",
    "instructions": "أمامك 6 أعواد. أضف 5 لتصبح 9",
    "animation": {
      "duration": 800,
      "easing": "ease-in-out",
      "blinkTimes": 3,
      "blinkInterval": 180
    },
    "sticks": [
      {
        "start": {
          "x": 73.72665405273438,
          "y": 282.9485626220703,
          "r": 90,
          "s": 1
        },
        "target": {
          "x": 73.72665405273438,
          "y": 282.9485626220703,
          "r": 90,
          "s": 1
        }
      },
      {
        "start": {
          "x": 187.1539306640625,
          "y": 283.4681854248047,
          "r": 90,
          "s": 1
        },
        "target": {
          "x": 187.1539306640625,
          "y": 283.4681854248047,
          "r": 90,
          "s": 1
        }
      },
      {
        "start": {
          "x": 289.7266540527344,
          "y": 282.9485626220703,
          "r": 90,
          "s": 1
        },
        "target": {
          "x": 289.7266540527344,
          "y": 282.9485626220703,
          "r": 90,
          "s": 1
        }
      },
      {
        "start": {
          "x": 391.1539306640625,
          "y": 283.4681854248047,
          "r": 90,
          "s": 1
        },
        "target": {
          "x": 391.1539306640625,
          "y": 283.4681854248047,
          "r": 90,
          "s": 1
        }
      },
      {
        "start": {
          "x": 497.7266540527344,
          "y": 282.9485626220703,
          "r": 90,
          "s": 1
        },
        "target": {
          "x": 497.7266540527344,
          "y": 282.9485626220703,
          "r": 90,
          "s": 1
        }
      },
      {
        "start": {
          "x": 595.1539306640625,
          "y": 283.4681854248047,
          "r": 90,
          "s": 1
        },
        "target": {
          "x": 595.1539306640625,
          "y": 283.4681854248047,
          "r": 90,
          "s": 1
        }
      },
      {
        "start": {
          "x": 349.8140869140625,
          "y": -46.731882095336914,
          "r": 0,
          "s": 0.3138428376721002
        },
        "target": {
          "x": 699.0182800292969,
          "y": 374.28209590911865,
          "r": 180,
          "s": 0.740024994425817
        }
      },
      {
        "start": {
          "x": 369.8140869140625,
          "y": -26.731882095336914,
          "r": 0,
          "s": 0.3138428376721002
        },
        "target": {
          "x": 698.5170288085938,
          "y": 181.55588912963867,
          "r": 180,
          "s": 0.740024994425817
        }
      },
      {
        "start": {
          "x": 389.8140869140625,
          "y": -6.731882095336914,
          "r": 0,
          "s": 0.3138428376721002
        },
        "target": {
          "x": 131.21202087402344,
          "y": 281.2794132232666,
          "r": 60,
          "s": 1.0619095295114962
        }
      },
      {
        "start": {
          "x": 450.829833984375,
          "y": -28.027257919311523,
          "r": 0,
          "s": 0.3138428376721002
        },
        "target": {
          "x": 451.4068603515625,
          "y": 278.9717311859131,
          "r": 60,
          "s": 0.9751235349049551
        }
      },
      {
        "start": {
          "x": 430.6485290527344,
          "y": -48.372793197631836,
          "r": 0,
          "s": 0.3138428376721002
        },
        "target": {
          "x": 700.6662902832031,
          "y": 276.095947265625,
          "r": 180,
          "s": 0.7252984970367434
        }
      }
    ]
  }
];

const GamePlay = ({ gameState, onUpdateGameState, onBackToMenu }: GamePlayProps) => {
  const [timeLeft, setTimeLeft] = useState(gameState.timeRemaining);
  const [availablePuzzles] = useState<GamePuzzle[]>(samplePuzzles);
  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);

  // Initialize with first puzzle if not set
  useEffect(() => {
    if (!gameState.currentPuzzle && availablePuzzles.length > 0) {
      onUpdateGameState({
        currentPuzzle: availablePuzzles[0],
        puzzleIndex: 0,
        timeRemaining: gameState.settings.timeLimit
      });
      setTimeLeft(gameState.settings.timeLimit);
    }
  }, [gameState.currentPuzzle, onUpdateGameState, gameState.settings.timeLimit, availablePuzzles]);

  // Timer logic
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && gameState.settings.timeLimit > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onUpdateGameState({ isPlaying: false, isPaused: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.settings.timeLimit, onUpdateGameState]);

  const toggleSolution = () => {
    if (gameState.showSolution) {
      onUpdateGameState({ 
        showSolution: false,
        showStep: 0
      });
    } else {
      startSequentialAnimation();
    }
  };

  const startSequentialAnimation = () => {
    const puzzle = gameState.currentPuzzle;
    if (!puzzle) return;

    const movingSticks = puzzle.sticks.filter(stick => 
      stick.start.x !== stick.target.x || 
      stick.start.y !== stick.target.y || 
      stick.start.r !== stick.target.r || 
      stick.start.s !== stick.target.s
    );

    let currentStep = 0;
    
    const animateNextStep = () => {
      if (currentStep >= movingSticks.length) {
      onUpdateGameState({ showSolution: true, showStep: 0 });
      return;
      }

      onUpdateGameState({ showStep: currentStep + 1 });
      currentStep++;

      setTimeout(() => {
        animateNextStep();
      }, puzzle.animation.duration + 200); // Add small delay between steps
    };

    onUpdateGameState({ showSolution: false, showStep: 0 });
    setTimeout(() => {
      animateNextStep();
    }, 500);
  };

  const showNextStep = () => {
    const puzzle = gameState.currentPuzzle;
    if (!puzzle) return;

    const movingSticks = puzzle.sticks.filter(stick => 
      stick.start.x !== stick.target.x || 
      stick.start.y !== stick.target.y || 
      stick.start.r !== stick.target.r || 
      stick.start.s !== stick.target.s
    );

    if (gameState.showStep < movingSticks.length) {
      onUpdateGameState({ 
        showStep: gameState.showStep + 1,
        stepsUsed: gameState.stepsUsed + 1
      });
    }
  };

  const resetPuzzle = () => {
    onUpdateGameState({
      showSolution: false,
      showStep: 0,
      timeRemaining: gameState.settings.timeLimit,
      isPaused: false,
      stepsUsed: 0
    });
    setTimeLeft(gameState.settings.timeLimit);
  };

  const nextPuzzle = async () => {
    try {
      console.log('جاري تحميل لغز جديد...');
      console.log('الألغاز المستخدمة حالياً:', gameState.usedPuzzles);
      
      // اختيار لغز عشوائي من مجلد الألغاز مع تجنب التكرار
      const randomPuzzle = await PuzzleService.getRandomPuzzle(gameState.usedPuzzles);
      
      // تحديث قائمة الألغاز المستخدمة
      let updatedUsedPuzzles = gameState.usedPuzzles;
      if (randomPuzzle.fileName) {
        // إذا تم استخدام جميع الألغاز، ابدأ من جديد
        if (gameState.usedPuzzles.length >= 3) { // عدد الألغاز المتاحة
          updatedUsedPuzzles = [randomPuzzle.fileName];
          console.log('تم إعادة تعيين قائمة الألغاز المستخدمة');
        } else {
          updatedUsedPuzzles = [...gameState.usedPuzzles, randomPuzzle.fileName];
        }
      }
      
      onUpdateGameState({
        currentPuzzle: randomPuzzle,
        puzzleIndex: 0,
        showSolution: false,
        showStep: 0,
        timeRemaining: gameState.settings.timeLimit,
        isPaused: false,
        stepsUsed: 0,
        usedPuzzles: updatedUsedPuzzles
      });
      setTimeLeft(gameState.settings.timeLimit);
    } catch (error) {
      // في حالة فشل التحميل، استخدم الألغاز المحلية
      const nextIndex = (gameState.puzzleIndex + 1) % availablePuzzles.length;
      onUpdateGameState({
        currentPuzzle: availablePuzzles[nextIndex],
        puzzleIndex: nextIndex,
        showSolution: false,
        showStep: 0,
        timeRemaining: gameState.settings.timeLimit,
        isPaused: false,
        stepsUsed: 0
      });
      setTimeLeft(gameState.settings.timeLimit);
    }
  };

  const handleShowPlayerSelection = () => {
    setShowPlayerSelection(true);
  };

  const handlePlayerSelect = (playerId: string) => {
    if (gameState.currentPuzzle) {
      const puzzle = gameState.currentPuzzle;
      const movingSticks = puzzle.sticks.filter(stick => 
        stick.start.x !== stick.target.x || 
        stick.start.y !== stick.target.y || 
        stick.start.r !== stick.target.r || 
        stick.start.s !== stick.target.s
      );
      
      const basePoints = movingSticks.length;
      const finalPoints = Math.max(0, basePoints - gameState.stepsUsed);
      
      // تحديث نقاط اللاعب المختار
      const updatedPlayers = [...gameState.settings.players];
      const playerIndex = updatedPlayers.findIndex(p => p.id === playerId);
      
      if (playerIndex !== -1) {
        updatedPlayers[playerIndex].score += finalPoints;
        
        onUpdateGameState({
          settings: { ...gameState.settings, players: updatedPlayers }
        });
      }
    }
    
    setShowPlayerSelection(false);
  };

  const handleSkipScoring = () => {
    setShowPlayerSelection(false);
  };

  const togglePause = () => {
    onUpdateGameState({ isPaused: !gameState.isPaused });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background to-secondary/20 overflow-hidden flex flex-col overscroll-none">
      {/* شريط المؤقت العلوي - مقلص جداً للجوال */}
      {gameState.settings.timeLimit > 0 && (
        <div className="p-1">
          <Card className="game-card">
            <CardContent className="p-1">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-3 w-3 text-primary" />
                <div className="text-center">
                  <div className="text-sm font-bold font-mono">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                {gameState.isPlaying && !gameState.isPaused && (
                  <Button onClick={togglePause} variant="outline" size="sm" className="text-xs p-1">
                    <Pause className="h-3 w-3" />
                  </Button>
                )}
                {gameState.isPaused && (
                  <Button onClick={togglePause} variant="default" size="sm" className="text-xs p-1">
                    <Play className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!gameState.currentPuzzle ? (
        <div className="flex items-center justify-center flex-1 p-4">
          <Card className="game-card max-w-md w-full">
            <CardContent className="text-center py-12 px-4">
              <h3 className="text-lg font-semibold mb-2">لا يوجد لغز محمّل</h3>
              <p className="text-muted-foreground mb-6">
                ابدأ باستخدام الألغاز المتاحة
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* تصميم متجاوب - عمودي وأفقي */
        <div className="flex-1 relative bg-gradient-to-br from-background to-secondary/20 overflow-y-auto">
          
          {/* تخطيط للوضع العمودي (portrait) - العناصر طافية */}
          <div className="portrait:block landscape:hidden relative min-h-full">
            {/* الشريط العلوي الطافي - أسفل شريط المؤقت */}
            {gameState.currentPuzzle.instructions && (
              <div className="absolute left-3 right-3 z-10" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}>
                <div className="bg-game-surface/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg animate-fade-in">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        <span>النقاط: {gameState.currentPuzzle.sticks.filter(stick => 
                          stick.start.x !== stick.target.x || 
                          stick.start.y !== stick.target.y || 
                          stick.start.r !== stick.target.r || 
                          stick.start.s !== stick.target.s
                        ).length}</span>
                      </div>
                      {gameState.stepsUsed > 0 && (
                        <div className="flex items-center gap-1 text-amber-600 text-sm">
                          <span>المساعدات: {gameState.stepsUsed}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {gameState.currentPuzzle.instructions}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* لوحة التحكم السفلى - مرفوعة أكثر مع تحسين العرض */}
            <div className="absolute left-3 right-3 z-10" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}>
              <div className="bg-game-surface/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg animate-fade-in">
                <div className="space-y-3">
                  
                  {/* الصف الأول - أزرار التحكم الرئيسية */}
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={toggleSolution}
                      variant={gameState.showSolution ? "secondary" : "default"}
                      className="text-xs flex flex-col items-center gap-1 h-12"
                      size="sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>الحل</span>
                    </Button>
                    
                    <Button
                      onClick={showNextStep}
                      variant="outline"
                      className="text-xs flex flex-col items-center gap-1 h-12"
                      size="sm"
                      disabled={gameState.showSolution}
                    >
                      <SkipForward className="h-4 w-4" />
                      <span>خطوة</span>
                    </Button>
                    
                    <Button
                      onClick={resetPuzzle}
                      variant="outline"
                      className="text-xs flex flex-col items-center gap-1 h-12"
                      size="sm"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>إعادة</span>
                    </Button>

                    <Button
                      onClick={nextPuzzle}
                      variant="outline"
                      className="text-xs flex flex-col items-center gap-1 h-12"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>التالي</span>
                    </Button>
                  </div>
                  
                  
                  {/* الصف الثاني - أزرار اللاعبين والتنقل - دائماً مرئية */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={gameState.settings.players.length > 0 ? handleShowPlayerSelection : undefined}
                      variant={gameState.settings.players.length > 0 ? "default" : "outline"}
                      className="text-xs flex flex-col items-center gap-1 h-12"
                      size="sm"
                      disabled={gameState.settings.players.length === 0}
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>نقاط</span>
                    </Button>
                    
                    <Button
                      onClick={gameState.settings.players.length > 0 ? () => setShowScoreBoard(true) : undefined}
                      variant={gameState.settings.players.length > 0 ? "secondary" : "outline"}
                      className="text-xs flex flex-col items-center gap-1 h-12"
                      size="sm"
                      disabled={gameState.settings.players.length === 0}
                    >
                      <Trophy className="h-4 w-4" />
                      <span>النتائج</span>
                    </Button>
                    
                    <Button
                      onClick={onBackToMenu}
                      variant="outline"
                      className="text-xs flex flex-col items-center gap-1 h-12"
                      size="sm"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>القائمة</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* منطقة اللعب الوسطى مع تباعد محسن يمنع التداخل */}
            <div className="flex items-center justify-center min-h-full px-4 pt-32 pb-48">
              <div className="w-full max-w-4xl">
                <MatchstickCanvas
                  puzzle={gameState.currentPuzzle}
                  showSolution={gameState.showSolution}
                  showStep={gameState.showStep}
                  onAnimationComplete={() => {
                    // يمكن إضافة منطق هنا عند انتهاء الأنيميشن
                  }}
                />
              </div>
            </div>
          </div>

          {/* تخطيط للوضع الأفقي (landscape) - شريط جانبي */}
          <div className="portrait:hidden landscape:flex h-full">
            
            {/* لوحة اللعب - الجزء الأيسر */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full h-full max-h-[85vh]">
                <MatchstickCanvas
                  puzzle={gameState.currentPuzzle}
                  showSolution={gameState.showSolution}
                  showStep={gameState.showStep}
                  onAnimationComplete={() => {
                    // يمكن إضافة منطق هنا عند انتهاء الأنيميشن
                  }}
                />
              </div>
            </div>

            {/* الشريط الجانبي - الجزء الأيمن مع التمرير */}
            <div className="w-80 bg-background/95 backdrop-blur-sm border-l border-border/50 p-4 flex flex-col gap-4 shadow-xl h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              
              {/* معلومات اللغز */}
              {gameState.currentPuzzle.instructions && (
                <div className="bg-secondary/20 rounded-lg p-4 animate-fade-in">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        <span>النقاط: {gameState.currentPuzzle.sticks.filter(stick => 
                          stick.start.x !== stick.target.x || 
                          stick.start.y !== stick.target.y || 
                          stick.start.r !== stick.target.r || 
                          stick.start.s !== stick.target.s
                        ).length}</span>
                      </div>
                      {gameState.stepsUsed > 0 && (
                        <div className="flex items-center gap-1 text-amber-600 text-sm">
                          <span>المساعدات: {gameState.stepsUsed}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {gameState.currentPuzzle.instructions}
                    </p>
                  </div>
                </div>
              )}

              {/* أزرار التحكم الرئيسية */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">أدوات التحكم</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={toggleSolution}
                    variant={gameState.showSolution ? "secondary" : "default"}
                    className="text-xs flex flex-col items-center gap-1 h-16"
                    size="sm"
                  >
                    <Eye className="h-5 w-5" />
                    <span>عرض الحل</span>
                  </Button>
                  
                  <Button
                    onClick={showNextStep}
                    variant="outline"
                    className="text-xs flex flex-col items-center gap-1 h-16"
                    size="sm"
                    disabled={gameState.showSolution}
                  >
                    <SkipForward className="h-5 w-5" />
                    <span>خطوة واحدة</span>
                  </Button>
                  
                  <Button
                    onClick={resetPuzzle}
                    variant="outline"
                    className="text-xs flex flex-col items-center gap-1 h-16"
                    size="sm"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span>إعادة تعيين</span>
                  </Button>

                  <Button
                    onClick={nextPuzzle}
                    variant="outline"
                    className="text-xs flex flex-col items-center gap-1 h-16"
                    size="sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span>لغز جديد</span>
                  </Button>
                </div>
              </div>

              {/* أزرار اللاعبين والتنقل */}
              <div className="space-y-3 flex-1">
                <h3 className="text-sm font-semibold text-muted-foreground">اللاعبون والنتائج</h3>
                {gameState.settings.players.length > 0 ? (
                  <div className="space-y-2">
                    <Button
                      onClick={handleShowPlayerSelection}
                      variant="default"
                      className="w-full text-sm flex items-center justify-center gap-2 h-12"
                      size="sm"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>تسجيل النقاط</span>
                    </Button>
                    
                    <Button
                      onClick={() => setShowScoreBoard(true)}
                      variant="secondary"
                      className="w-full text-sm flex items-center justify-center gap-2 h-12"
                      size="sm"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>عرض النتائج</span>
                    </Button>
                  </div>
                ) : null}
                
                <Button
                  onClick={onBackToMenu}
                  variant="outline"
                  className="w-full text-sm flex items-center justify-center gap-2 h-12 mt-auto"
                  size="sm"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>القائمة الرئيسية</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* حالة الإيقاف المؤقت */}
      {gameState.isPaused && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="text-center space-y-4 p-4 sm:p-6">
              <div className="flex items-center justify-center gap-2">
                <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
                <h3 className="text-lg font-semibold">اللعبة متوقفة مؤقتاً</h3>
              </div>
              <p className="text-muted-foreground">
                اضغط على "استئناف" للمتابعة
              </p>
              <Button onClick={togglePause} className="w-full">
                <Play className="h-4 w-4 ml-2" />
                استئناف اللعبة
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* لوحة النتائج */}
      {showScoreBoard && (
        <ScoreBoard
          settings={gameState.settings}
          onClose={() => setShowScoreBoard(false)}
        />
      )}

      {/* نافذة اختيار اللاعب */}
      {showPlayerSelection && gameState.currentPuzzle && (
        <PlayerSelection
          players={gameState.settings.players}
          stepsUsed={gameState.stepsUsed}
          totalMoves={gameState.currentPuzzle.sticks.filter(stick => 
            stick.start.x !== stick.target.x || 
            stick.start.y !== stick.target.y || 
            stick.start.r !== stick.target.r || 
            stick.start.s !== stick.target.s
          ).length}
          onPlayerSelect={handlePlayerSelect}
          onSkip={handleSkipScoring}
          onClose={() => setShowPlayerSelection(false)}
        />
      )}
    </div>
  );
};

export default GamePlay;