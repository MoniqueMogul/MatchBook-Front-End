import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import RoleSelection from './pages/RoleSelection';
import AboutYouStep from './pages/buyer-onboarding/AboutYouStep';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/buyer/onboarding" element={<AboutYouStep />} />
        {/* If the user clicks Next, the browser goes here. This is a placeholder so it isn't a blank white screen. */}
        <Route path="/dashboard" element={<div>Dashboard Coming Soon - Not my task!</div>} />
      </Routes>
    </Router>
  );
}

export default App;