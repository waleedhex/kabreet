import { useEffect, useRef, useState } from 'react';
import { GameStick } from '@/types/game';

interface MatchstickProps {
  stick: GameStick;
  index: number;
  isAnimating: boolean;
  animationDuration: number;
  animationEasing: string;
  showTarget?: boolean;
  reset?: boolean;
  blinkTimes?: number;
  blinkInterval?: number;
}

const Matchstick = ({ 
  stick, 
  index, 
  isAnimating, 
  animationDuration, 
  animationEasing, 
  showTarget = false,
  reset = false,
  blinkTimes = 3,
  blinkInterval = 180
}: MatchstickProps) => {
  const groupRef = useRef<SVGGElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    if (reset) {
      // إعادة تعيين فورية للموضع الأصلي
      group.style.transform = `translate3d(${stick.start.x}px, ${stick.start.y}px, 0) rotate(${stick.start.r}deg) scale(${stick.start.s})`;
      group.style.transition = 'none';
      setIsBlinking(false);
      return;
    }
    
    if (showTarget) {
      // بدء الوميض قبل الحركة
      setIsBlinking(true);
      
      // تنفيذ الوميض
      let blinkCount = 0;
      const blinkInterval_ID = setInterval(() => {
        group.style.opacity = group.style.opacity === '0.3' ? '1' : '0.3';
        blinkCount++;
        
        if (blinkCount >= blinkTimes * 2) { // ضرب في 2 لأن كل وميض يحتاج تشغيل وإطفاء
          clearInterval(blinkInterval_ID);
          group.style.opacity = '1';
          setIsBlinking(false);
          
          // بدء الحركة بعد انتهاء الوميض
          setTimeout(() => {
            group.style.transition = `transform ${animationDuration}ms ${animationEasing}`;
            group.style.transform = `translate3d(${stick.target.x}px, ${stick.target.y}px, 0) rotate(${stick.target.r}deg) scale(${stick.target.s})`;
          }, 100); // تأخير بسيط لضمان انتهاء الوميض
        }
      }, blinkInterval);
    }
  }, [showTarget, reset, stick.start, stick.target, animationDuration, animationEasing, blinkTimes, blinkInterval]);

  // الأبعاد الأصلية من الكود المصدر
  const stickWidth = 200;   // العرض الأصلي
  const stickHeight = 12;   // الارتفاع الأصلي
  const headWidth = 28;     // عرض الرأس
  const headHeight = 18;    // ارتفاع الرأس

  return (
    <g 
      ref={groupRef}
      style={{
        transform: `translate3d(${stick.start.x}px, ${stick.start.y}px, 0) rotate(${stick.start.r}deg) scale(${stick.start.s})`,
        transformOrigin: `${stickWidth/2}px 0px`,
        willChange: isAnimating ? 'transform' : 'auto',
        transformBox: 'fill-box',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      <defs>
        <linearGradient id={`matchstick-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--matchstick-tip))" />
          <stop offset="14%" stopColor="hsl(var(--matchstick-tip))" />
          <stop offset="20%" stopColor="hsl(var(--matchstick-wood))" />
          <stop offset="100%" stopColor="hsl(var(--matchstick-wood))" />
        </linearGradient>
      </defs>
      
      {/* جسم العود الخشبي */}
      <rect
        className="wood"
        x="0"
        y={-stickHeight / 2}
        width={stickWidth}
        height={stickHeight}
        rx="6"
        fill="hsl(var(--matchstick-wood))"
        stroke="hsl(var(--matchstick-wood))"
        strokeWidth="1"
      />
      
      {/* رأس العود الأحمر (في البداية) */}
      <rect
        className="headFill"
        x="-16"
        y={-headHeight / 2}
        width={headWidth}
        height={headHeight}
        rx="9"
        fill="hsl(var(--matchstick-tip))"
      />
      
      {/* بريق على الرأس */}
      <rect
        className="headShine"
        x="-10"
        y={-headHeight / 2}
        width="8"
        height={headHeight}
        fill="#ffffff"
        opacity="0.25"
      />
      
      {/* نص رقم الخطوة (إذا كان موجود) */}
      <text
        x="100"
        y="5"
        fill="#ffffff"
        fontSize="20"
        textAnchor="middle"
        style={{ pointerEvents: 'none' }}
      >
        {/* يمكن إضافة رقم الخطوة هنا لاحقاً */}
      </text>
    </g>
  );
};

export default Matchstick;