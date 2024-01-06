import { connectToDB } from '@/lib/mongoose';
import { getUserModel } from '@/lib/models/user.model';

export const GET = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const userIdentifier = requestUrl.searchParams.get('userId');

  if (!userIdentifier) {
    return new Response('User ID is required', { status: 400 });
  }

  const UserModel = getUserModel();

  try {
    await connectToDB();

    const userGameRecords = (await UserModel.findOne({ userId: userIdentifier })
      .populate('createdGames')
      .lean()) as any;

    if (!userGameRecords || !userGameRecords.createdGames) {
      return new Response('No game sessions found for this user', {
        status: 404,
      });
    }

    return new Response(JSON.stringify(userGameRecords.createdGames), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response('Internal server error', { status: 500 });
  }
};
