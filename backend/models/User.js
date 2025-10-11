import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  timezone: {
    type: String,
    default: 'America/New_York'
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    reminderMinutes: {
      type: Number,
      default: 15
    }
  },
  meetings: [{
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting'
    },
    role: {
      type: String,
      enum: ['creator', 'participant']
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
