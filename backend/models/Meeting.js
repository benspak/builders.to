import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  dateTime: {
    type: Date,
    required: true
  },
  votes: [{
    userId: String,
    userName: String,
    email: String
  }],
  voteCount: {
    type: Number,
    default: 0
  }
});

const participantSchema = new mongoose.Schema({
  userId: String,
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Builders.to Coworking Session'
  },
  description: {
    type: String,
    default: '5 min intro → 30 min focused work → 10 min recap'
  },
  createdBy: {
    userId: String,
    name: String,
    email: String
  },
  status: {
    type: String,
    enum: ['voting', 'scheduled', 'completed', 'cancelled'],
    default: 'voting'
  },
  proposedTimeSlots: [timeSlotSchema],
  selectedTimeSlot: {
    type: Date
  },
  duration: {
    type: Number,
    default: 45 // 45 minutes total
  },
  participants: [participantSchema],
  zoomLink: String,
  zoomMeetingId: String,
  zoomPassword: String,
  maxParticipants: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

meetingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Meeting', meetingSchema);
