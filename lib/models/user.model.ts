import mongoose, { Model } from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    createdGames: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'GameSession' },
    ],
  },
  { timestamps: true }
);

function getUserModel(): Model<any> {
  if (mongoose.models.User) {
    return mongoose.models.User;
  } else {
    return mongoose.model('User', userSchema);
  }
}

export { getUserModel };
