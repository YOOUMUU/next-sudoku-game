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

  const initialBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
  const [sudokuBoard, setSudokuBoard] = useState<Board>(initialBoard);

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

  const generateSessionId = () => {
    return uuidv4();
  };

  const saveGameState = useCallback(
    async (
      sessionId: string,
      board: Board,
      difficulty: GameDifficulty,
      history: Move[],
      initialBoard?: Board
    ) => {
      const newGameState = {
        sessionId,
        board,
        difficulty,
        history,
        initialBoard,
      };

      try {
        const response = await fetch('/api/saveGame', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newGameState),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        localStorage.setItem(
          `sudokuGameState_${sessionId}`,
          JSON.stringify(newGameState)
        );
      } catch (error) {
        console.error('Failed to save game session', error);
        localStorage.setItem(
          `sudokuGameState_${sessionId}`,
          JSON.stringify(newGameState)
        );
      }
    },
    []
  );

  const createNewGameSession = useCallback(
    async (sessionId: string) => {
      try {
        const newBoard = createNewBoard(difficulty);
        setSudokuBoard(newBoard);
        await saveGameState(sessionId, newBoard, difficulty, [], newBoard);
      } catch (error) {
        console.error('Failed to create new game session', error);
      }
    },
    [difficulty, saveGameState]
  );

  const loadGameSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/loadGame?sessionId=${sessionId}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const { board, difficulty, history, initialBoard } =
        await response.json();

      setGameStateFromResponse(
        sessionId,
        board,
        difficulty,
        history,
        initialBoard
      );
    } catch (error) {
      console.error('Failed to load game session from API', error);
      const gameState = localStorage.getItem(`sudokuGameState_${sessionId}`);
      if (gameState) {
        const { board, difficulty, history, initialBoard } =
          JSON.parse(gameState);
        setGameStateFromResponse(
          sessionId,
          board,
          difficulty,
          history,
          initialBoard
        );
      }
    }
  }, []);

  const setGameStateFromResponse = (
    sessionId: string,
    board: Board,
    difficulty: GameDifficulty,
    history: Move[],
    initialBoard?: Board
  ) => {
    setDifficulty(difficulty);
    setSudokuBoard(board);
    setHistory(history);

    const effectiveInitialBoard = initialBoard || board;
    const emptyCells = effectiveInitialBoard.map((row) =>
      row.map((cell) => cell === null)
    );
    setInitialEmptyCells(emptyCells);
  };

  const redirectToNewGame = useCallback(
    (sessionId: string) => {
      router.push(`/game/${sessionId}`);
    },
    [router]
  );

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

  useEffect(() => {
    if (sessionId) {
      loadGameSession(sessionId as string);
    } else {
      const newSessionId = generateSessionId();
      createNewGameSession(newSessionId);
      redirectToNewGame(newSessionId);
    }
  }, [createNewGameSession, loadGameSession, redirectToNewGame, sessionId]);

  const resetGame = async () => {
    const newBoard = createNewBoard(difficulty);
    const newSessionId = generateSessionId();

    await saveGameState(newSessionId, newBoard, difficulty, [], newBoard);

    setSudokuBoard(newBoard);
    setInitialEmptyCells(
      newBoard.map((row) => row.map((cell) => cell === null))
    );
    redirectToNewGame(newSessionId);
  };

  const handleDifficultyChange = async (newDifficulty: GameDifficulty) => {
    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      const newSessionId = generateSessionId();

      const newBoard = createNewBoard(newDifficulty);

      await saveGameState(newSessionId, newBoard, newDifficulty, [], newBoard);

      setSudokuBoard(newBoard);
      setInitialEmptyCells(
        newBoard.map((row) => row.map((cell) => cell === null))
      );

      redirectToNewGame(newSessionId);
    }
  };

  const handleCellChange = async (index: number) => {
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

      const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;
      await saveGameState(id, sudokuBoard, difficulty, history);
    }
  };

  const handleNumberSelect = async (num: number) => {
    if (selectedCell !== -1) {
      const row = Math.floor(selectedCell / 9);
      const col = selectedCell % 9;

      if (initialEmptyCells[row][col]) {
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

        setSudokuBoard(newBoard);
        setHistory(newHistory);

        const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;
        await saveGameState(id, newBoard, difficulty, newHistory);
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

  const undo = async () => {
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
        saveGameState(id, newBoard, difficulty, newHistory).catch((error) =>
          console.error('Failed to save game state after undo', error)
        );
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
