import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Group from './pages/Group.tsx';
import Profile from './pages/Profile.tsx';
import SignUp from "./pages/SignUp.tsx";
import SignIn from "./pages/SignIn.tsx";
import Feed from "./pages/Feed.tsx";
import ESpaces from './pages/ESpaces.tsx';
import FollowedUsers from './pages/FollowedUsers.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/group" element={<Group />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/espaces" element={<ESpaces />} />
        <Route path='./pages.FollowedUsers.tsx' element={<FollowedUsers />} />
      </Routes>
      
    </Router>
  )
}

export default App;
