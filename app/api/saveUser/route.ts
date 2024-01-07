import { connectToDB } from '@/lib/mongoose';
import { getUserModel } from '../../../lib/models/user.model';

export const POST = async (req: Request, res: Response) => {
  const { userId } = await req.json();
  const User = getUserModel();

  try {
    await connectToDB();

    const newUser = new User({ userId });
    const savedUser = await newUser.save();

    return new Response(JSON.stringify(savedUser), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response('用户创建失败', { status: 500 });
  }
};
