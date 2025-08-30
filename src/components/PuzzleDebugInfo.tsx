import { GamePuzzle } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Eye } from 'lucide-react';

interface PuzzleDebugInfoProps {
  puzzle: GamePuzzle;
  showDebug: boolean;
  onToggleDebug: () => void;
}

const PuzzleDebugInfo = ({ puzzle, showDebug, onToggleDebug }: PuzzleDebugInfoProps) => {
  const getViewBoxInfo = () => {
    // ViewBox ثابت كما في الكود الأصلي
    return {
      viewBox: "0 0 960 540",
      bounds: {
        minX: 0,
        minY: 0,
        maxX: 960,
        maxY: 540,
        width: 960,
        height: 540
      }
    };
  };

  const getMovingSticksInfo = () => {
    return puzzle.sticks.map((stick, index) => ({
      index,
      isMoving: stick.start.x !== stick.target.x || 
               stick.start.y !== stick.target.y || 
               stick.start.r !== stick.target.r || 
               stick.start.s !== stick.target.s,
      start: stick.start,
      target: stick.target
    }));
  };

  const getOriginalStickInfo = () => {
    return {
      width: 200,     // من الكود الأصلي
      height: 12,     // من الكود الأصلي
      headWidth: 28,  // من الكود الأصلي
      headHeight: 18, // من الكود الأصلي
      transformSystem: "translate(x y) rotate(r 100*s 0) scale(s)"
    };
  };

  if (!showDebug) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleDebug}
        className="w-full"
      >
        <Info className="h-4 w-4 ml-2" />
        معلومات التطوير
      </Button>
    );
  }

  const viewBoxInfo = getViewBoxInfo();
  const sticksInfo = getMovingSticksInfo();
  const movingSticks = sticksInfo.filter(s => s.isMoving);
  const originalInfo = getOriginalStickInfo();

  return (
    <Card className="game-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">معلومات التطوير</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleDebug}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 text-xs">
        {/* ViewBox Info */}
        <div>
          <h4 className="font-semibold mb-2">ViewBox الأصلي:</h4>
          <code className="text-xs bg-muted p-1 rounded block">
            {viewBoxInfo.viewBox}
          </code>
          <div className="mt-2 grid grid-cols-2 gap-1">
            <div>العرض: {viewBoxInfo.bounds.width}px</div>
            <div>الارتفاع: {viewBoxInfo.bounds.height}px</div>
            <div>نسبة العرض: 16:9</div>
            <div>ثابت دائماً</div>
          </div>
        </div>

        {/* Original Stick Dimensions */}
        <div>
          <h4 className="font-semibold mb-2">أبعاد العود الأصلي:</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>العرض: {originalInfo.width}px</div>
            <div>الارتفاع: {originalInfo.height}px</div>
            <div>الرأس: {originalInfo.headWidth}×{originalInfo.headHeight}px</div>
            <div>من -16 إلى +12</div>
          </div>
          <code className="text-xs bg-muted p-1 rounded block mt-2">
            {originalInfo.transformSystem}
          </code>
        </div>

        {/* Moving Sticks Info */}
        <div>
          <h4 className="font-semibold mb-2">الأعواد المتحركة: {movingSticks.length}</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {movingSticks.map((stick, i) => (
              <div key={stick.index} className="border-b border-border/30 pb-1">
                <Badge variant="outline" className="text-xs">
                  عود #{stick.index} (متحرك #{i + 1})
                </Badge>
                <div className="text-xs mt-1">
                  <div>من: ({Math.round(stick.start.x)}, {Math.round(stick.start.y)}) r:{stick.start.r}° s:{stick.start.s.toFixed(2)}</div>
                  <div>إلى: ({Math.round(stick.target.x)}, {Math.round(stick.target.y)}) r:{stick.target.r}° s:{stick.target.s.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Static Sticks */}
        <div>
          <h4 className="font-semibold mb-2">الأعواد الثابتة: {sticksInfo.length - movingSticks.length}</h4>
          <div className="text-xs">
            {sticksInfo.filter(s => !s.isMoving).map(stick => (
              <Badge key={stick.index} variant="secondary" className="text-xs mr-1 mb-1">
                #{stick.index}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PuzzleDebugInfo;