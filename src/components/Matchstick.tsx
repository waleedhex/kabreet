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
        {/* تدرج الخشب ثلاثي الأبعاد */}
        <linearGradient id={`wood-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--matchstick-wood-light))" />
          <stop offset="50%" stopColor="hsl(var(--matchstick-wood))" />
          <stop offset="100%" stopColor="hsl(var(--matchstick-wood-dark))" />
        </linearGradient>
        
        {/* تدرج رأس العود */}
        <radialGradient id={`tip-gradient-${index}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(var(--matchstick-tip))" />
          <stop offset="100%" stopColor="hsl(var(--matchstick-tip-dark))" />
        </radialGradient>
        
        {/* بريق رأس العود */}
        <linearGradient id={`shine-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--matchstick-tip-shine))" stopOpacity="0.4" />
          <stop offset="70%" stopColor="hsl(var(--matchstick-tip-shine))" stopOpacity="0.1" />
          <stop offset="100%" stopColor="hsl(var(--matchstick-tip-shine))" stopOpacity="0" />
        </linearGradient>
        
        {/* فلتر الظل */}
        <filter id={`shadow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="hsl(0 0% 0%)" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* جسم العود الخشبي محسن */}
      <rect
        className="wood"
        x="0"
        y={-stickHeight / 2}
        width={stickWidth}
        height={stickHeight}
        rx="6"
        fill={`url(#wood-gradient-${index})`}
        stroke="hsl(var(--matchstick-wood-dark))"
        strokeWidth="1"
        filter={`url(#shadow-${index})`}
        style={{
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
        }}
      />
      
      {/* نسيج الخشب */}
      <rect
        x="20"
        y={-stickHeight / 2 + 2}
        width={stickWidth - 40}
        height="2"
        fill="hsl(var(--matchstick-wood-dark))"
        opacity="0.3"
        rx="1"
      />
      <rect
        x="30"
        y={stickHeight / 2 - 4}
        width={stickWidth - 60}
        height="2"
        fill="hsl(var(--matchstick-wood-dark))"
        opacity="0.2"
        rx="1"
      />
      
      {/* رأس العود الأحمر محسن */}
      <rect
        className="headFill"
        x="-16"
        y={-headHeight / 2}
        width={headWidth}
        height={headHeight}
        rx="9"
        fill={`url(#tip-gradient-${index})`}
        stroke="hsl(var(--matchstick-tip-dark))"
        strokeWidth="0.5"
        style={{
          filter: 'drop-shadow(0 1px 3px rgba(177, 27, 27, 0.4))'
        }}
      />
      
      {/* بريق متطور على الرأس */}
      <ellipse
        cx="-8"
        cy={-headHeight / 4}
        rx="6"
        ry="4"
        fill={`url(#shine-gradient-${index})`}
      />
      
      {/* بريق صغير إضافي */}
      <circle
        cx="-6"
        cy={-headHeight / 3}
        r="2"
        fill="hsl(var(--matchstick-tip-shine))"
        opacity="0.6"
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