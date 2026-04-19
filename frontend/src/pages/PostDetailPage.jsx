import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { postsApi } from '../services/api';
import { PublicLayout } from '../components/layout/PublicLayout';

export default function PostDetailPage() {
  const { slug } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsApi.getBySlug(slug),
    retry: false,
  });

  const post = data?.data?.post;

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-4 animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-64 bg-gray-100 rounded-xl" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (isError || !post) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Bài viết không tồn tại</h1>
          <p className="text-gray-500 text-sm mb-6">Bài viết này có thể đã bị xóa hoặc chưa được đăng.</p>
          <Link to="/ban-tin" className="text-green-700 text-sm hover:underline">← Quay về bản tin</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-green-700">Trang chủ</Link>
          <span>/</span>
          <Link to="/ban-tin" className="hover:text-green-700">Bản tin</Link>
          {post.category_name && (
            <>
              <span>/</span>
              <Link to={`/ban-tin?category=${post.category_slug}`} className="hover:text-green-700">
                {post.category_name}
              </Link>
            </>
          )}
        </nav>

        {/* Category badge */}
        {post.category_name && (
          <span className="inline-block text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium mb-4">
            {post.category_name}
          </span>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-6 pb-6 border-b border-gray-100">
          {post.author_avatar ? (
            <img src={post.author_avatar} alt={post.author_name} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-medium">
              {post.author_name?.[0] || 'A'}
            </div>
          )}
          <span className="text-gray-600 font-medium">{post.author_name || 'Admin'}</span>
          <span>·</span>
          {post.published_at && (
            <time>{format(new Date(post.published_at), "dd MMMM yyyy", { locale: vi })}</time>
          )}
          <span>·</span>
          <span>{post.views_count} lượt xem</span>
        </div>

        {/* Thumbnail */}
        {post.thumbnail_url && (
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="w-full rounded-xl mb-6 object-cover max-h-72"
          />
        )}

        {/* Summary */}
        {post.summary && (
          <p className="text-base text-gray-600 italic border-l-4 border-green-300 pl-4 mb-6">
            {post.summary}
          </p>
        )}

        {/* Content */}
        <div
          className="prose prose-sm prose-green max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/ban-tin?tag=${tag.slug}`}
                className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link to="/ban-tin" className="text-sm text-green-700 hover:underline">← Quay về danh sách bài viết</Link>
        </div>
      </article>
    </PublicLayout>
  );
}
