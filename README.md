# Builders.to - Video Coworking Platform

A MERN stack application for scheduling and hosting video coworking sessions for founders and builders.

## 🎯 What is Builders.to?

Builders.to helps founders escape isolation and ship faster through structured 45-minute coworking sessions:

- **5 minutes**: Get to know each other
- **30 minutes**: Heads down focused work
- **10 minutes**: Recap and share progress

## 🚀 Features

### Core Features
- **Beautiful Landing Page**: Spotify-inspired dark mode design with Chakra UI
- **Smart Scheduling**: Create sessions with multiple proposed time slots
- **Consensus Voting**: Let participants vote on the best time for everyone
- **Zoom Integration**: Automatically generate Zoom meeting links
- **Email Notifications**: Powered by Resend for meeting reminders
- **Real-time Updates**: See votes come in as participants respond

### Tech Stack
- **Frontend**: React 18 + Vite + Chakra UI v2
- **Backend**: Node.js + Express + MongoDB
- **APIs**: OpenAI (future features), Zoom, Resend
- **Deployment**: Render.com ready

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Install all dependencies**:
```bash
npm run install:all
```

2. **Configure Backend Environment**:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Zoom Integration
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_ACCOUNT_ID=your_zoom_account_id

# Optional
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
JWT_SECRET=your_random_secret_key
```

3. **Start Development Servers**:
```bash
npm run dev
```

This will start:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## 🔧 Configuration

### MongoDB Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and add it to `.env`

### Resend Email Setup
1. Sign up at [Resend](https://resend.com)
2. Get your API key
3. Configure your sending domain (or use their test domain)
4. Add API key to `.env`

### Zoom Integration Setup
1. Go to [Zoom App Marketplace](https://marketplace.zoom.us)
2. Create a Server-to-Server OAuth app
3. Copy your Account ID, Client ID, and Client Secret
4. Add scopes: `meeting:write`, `meeting:read`
5. Add credentials to `.env`

## 🎨 Customization

### Theme
The app uses a Spotify-inspired dark theme. Customize in `frontend/src/theme.js`:

```javascript
colors: {
  brand: {
    500: '#3f9142', // Primary green
  },
  dark: {
    bg: '#121212',
    bgSecondary: '#181818',
  }
}
```

## 📁 Project Structure

```
builders.to/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic (Zoom, Email)
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── theme.js     # Chakra UI theme
│   │   └── App.jsx      # Main app component
│   └── index.html
└── package.json
```

## 🌐 Deployment

### Deploy to Render.com

#### Backend
1. Create a new Web Service
2. Connect your GitHub repo
3. Configure:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
4. Add environment variables from `.env`

#### Frontend
1. Create a new Static Site
2. Configure:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
3. Update backend URL in frontend code

## 🔐 Environment Variables

### Required
- `MONGODB_URI`: MongoDB connection string
- `RESEND_API_KEY`: Email service API key

### Optional
- `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_ACCOUNT_ID`: For Zoom integration
- `OPENAI_API_KEY`: For future AI features
- `STRIPE_SECRET_KEY`: For future payment features

## 🚦 API Endpoints

### Scheduling
- `POST /api/scheduling/create` - Create new meeting
- `POST /api/scheduling/:meetingId/vote` - Vote for time slot
- `GET /api/scheduling/:meetingId` - Get meeting details
- `POST /api/scheduling/:meetingId/finalize` - Finalize meeting time

### Meetings
- `POST /api/meetings/:meetingId/zoom` - Generate Zoom link
- `GET /api/meetings/upcoming` - Get upcoming meetings

### Users
- `POST /api/users` - Create/update user
- `GET /api/users/:email` - Get user details

## 🎯 Usage Flow

1. **Create Session**: Organizer creates a coworking session with 2-5 proposed time slots
2. **Share Link**: Copy and share the unique meeting link
3. **Vote**: Participants vote on times that work for them
4. **Finalize**: Organizer selects the winning time slot
5. **Generate Zoom**: System creates Zoom meeting link
6. **Notifications**: All participants receive email confirmation
7. **Join**: At scheduled time, participants join via Zoom

## 🤝 Integration with TidyCal

Your existing TidyCal booking link (https://tidycal.com/benvspak/virtual-coworking) can work alongside this platform:

- Use TidyCal for 1-on-1 bookings
- Use Builders.to for group coworking sessions with consensus scheduling

## 💡 Future Enhancements

- [ ] Stripe integration for premium features
- [ ] OpenAI-powered session summaries
- [ ] Recurring session templates
- [ ] Community leaderboard (most active builders)
- [ ] Session recordings
- [ ] Mobile app

## 📝 License

MIT License - feel free to use this for your own projects!

## 🙋‍♂️ Support

Questions? Issues? Create an issue on GitHub or reach out!

---

Built by builders, for builders. Let's ship together! 🚀
