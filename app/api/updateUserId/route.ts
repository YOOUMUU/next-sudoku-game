import { connectToDB } from '@/lib/mongoose';
import { getUserModel } from '@/lib/models/user.model';

export const POST = async (req: Request, res: Response) => {
  const { userId, createdGames } = await req.json();
  const User = getUserModel();

  try {
    await connectToDB();

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { createdGames },
      {
        upsert: true,
        new: true,
      }
    );

    return new Response(JSON.stringify(updatedUser), {
      status: 201,
    });
  } catch (err) {
    return new Response('更新用户失败', { status: 500 });
  }
};
