'use client';

import SudokuCell from '@/components/SudokuCell';
import { useEffect, useState, useCallback } from 'react';
import { createSudoku } from '@/utils/sudoku';
import { v4 as uuidv4 } from 'uuid';
import { useRouter, useParams } from 'next/navigation';
import SudokuControl from './SudokuControl';

const SudokuBoard = () => {
  const router = useRouter();
  const { sessionId } = useParams();
  const [selectedCell, setSelectedCell] = useState(-1);
  const [sudokuBoard, setSudokuBoard] = useState<Board>(
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const [history, setHistory] = useState<Move[]>([]);
  const [initialEmptyCells, setInitialEmptyCells] = useState<boolean[][]>([]);
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);

  function createNewBoard(difficulty: GameDifficulty) {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    createSudoku(board, difficulty);
    return board;
  }

  useEffect(() => {
    const newBoard = createNewBoard(difficulty);
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

  const generateSessionId = () => {
    return uuidv4();
  };

  const saveGameState = useCallback(
    (
      sessionId: string,
      board: Board,
      moveHistory: Move[],
      difficulty: GameDifficulty
    ) => {
      const gameState = {
        board: board,
        history: moveHistory,
        difficulty: difficulty,
      };
      localStorage.setItem(
        `sudokuGameState_${sessionId}`,
        JSON.stringify(gameState)
      );
    },
    []
  );

  const createNewGameSession = useCallback(
    (sessionId: string) => {
      try {
        const newBoard = createNewBoard(difficulty);
        setSudokuBoard(newBoard);
        saveGameState(sessionId, newBoard, [], difficulty);
      } catch (error) {
        console.error('Failed to create new game session', error);
      }
    },
    [saveGameState, difficulty]
  );

  const loadGameSession = useCallback((sessionId: string) => {
    try {
      const gameState = localStorage.getItem(`sudokuGameState_${sessionId}`);
      if (gameState) {
        const { board, history, difficulty } = JSON.parse(gameState) as {
          board: Board;
          history: Move[];
          difficulty: GameDifficulty;
        };
        setDifficulty(difficulty);
        setSudokuBoard(board);
        setHistory(history);

        const emptyCells = board.map((row: (number | null)[]) =>
          row.map((cell: number | null) => cell === null)
        );
        setInitialEmptyCells(emptyCells);
      }
    } catch (error) {
      console.error('Failed to load game session', error);
    }
  }, []);

  const redirectToNewGame = useCallback(
    (sessionId: string) => {
      router.push(`/game/${sessionId}`);
    },
    [router]
  );

  useEffect(() => {
    const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;
    if (id) {
      loadGameSession(id);
    } else {
      const newSessionId = generateSessionId();
      createNewGameSession(newSessionId);
      redirectToNewGame(newSessionId);
    }
  }, [sessionId, loadGameSession, redirectToNewGame, createNewGameSession]);

  const resetGame = () => {
    const newBoard = createNewBoard(difficulty);
    const newSessionId = generateSessionId();
    saveGameState(newSessionId, newBoard, [], difficulty);
    setSudokuBoard(newBoard);
    setInitialEmptyCells(
      newBoard.map((row) => row.map((cell) => cell === null))
    );
    redirectToNewGame(newSessionId);
  };

  const handleDifficultyChange = (newDifficulty: GameDifficulty) => {
    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      const newSessionId = generateSessionId();

      const newBoard = createNewBoard(newDifficulty);
      saveGameState(newSessionId, newBoard, [], newDifficulty);

      setSudokuBoard(newBoard);
      setInitialEmptyCells(
        newBoard.map((row) => row.map((cell) => cell === null))
      );

      redirectToNewGame(newSessionId);
    }
  };

  const handleCellChange = (index: number) => {
    const newValue = sudokuBoard[Math.floor(index / 9)][index % 9];
    if (selectedCell === index) {
      setSelectedCell(-1);
      setHighlightedCells([]);
    } else {
      setSelectedCell(index);
      if (newValue) {
        const newHighlightedCells: number[] = [];
        sudokuBoard.forEach((row, rowIndex) => {
          row.forEach((cellValue, colIndex) => {
            if (cellValue === newValue) {
              newHighlightedCells.push(rowIndex * 9 + colIndex);
            }
          });
        });
        setHighlightedCells(newHighlightedCells);
      } else {
        setHighlightedCells([]);
      }
    }
  };

  const handleNumberSelect = (num: number) => {
    if (selectedCell !== -1) {
      const row = Math.floor(selectedCell / 9);
      const col = selectedCell % 9;

      if (initialEmptyCells[row][col]) {
        // 确保该单元格可填入
        const newBoard = [...sudokuBoard];
        newBoard[row][col] = num;

        const newHistory = [
          ...history,
          {
            position: { row, col },
            value: num,
            timeStamp: new Date(),
          },
        ];
        const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;

        setSudokuBoard(newBoard);
        setHistory(newHistory);
        saveGameState(id, newBoard, newHistory, difficulty);
      }
    }
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
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;

      const newHistory = [...prevHistory];
      const lastMove = newHistory.pop();
      const newBoard = sudokuBoard.map((row) => [...row]);

      if (lastMove) {
        const { row, col } = lastMove.position;
        newBoard[row][col] = null;
        setSudokuBoard(newBoard);
        const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;

        saveGameState(id, newBoard, newHistory, difficulty);
      }

      return newHistory;
    });
  };

  const sudokuArray = sudokuBoard.flat();

  if (!sessionId) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <SudokuControl
        difficulty={difficulty}
        validateSolution={validateSolution}
        resetGame={resetGame}
        handleDifficultyChange={handleDifficultyChange}
      />
      <div className="grid grid-cols-9 gap-0 bg-gray-50 border border-gray-600">
        {sudokuArray.map((value, index) => {
          const row = Math.floor(index / 9);
          const col = index % 9;

          const borderStyle = `border border-gray-300 ${
            row % 3 === 0 ? 'border-t-gray-600' : ''
          } ${col % 3 === 0 ? 'border-l-gray-600' : ''} ${
            row % 3 === 2 ? 'border-b-gray-600' : ''
          } ${col % 3 === 2 ? 'border-r-gray-600' : ''}`;

          const initialEmpty =
            initialEmptyCells[row] && initialEmptyCells[row][col];
          const isHighlighted = highlightedCells.includes(index);

          return (
            <SudokuCell
              key={index}
              index={index}
              value={value}
              isSelected={index === selectedCell}
              onChange={handleCellChange}
              borderStyle={borderStyle}
              currentValue={selectedNumber}
              selectedRow={Math.floor(selectedCell / 9)}
              selectedCol={selectedCell % 9}
              highlight={isHighlighted}
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
                selectedNumber === num ? 'bg-yellow-400' : 'bg-gray-200'
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
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
