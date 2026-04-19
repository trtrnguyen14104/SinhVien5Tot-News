import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../services/api';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Newspaper, PencilOff, CircleStar, BookOpenText, FilePlus, UserPlus, FilePlusCorner, Wrench, House, ImagePlus, UserCog } from 'lucide-react';

function StatCard({ label, value, icon, to, color }) {
  const card = (
    <div className={`bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-all ${to ? 'cursor-pointer hover:border-gray-200' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color || 'text-gray-900'}`}>{value ?? '—'}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getStats,
  });

  const stats    = data?.data?.stats    || {};
  const topPosts = data?.data?.topPosts || [];

  return (
    <AdminLayout>
      <div className="mb-7">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Tổng quan hệ thống bản tin SV5T</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Bài đã đăng"     value={stats.publishedPosts} icon={<Newspaper />} color="text-green-700" to="/admin/posts?status=published" />
        <StatCard label="Bản nháp"         value={stats.draftPosts}     icon={<PencilOff />} color="text-amber-600"  to="/admin/posts?status=draft"     />
        <StatCard label="Sinh viên tiêu biểu" value={stats.activeStudents} icon={<CircleStar />} color="text-blue-600" to="/admin/students" />
        <StatCard label="Tài liệu"         value={stats.totalDocuments} icon={<BookOpenText />} color="text-purple-600" to="/admin/documents" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top posts */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Bài viết nhiều lượt xem nhất</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />)}
            </div>
          ) : topPosts.length === 0 ? (
            <p className="text-gray-400 text-sm">Chưa có dữ liệu.</p>
          ) : (
            <div className="space-y-1">
              {topPosts.map((post, i) => (
                <div key={post.slug} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
                  <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                  <Link
                    to={`/bai-viet/${post.slug}`}
                    target="_blank"
                    className="flex-1 text-sm text-gray-700 hover:text-green-700 truncate"
                  >
                    {post.title}
                  </Link>
                  <span className="text-xs text-gray-400 shrink-0">{post.views_count} lượt</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="space-y-2">
            {[
              { to: '/admin/posts/new',     label: 'Viết bài mới',              icon: <FilePlus /> },
              { to: '/admin/students/new',  label: 'Thêm sinh viên tiêu biểu',  icon: <UserPlus /> },
              { to: '/admin/documents/new', label: 'Upload tài liệu',           icon: <BookOpenText /> },
              { to: '/admin/banners/new',   label: 'Thêm banner',              icon: <ImagePlus /> },
              { to: '/',                    label: 'Xem trang chủ (public)',     icon: <House />, target: '_blank' },
            ].map(({ to, label, icon, target }) => (
              <Link
                key={to}
                to={to}
                target={target}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all text-sm text-gray-700 hover:text-green-700"
              >
                <span>{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
