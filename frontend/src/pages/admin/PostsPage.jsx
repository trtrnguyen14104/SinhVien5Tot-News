import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { postsApi, categoriesApi } from '../../services/api';
import { AdminLayout } from '../../components/layout/AdminLayout';

// ─── Post List ────────────────────────────────────────────────────────────────
export function AdminPostsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const status   = searchParams.get('status') || '';
  const page     = parseInt(searchParams.get('page') || '1');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-posts', { status, page }],
    queryFn: () => postsApi.adminGetAll({ status: status || undefined, page, limit: 15 }),
    keepPreviousData: true,
  });
  console.log('admin posts', data);
  const deleteMutation = useMutation({
    mutationFn: postsApi.delete,
    onSuccess: () => queryClient.invalidateQueries(['admin-posts']),
  });

  const posts      = data?.data?.posts || [];
  const pagination = data?.data?.pagination || {};

  const handleDelete = (id, title) => {
    if (window.confirm(`Xóa bài viết "${title}"?`)) deleteMutation.mutate(id);
  };

  const STATUS_BADGE = {
    published: 'bg-green-50 text-green-700',
    draft:     'bg-amber-50 text-amber-600',
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý bài viết</h1>
          <p className="text-gray-400 text-sm mt-0.5">Tổng {pagination.total || 0} bài viết</p>
        </div>
        <Link
          to="/admin/posts/new"
          className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Viết bài mới
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[{ v: '', l: 'Tất cả' }, { v: 'published', l: 'Đã đăng' }, { v: 'draft', l: 'Bản nháp' }].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setSearchParams(v ? { status: v } : {})}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              status === v ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm">Chưa có bài viết nào.</p>
            <Link to="/admin/posts/new" className="mt-3 inline-block text-sm text-green-700 hover:underline">
              Viết bài đầu tiên →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Tiêu đề</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium hidden sm:table-cell">Danh mục</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium hidden md:table-cell">Trạng thái</th>
                <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium hidden lg:table-cell">Lượt xem</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {post.created_at ? format(new Date(post.created_at), 'dd/MM/yyyy', { locale: vi }) : ''}
                      {post.author_name && ` · ${post.author_name}`}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-xs text-gray-500">{post.category_name || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[post.status] || ''}`}>
                      {post.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                    <span className="text-xs text-gray-400">{post.views_count}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/posts/${post.id}/edit`}
                        className="text-xs text-green-700 hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(pagination.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setSearchParams({ page: i + 1, ...(status ? { status } : {}) })}
              className={`w-8 h-8 rounded text-sm transition-colors ${
                page === i + 1 ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

// ─── Post Form (Create / Edit) ─────────────────────────────────────────────────
export function AdminPostFormPage() {

  const { id } = useParams();
  const postId = id? id : null;

  const queryClient = useQueryClient();
  const isEdit = Boolean(postId);

  const { data: postData } = useQuery({
    queryKey: ['admin-post', postId],
    queryFn: () => postsApi.adminGetPostById(postId),
    enabled: isEdit,
  });

    useEffect(() => {
    if (postData?.data) {
      const p = postData.data.post;

      setForm({
        title: p.title || "",
        summary: p.summary || "",
        content: p.content || "",
        thumbnail_url: p.thumbnail_url || "",
        status: p.status || "draft",
        category_id: p.category_id || "",
        tag_ids: p.tag_ids || [],
      });
    }
  }, [postData]);

  const { data: catsData } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });
  const categories = catsData?.data?.categories || [];

  const [form, setForm] = useState({
    title: '', summary: '', content: '', thumbnail_url: '',
    status: 'draft', category_id: '', tag_ids: [],
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const createMutation = useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-posts']);
      alert('Tạo bài viết thành công!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => postsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-posts']);
      alert('Cập nhật thành công!');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) updateMutation.mutate({ id: postId, data: form });
    else createMutation.mutate(form);
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-7">
          <Link to="/admin/posts" className="text-gray-400 hover:text-gray-600 text-sm">← Bài viết</Link>
          <span className="text-gray-200">/</span>
          <h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Sửa bài viết' : 'Viết bài mới'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tiêu đề *</label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
              placeholder="Tiêu đề bài viết..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Danh mục</label>
              <select
                value={form.category_id}
                onChange={(e) => set('category_id', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-white"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-white"
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Đăng ngay</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tóm tắt</label>
            <textarea
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
              rows={2}
              placeholder="Mô tả ngắn về bài viết (hiển thị ngoài danh sách)..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">URL ảnh đại diện</label>
            <input
              value={form.thumbnail_url}
              onChange={(e) => set('thumbnail_url', e.target.value)}
              placeholder="https://... (sau khi upload ảnh)"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nội dung *</label>
            <textarea
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              required
              rows={14}
              placeholder="Nội dung bài viết (hỗ trợ HTML)..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 font-mono resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">Hỗ trợ HTML. Tích hợp trình soạn thảo WYSIWYG (react-quill) sau.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo bài viết'}
            </button>
            <Link
              to="/admin/posts"
              className="px-6 py-2.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
