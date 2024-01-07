import { connectToDB } from '@/lib/mongoose';
import { getUserModel } from '@/lib/models/user.model';

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return new Response('需要提供 userId', { status: 400 });
  }

  const User = getUserModel();
  try {
    await connectToDB();
    const userWithGames = await User.findOne({ userId }).lean();

    if (!userWithGames) {
      return new Response('未找到用户或游戏历史', { status: 404 });
    }
    console.log(userWithGames);
    return new Response(JSON.stringify(userWithGames), {
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
