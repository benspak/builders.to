import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Home from './pages/Home';
import CreateMeeting from './pages/CreateMeeting';
import MeetingDetails from './pages/MeetingDetails';
import UpcomingMeetings from './pages/UpcomingMeetings';

function App() {
  return (
    <Box minH="100vh" bg="dark.bg">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateMeeting />} />
        <Route path="/meeting/:meetingId" element={<MeetingDetails />} />
        <Route path="/upcoming" element={<UpcomingMeetings />} />
      </Routes>
    </Box>
  );
}

export default App;
