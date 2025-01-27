import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ArtistRegister from './pages/ArtistRegister';
import Settings from './pages/Settings';
import BusinessPage from './pages/BusinessPage';
import Explore from './pages/Explore';
import Account from './pages/Account';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <LocationProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/artist-register" element={<ArtistRegister />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/business/:id" element={<BusinessPage />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/account" element={<Account />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Routes>
            </Router>
          </LocationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;