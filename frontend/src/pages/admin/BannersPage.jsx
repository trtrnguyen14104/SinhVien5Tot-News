import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bannersApi, uploadApi } from '../../services/api';
import { AdminLayout } from '../../components/layout/AdminLayout';

export default function BannersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm] = useState({ title: '', image_url: '', link: '', is_active: true, order_index: 0 });
  const [imgFile, setImgFile]   = useState(null);
  const [preview, setPreview]   = useState('');
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['banners'], queryFn: bannersApi.getAll });
  const banners = data?.data?.banners || [];

  const createMutation = useMutation({ mutationFn: bannersApi.create, onSuccess: () => { queryClient.invalidateQueries(['banners']); resetForm(); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => bannersApi.update(id, data), onSuccess: () => { queryClient.invalidateQueries(['banners']); resetForm(); } });
  const deleteMutation = useMutation({ mutationFn: bannersApi.delete, onSuccess: () => queryClient.invalidateQueries(['banners']) });

  const resetForm = () => {
    setForm({ title: '', image_url: '', link: '', is_active: true, order_index: 0 });
    setEditing(null); setImgFile(null); setPreview(''); setShowForm(false);
  };

  const openEdit = (b) => {
    setForm({ title: b.title || '', image_url: b.image_url, link: b.link || '', is_active: b.is_active, order_index: b.order_index });
    setPreview(b.image_url);
    setEditing(b.id);
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImgFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalForm = { ...form };
    if (imgFile) {
      setUploading(true);
      try { const res = await uploadApi.image(imgFile); finalForm.image_url = res.data.url; }
      finally { setUploading(false); }
    }
    if (!finalForm.image_url) return alert('Vui lòng chọn hoặc nhập URL ảnh banner');
    if (editing) updateMutation.mutate({ id: editing, data: finalForm });
    else createMutation.mutate(finalForm);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const loading = createMutation.isPending || updateMutation.isPending || uploading;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý Banner</h1>
          <p className="text-gray-400 text-sm mt-0.5">{banners.filter((b) => b.is_active).length} banner đang hiển thị</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Thêm banner
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">{editing ? 'Chỉnh sửa banner' : 'Thêm banner mới'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tiêu đề banner</label>
                <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Banner chào mừng năm học mới..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Link khi click (tuỳ chọn)</label>
                <input value={form.link} onChange={(e) => set('link', e.target.value)} placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Upload ảnh</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-green-50 file:text-green-700 file:text-xs" />
                <p className="text-xs text-gray-400 mt-1">Hoặc nhập URL bên dưới</p>
                <input value={form.image_url} onChange={(e) => { set('image_url', e.target.value); setPreview(e.target.value); }} placeholder="https://... URL ảnh" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Thứ tự hiển thị</label>
                  <input type="number" value={form.order_index} onChange={(e) => set('order_index', parseInt(e.target.value) || 0)} min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="accent-green-600" />
                  <label htmlFor="is_active" className="text-xs font-medium text-gray-600">Hiển thị banner này</label>
                </div>
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400 px-3 py-1.5 border-b border-gray-100">Xem trước</p>
                <img src={preview} alt="Preview" className="w-full h-40 object-cover" onError={() => setPreview('')} />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium">
                {loading ? (uploading ? 'Đang upload...' : 'Đang lưu...') : editing ? 'Cập nhật' : 'Thêm banner'}
              </button>
              <button type="button" onClick={resetForm} className="px-5 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* Banner list */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">🖼️</p>
          <p className="text-sm">Chưa có banner nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b.id} className={`relative rounded-xl overflow-hidden border-2 transition-all ${b.is_active ? 'border-green-200' : 'border-gray-100 opacity-60'}`}>
              <img src={b.image_url} alt={b.title} className="w-full h-36 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                <div>
                  {b.title && <p className="text-white text-sm font-medium">{b.title}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.is_active ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'}`}>
                      {b.is_active ? 'Đang hiện' : 'Đã ẩn'}
                    </span>
                    <span className="text-white/60 text-xs">#{b.order_index}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)} className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg backdrop-blur-sm transition-colors">Sửa</button>
                  <button onClick={() => window.confirm(`Xóa banner "${b.title || 'này'}"?`) && deleteMutation.mutate(b.id)} className="text-xs bg-red-500/60 hover:bg-red-500/80 text-white px-2.5 py-1 rounded-lg backdrop-blur-sm transition-colors">Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
