export type Board = (number | null)[][];

function isValid(board: Board, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    const m = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const n = 3 * Math.floor(col / 3) + (i % 3);
    if (board[row][i] === num || board[i][col] === num || board[m][n] === num) {
      return false;
    }
  }
  return true;
}

export function createSudoku(
  board: Board,
  difficulty: string,
  row = 0,
  col = 0
): boolean {
  if (row === 9) {
    clearCellsForDifficulty(board, difficulty); // 新增：根据难度清空单元格
    return true;
  }
  if (col === 9) return createSudoku(board, difficulty, row + 1, 0);
  if (board[row][col] !== 0)
    return createSudoku(board, difficulty, row, col + 1);

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(numbers);

  for (const num of numbers) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      if (createSudoku(board, difficulty, row, col + 1)) return true;
      board[row][col] = 0;
    }
  }
  return false;
}

function shuffleArray(array: number[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function clearCellsForDifficulty(board: Board, difficulty: string): void {
  const empties =
    difficulty === 'easy' ? 20 : difficulty === 'normal' ? 40 : 60;
  for (let i = 0; i < empties; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== null) {
      board[row][col] = null;
    } else {
      i--;
    }
  }
}
