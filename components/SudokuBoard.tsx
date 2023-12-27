'use client';

import SudokuCell from '@/components/SudokuCell';
import { useEffect, useState } from 'react';
import { Board, createSudoku } from '@/utils/sudoku';

type GameDifficulty = 'normal' | 'easy' | 'hard';

const SudokuBoard = () => {
  const [selectedCell, setSelectedCell] = useState(-1);
  const [sudokuBoard, setSudokuBoard] = useState<Board>(
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');
  const [currentValue, setCurrentValue] = useState<number | null>(null);

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const [history, setHistory] = useState<Board[]>([]);
  const [initialEmptyCells, setInitialEmptyCells] = useState<boolean[][]>([]);

  useEffect(() => {
    const newBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
    createSudoku(newBoard, difficulty);
    setSudokuBoard(newBoard);

    const emptyCells = newBoard.map((row) => row.map((cell) => cell === null));
    setInitialEmptyCells(emptyCells);
  }, [difficulty]);

  useEffect(() => {
    if (selectedCell !== -1) {
      const row = Math.floor(selectedCell / 9);
      const col = selectedCell % 9;
      const cellValue = sudokuBoard[row][col];

      if (typeof cellValue === 'number') {
        setSelectedNumber(cellValue);
      } else {
        setSelectedNumber(null);
      }
    }
  }, [selectedCell, sudokuBoard]);

  const resetGame = () => {
    const newBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
    createSudoku(newBoard, difficulty);

    setSudokuBoard(newBoard);

    const emptyCells = newBoard.map((row) => row.map((cell) => cell === null));
    setInitialEmptyCells(emptyCells);
    setSelectedCell(-1);
  };

  const sudokuArray = sudokuBoard.flat();

  const handleDifficultyChange = (newDifficulty: GameDifficulty) => {
    setDifficulty(newDifficulty);
    resetGame();
  };

  const handleCellChange = (index: number) => {
    setSelectedCell(index);
  };

  const handleNumberSelect = (num: number) => {
    if (selectedCell !== -1) {
      const row = Math.floor(selectedCell / 9);
      const col = selectedCell % 9;

      if (sudokuBoard[row][col] === null) {
        const newBoard = sudokuBoard.map((row) => [...row]);
        newBoard[row][col] = num;

        setHistory((prev) => [...prev, sudokuBoard]);
        setSudokuBoard(newBoard);
      }
    }
  };

  const checkForErrors = (index: number): boolean => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const num = sudokuBoard[row][col];

    if (num === null) {
      return false;
    }

    for (let i = 0; i < 9; i++) {
      if (i !== col && sudokuBoard[row][i] === num) return true;
      if (i !== row && sudokuBoard[i][col] === num) return true;
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (i !== row && j !== col && sudokuBoard[i][j] === num) return true;
      }
    }

    return false;
  };

  const validateSolution = () => {
    for (let row = 0; row < 9; row++) {
      if (!isValidSet(sudokuBoard[row])) {
        return false;
      }
    }

    for (let col = 0; col < 9; col++) {
      const column = sudokuBoard.map((row) => row[col]);
      if (!isValidSet(column)) {
        return false;
      }
    }

    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const box = [];
        for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
          for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
            box.push(sudokuBoard[row][col]);
          }
        }
        if (!isValidSet(box)) {
          return false;
        }
      }
    }

    return true;
  };

  const isValidSet = (items: (number | null)[]) => {
    const numbers = items.filter((item) => item !== null);
    if (numbers.length !== 9) {
      return false;
    }
    return new Set(numbers).size === 9;
  };

  const undo = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;

      const lastBoard = prev[prev.length - 1];
      setSudokuBoard(lastBoard.map((row) => [...row]));
      return prev.slice(0, prev.length - 1);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex gap-3 justify-center">
        <button
          className="mt-4 p-2 bg-gray-200 hover:bg-gray-900 hover:text-white rounded"
          onClick={() => {
            const isCorrect = validateSolution();
            if (isCorrect) {
              alert('恭喜，您成功解开了数独！');
            } else {
              alert('解答错误，请再试一次。');
            }
          }}
        >
          提交
        </button>
        <button
          className="mt-4 p-2 bg-gray-200 hover:bg-gray-900 hover:text-white rounded"
          onClick={resetGame}
        >
          重置
        </button>
        <button
          className="mt-4 p-2 bg-gray-200 rounded hover:bg-gray-900 hover:text-white"
          onClick={() => handleDifficultyChange('easy')}
        >
          简单
        </button>
        <button
          className="mt-4 p-2 bg-gray-200 rounded hover:bg-gray-900 hover:text-white"
          onClick={() => handleDifficultyChange('normal')}
        >
          普通
        </button>
        <button
          className="mt-4 p-2 bg-gray-200 rounded hover:bg-gray-900 hover:text-white"
          onClick={() => handleDifficultyChange('hard')}
        >
          困难
        </button>
      </div>
      <div className="grid grid-cols-9 gap-0 bg-gray-50 border border-gray-600">
        {sudokuArray.map((value, index) => {
          const row = Math.floor(index / 9);
          const col = index % 9;

          const borderStyle = `border border-gray-300 ${
            row % 3 === 0 ? 'border-t-gray-600' : ''
          } ${col % 3 === 0 ? 'border-l-gray-600' : ''} ${
            row % 3 === 2 ? 'border-b-gray-600' : ''
          } ${col % 3 === 2 ? 'border-r-gray-600' : ''}`;

          const highlightError = checkForErrors(index);
          const highlight = value === selectedNumber && selectedNumber !== null;
          const initialEmpty =
            initialEmptyCells[row] && initialEmptyCells[row][col];

          return (
            <SudokuCell
              key={index}
              index={index}
              value={value}
              isSelected={index === selectedCell}
              onChange={handleCellChange}
              borderStyle={borderStyle}
              currentValue={currentValue}
              selectedRow={Math.floor(selectedCell / 9)}
              selectedCol={selectedCell % 9}
              highlightError={highlightError}
              highlight={highlight}
              initialEmpty={initialEmpty}
            />
          );
        })}
      </div>
      <div>
        <div className="grid grid-cols-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className={`w-12 h-12 m-1 ${
                currentValue === num ? 'bg-yellow-400' : 'bg-gray-200'
              }`}
              onClick={() => handleNumberSelect(num)}
            >
              {num}
            </button>
          ))}
          <button
            className="w-12 h-12 m-1 bg-gray-200 flex justify-center items-center"
            onClick={undo}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 14 4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SudokuBoard;
