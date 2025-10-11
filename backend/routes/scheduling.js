import express from 'express';
import Meeting from '../models/Meeting.js';
import { sendSchedulingEmail } from '../services/emailService.js';

const router = express.Router();

// Create a new meeting with proposed time slots
router.post('/create', async (req, res) => {
  try {
    const { title, description, createdBy, proposedTimeSlots, maxParticipants } = req.body;

    const meeting = new Meeting({
      title: title || 'Builders.to Coworking Session',
      description: description || '5 min intro → 30 min focused work → 10 min recap',
      createdBy,
      proposedTimeSlots: proposedTimeSlots.map(slot => ({
        dateTime: new Date(slot.dateTime),
        votes: [],
        voteCount: 0
      })),
      maxParticipants: maxParticipants || 10,
      status: 'voting',
      participants: [createdBy]
    });

    await meeting.save();

    // Send email to creator
    if (createdBy.email) {
      await sendSchedulingEmail({
        to: createdBy.email,
        meetingId: meeting._id,
        meetingTitle: meeting.title,
        type: 'created'
      });
    }

    res.status(201).json({
      success: true,
      meeting,
      shareLink: `${process.env.FRONTEND_URL}/meeting/${meeting._id}`
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vote for a time slot
router.post('/:meetingId/vote', async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { timeSlotIndex, voter } = req.body;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    if (meeting.status !== 'voting') {
      return res.status(400).json({ success: false, error: 'Voting is closed for this meeting' });
    }

    // Check if user already voted for this slot
    const existingVote = meeting.proposedTimeSlots[timeSlotIndex].votes.find(
      v => v.email === voter.email
    );

    if (existingVote) {
      return res.status(400).json({ success: false, error: 'You already voted for this time slot' });
    }

    // Add vote
    meeting.proposedTimeSlots[timeSlotIndex].votes.push(voter);
    meeting.proposedTimeSlots[timeSlotIndex].voteCount += 1;

    // Add participant if not already in list
    const isParticipant = meeting.participants.some(p => p.email === voter.email);
    if (!isParticipant) {
      meeting.participants.push(voter);
    }

    await meeting.save();

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove vote
router.post('/:meetingId/unvote', async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { timeSlotIndex, voterEmail } = req.body;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    // Remove vote
    const votes = meeting.proposedTimeSlots[timeSlotIndex].votes;
    meeting.proposedTimeSlots[timeSlotIndex].votes = votes.filter(
      v => v.email !== voterEmail
    );
    meeting.proposedTimeSlots[timeSlotIndex].voteCount = meeting.proposedTimeSlots[timeSlotIndex].votes.length;

    await meeting.save();

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Error removing vote:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get meeting details
router.get('/:meetingId', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Finalize meeting time (select winning time slot)
router.post('/:meetingId/finalize', async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { timeSlotIndex } = req.body;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    meeting.selectedTimeSlot = meeting.proposedTimeSlots[timeSlotIndex].dateTime;
    meeting.status = 'scheduled';

    await meeting.save();

    // Send confirmation emails to all participants
    for (const participant of meeting.participants) {
      if (participant.email) {
        await sendSchedulingEmail({
          to: participant.email,
          meetingId: meeting._id,
          meetingTitle: meeting.title,
          meetingTime: meeting.selectedTimeSlot,
          type: 'scheduled'
        });
      }
    }

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Error finalizing meeting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
