import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Clock, Play, SkipForward, Users, Target, Zap, RotateCcw } from 'lucide-react';
import PlayerNameDialog from './PlayerNameDialog';
import PlayerSelectionDialog from './PlayerSelectionDialog';
import Leaderboard from './Leaderboard';
import PuzzleLoader from './PuzzleLoader';

interface Player {
  id: string;
  name: string;
  score: number;
  solvedPuzzles: number;
}

interface Puzzle {
  title: string;
  instructions: string;
  sticks: Array<{
    start: { x: number; y: number; r: number; s: number };
    target: { x: number; y: number; r: number; s: number };
    step?: number;
  }>;
  animation: {
    duration: number;
    easing: string;
    blinkTimes: number;
    blinkInterval: number;
  };
}

interface Stick {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  selected: boolean;
  blinking?: boolean;
  animating?: boolean;
}

interface MultiPlayerGameProps {
  players: Player[];
  timeLimit: number; // في دقائق
  onBackToSetup: () => void;
}

const MultiPlayerGame: React.FC<MultiPlayerGameProps> = ({ 
  players: initialPlayers, 
  timeLimit, 
  onBackToSetup 
}) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [sticks, setSticks] = useState<Stick[]>([]);
  const [selectedStickIds, setSelectedStickIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // بالثواني
  const [gameState, setGameState] = useState<'playing' | 'solved' | 'timeUp' | 'results'>('playing');
  const [stepsUsed, setStepsUsed] = useState(0); // عدد مرات استخدام زر الخطوة الواحدة
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPuzzleNumber, setCurrentPuzzleNumber] = useState<number | null>(null);
  
  // حالة التحميل والألغاز
  const [allPuzzles, setAllPuzzles] = useState<Map<number, Puzzle>>(new Map());
  const [isLoadingPuzzles, setIsLoadingPuzzles] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [usedPuzzles, setUsedPuzzles] = useState<number[]>(() => {
    const saved = localStorage.getItem('usedPuzzles');
    return saved ? JSON.parse(saved) : [];
  });

  
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRefs = useRef<{
    blinkInterval?: NodeJS.Timeout;
    solveTimeout?: NodeJS.Timeout;
    animationFrame?: number;
  }>({});

  // قائمة جميع الألغاز المتاحة
  const availablePuzzles = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
    39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56
  ];

  // تحميل جميع الألغاز في البداية
  const loadAllPuzzles = useCallback(async () => {
    setIsLoadingPuzzles(true);
    setLoadingProgress(0);
    const puzzlesMap = new Map<number, Puzzle>();
    
    try {
      for (let i = 0; i < availablePuzzles.length; i++) {
        const puzzleNum = availablePuzzles[i];
        try {
          const response = await fetch(`/puzzles/puzzle${puzzleNum}.json`);
          if (response.ok) {
            const puzzleData: Puzzle = await response.json();
            puzzlesMap.set(puzzleNum, puzzleData);
          } else {
            console.warn(`تعذر تحميل اللغز ${puzzleNum}`);
          }
        } catch (error) {
          console.warn(`خطأ في تحميل اللغز ${puzzleNum}:`, error);
        }
        
        // تحديث شريط التقدم
        setLoadingProgress(i + 1);
        
        // توقف قصير لتجنب حجب الـ UI
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      setAllPuzzles(puzzlesMap);
      setIsLoadingPuzzles(false);
      
      toast({
        title: "تم تحميل الألغاز بنجاح!",
        description: `${puzzlesMap.size} لغز جاهز للعب`
      });
      
    } catch (error) {
      console.error('خطأ في تحميل الألغاز:', error);
      setIsLoadingPuzzles(false);
      toast({
        variant: "destructive",
        title: "خطأ في التحميل",
        description: "فشل في تحميل بعض الألغاز"
      });
    }
  }, [toast]);

  // اختيار لغز عشوائي من الألغاز المحملة
  const selectRandomPuzzle = useCallback(() => {
    if (allPuzzles.size === 0) return;
    
    // إيقاف جميع الأنيميشن والمؤقتات الجارية
    if (animationRefs.current.blinkInterval) {
      clearInterval(animationRefs.current.blinkInterval);
      animationRefs.current.blinkInterval = undefined;
    }
    if (animationRefs.current.solveTimeout) {
      clearTimeout(animationRefs.current.solveTimeout);
      animationRefs.current.solveTimeout = undefined;
    }
    if (animationRefs.current.animationFrame) {
      cancelAnimationFrame(animationRefs.current.animationFrame);
      animationRefs.current.animationFrame = undefined;
    }
    setIsAnimating(false);
    
    // إنشاء قائمة الألغاز المتاحة (غير المستخدمة)
    let availableForSelection = availablePuzzles.filter(num => 
      !usedPuzzles.includes(num) && allPuzzles.has(num)
    );
    
    // إذا تم استخدام جميع الألغاز، إعادة تعيين القائمة
    if (availableForSelection.length === 0) {
      availableForSelection = availablePuzzles.filter(num => allPuzzles.has(num));
      setUsedPuzzles([]);
      localStorage.removeItem('usedPuzzles');
      toast({
        title: "إعادة تشغيل دورة الألغاز",
        description: "تم إكمال جميع الألغاز، بدء دورة جديدة!"
      });
    }

    // اختيار لغز عشوائي
    const randomIndex = Math.floor(Math.random() * availableForSelection.length);
    const selectedPuzzle = availableForSelection[randomIndex];
    const puzzleData = allPuzzles.get(selectedPuzzle);
    
    if (puzzleData) {
      setCurrentPuzzle(puzzleData);
      setCurrentPuzzleNumber(selectedPuzzle);
      
      // تحويل الأعواد للعرض
      const initialSticks: Stick[] = puzzleData.sticks.map((stick, index) => ({
        id: index,
        x: stick.start.x,
        y: stick.start.y,
        rotation: stick.start.r,
        scale: stick.start.s,
        selected: false,
        blinking: false,
        animating: false
      }));
      
      setSticks(initialSticks);
      
      // تحديث قائمة الألغاز المستخدمة
      setUsedPuzzles(prev => {
        const updated = [...prev, selectedPuzzle];
        localStorage.setItem('usedPuzzles', JSON.stringify(updated));
        return updated;
      });
      
      // إعادة تعيين حالة اللعبة
      setSelectedStickIds([]);
      setMoves(0);
      setStepsUsed(0);
      setCurrentStep(0);
      setGameState('playing');
      setTimeRemaining(timeLimit * 60);
      
      // بدء المؤقت (فقط إذا كان هناك حد زمني)
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeLimit > 0) {
        timerRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              setGameState('timeUp');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  }, [allPuzzles, usedPuzzles, timeLimit, toast]);

  // تنظيف المؤقتات والأنيميشن
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRefs.current.blinkInterval) clearInterval(animationRefs.current.blinkInterval);
      if (animationRefs.current.solveTimeout) clearTimeout(animationRefs.current.solveTimeout);
      if (animationRefs.current.animationFrame) cancelAnimationFrame(animationRefs.current.animationFrame);
    };
  }, []);

  // تحميل جميع الألغاز عند بدء التطبيق
  useEffect(() => {
    loadAllPuzzles();
  }, [loadAllPuzzles]);

  // اختيار أول لغز بعد تحميل الألغاز
  useEffect(() => {
    if (!isLoadingPuzzles && allPuzzles.size > 0 && !currentPuzzle) {
      selectRandomPuzzle();
    }
  }, [isLoadingPuzzles, allPuzzles.size, currentPuzzle, selectRandomPuzzle]);

  // تحريك عود واحد مع الانيميشن
  const moveStickToTarget = useCallback((stickIndex: number) => {
    if (!currentPuzzle || isAnimating) return;
    
    const stick = currentPuzzle.sticks[stickIndex];
    // التحقق من أن العود يحتاج للحركة (الهدف مختلف عن البداية)
    if (!stick.target || 
        (stick.start.x === stick.target.x && 
         stick.start.y === stick.target.y && 
         stick.start.r === stick.target.r && 
         stick.start.s === stick.target.s)) {
      return; // لا يحتاج للحركة
    }
    
    setIsAnimating(true);
    
    // إعدادات الانيميشن من ملف JSON
    const animation = currentPuzzle.animation || {
      duration: 800,
      blinkTimes: 3,
      blinkInterval: 180
    };
    
    // الوميض قبل الحركة
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
    animationRefs.current.blinkInterval = blinkInterval;
      setSticks(prev => prev.map((s, i) => 
        i === stickIndex 
          ? { ...s, blinking: !s.blinking }
          : s
      ));
      
      blinkCount++;
      if (blinkCount >= animation.blinkTimes * 2) {
        clearInterval(blinkInterval);
        animationRefs.current.blinkInterval = undefined;
        
        // إزالة الوميض وبدء الحركة
        setSticks(prev => prev.map((s, i) => 
          i === stickIndex 
            ? { ...s, blinking: false, animating: true }
            : s
        ));
        
        // بدء الحركة السلسة
        const startTime = performance.now();
        const currentStick = sticks[stickIndex];
        const startPos = {
          x: currentStick.x,
          y: currentStick.y,
          rotation: currentStick.rotation,
          scale: currentStick.scale
        };
        
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / animation.duration, 1);
          
          // حركة خطية بسرعة ثابتة
          const easedProgress = progress;
          
          // حساب الموضع الحالي
          const currentPos = {
            x: startPos.x + (stick.target.x - startPos.x) * easedProgress,
            y: startPos.y + (stick.target.y - startPos.y) * easedProgress,
            rotation: startPos.rotation + (stick.target.r - startPos.rotation) * easedProgress,
            scale: startPos.scale + (stick.target.s - startPos.scale) * easedProgress
          };
          
          // تحديث موضع العود
          setSticks(prev => prev.map((s, i) => 
            i === stickIndex 
              ? { ...s, ...currentPos }
              : s
          ));
          
          if (progress < 1) {
            animationRefs.current.animationFrame = requestAnimationFrame(animate);
          } else {
            // انتهاء الحركة
            setSticks(prev => prev.map((s, i) => 
              i === stickIndex 
                ? { ...s, animating: false }
                : s
            ));
            setIsAnimating(false);
            setCurrentStep(prev => prev + 1);
            setMoves(prev => prev + 1);
          }
        };
        
        animationRefs.current.animationFrame = requestAnimationFrame(animate);
      }
    }, animation.blinkInterval);
  }, [currentPuzzle, isAnimating, sticks]);

  // حل اللغز تلقائياً
  const solvePuzzle = useCallback(() => {
    if (!currentPuzzle || isAnimating) return;
    
    // إعادة اللغز لوضع البداية أولاً
    const initialSticks: Stick[] = currentPuzzle.sticks.map((stick, index) => ({
      id: index,
      x: stick.start.x,
      y: stick.start.y,
      rotation: stick.start.r,
      scale: stick.start.s,
      selected: false,
      blinking: false,
      animating: false
    }));
    
    setSticks(initialSticks);
    setCurrentStep(0);
    setMoves(0);
    
    // انتظار قصير ثم بدء الحل
    const solveTimeout = setTimeout(() => {
    animationRefs.current.solveTimeout = solveTimeout;
      // العثور على الأعواد التي تحتاج للحركة
      const movableSticks = currentPuzzle.sticks
        .map((stick, index) => ({ stick, index }))
        .filter(({ stick }) => stick.target && 
          (stick.start.x !== stick.target.x || 
           stick.start.y !== stick.target.y || 
           stick.start.r !== stick.target.r || 
           stick.start.s !== stick.target.s))
        .sort((a, b) => (a.stick.step || 0) - (b.stick.step || 0));
      
      if (movableSticks.length === 0) {
        return;
      }
      
      let moveIndex = 0;
      const animateNext = () => {
        if (moveIndex >= movableSticks.length) {
          setGameState('solved');
          if (timerRef.current) clearInterval(timerRef.current);
          return;
        }
        
        const { index } = movableSticks[moveIndex];
        moveStickToTarget(index);
        moveIndex++;
        
        animationRefs.current.solveTimeout = setTimeout(animateNext, 2000); // تأخير أطول للسماح بالوميض والحركة
      };
      
      animateNext();
    }, 500); // انتظار نصف ثانية قبل بدء الحل
  }, [currentPuzzle, isAnimating, moveStickToTarget, toast]);

  // خطوة واحدة
  const singleStep = useCallback(() => {
    if (!currentPuzzle || isAnimating) return;
    
    const movableSticks = currentPuzzle.sticks
      .map((stick, index) => ({ stick, index }))
      .filter(({ stick }) => stick.target && 
        (stick.start.x !== stick.target.x || 
         stick.start.y !== stick.target.y || 
         stick.start.r !== stick.target.r || 
         stick.start.s !== stick.target.s))
      .sort((a, b) => (a.stick.step || 0) - (b.stick.step || 0));
    
    if (currentStep >= movableSticks.length) {
      setGameState('solved');
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    
    const { index } = movableSticks[currentStep];
    moveStickToTarget(index);
    setStepsUsed(prev => prev + 1); // زيادة عداد استخدام الخطوات
  }, [currentPuzzle, currentStep, isAnimating, moveStickToTarget, toast]);

  // حساب النقاط بناءً على عدد الأعواد المتحركة
  const calculateScore = useCallback(() => {
    if (!currentPuzzle) return 0;
    
    // حساب عدد الأعواد المتحركة في هذا اللغز
    const movingSticks = currentPuzzle.sticks.filter(stick => 
      stick.target && 
      (stick.start.x !== stick.target.x || 
       stick.start.y !== stick.target.y || 
       stick.start.r !== stick.target.r || 
       stick.start.s !== stick.target.s)
    ).length;
    
    // النقاط = عدد الأعواد المتحركة - عدد مرات استخدام زر الخطوة الواحدة
    const baseScore = movingSticks;
    const finalScore = Math.max(1, baseScore - stepsUsed); // أقل نقطة هي 1
    
    return finalScore;
  }, [currentPuzzle, stepsUsed]);

  // إضافة النقاط للاعب المحدد
  const addScoreToPlayer = useCallback((playerId: string) => {
    const score = calculateScore();
    setPlayers(prev => prev.map(player =>
      player.id === playerId
        ? { 
            ...player, 
            score: player.score + score, 
            solvedPuzzles: player.solvedPuzzles + 1 
          }
        : player
    ));
    
    const selectedPlayer = players.find(p => p.id === playerId);
    toast({
      title: "تم رصد النقاط!",
      description: `${selectedPlayer?.name}: +${score} نقطة`
    });
    
    setShowPlayerSelection(false);
    
    // تحميل لغز جديد بعد رصد النقاط مع تأخير قصير
    setTimeout(() => {
      selectRandomPuzzle();
    }, 1000);
  }, [calculateScore, players, toast, selectRandomPuzzle]);

  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-game-bg landscape:min-h-[100dvh] landscape:overflow-hidden">
      {/* تخطيط ذكي للوضع الأفقي والعمودي */}
      <div className="h-full landscape:h-[100dvh] landscape:flex landscape:flex-col p-2 sm:p-4">
        
        {/* شريط المعلومات العلوي - مضغوط في الوضع الأفقي */}
        <div className="w-full mb-4 landscape:mb-2 landscape:flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="landscape:flex landscape:items-center landscape:justify-between landscape:gap-4">
              {/* المؤقت */}
              <Card className="bg-game-panel border-border landscape:flex-1 landscape:max-w-xs">
                <CardContent className="p-3 landscape:p-2">
                  <div className="flex items-center gap-3 landscape:gap-2">
                    <Clock className="w-4 h-4 landscape:w-3 landscape:h-3 text-warning flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs landscape:text-[10px] text-muted-foreground">الوقت المتبقي</p>
                      <p className="font-bold text-warning text-sm landscape:text-xs">
                        {timeLimit === 0 ? 'بدون وقت' : formatTime(timeRemaining)}
                      </p>
                      {timeLimit > 0 && (
                        <Progress 
                          value={(timeRemaining / (timeLimit * 60)) * 100} 
                          className="h-1.5 landscape:h-1 mt-1"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* إحصائيات مضغوطة في الوضع الأفقي */}
              <div className="hidden landscape:flex landscape:items-center landscape:gap-2 landscape:flex-1">
                <div className="flex items-center gap-1 text-xs bg-game-panel px-2 py-1 rounded">
                  <Target className="w-3 h-3" />
                  <span>حركات: {moves}</span>
                </div>
                <div className="flex items-center gap-1 text-xs bg-game-panel px-2 py-1 rounded">
                  <Zap className="w-3 h-3" />
                  <span>نقاط: {calculateScore()}</span>
                </div>
              </div>

              {/* أزرار التحكم مضغوطة */}
              <div className="hidden landscape:flex landscape:items-center landscape:gap-1 landscape:flex-shrink-0">
                <Button 
                  onClick={solvePuzzle}
                  variant="success"
                  size="sm"
                  className="text-xs px-2 py-1 h-7"
                >
                  <Play className="w-3 h-3" />
                </Button>
                
                <Button 
                  onClick={singleStep}
                  variant="secondary"
                  size="sm"
                  className="text-xs px-2 py-1 h-7"
                >
                  <SkipForward className="w-3 h-3" />
                </Button>
                
                <Button 
                  onClick={() => setShowPlayerSelection(true)}
                  variant="warning"
                  size="sm"
                  className="text-xs px-2 py-1 h-7"
                >
                  <Trophy className="w-3 h-3" />
                </Button>
                
                <Button 
                  onClick={selectRandomPuzzle}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1 h-7"
                  disabled={isAnimating}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* منطقة اللعب الرئيسية */}
        <div className="flex-1 landscape:flex landscape:gap-2 landscape:overflow-hidden">
          <div className="max-w-7xl mx-auto w-full landscape:flex landscape:h-full landscape:gap-2">
            
            {/* منطقة اللغز - تأخذ معظم المساحة في الوضع الأفقي */}
            <div className="landscape:flex-1 landscape:flex landscape:flex-col landscape:min-w-0 space-y-4 landscape:space-y-2">
              
              {/* لوحة التعليمات - مضغوطة في الوضع الأفقي */}
              <Card className="bg-game-panel border-border landscape:flex-shrink-0">
                <CardContent className="p-3 landscape:p-2">
                  <div className="text-center">
                    <p className="text-foreground leading-relaxed text-sm landscape:text-xs">
                      {currentPuzzle?.instructions || "جاري تحميل اللغز..."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* لوحة اللغز - المنطقة الرئيسية */}
              <Card className="bg-game-panel border-border landscape:flex-1 landscape:min-h-0">
                <CardContent className="p-2 landscape:p-1 h-full landscape:flex landscape:items-center">
                  <div className="aspect-video landscape:aspect-auto landscape:w-full landscape:h-full bg-game-board rounded-lg p-2 landscape:p-1 relative overflow-hidden flex items-center justify-center">
                    <svg 
                      viewBox="0 0 960 540" 
                      className="w-full h-auto max-h-[250px] landscape:max-h-full landscape:h-full"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {sticks.map((stick) => (
                        <g
                          key={stick.id}
                          transform={`translate(${stick.x} ${stick.y}) rotate(${stick.rotation} ${100 * stick.scale} 0) scale(${stick.scale})`}
                           className={`transition-all duration-300 ${
                             stick.selected ? 'opacity-80' : ''
                           } ${stick.blinking ? 'animate-pulse opacity-30' : ''} ${
                             stick.animating ? 'filter drop-shadow-lg' : ''
                           }`}
                           style={{
                             opacity: stick.blinking ? 0.3 : 1
                           }}
                        >
                          {/* جسم العود */}
                          <rect
                            x="0"
                            y="-6"
                            width="200"
                            height="12"
                            rx="6"
                            fill="hsl(var(--wood))"
                            stroke="hsl(var(--wood-border))"
                            strokeWidth="1"
                          />
                          {/* رأس العود */}
                          <rect
                            x="-16"
                            y="-9"
                            width="28"
                            height="18"
                            rx="9"
                            fill="hsl(var(--match-head))"
                          />
                          {/* بريق رأس العود */}
                          <rect
                            x="-10"
                            y="-9"
                            width="8"
                            height="18"
                            fill="white"
                            opacity="0.25"
                          />
                        </g>
                      ))}
                    </svg>
                  </div>
                </CardContent>
              </Card>

              {/* الإحصائيات والأزرار للوضع العمودي */}
              <div className="landscape:hidden">
                {/* الإحصائيات */}
                <Card className="bg-game-panel border-border">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Target className="w-4 h-4" />
                          <span className="text-sm">الحركات</span>
                        </div>
                        <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                          {moves}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm">النقاط المحتملة</span>
                        </div>
                        <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                          {calculateScore()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* أزرار التحكم */}
                <Card className="bg-game-panel border-border">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={solvePuzzle}
                        variant="success"
                        className="flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        حل اللغز
                      </Button>
                      
                      <Button 
                        onClick={singleStep}
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        <SkipForward className="w-4 h-4" />
                        خطوة واحدة
                      </Button>
                      
                      <Button 
                        onClick={() => setShowPlayerSelection(true)}
                        variant="warning"
                        className="flex items-center gap-2"
                      >
                        <Trophy className="w-4 h-4" />
                        رصد النقاط
                      </Button>
                      
                      <Button 
                        onClick={() => setShowLeaderboard(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        النتائج
                      </Button>
                      
                      <Button 
                        onClick={selectRandomPuzzle}
                        disabled={isAnimating}
                        variant="game"
                        className="flex items-center gap-2"
                      >
                        {isAnimating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                            جاري...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            لغز جديد
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        onClick={onBackToSetup}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        العودة للإعدادات
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* لوحة جانبية في الوضع الأفقي */}
            <div className="hidden landscape:flex landscape:flex-col landscape:w-60 landscape:flex-shrink-0 landscape:gap-2 landscape:overflow-y-auto landscape:max-h-full">
              {/* الإحصائيات المفصلة */}
              <Card className="bg-game-panel border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">الإحصائيات</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">الحركات</span>
                    <Badge variant="outline" className="text-xs">{moves}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">النقاط</span>
                    <Badge variant="secondary" className="text-xs">{calculateScore()}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">الخطوات المستخدمة</span>
                    <Badge variant="outline" className="text-xs">{stepsUsed}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* أزرار التحكم */}
              <Card className="bg-game-panel border-border flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">التحكم</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  <Button 
                    onClick={solvePuzzle}
                    variant="success"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <Play className="w-3 h-3 ml-1" />
                    حل اللغز
                  </Button>
                  
                  <Button 
                    onClick={singleStep}
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <SkipForward className="w-3 h-3 ml-1" />
                    خطوة واحدة
                  </Button>
                  
                  <Button 
                    onClick={() => setShowPlayerSelection(true)}
                    variant="warning"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <Trophy className="w-3 h-3 ml-1" />
                    رصد النقاط
                  </Button>
                  
                  <Button 
                    onClick={() => setShowLeaderboard(true)}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <Users className="w-3 h-3 ml-1" />
                    النتائج
                  </Button>
                  
                  <Button 
                    onClick={selectRandomPuzzle}
                    disabled={isAnimating}
                    variant="game"
                    size="sm"
                    className="w-full text-xs"
                  >
                    {isAnimating ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current ml-1" />
                    ) : (
                      <SkipForward className="w-3 h-3 ml-1" />
                    )}
                    {isAnimating ? 'جاري...' : 'لغز جديد'}
                  </Button>
                  
                  <Button 
                    onClick={onBackToSetup}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <RotateCcw className="w-3 h-3 ml-1" />
                    الإعدادات
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* النوافذ المنبثقة محسّنة للوضع الأفقي */}
      {showPlayerSelection && (
        <div className="landscape:fixed landscape:inset-0 landscape:z-50 landscape:flex landscape:items-center landscape:justify-center landscape:bg-black/50 landscape:backdrop-blur-sm">
          <div className="landscape:max-w-md landscape:w-full landscape:mx-4 landscape:max-h-[80vh] landscape:overflow-auto">
            <PlayerSelectionDialog
              open={showPlayerSelection}
              onOpenChange={setShowPlayerSelection}
              players={players}
              score={calculateScore()}
              moves={moves}
              timeSeconds={timeLimit * 60 - timeRemaining}
              onSelectPlayer={addScoreToPlayer}
            />
          </div>
        </div>
      )}

      <div className="landscape:fixed landscape:inset-0 landscape:z-50 landscape:pointer-events-none">
        <div className={`landscape:pointer-events-auto ${showLeaderboard ? 'landscape:flex landscape:items-center landscape:justify-center landscape:bg-black/50 landscape:backdrop-blur-sm landscape:h-full' : ''}`}>
          {showLeaderboard && (
            <div className="landscape:max-w-lg landscape:w-full landscape:mx-4 landscape:max-h-[80vh] landscape:overflow-auto">
              <Leaderboard
                open={showLeaderboard}
                onOpenChange={setShowLeaderboard}
                players={players.sort((a, b) => b.score - a.score).map(player => ({
                  name: player.name,
                  score: player.score,
                  moves: player.solvedPuzzles,
                  timeSeconds: 0
                }))}
                onClearLeaderboard={() => {
                  setPlayers(prev => prev.map(player => ({ ...player, score: 0, solvedPuzzles: 0 })));
                  setShowLeaderboard(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiPlayerGame;