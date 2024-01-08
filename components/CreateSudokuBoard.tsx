'use client';

import SudokuCell from '@/components/SudokuCell';
import { v4 as uuidv4 } from 'uuid';
import { useCallback, useEffect, useState } from 'react';
import NumberPanel from './NumberPanel';
import { useRouter } from 'next/navigation';

const CreateSudokuBoard = () => {
  const router = useRouter();

  const initialBoard: Board = Array.from({ length: 9 }, () =>
    Array(9).fill(null)
  );
  const [sudokuBoard, setSudokuBoard] = useState<Board>(initialBoard);
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');
  const [userId, setUserId] = useState<string>('');
  const [userObjectId, setUserObjectId] = useState<string>('');

  const [isUserReady, setIsUserReady] = useState(false);

  const [selectedCell, setSelectedCell] = useState(-1);

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

  const initializeUser = useCallback(async () => {
    let currentUserId = localStorage.getItem('userId');
    let currentUserObjectId = localStorage.getItem('userData');

    if (currentUserId) setUserId(currentUserId);

    if (currentUserObjectId) setUserObjectId(currentUserObjectId);

    if (!currentUserId && !currentUserObjectId) {
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
    setIsUserReady(true);
  }, []);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const createNewGame = async (board: Board, difficulty: GameDifficulty) => {
    if (!isUserReady) {
      console.error('用户未准备好');
      return;
    }

    const newSessionId = uuidv4();
    initializeUser();
    const newGameState = {
      sessionId: newSessionId,
      user: userObjectId,
      board: board,
      difficulty: difficulty,
      history: [],
      gameStatus: 'processing',
      initialBoard: board,
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
        `sudokuGameState_${newSessionId}`,
        JSON.stringify(newGameState)
      );

      const updatedUserData = await updateUserResponse.json();
      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      router.push(`/game/${newSessionId}`);
    } catch (error) {
      console.error('Failed to save game session', error);
      localStorage.setItem(
        `sudokuGameState_${newSessionId}`,
        JSON.stringify(newGameState)
      );
    }
  };

  const handleNumberSelect = (num: number) => {
    if (selectedCell !== -1) {
      const row = Math.floor(selectedCell / 9);
      const col = selectedCell % 9;

      const newBoard = [...sudokuBoard];
      newBoard[row][col] = num;

      setSudokuBoard(newBoard);
      console.log(sudokuBoard);
    }
  };

  const sudokuArray = sudokuBoard.flat();

  return (
    <div className="flex flex-col md:grid md:grid-cols-[1fr,auto] items-start gap-2 md:gap-4 mx-auto">
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
                initialEmpty={true}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-4 md:mt-0 w-full h-full flex flex-col gap-2 md:gap-4 justify-between items-start md:w-full">
        <div className="w-full">
          <h3 className="font-bold text-md md:text-xl mb-2 text-gray-800">
            填写数字
          </h3>
          <NumberPanel
            selectedNumber={selectedNumber}
            handleNumberSelect={handleNumberSelect}
            gameStatus={'processing'}
          />
        </div>
        <div className="w-full">
          <h3 className="font-bold text-md md:text-xl mb-2 text-gray-800">
            选择难度
          </h3>
          <div className="grid grid-cols-3 w-full md:flex md:gap-4">
            <button
              className={
                difficulty === 'easy'
                  ? 'p-2 md:p-4 md:rounded bg-gray-900 text-white cursor-default'
                  : 'p-2 md:p-4 bg-gray-200 md:rounded hover:bg-gray-900 hover:text-white'
              }
              onClick={() => setDifficulty('easy')}
            >
              简单
            </button>
            <button
              className={
                difficulty === 'normal'
                  ? 'p-2 md:p-4 md:rounded bg-gray-900 text-white cursor-default'
                  : 'p-2 md:p-4 bg-gray-200 md:rounded hover:bg-gray-900 hover:text-white'
              }
              onClick={() => setDifficulty('normal')}
            >
              普通
            </button>
            <button
              className={
                difficulty === 'hard'
                  ? 'p-2 md:p-4 md:rounded bg-gray-900 text-white cursor-default'
                  : 'p-2 md:p-4 bg-gray-200 md:rounded hover:bg-gray-900 hover:text-white'
              }
              onClick={() => setDifficulty('hard')}
            >
              困难
            </button>
          </div>
        </div>
        <div className="w-full">
          <h3 className="font-bold text-md md:text-xl mb-2 text-gray-800">
            点击创建
          </h3>
          <button
            onClick={() => createNewGame(sudokuBoard, difficulty)}
            className="w-full p-2 md:p-4 bg-gray-200 md:text-xl hover:bg-gray-900 hover:text-white rounded"
          >
            创建新游戏
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSudokuBoard;
