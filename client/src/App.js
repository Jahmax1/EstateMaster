import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import TenantDashboard from './pages/TenantDashboard';
import LandlordDashboard from './pages/LandlordDashboard';
import BrokerDashboard from './pages/BrokerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PropertyList from './components/PropertyList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <div className="text-center mt-10">
                  <p>Welcome to Estate Master</p>
                  <p>Find your perfect home or manage your properties with ease.</p>
                </div>
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/tenant-dashboard" element={<TenantDashboard />} />
            <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
            <Route path="/broker-dashboard" element={<BrokerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;