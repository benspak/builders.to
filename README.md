# builders.to

A landing page and application system for builders.to - a hacker house for motivated founders and builders in Orlando, Florida.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Resend API key (get one at [resend.com](https://resend.com))

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
PORT=5000
RESEND_API_KEY=your_resend_api_key_here
RECIPIENT_EMAIL=benvspak@gmail.com
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📦 Tech Stack

- **Frontend**: React + Vite + Chakra UI v2
- **Backend**: Node.js + Express
- **Email**: Resend
- **Styling**: Dark mode theme inspired by Spotify

## 🎨 Features

- Modern, responsive landing page with dark theme
- Application form with validation
- Email notifications sent to benvspak@gmail.com
- Professional UI with smooth animations
- Mobile-friendly design

## 📝 Application Form Fields

The application form collects:
- Name
- Phone Number
- Email
- Expected Move-in Date
- Current Project Details
- Builder Hours
- Work Information
- Monthly Budget

## 🚢 Deployment

### Backend (Render.com)

1. Create a new Web Service on Render.com
2. Connect your repository
3. Set the following:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     - `RESEND_API_KEY`: Your Resend API key
     - `RECIPIENT_EMAIL`: benvspak@gmail.com
     - `FRONTEND_URL`: Your frontend URL (e.g., `https://your-frontend-app.onrender.com`)
     - `NODE_ENV`: production
     - `PORT`: 5000 (optional, Render sets this automatically)

4. Copy the backend URL (e.g., `https://your-backend-app.onrender.com`)

### Frontend (Render.com)

1. Create a new Static Site on Render.com
2. Connect your repository
3. Set the following:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment Variables**:
     - `VITE_API_URL`: Your backend URL from step 1 (e.g., `https://your-backend-app.onrender.com`)

**Important**: The frontend MUST have the `VITE_API_URL` environment variable set to your backend URL, otherwise API calls will fail.

## 📧 Email Configuration

To use a custom domain for sending emails with Resend:

1. Verify your domain at resend.com
2. Update the `from` field in `backend/server.js`:
```javascript
from: 'builders.to <applications@builders.to>'
```

## 🔒 Environment Variables

### Backend (`backend/.env`)
- `PORT`: Server port (default: 5000)
- `RESEND_API_KEY`: Your Resend API key
- `RECIPIENT_EMAIL`: Email address to receive applications (benvspak@gmail.com)
- `FRONTEND_URL`: Frontend URL for CORS (e.g., `http://localhost:3000` for local, `https://your-frontend-app.onrender.com` for production)
- `NODE_ENV`: Environment (development/production)

### Frontend (`frontend/.env`)
- `VITE_API_URL`: Backend API URL (e.g., `http://localhost:5000` for local, `https://your-backend-app.onrender.com` for production)

## 📄 License

MIT
