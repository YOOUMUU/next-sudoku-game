import { connectToDB } from '@/lib/mongoose';
import { getUserModel } from '@/lib/models/user.model';

export const POST = async (req: Request, res: Response) => {
  const { userId, sessionObjectId } = await req.json();
  const User = getUserModel();

  try {
    await connectToDB();

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $addToSet: { createdGames: sessionObjectId } },
      { upsert: true, new: true }
    );

    return new Response(JSON.stringify(updatedUser), {
      status: 201,
    });
  } catch (err) {
    console.error(err);

    return new Response('更新用户createdGames失败', { status: 500 });
  }
};
