export interface GameStick {
  start: {
    x: number;
    y: number;
    r: number; // rotation in degrees
    s: number; // scale
  };
  target: {
    x: number;
    y: number;
    r: number;
    s: number;
  };
}

export interface GameAnimation {
  duration: number;
  easing: string;
  blinkTimes: number;
  blinkInterval: number;
}

export interface GamePuzzle {
  version: number;
  title: string;
  instructions: string;
  animation: GameAnimation;
  sticks: GameStick[];
  fileName?: string; // اسم الملف لتتبع الألغاز المستخدمة
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface GameSettings {
  timeLimit: number; // in seconds, 0 for no limit
  players: Player[];
}

export interface GameState {
  currentPuzzle: GamePuzzle | null;
  puzzleIndex: number;
  showSolution: boolean;
  showStep: number; // 0 = initial, 1+ = step number
  timeRemaining: number;
  isPlaying: boolean;
  isPaused: boolean;
  settings: GameSettings;
  stepsUsed: number; // عدد المرات التي استخدم فيها زر "خطوة واحدة"
  currentPlayerIndex: number; // فهرس اللاعب الحالي
  usedPuzzles: string[]; // أسماء الألغاز المستخدمة لتجنب التكرار
}