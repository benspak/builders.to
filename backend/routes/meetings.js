import express from 'express';
import Meeting from '../models/Meeting.js';
import { createZoomMeeting } from '../services/zoomService.js';

const router = express.Router();

// Create Zoom meeting link for scheduled meeting
router.post('/:meetingId/zoom', async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    if (meeting.status !== 'scheduled') {
      return res.status(400).json({ success: false, error: 'Meeting must be scheduled first' });
    }

    // Create Zoom meeting
    const zoomMeeting = await createZoomMeeting({
      topic: meeting.title,
      startTime: meeting.selectedTimeSlot,
      duration: meeting.duration,
      agenda: meeting.description
    });

    meeting.zoomLink = zoomMeeting.join_url;
    meeting.zoomMeetingId = zoomMeeting.id;
    meeting.zoomPassword = zoomMeeting.password;

    await meeting.save();

    res.json({
      success: true,
      zoomLink: meeting.zoomLink,
      zoomMeetingId: meeting.zoomMeetingId,
      zoomPassword: meeting.zoomPassword
    });
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all upcoming meetings
router.get('/upcoming', async (req, res) => {
  try {
    const meetings = await Meeting.find({
      status: 'scheduled',
      selectedTimeSlot: { $gte: new Date() }
    }).sort({ selectedTimeSlot: 1 });

    res.json({
      success: true,
      meetings
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
