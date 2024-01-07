'use client';

import SudokuCell from '@/components/SudokuCell';
import { useEffect, useState, useCallback } from 'react';
import { createSudoku } from '@/utils/sudoku';
import { v4 as uuidv4 } from 'uuid';
import { useRouter, useParams } from 'next/navigation';
import SudokuControl from './GameControl';
import NumberPanel from './NumberPanel';
import DifficultyControl from './DifficultyControl';
import StepsControl from './StepsControl';

const SudokuBoard = () => {
  const [userId, setUserId] = useState<string>('');
  const [userObjectId, setUserObjectId] = useState<string>('');

  const router = useRouter();
  const { sessionId: paramsId } = useParams();
  const [selectedCell, setSelectedCell] = useState(-1);

  const initialBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
  const [sudokuBoard, setSudokuBoard] = useState<Board>(initialBoard);
  const [currentBoard, setCurrentBoard] = useState<Board>([]);

  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const [history, setHistory] = useState<Move[]>([]);
  const [initialEmptyCells, setInitialEmptyCells] = useState<boolean[][]>([]);
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [undoneSteps, setUndoneSteps] = useState<Move[]>([]);

  const [gameStatus, setGameStatus] = useState<GameStatus>('processing');

  const [gameHistory, setGameHistory] = useState([]);

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
      user: string,
      board: Board,
      difficulty: GameDifficulty,
      history: Move[],
      gameStatus: GameStatus,
      initialBoard?: Board
    ) => {
      const newGameState = {
        sessionId,
        user,
        board,
        difficulty,
        history,
        gameStatus,
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

        const sessionData = await response.json();

        const updateUserResponse = await fetch('/api/updateUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            sessionObjectId: sessionData._id,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        if (!updateUserResponse.ok) {
          throw new Error(`Error: ${updateUserResponse.statusText}`);
        }

        localStorage.setItem(
          `sudokuGameState_${sessionId}`,
          JSON.stringify(newGameState)
        );

        const updatedUserData = await updateUserResponse.json();
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
      } catch (error) {
        console.error('Failed to save game session', error);
        localStorage.setItem(
          `sudokuGameState_${sessionId}`,
          JSON.stringify(newGameState)
        );
      }
    },
    [userId]
  );

  const initializeUser = useCallback(async () => {
    let currentUserId = localStorage.getItem('userId');
    if (currentUserId) setUserId(currentUserId);
    if (!currentUserId) {
      currentUserId = uuidv4();
      localStorage.setItem('userId', currentUserId);
      setUserId(currentUserId);

      try {
        const response = await fetch('/api/createUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: currentUserId }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const userData = await response.json();

        if (userData) {
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Failed to create user', error);
        return;
      }
    }
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      setUserObjectId(userData._id);
    }
  }, []);

  const createNewGameSession = useCallback(
    async (sessionId: string, difficulty: GameDifficulty) => {
      try {
        const newBoard = createNewBoard(difficulty);
        setDifficulty(difficulty);
        setSudokuBoard(newBoard);

        await saveGameState(
          sessionId,
          userObjectId,
          newBoard,
          difficulty,
          [],
          'processing',
          newBoard
        );
      } catch (error) {
        console.error('Failed to create new game session', error);
      }
    },
    [userObjectId, saveGameState]
  );

  const loadGameSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/loadGame?sessionId=${sessionId}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const {
        id,
        userObjectId,
        board,
        difficulty,
        history,
        gameStatus,
        initialBoard,
      } = await response.json();

      setGameStateFromResponse(
        id,
        userObjectId,
        board,
        difficulty,
        history,
        gameStatus,
        initialBoard
      );
    } catch (error) {
      console.error('Failed to load game session from API', error);
      const gameState = localStorage.getItem(`sudokuGameState_${sessionId}`);
      if (gameState) {
        const {
          id,
          userObjectId,
          board,
          difficulty,
          history,
          gameStatus,
          initialBoard,
        } = JSON.parse(gameState);
        setGameStateFromResponse(
          sessionId,
          userObjectId,
          board,
          difficulty,
          history,
          gameStatus,
          initialBoard
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setGameStateFromResponse = (
    sessionId: string,
    userObjectId: string,
    board: Board,
    difficulty: GameDifficulty,
    history: Move[],
    gameStatus: GameStatus,
    initialBoard: Board
  ) => {
    setDifficulty(difficulty);
    setSudokuBoard(board);
    setHistory(history);
    setGameStatus(gameStatus);
    setCurrentBoard(initialBoard);

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
    initializeUser();
  }, [initializeUser]);

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
    if (userObjectId) {
      if (paramsId) {
        loadGameSession(paramsId as string);
      } else {
        const newSessionId = generateSessionId();
        createNewGameSession(newSessionId, difficulty);
        redirectToNewGame(newSessionId);
      }
    }
  }, [
    difficulty,
    userObjectId,
    paramsId,
    createNewGameSession,
    loadGameSession,
    redirectToNewGame,
  ]);

  const resetGame = async () => {
    setIsLoading(true);

    try {
      const newSessionId = generateSessionId();
      await createNewGameSession(newSessionId, difficulty);
      redirectToNewGame(newSessionId);
    } catch (error) {
      console.error('Error resetting game:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 1200);
    }
  };

  const handleDifficultyChange = async (newDifficulty: GameDifficulty) => {
    if (newDifficulty !== difficulty) {
      setIsLoading(true);

      try {
        const newSessionId = generateSessionId();
        setDifficulty(newDifficulty);
        await createNewGameSession(newSessionId, newDifficulty);
        redirectToNewGame(newSessionId);
      } catch (error) {
        console.error('Error changing difficulty:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 1200);
      }
    }
  };

  const handleCellClick = async (index: number) => {
    const newValue = sudokuBoard[Math.floor(index / 9)][index % 9];
    if (selectedCell === index) {
      setSelectedCell(-1);
      setHighlightedCells([]);
      setSelectedNumber(null);
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

        const id = Array.isArray(paramsId) ? paramsId[0] : paramsId;

        saveGameState(
          id,
          userObjectId,
          newBoard,
          difficulty,
          newHistory,
          gameStatus,
          currentBoard
        ).catch((error) =>
          console.error('Failed to asynchronously save game state', error)
        );
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

  const submitSolution = () => {
    const isSolutionValid = validateSolution();
    const newGameStatus = isSolutionValid ? 'win' : 'failed';
    setGameStatus(newGameStatus);
    setHighlightedCells([]);
    setSelectedNumber(null);

    const id = Array.isArray(paramsId) ? paramsId[0] : paramsId;

    try {
      saveGameState(
        id,
        userObjectId,
        sudokuBoard,
        difficulty,
        history,
        newGameStatus,
        currentBoard
      );
    } catch (error) {
      console.error('Failed to update game status in database', error);
    } finally {
      return isSolutionValid;
    }
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

        const id = Array.isArray(paramsId) ? paramsId[0] : paramsId;
        saveGameState(
          id,
          userObjectId,
          newBoard,
          difficulty,
          newHistory,
          gameStatus
        ).catch((error) =>
          console.error('Failed to save game state after undo', error)
        );
      }

      return newHistory;
    });
  };

  const sudokuArray = sudokuBoard.flat();

  const goToNextStep = () => {
    if (undoneSteps.length > 0) {
      const newUndoneSteps = [...undoneSteps];
      const nextMove = newUndoneSteps.pop();
      setUndoneSteps(newUndoneSteps);

      if (nextMove) {
        const newBoard = [...sudokuBoard];
        const { row, col } = nextMove.position;
        newBoard[row][col] = nextMove.value;
        setSudokuBoard(newBoard);

        setHistory((prevHistory) => [...prevHistory, nextMove]);
      }
    }
    setSelectedCell(-1);
    setHighlightedCells([]);
    setSelectedNumber(null);
  };

  const goToPreviousStep = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const lastMove = newHistory.pop();
      setHistory(newHistory);

      if (lastMove) {
        setUndoneSteps((prevUndoneSteps) => [...prevUndoneSteps, lastMove]);

        const newBoard = [...sudokuBoard];
        const { row, col } = lastMove.position;
        newBoard[row][col] = null;
        setSudokuBoard(newBoard);
      }
    }
    setSelectedCell(-1);
    setHighlightedCells([]);
    setSelectedNumber(null);
  };

  const handlePreviousStep = async () => {
    if (gameStatus !== 'processing') {
      goToPreviousStep();
    } else {
      await undo();
    }
  };

  if (!paramsId) return null;

  if (isLoading) return <div>加载中...</div>;

  return (
    <>
      <div className="flex flex-col md:flex-row items-start gap-2 md:gap-4">
        <div className="flex flex-col items-center md:items-start">
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
                  onClick={handleCellClick}
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
          {gameStatus === 'win' && (
            <div className="mt-2 text-md md:text-xl text-gray-600">
              游戏结束！恭喜你赢得了胜利！🎉
            </div>
          )}

          {gameStatus === 'failed' && (
            <div className="mt-2 text-md md:text-xl text-gray-600">
              游戏结束！很遗憾，你没有完成挑战。😢
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 md:gap-4 justify-center items-start w-full md:w-auto">
          <DifficultyControl
            difficulty={difficulty}
            handleDifficultyChange={handleDifficultyChange}
          />
          <NumberPanel
            selectedNumber={selectedNumber}
            handleNumberSelect={
              gameStatus !== 'processing' ? () => {} : handleNumberSelect
            }
            gameStatus={gameStatus}
          />
          <div className="flex md:flex-col gap-4 w-full">
            <StepsControl
              goToPrev={handlePreviousStep}
              goToNext={goToNextStep}
              gameStatus={gameStatus}
            />
            <SudokuControl
              setGameStatus={setGameStatus}
              validateSolution={submitSolution}
              resetGame={resetGame}
              gameStatus={gameStatus}
            />
          </div>
        </div>
      </div>
      {gameHistory.length !== 0 && (
        <div>
          <h3>游戏历史</h3>
        </div>
      )}
    </>
  );
};

export default SudokuBoard;
