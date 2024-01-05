// lib/gameSessionService.ts
import { getGameSessionModel } from './models/gameSession.model';
import { connectToDB } from './mongoose';

interface UpdateGameSessionParams {
  sessionId: string;
  currentGrid: Board;
  moves: Move[];
}

export async function updateGameSession({
  sessionId,
  currentGrid,
  moves,
}: UpdateGameSessionParams): Promise<any> {
  await connectToDB();

  try {
    const GameSession = getGameSessionModel();
    const updatedSession = await GameSession.findOneAndUpdate(
      { sessionId },
      { currentGrid, moves },
      { new: true, upsert: true }
    );
    return updatedSession;
  } catch (error) {
    throw new Error(`Failed to update session: ${sessionId}`);
  }
}

export async function getGameSession(sessionId: string): Promise<any> {
  await connectToDB();

  try {
    const GameSession = getGameSessionModel();
    const gameSession = await GameSession.findOne({ sessionId });
    if (!gameSession) {
      throw new Error('Session not found');
    }
    return gameSession;
  } catch (error) {
    throw new Error(`Failed to retrieve session: ${sessionId}`);
  }
}
