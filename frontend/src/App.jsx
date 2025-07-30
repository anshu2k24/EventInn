// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
// import LoginPage from "./pages/LoginPage";
// import RegistrationPage from "./pages/RegistrationPage";
import DashboardPage from "./pages/DashboardPage"
import AuthPage from "./pages/AuthPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/register" element={<RegistrationPage />} /> */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;
