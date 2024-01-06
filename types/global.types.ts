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
