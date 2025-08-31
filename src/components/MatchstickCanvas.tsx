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
    // حساب الحدود الفعلية للألغاز للتوسيط التلقائي
    if (!puzzle.sticks.length) return "0 0 960 540";
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    puzzle.sticks.forEach(stick => {
      // فحص موضع البداية والهدف
      [stick.start, stick.target].forEach(pos => {
        const stickWidth = 200 * pos.s;
        const x1 = pos.x - 16; // رأس العود
        const x2 = pos.x + stickWidth;
        const y1 = pos.y - 9;
        const y2 = pos.y + 9;
        
        minX = Math.min(minX, x1, x2);
        maxX = Math.max(maxX, x1, x2);
        minY = Math.min(minY, y1, y2);
        maxY = Math.max(maxY, y1, y2);
      });
    });
    
    // إضافة padding
    const padding = 50;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    // الحفاظ على نسبة 16:9 مع التوسيط
    const targetRatio = 16 / 9;
    const currentRatio = width / height;
    
    if (currentRatio > targetRatio) {
      // العرض أكبر، نوسع الارتفاع
      const newHeight = width / targetRatio;
      const extraHeight = newHeight - height;
      minY -= extraHeight / 2;
      return `${minX} ${minY} ${width} ${newHeight}`;
    } else {
      // الارتفاع أكبر، نوسع العرض
      const newWidth = height * targetRatio;
      const extraWidth = newWidth - width;
      minX -= extraWidth / 2;
      return `${minX} ${minY} ${newWidth} ${height}`;
    }
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