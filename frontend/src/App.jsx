import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from './store/authStore';

// Public pages
import HomePage         from './pages/HomePage';
import BanTinPage       from './pages/BanTinPage';
import PostDetailPage   from './pages/PostDetailPage';
import { GuongMatPage } from './pages/GuongMatPage';
import { TaiLieuPage }  from './pages/TaiLieuPage';

// Admin pages
import LoginPage        from './pages/admin/LoginPage';
import DashboardPage    from './pages/admin/DashboardPage';
import { AdminPostsPage, AdminPostFormPage } from './pages/admin/PostsPage';
import { AdminStudentsPage, AdminDocumentsPage } from './pages/admin/ManagePage';
import BannersPage      from './pages/admin/BannersPage';
import UsersPage        from './pages/admin/UsersPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/admin/login" replace />;
}

function AdminOnlyRoute({ children }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/admin" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { token } = useAuthStore();
  return token ? <Navigate to="/admin" replace /> : children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ── Public ─────────────────────────────────── */}
          <Route path="/"                     element={<HomePage />} />
          <Route path="/ban-tin"              element={<BanTinPage />} />
          <Route path="/bai-viet/:slug"       element={<PostDetailPage />} />
          <Route path="/tieu-chuan"           element={<TaiLieuPage />} />
          <Route path="/guong-mat-tieu-bieu"  element={<GuongMatPage />} />

          {/* ── Admin ──────────────────────────────────── */}
          <Route path="/admin/login" element={
            <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="/admin/posts" element={
            <PrivateRoute><AdminPostsPage /></PrivateRoute>
          } />
          <Route path="/admin/posts/new" element={
            <PrivateRoute><AdminPostFormPage /></PrivateRoute>
          } />
          <Route path="/admin/posts/:id/edit" element={
            <PrivateRoute><AdminPostFormPage /></PrivateRoute>
          } />
          <Route path="/admin/students/new" element={
            <PrivateRoute><AdminStudentsPage /></PrivateRoute>
          } />
          <Route path="/admin/documents/new" element={
            <PrivateRoute><AdminDocumentsPage /></PrivateRoute>
          } />
          <Route path="/admin/banners/new" element={
            <PrivateRoute><BannersPage /></PrivateRoute>
          } />
          {/* Users — admin only */}
          <Route path="/admin/users" element={
            <AdminOnlyRoute><UsersPage /></AdminOnlyRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
