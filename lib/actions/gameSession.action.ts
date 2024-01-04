import GameSession from '../models/gameSession.model';
import { connectToDB } from '../mongoose';

interface Params {
  sessionId: string;
  currentGrid: number[][];
  moves: Move[][];
}

export async function updateGameSession({
  sessionId,
  currentGrid,
  moves,
}: Params): Promise<void> {
  await connectToDB();

  try {
    await GameSession.findOneAndUpdate(
      { sessionId: sessionId },
      {
        currentGrid: currentGrid,
        moves: moves,
      },
      {
        new: true,
        upsert: true,
      }
    );
  } catch (error: any) {
    throw new Error(`Failed to create/updat session: ${sessionId}`);
  }
}
