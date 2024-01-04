// actions/puzzle.action.ts
import Puzzle from '../models/puzzle.model';
import { connectToDB } from '../mongoose';

interface Params {
  puzzleId: string;
  initialGrid: number[][];
  solution: number[][];
}

export async function updatePuzzle({
  puzzleId,
  initialGrid,
  solution,
}: Params): Promise<void> {
  await connectToDB();

  try {
    const puzzle = await Puzzle.findByIdAndUpdate(
      puzzleId,
      {
        initialGrid: initialGrid,
        solution: solution,
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
      }
    );
    if (!puzzle) {
      throw new Error('Puzzle not found or failed to create.');
    }
  } catch (error) {
    throw new Error(`Failed to update puzzle: ${puzzleId}`);
  }
}
