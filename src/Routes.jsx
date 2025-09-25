import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import AdminRoute from "components/AdminRoute";
import { AuthProvider } from "./contexts/AuthContext";
import NotFound from "pages/NotFound";
import UserLogin from './pages/user-login';
import ProgressPhotos from './pages/progress-photos';
import NutritionTracker from './pages/nutrition-tracker';
import Dashboard from './pages/dashboard';
import UserRegistration from './pages/user-registration';
import WorkoutTracker from './pages/workout-tracker';
import HabitGoalTracker from './pages/habit-goal-tracker';
import CommunityHub from './pages/community-hub';
import Achievements from './pages/achievements';
import AdminDashboard from './pages/admin-dashboard';
import UserProfile from './pages/user-profile';
import MediaComparisonTool from './pages/media-comparison-tool';
import AdminUserProfile from './pages/admin-dashboard/UserProfile';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ScrollToTop />
          <RouterRoutes>
            {/* Public Routes */}
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/user-registration" element={<UserRegistration />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/progress-photos" element={<ProtectedRoute><ProgressPhotos /></ProtectedRoute>} />
            <Route path="/nutrition-tracker" element={<ProtectedRoute><NutritionTracker /></ProtectedRoute>} />
            <Route path="/workout-tracker" element={<ProtectedRoute><WorkoutTracker /></ProtectedRoute>} />
            <Route path="/habit-goal-tracker" element={<ProtectedRoute><HabitGoalTracker /></ProtectedRoute>} />
            <Route path="/community-hub" element={<ProtectedRoute><CommunityHub /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
            <Route path="/admin-dashboard/users/:id" element={<ProtectedRoute><AdminRoute><AdminUserProfile /></AdminRoute></ProtectedRoute>} />
            <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/media-comparison-tool" element={<ProtectedRoute><MediaComparisonTool /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;