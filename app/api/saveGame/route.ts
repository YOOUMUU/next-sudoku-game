import { connectToDB } from '@/lib/mongoose';
import { getGameSessionModel } from '../../../lib/models/gameSession.model';

export const POST = async (req: Request, res: Response) => {
  const { sessionId, ...gameState } = await req.json();
  const GameSession = getGameSessionModel();

  try {
    await connectToDB();

    const updatedSession = await GameSession.findOneAndUpdate(
      { sessionId },
      gameState,
      {
        upsert: true,
        new: true,
      }
    );

    return new Response(JSON.stringify(updatedSession), {
      status: 201,
    });
  } catch (err) {
    return new Response('新游戏创建失败', { status: 500 });
  }
};
