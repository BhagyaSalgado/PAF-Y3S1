import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Views/Home';
import Community from './Views/Community';
import OAuthCallback from './Components/Home/OAuthCallbackHandler';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('userId') && localStorage.getItem('accessToken');
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const App = () => {
  return (
    <div className="app">
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/oauth2/callback" element={<OAuthCallback />} />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
