import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Matchstick from './Matchstick';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { GamePuzzle } from '@/types/game';

interface MatchstickCanvasProps {
  puzzle: GamePuzzle;
  showSolution: boolean;
  showStep: number;
  onAnimationComplete?: () => void;
}

const MatchstickCanvas = ({ 
  puzzle, 
  showSolution, 
  showStep, 
  onAnimationComplete 
}: MatchstickCanvasProps) => {
  const isAnimating = showSolution || showStep > 0;
  const isMobile = useIsMobile();
  const effectiveDuration = puzzle.animation.duration * (isMobile ? 1.8 : 1.2);
  const effectiveEasing = isMobile ? 'cubic-bezier(0.25, 0.1, 0.25, 1)' : 'cubic-bezier(0.4, 0, 0.2, 1)';

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        onAnimationComplete?.();
      }, effectiveDuration + 100);

      return () => clearTimeout(timer);
    }
  }, [isAnimating, effectiveDuration, onAnimationComplete]);

  const getViewBox = () => {
    // ViewBox محدث ليناسب بيانات الألغاز الفعلية
    return "0 0 800 600";
  };

  return (
    <div className="w-full bg-game-surface rounded-lg border border-border/30 shadow-inner">
      <AspectRatio ratio={16 / 9} className="w-full">
        <svg
          viewBox={getViewBox()}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ 
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
            willChange: 'transform'
          }}
        >
          <defs>
            <radialGradient id="canvas-background" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--game-surface))" />
              <stop offset="100%" stopColor="hsl(var(--background))" />
            </radialGradient>
          </defs>
          
          {/* Canvas background */}
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#canvas-background)" 
            opacity="0.8"
          />
          
          {/* Render matchsticks */}
          {puzzle.sticks.map((stick, index) => {
            // تحديد ما إذا كان العود متحرك أم لا
            const isMovingStick = stick.start.x !== stick.target.x || 
                                  stick.start.y !== stick.target.y || 
                                  stick.start.r !== stick.target.r || 
                                  stick.start.s !== stick.target.s;
            
            // حساب فهرس العود المتحرك
            const movingStickIndex = puzzle.sticks
              .slice(0, index + 1)
              .filter(s => s.start.x !== s.target.x || 
                          s.start.y !== s.target.y || 
                          s.start.r !== s.target.r || 
                          s.start.s !== s.target.s).length;
            
            // تحديد ما إذا كان يجب عرض الهدف - محسن للتتابع
            let shouldShowTarget = false;
            
            if (showSolution) {
              // عرض جميع الأهداف عند إظهار الحل الكامل
              shouldShowTarget = isMovingStick;
            } else if (showStep > 0 && isMovingStick) {
              // عرض الأهداف حسب الخطوات المطلوبة فقط
              shouldShowTarget = movingStickIndex <= showStep;
            }
            
            return (
              <Matchstick
                key={index}
                stick={stick}
                index={index}
                isAnimating={isAnimating && shouldShowTarget}
                animationDuration={effectiveDuration}
                animationEasing={effectiveEasing}
                showTarget={shouldShowTarget}
                reset={!(showSolution || showStep > 0)}
                blinkTimes={puzzle.animation.blinkTimes}
                blinkInterval={puzzle.animation.blinkInterval}
              />
            );
          })}
        </svg>
      </AspectRatio>
    </div>
  );
};

export default MatchstickCanvas;