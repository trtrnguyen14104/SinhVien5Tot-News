import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { postsApi, categoriesApi } from '../services/api';
import { PublicLayout } from '../components/layout/PublicLayout';

export default function BanTinPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const category = searchParams.get('category') || '';
  const page     = parseInt(searchParams.get('page') || '1');

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts', { category, page, search }],
    queryFn: () => postsApi.getAll({ category, page, limit: 9, search: search || undefined }),
    keepPreviousData: true,
  });

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const posts      = postsData?.data?.posts || [];
  const pagination = postsData?.data?.pagination || {};
  const categories = catsData?.data?.categories || [];

  const setCategory = (slug) => {
    setSearchParams(slug ? { category: slug } : {});
  };

  const setPage = (p) => {
    setSearchParams((prev) => { prev.set('page', p); return prev; });
  };

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Bản tin Sinh viên 5 Tốt</h1>
          <p className="text-gray-500 text-sm">Tin tức hoạt động phong trào của khoa Tâm lý học</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearchParams({ search, category })}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-400"
          />
          <button
            onClick={() => setSearchParams({ search, category })}
            className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
          >
            Tìm kiếm
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !category ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat.slug ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
              {cat.post_count > 0 && (
                <span className="ml-1 opacity-60">({cat.post_count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">Không tìm thấy bài viết nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/bai-viet/${post.slug}`}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm hover:border-gray-200 transition-all"
              >
                {post.thumbnail_url ? (
                  <img src={post.thumbnail_url} alt={post.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-green-50 flex items-center justify-center text-3xl">📰</div>
                )}
                <div className="p-4">
                  <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                    {post.category_name || 'Bản tin'}
                  </span>
                  <h2 className="mt-2 text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
                    {post.title}
                  </h2>
                  {post.summary && (
                    <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{post.summary}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    {post.published_at
                      ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: vi })
                      : ''}
                    {' · '}{post.views_count} lượt xem
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded text-sm transition-colors ${
                  page === i + 1
                    ? 'bg-green-700 text-white font-medium'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
