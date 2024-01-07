import { connectToDB } from '@/lib/mongoose';
import { getGameSessionModel } from '../../../lib/models/gameSession.model';

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const sessionObjectId = url.searchParams.get('sessionObjectId');

  if (!sessionObjectId) {
    return new Response('需要提供 sessionObjectId', { status: 400 });
  }

  const GameSession = getGameSessionModel();

  try {
    await connectToDB();

    const gameSession = await GameSession.findOne({
      _id: sessionObjectId,
    }).lean();

    if (!gameSession) {
      return new Response('未找到游戏会话', { status: 404 });
    }

    return new Response(JSON.stringify(gameSession), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error(err);
    return new Response('服务器错误', { status: 500 });
  }
};
