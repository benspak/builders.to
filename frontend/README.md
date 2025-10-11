# Builders.to Frontend

React + Vite frontend for the Builders.to video coworking platform.

## Tech Stack

- **React 18**: UI library
- **Vite**: Build tool & dev server
- **Chakra UI v2**: Component library
- **React Router v6**: Client-side routing
- **Axios**: HTTP client
- **date-fns**: Date formatting

## Project Structure

```
frontend/
├── src/
│   ├── pages/              # Route components
│   │   ├── Home.jsx        # Landing page
│   │   ├── CreateMeeting.jsx    # Create new session
│   │   ├── MeetingDetails.jsx   # Vote & view session
│   │   └── UpcomingMeetings.jsx # List of sessions
│   ├── App.jsx             # Main app with routes
│   ├── theme.js            # Chakra UI theme config
│   └── main.jsx            # Entry point
├── index.html              # HTML template
└── vite.config.js          # Vite configuration
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Dev server runs at: http://localhost:5173

## Pages

### Home (`/`)
- Hero section with value proposition
- "How It Works" section (5-30-10 structure)
- "Why Cowork?" benefits
- Call-to-action buttons

### Create Meeting (`/create`)
- Form to create new session
- Add multiple time slot options
- Collect organizer info
- Share link generation

### Meeting Details (`/meeting/:meetingId`)
- View proposed time slots
- Vote for preferred times
- Real-time vote counts
- Finalize time (for organizers)
- Generate Zoom link
- Participant list

### Upcoming Meetings (`/upcoming`)
- Grid of scheduled sessions
- Filter by date
- Quick join buttons
- Session details

## Theme

Spotify-inspired dark mode theme configured in `src/theme.js`:

**Colors:**
- Background: `#121212`
- Secondary BG: `#181818`
- Tertiary BG: `#282828`
- Brand Green: `#3f9142`
- Text: `#ffffff`
- Secondary Text: `#b3b3b3`

**Components:**
- Rounded buttons with hover effects
- Card components with borders
- Smooth transitions
- Consistent spacing

## API Integration

API calls go through Vite proxy (dev) or direct URL (prod).

**Dev:** `http://localhost:5173/api/*` → `http://localhost:5000/api/*`

**Prod:** Update API base URL in axios calls

## Customization

### Change Colors
Edit `src/theme.js`:
```javascript
colors: {
  brand: {
    500: '#yourcolor',
  }
}
```

### Change Copy
Edit page files in `src/pages/`

### Add New Page
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`:
```javascript
<Route path="/new-page" element={<NewPage />} />
```

## Environment Variables

Create `.env` for production:
```env
VITE_API_URL=https://your-backend-url.com
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL || '/api';
```

## Build & Deploy

### Build for Production
```bash
npm run build
```

Output: `dist/` directory

### Deploy to Render
1. Connect GitHub repo
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Auto-deploys on push

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Performance

- Vite for fast HMR (Hot Module Replacement)
- Code splitting by route
- Lazy loading components
- Optimized production builds

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers

## Styling Guide

### Use Chakra Components
```javascript
import { Box, Button, Heading } from '@chakra-ui/react';

<Box p={4} bg="dark.bgSecondary">
  <Heading size="lg">Title</Heading>
  <Button colorScheme="brand">Click Me</Button>
</Box>
```

### Responsive Design
```javascript
<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
  {/* Grid items */}
</SimpleGrid>
```

### Dark Mode Colors
```javascript
<Box bg="dark.bg" color="dark.text">
  <Text color="dark.textSecondary">Secondary text</Text>
</Box>
```

## Testing

```bash
# Run locally
npm run dev

# Test production build
npm run build
npm run preview
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### API calls failing
- Check backend is running on port 5000
- Verify CORS is enabled in backend
- Check browser console for errors

### Build errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Future Enhancements

- [ ] Add loading skeletons
- [ ] Implement dark/light mode toggle
- [ ] Add toast notifications
- [ ] Session countdown timer
- [ ] Calendar view
- [ ] User profiles
- [ ] Session history

See `../README.md` for full project documentation.
