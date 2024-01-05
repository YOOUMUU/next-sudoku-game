export const createNewBoard = (difficulty: GameDifficulty): Board => {
  const board: Board = Array.from({ length: 9 }, () => Array(9).fill(null));
  createSudoku(board, difficulty);
  return board;
};

const createSudoku = (board: Board, difficulty: GameDifficulty) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      board[row][col] = Math.floor(Math.random() * 9) + 1;
    }
  }
};
export const validateSolution = (board: Board): boolean => {
  for (let row = 0; row < 9; row++) {
    if (!isValidSet(board[row])) {
      return false;
    }
  }

  for (let col = 0; col < 9; col++) {
    const column = board.map((row) => row[col]);
    if (!isValidSet(column)) {
      return false;
    }
  }

  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const box = [];
      for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
          box.push(board[row][col]);
        }
      }
      if (!isValidSet(box)) {
        return false;
      }
    }
  }

  return true;
};

export const isValidSet = (items: (number | null)[]): boolean => {
  const numbers = items.filter((item) => item !== null);
  return new Set(numbers).size === numbers.length;
};
