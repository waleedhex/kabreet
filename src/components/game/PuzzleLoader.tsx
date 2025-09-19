import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Puzzle, Zap, Download } from 'lucide-react';

interface PuzzleLoaderProps {
  progress: number;
  total: number;
  currentPuzzle?: number;
}

const PuzzleLoader: React.FC<PuzzleLoaderProps> = ({ 
  progress, 
  total, 
  currentPuzzle 
}) => {
  const percentage = Math.round((progress / total) * 100);
  
  const motivationalMessages = [
    "جاري تحضير مغامرة الألغاز...",
    "تحميل أعواد الثقاب السحرية...",
    "إعداد التحديات المثيرة...",
    "تجهيز عقلك للتفكير...",
    "قريباً ستبدأ المتعة...",
    "الصبر مفتاح الفوز...",
    "الألغاز تنتظرك...",
    "جاري شحن قوة الذكاء..."
  ];
  
  const messageIndex = Math.floor((progress / total) * motivationalMessages.length);
  const currentMessage = motivationalMessages[Math.min(messageIndex, motivationalMessages.length - 1)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          {/* أيقونة متحركة */}
          <div className="relative">
            <div className="animate-pulse">
              <Puzzle className="w-16 h-16 mx-auto text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 animate-bounce">
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          
          {/* العنوان */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              تحميل الألغاز
            </h2>
            <p className="text-muted-foreground">
              {currentMessage}
            </p>
          </div>
          
          {/* شريط التقدم */}
          <div className="space-y-3">
            <Progress 
              value={percentage} 
              className="w-full h-3"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Download className="w-4 h-4" />
                {progress} / {total}
              </span>
              <span className="font-semibold text-primary">
                {percentage}%
              </span>
            </div>
          </div>
          
          {/* معلومات إضافية */}
          {currentPuzzle && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              جاري تحميل اللغز رقم {currentPuzzle}
            </div>
          )}
          
          {/* رسالة تشجيعية */}
          <div className="text-xs text-muted-foreground">
            ستكون تجربة اللعب سلسة وفورية بعد اكتمال التحميل
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PuzzleLoader;