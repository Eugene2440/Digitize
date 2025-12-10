import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import VisitorList from '@/pages/visitors/VisitorList';
import VisitorSignIn from '@/pages/visitors/VisitorSignIn';
import CargoList from '@/pages/cargo/CargoList';
import CargoEntry from '@/pages/cargo/CargoEntry';
import UserManagement from '@/pages/users/UserManagement';
import Reports from '@/pages/Reports';
import FitnessList from '@/pages/fitness/FitnessList';
import FitnessEntry from '@/pages/fitness/FitnessEntry';
import MemberManagement from '@/pages/fitness/MemberManagement';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/visitors" element={<ProtectedRoute><VisitorList /></ProtectedRoute>} />
          <Route path="/visitors/new" element={<ProtectedRoute><VisitorSignIn /></ProtectedRoute>} />
          <Route path="/cargo" element={<ProtectedRoute><CargoList /></ProtectedRoute>} />
          <Route path="/cargo/new" element={<ProtectedRoute><CargoEntry /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/fitness" element={<ProtectedRoute><FitnessList /></ProtectedRoute>} />
          <Route path="/fitness/new" element={<ProtectedRoute><FitnessEntry /></ProtectedRoute>} />
          <Route path="/fitness/members" element={<ProtectedRoute><MemberManagement /></ProtectedRoute>} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
