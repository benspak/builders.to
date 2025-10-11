# Builders.to Backend

Express.js REST API for the Builders.to video coworking platform.

## Structure

```
backend/
├── models/           # MongoDB schemas
│   ├── Meeting.js    # Meeting data & voting
│   └── User.js       # User profiles
├── routes/           # API endpoints
│   ├── scheduling.js # Create/vote/finalize meetings
│   ├── meetings.js   # Zoom links, upcoming sessions
│   └── users.js      # User management
├── services/         # Business logic
│   ├── emailService.js    # Resend email integration
│   └── zoomService.js     # Zoom API integration
└── server.js         # Express app entry point
```

## API Endpoints

### Health Check
```
GET /api/health
Response: { "status": "ok", "message": "Builders.to API is running" }
```

### Scheduling

**Create Meeting**
```
POST /api/scheduling/create
Body: {
  "title": "Session Title",
  "createdBy": { "name": "...", "email": "..." },
  "proposedTimeSlots": [{ "dateTime": "2025-10-15T10:00:00Z" }]
}
Response: { "success": true, "meeting": {...}, "shareLink": "..." }
```

**Vote for Time Slot**
```
POST /api/scheduling/:meetingId/vote
Body: {
  "timeSlotIndex": 0,
  "voter": { "name": "...", "email": "..." }
}
Response: { "success": true, "meeting": {...} }
```

**Get Meeting**
```
GET /api/scheduling/:meetingId
Response: { "success": true, "meeting": {...} }
```

**Finalize Meeting**
```
POST /api/scheduling/:meetingId/finalize
Body: { "timeSlotIndex": 0 }
Response: { "success": true, "meeting": {...} }
```

### Meetings

**Create Zoom Link**
```
POST /api/meetings/:meetingId/zoom
Response: {
  "success": true,
  "zoomLink": "...",
  "zoomMeetingId": "...",
  "zoomPassword": "..."
}
```

**Get Upcoming Meetings**
```
GET /api/meetings/upcoming
Response: { "success": true, "meetings": [...] }
```

### Users

**Create/Update User**
```
POST /api/users
Body: { "name": "...", "email": "...", "timezone": "America/New_York" }
Response: { "success": true, "user": {...} }
```

**Get User**
```
GET /api/users/:email
Response: { "success": true, "user": {...} }
```

## Environment Variables

See `.env.example` for all configuration options.

## Development

```bash
# Install dependencies
npm install

# Start dev server with nodemon
npm run dev

# Start production server
npm start
```

## Database Schema

### Meeting
- `title`: String
- `description`: String
- `createdBy`: { name, email }
- `status`: 'voting' | 'scheduled' | 'completed' | 'cancelled'
- `proposedTimeSlots`: [{ dateTime, votes[], voteCount }]
- `selectedTimeSlot`: Date
- `participants`: [{ name, email, joinedAt }]
- `zoomLink`: String
- `maxParticipants`: Number (default: 10)

### User
- `name`: String
- `email`: String (unique)
- `timezone`: String
- `preferences`: { notifications, reminderMinutes }
- `meetings`: [{ meetingId, role }]

## Error Handling

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## CORS

Configured to accept requests from `FRONTEND_URL` environment variable.

## Email Templates

Email templates are in `services/emailService.js`:
- `created`: New meeting confirmation
- `scheduled`: Meeting time finalized
- `reminder`: Meeting starting soon

## Zoom Integration

Uses Server-to-Server OAuth for authentication. Requires:
- ZOOM_ACCOUNT_ID
- ZOOM_CLIENT_ID
- ZOOM_CLIENT_SECRET

Token is cached and refreshed automatically.

## Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Create test meeting
curl -X POST http://localhost:5000/api/scheduling/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Session",
    "createdBy": {"name": "Test", "email": "test@example.com"},
    "proposedTimeSlots": [{"dateTime": "2025-10-15T10:00:00Z"}]
  }'
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use production MongoDB URI
3. Configure all required API keys
4. Enable HTTPS
5. Set up monitoring (error logging)
6. Configure rate limiting (recommended)

See `../DEPLOYMENT.md` for detailed instructions.
