import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Forecasting from './pages/Forecasting';
import CropAdvisory from './pages/CropAdvisory';
import AlertControl from './pages/AlertControl';
import Billing from './pages/Billing';

// Cryptographic JWT Authentication Guard
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400">Verifying session signatures...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Authenticated Application Shell with custom forest-glow base gradients
const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070b13] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.06),rgba(255,255,255,0))] font-sans relative antialiased text-slate-100">
      <Sidebar />
      <div className="flex-1 transition-all duration-300">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/forecasting" element={<Forecasting />} />
          <Route path="/crop-advisory" element={<CropAdvisory />} />
          <Route path="/alerts" element={<AlertControl />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
