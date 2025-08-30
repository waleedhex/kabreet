import { GamePuzzle } from '@/types/game';

export class PuzzleService {
  private static puzzlesCache: GamePuzzle[] | null = null;
  private static async loadPuzzleIndex(): Promise<string[]> {
    try {
      const response = await fetch('/puzzles/puzzles-index.json');
      if (!response.ok) {
        throw new Error('فشل في تحميل فهرس الألغاز');
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading puzzle index:', error);
      throw new Error('لا يمكن تحميل فهرس الألغاز');
    }
  }

  private static async loadPuzzleFile(filename: string): Promise<GamePuzzle> {
    try {
      const response = await fetch(`/puzzles/${filename}`);
      if (!response.ok) {
        throw new Error(`فشل في تحميل اللغز: ${filename}`);
      }
      const puzzle = await response.json();
      
      // التحقق من صحة بنية اللغز
      if (!puzzle.sticks || !puzzle.title || !puzzle.instructions) {
        throw new Error('بنية اللغز غير صحيحة');
      }
      
      return puzzle;
    } catch (error) {
      console.error(`Error loading puzzle ${filename}:`, error);
      throw new Error(`لا يمكن تحميل اللغز: ${filename}`);
    }
  }

  static async getRandomPuzzle(excludePuzzles: string[] = []): Promise<GamePuzzle> {
    try {
      // إذا لم يتم تحميل الألغاز من قبل، قم بتحميلها وحفظها في الكاش
      if (!this.puzzlesCache) {
        console.log('تحميل الألغاز للمرة الأولى...');
        this.puzzlesCache = await this.getAllPuzzles();
        console.log(`تم تحميل ${this.puzzlesCache.length} ألغاز بنجاح`);
      }
      
      if (this.puzzlesCache.length === 0) {
        throw new Error('لا توجد ألغاز متاحة');
      }
      
      // استخراج أسماء الملفات من الكاش
      const allPuzzleNames = this.puzzlesCache.map(p => p.fileName || '');
      
      // تصفية الألغاز المستخدمة
      const availablePuzzles = this.puzzlesCache.filter(puzzle => 
        puzzle.fileName && !excludePuzzles.includes(puzzle.fileName)
      );
      
      // إذا تم استخدام جميع الألغاز، ابدأ من جديد
      let puzzlesToChooseFrom = availablePuzzles;
      if (availablePuzzles.length === 0) {
        console.log('تم استخدام جميع الألغاز، سيتم إعادة التشغيل من البداية');
        puzzlesToChooseFrom = this.puzzlesCache;
      }
      
      // اختيار لغز عشوائي من الكاش (بدون طلبات HTTP)
      const randomIndex = Math.floor(Math.random() * puzzlesToChooseFrom.length);
      const selectedPuzzle = puzzlesToChooseFrom[randomIndex];
      
      console.log(`تم اختيار اللغز من الكاش: ${selectedPuzzle.fileName || selectedPuzzle.title}`);
      
      return selectedPuzzle;
    } catch (error) {
      console.error('Error getting random puzzle:', error);
      throw error;
    }
  };

  static async getAllPuzzles(): Promise<GamePuzzle[]> {
    try {
      const puzzleFiles = await this.loadPuzzleIndex();
      const puzzles: GamePuzzle[] = [];
      
      for (const filename of puzzleFiles) {
        try {
          const puzzle = await this.loadPuzzleFile(filename);
          // إضافة اسم الملف لكل لغز
          puzzles.push({ ...puzzle, fileName: filename });
        } catch (error) {
          console.warn(`تم تخطي اللغز ${filename} بسبب خطأ:`, error);
        }
      }
      
      return puzzles;
    } catch (error) {
      console.error('Error loading all puzzles:', error);
      throw error;
    }
  }
}