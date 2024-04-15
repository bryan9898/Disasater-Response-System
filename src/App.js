import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavBar from './components/NavBar';
import Home from './components/Home';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import UserProfile from './components/UserProfile';
import ReportVerification from './components/ReportVerification';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<PrivateElement><UserProfile /></PrivateElement>} />
          <Route path="/verify" element={<PrivateElement><ReportVerification /></PrivateElement>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// PrivateElement component to handle rendering based on authentication status
const PrivateElement = ({ children }) => {
  const { currentUser } = useAuth(); // Assuming useAuth() returns an object with currentUser being null if not logged in
  return currentUser ? children : <Navigate to="/login" />;
};

export default App;
