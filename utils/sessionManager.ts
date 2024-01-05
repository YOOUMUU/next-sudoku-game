// SessionManager.ts
import { v4 as uuidv4 } from 'uuid';

type Move = {
  position: { row: number; col: number };
  value: number;
  timeStamp: Date;
};

export const saveGameState = (
  sessionId: string,
  board: Board,
  history: Move[],
  difficulty: GameDifficulty
): void => {
  const gameState = {
    board: board,
    history: history,
    difficulty: difficulty,
  };
  localStorage.setItem(
    `sudokuGameState_${sessionId}`,
    JSON.stringify(gameState)
  );
};

export const loadGameSession = (
  sessionId: string
): { board: Board; history: Move[]; difficulty: GameDifficulty } | null => {
  const gameState = localStorage.getItem(`sudokuGameState_${sessionId}`);
  if (gameState) {
    return JSON.parse(gameState);
  }
  return null;
};

export const generateSessionId = (): string => {
  return uuidv4();
};
