import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { postsApi, studentsApi, documentsApi, bannersApi } from '../services/api';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Newspaper, UserCircle, FileText, Image } from 'lucide-react';
import { FacebookOutlined } from "@ant-design/icons";

function PostCard({ post }) {
  return (
    <Link
      to={`/bai-viet/${post.slug}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all"
    >
      {post.thumbnail_url ? (
        <img src={post.thumbnail_url} alt={post.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-green-50 flex items-center justify-center text-4xl"><Newspaper /></div>
      )}
      <div className="p-4">
        <span className="text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full">
          {post.category_name || 'Bản tin'}
        </span>
        <h3 className="mt-2 text-sm font-medium text-gray-900 leading-snug group-hover:text-green-700 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-2 text-xs text-gray-400">
          {post.published_at
            ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: vi })
            : ''}
          {' · '}{post.views_count} lượt xem
        </p>
      </div>
    </Link>
  );
}

function StudentCard({ student }) {
  const initials = student.name.split(' ').slice(-2).map((w) => w[0]).join('');
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3 hover:border-gray-200 transition-all">
      {student.avatar_url ? (
        <img src={student.avatar_url} alt={student.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 font-medium text-sm flex items-center justify-center shrink-0">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-medium text-sm text-gray-900">{student.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{student.academic_year}</p>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{student.achievement}</p>
      </div>
    </div>
  );
}

const HeroBanner = ({ banners = [] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners.length) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners]);

  if (!banners.length) return null;

  const banner = banners[index];

  return (
    <div
      className="relative text-white py-20 px-4 text-center bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url(${banner.image_url})` }}
    >
      {/* overlay */}
      <div className="absolute bg-black/50"></div>

      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-3">
          {banner.title || ''}
        </h1>

        {banner.link && (
          <a
            href={banner.link}
            className="bg-green-600 hover:bg-green-500 px-5 py-2 rounded-lg text-sm"
          >
            Xem chi tiết
          </a>
        )}
      </div>
    </div>
  );
};

export default function HomePage() {
  const { data: postsData }    = useQuery({ queryKey: ['posts', 'home'],     queryFn: () => postsApi.getAll({ limit: 6 }) });
  const { data: studentsData } = useQuery({ queryKey: ['students', 'home'],  queryFn: () => studentsApi.getAll() });
  const { data: docsData }     = useQuery({ queryKey: ['documents', 'home'], queryFn: () => documentsApi.getAll() });
  const { data: bannersData }  = useQuery({ queryKey: ['banners', 'home'], queryFn: () => bannersApi.getAll() });

  const posts    = postsData?.data?.posts    || [];
  const students = studentsData?.data?.students?.slice(0, 3) || [];
  const docs     = docsData?.data?.documents?.slice(0, 4) || [];
  const banners  = bannersData?.data?.banners  || [];

  return (
    <PublicLayout>
      {/* Hero */}
      <HeroBanner banners={banners.filter((b) => b.is_active)} />
      
      

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">

        <a
          href="https://www.facebook.com/DoanHoiTLH"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <FacebookOutlined className="text-xl" />
          <span>Fanpage Khoa Tâm lý học</span>
        </a>
        
        {/* Bài viết mới nhất */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900"><Newspaper className="w-5 h-5 inline mr-2" />Bài viết mới nhất</h2>
            <Link to="/ban-tin" className="text-sm text-green-700 hover:underline">Xem tất cả →</Link>
          </div>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Chưa có bài viết nào.</p>
          )}
        </section>

        {/* Gương mặt tiêu biểu */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900"><UserCircle className="w-5 h-5 inline mr-2" />Gương mặt Sinh viên 5 Tốt tiêu biểu</h2>
            <Link to="/guong-mat-tieu-bieu" className="text-sm text-green-700 hover:underline">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {students.map((s) => <StudentCard key={s.id} student={s} />)}
          </div>
        </section>

        {/* Tài liệu */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900"><FileText className="w-5 h-5 inline mr-2" />Tài liệu tiêu chuẩn</h2>
            <Link to="/tai-lieu" className="text-sm text-green-700 hover:underline">Xem tất cả →</Link>
          </div>
          <div className="space-y-2">
            {docs.map((doc) => (
              <a
                key={doc.id}
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3 hover:border-gray-200 hover:shadow-sm transition-all group"
              >
                <div className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center text-sm shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-green-700 truncate">{doc.title}</p>
                  <p className="text-xs text-gray-400">{doc.category_name || doc.type || 'Tài liệu'}</p>
                </div>
                <span className="text-xs text-green-600 shrink-0">Tải xuống ↓</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
