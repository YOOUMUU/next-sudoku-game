import { NextApiRequest, NextApiResponse } from 'next';
import { getGameSession } from '../../../../lib/gameSessionService';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { sessionId } = req.query;

    const gameSession = await getGameSession(sessionId as string);
    res.status(200).json(gameSession);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
