// 假设这是文件 `loadGame.route.ts`
import { connectToDB } from '@/lib/mongoose';
import { getGameSessionModel } from '../../../lib/models/gameSession.model';

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('需要提供 sessionId', { status: 400 });
  }

  const GameSession = getGameSessionModel();

  try {
    await connectToDB();

    const gameSession = await GameSession.findOne({ sessionId }).lean();

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
