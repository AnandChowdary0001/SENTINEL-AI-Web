import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { Toaster } from 'sonner';

import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveCameras from './pages/LiveCameras';
import Alerts from './pages/Alerts';
import Watchlist from './pages/Watchlist';
import CameraManagement from './pages/CameraManagement';
import DetectionHistory from './pages/DetectionHistory';
import UsersAccess from './pages/UsersAccess';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090b10] flex flex-col items-center justify-center font-mono-hud text-slate-400 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-xs tracking-wider uppercase">AUTHENTICATING SENTINEL GATEWAY...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#090b10] flex flex-col items-center justify-center font-mono-hud text-red-400 space-y-2 p-4 text-center">
        <p className="text-sm font-bold uppercase">403 ACCESS FORBIDDEN</p>
        <p className="text-xs text-slate-400">Administrator privileges required to view this section.</p>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/live" element={<ProtectedRoute><LiveCameras /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
            <Route path="/cameras" element={<ProtectedRoute><CameraManagement /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><DetectionHistory /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute adminOnly><UsersAccess /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" theme="dark" richColors />
      </WebSocketProvider>
    </AuthProvider>
  );
}
