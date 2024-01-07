import mongoose, { Model } from 'mongoose';

const moveSchema = new mongoose.Schema({
  position: {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
  },
  value: { type: Number, required: true },
  timeStamp: { type: Date, required: true },
});

const gameSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    board: { type: [[Number]], required: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'normal', 'hard'],
    },
    history: { type: [moveSchema], required: true, default: [] },
    gameStatus: {
      type: String,
      required: true,
      enum: ['win', 'failed', 'processing'],
    },
    initialBoard: { type: [[Number]] },
  },
  { timestamps: true }
);

function getGameSessionModel(): Model<any> {
  if (mongoose.models.GameSession) {
    return mongoose.models.GameSession;
  } else {
    return mongoose.model('GameSession', gameSessionSchema);
  }
}

export { getGameSessionModel };
