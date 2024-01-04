import mongoose from 'mongoose';

const moveSchema = new mongoose.Schema({
  position: {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
  },
  value: { type: Number, required: true },
  timeStamp: { type: Date, required: true },
});

const gameSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  puzzleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle',
    required: true,
  },
  currentGrid: { type: Array, required: true, default: [] },
  moves: { type: [moveSchema], default: [] },
  status: {
    type: String,
    required: true,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress',
  },
});

const GameSession =
  mongoose.models.GameSession ||
  mongoose.model('GameSession', gameSessionSchema);

export default GameSession;
