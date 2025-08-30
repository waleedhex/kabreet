import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Play } from 'lucide-react';
import { GamePuzzle } from '@/types/game';
import { toast } from 'sonner';

interface PuzzleLoaderProps {
  onPuzzleLoaded: (puzzle: GamePuzzle) => void;
}

const PuzzleLoader = ({ onPuzzleLoaded }: PuzzleLoaderProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const puzzle = JSON.parse(text) as GamePuzzle;
      
      // التحقق من صحة بنية ملف JSON
      if (!puzzle.sticks || !puzzle.title || !puzzle.instructions) {
        throw new Error('بنية ملف JSON غير صحيحة');
      }

      onPuzzleLoaded(puzzle);
      toast.success(`تم تحميل اللغز: ${puzzle.title}`);
    } catch (error) {
      toast.error('خطأ في تحميل الملف. تأكد من أن الملف بصيغة JSON صحيحة');
      console.error('Error loading puzzle:', error);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <Card className="game-card w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <FileText className="h-5 w-5" />
          تحميل لغز جديد
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".json"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          
          <p className="text-sm text-muted-foreground mb-2">
            اسحب ملف JSON هنا أو اضغط للاختيار
          </p>
          
          <Button variant="outline" className="mt-2">
            <FileText className="h-4 w-4 ml-2" />
            اختر ملف
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4 text-center">
          يدعم ملفات JSON فقط مع بنية اللغز الصحيحة
        </p>
      </CardContent>
    </Card>
  );
};

export default PuzzleLoader;