import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/loginpage';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';
import './App.css';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<LandingPage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard"     element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
