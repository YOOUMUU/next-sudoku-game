// models/puzzle.model.ts
import mongoose from 'mongoose';

const puzzleSchema = new mongoose.Schema({
  initialGrid: { type: Array, required: true },
  solution: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Puzzle = mongoose.models.Puzzle || mongoose.model('Puzzle', puzzleSchema);

export default Puzzle;
