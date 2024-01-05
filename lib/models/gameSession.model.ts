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
    board: { type: [[Number]], required: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'normal', 'hard'],
    },
    history: { type: [moveSchema], default: [] },
    initialBoard: { type: [[Number]], required: true },
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
