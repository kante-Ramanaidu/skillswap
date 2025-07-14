import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

// Protected Layout + Pages
import PrivateLayout from "./components/PrivateLayout";
import Dashboard from "./pages/Dashboard";
import Match from "./pages/Match";
import Chat from "./pages/Chat";
import StudyEnvironmentPage from "./pages/StudyEnvironmentPage";
import FriendRequests from "./pages/FriendRequests";
import FriendsPage from "./pages/FriendsPage";
import ProgressPage from "./pages/ProgressPage"; 
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from './pages/ProfilePage'; // Adjust path if it's in a different folder


<Route path="/history" element={<HistoryPage />} />

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Private Routes */}
        <Route element={<PrivateLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/match" element={<Match />} />
          <Route path="/study/:roomId" element={<StudyEnvironmentPage />} />
          <Route path="/chat/:roomId" element={<Chat />} />
          <Route path="/friend-requests" element={<FriendRequests />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/progress/:userId" element={<ProgressPage />} /> {/* ✅ Session History */}
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />

        </Route>

      </Routes>
    </Router>
  );
}

export default App;
