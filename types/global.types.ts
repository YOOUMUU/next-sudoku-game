type Move = {
  position: {
    row: number;
    col: number;
  };
  value: number;
  timeStamp: Date;
};
type Board = (number | null)[][];
type GameDifficulty = 'normal' | 'easy' | 'hard';
type GameStatus = 'win' | 'failed' | 'processing';

type GameeSession = {
  sessionId: string;
  userId: string;
  board: Board;
  difficulty: GameDifficulty;
  gameStatus: GameStatus;
  history: Move[];
  createdAt: string;
  updatedAt: string;
};
