import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsApi, documentsApi, categoriesApi, uploadApi } from '../../services/api';
import { AdminLayout } from '../../components/layout/AdminLayout';

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
export function AdminStudentsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form, setForm] = useState({ name: '', achievement: '', academic_year: '', description: '', facebook_url: '', avatar_url: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading]   = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['students'], queryFn: studentsApi.getAll });
  const students = data?.data?.students || [];

  const resetForm = () => {
    setForm({ name: '', achievement: '', academic_year: '', description: '', facebook_url: '', avatar_url: '' });
    setEditing(null);
    setAvatarFile(null);
    setShowForm(false);
  };

  const createMutation = useMutation({ mutationFn: studentsApi.create, onSuccess: () => { queryClient.invalidateQueries(['students']); resetForm(); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => studentsApi.update(id, data), onSuccess: () => { queryClient.invalidateQueries(['students']); resetForm(); } });
  const deleteMutation = useMutation({ mutationFn: studentsApi.delete, onSuccess: () => queryClient.invalidateQueries(['students']) });

  const openEdit = (s) => {
    setForm({ name: s.name, achievement: s.achievement || '', academic_year: s.academic_year || '', description: s.description || '', facebook_url: s.facebook_url || '', avatar_url: s.avatar_url || '' });
    setEditing(s.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalForm = { ...form };
    if (avatarFile) {
      setUploading(true);
      try { const res = await uploadApi.image(avatarFile); finalForm.avatar_url = res.data.url; }
      finally { setUploading(false); }
    }
    if (editing) updateMutation.mutate({ id: editing, data: finalForm });
    else createMutation.mutate(finalForm);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const loading = createMutation.isPending || updateMutation.isPending || uploading;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sinh viên 5 Tốt tiêu biểu</h1>
          <p className="text-gray-400 text-sm mt-0.5">{students.length} sinh viên đang hiển thị</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Thêm sinh viên
        </button>
      </div>

      {/* Form thêm/sửa */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">{editing ? 'Sửa thông tin' : 'Thêm sinh viên tiêu biểu'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Họ và tên *</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Nguyễn Thị A" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Khóa học</label>
                <input value={form.academic_year} onChange={(e) => set('academic_year', e.target.value)} placeholder="2021-2025" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Thành tích nổi bật</label>
              <input value={form.achievement} onChange={(e) => set('achievement', e.target.value)} placeholder="GPA 3.8 · Bí thư Chi đoàn · ..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Giới thiệu</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Facebook URL</label>
                <input value={form.facebook_url} onChange={(e) => set('facebook_url', e.target.value)} placeholder="https://facebook.com/..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ảnh đại diện</label>
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-green-50 file:text-green-700 file:text-xs" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium">
                {loading ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm'}
              </button>
              <button type="button" onClick={resetForm} className="px-5 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student list */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {students.map((s) => {
            const initials = s.name.split(' ').slice(-2).map((w) => w[0]).join('');
            return (
              <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                {s.avatar_url
                  ? <img src={s.avatar_url} alt={s.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  : <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 font-medium flex items-center justify-center shrink-0">{initials}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.academic_year} · {s.achievement?.substring(0, 60)}...</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(s)} className="text-xs text-green-700 hover:underline">Sửa</button>
                  <button onClick={() => window.confirm(`Xóa ${s.name}?`) && deleteMutation.mutate(s.id)} className="text-xs text-red-500 hover:underline">Xóa</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
export function AdminDocumentsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', description: '', category_id: '', type: 'pdf' });
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data }     = useQuery({ queryKey: ['documents', ''], queryFn: () => documentsApi.getAll() });
  const { data: catsData } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll, staleTime: 5 * 60 * 1000 });

  const docs       = data?.data?.documents || [];
  const categories = catsData?.data?.categories || [];

  const createMutation = useMutation({ mutationFn: documentsApi.create, onSuccess: () => { queryClient.invalidateQueries(['documents']); setShowForm(false); setForm({ title: '', description: '', category_id: '', type: 'pdf' }); setFile(null); } });
  const deleteMutation = useMutation({ mutationFn: documentsApi.delete, onSuccess: () => queryClient.invalidateQueries(['documents']) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Vui lòng chọn file tài liệu');
    setUploading(true);
    try {
      const uploadRes = await uploadApi.document(file);
      await createMutation.mutateAsync({ ...form, file_url: uploadRes.data.url, category_id: form.category_id || null });
    } finally { setUploading(false); }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const loading = createMutation.isPending || uploading;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý tài liệu</h1>
          <p className="text-gray-400 text-sm mt-0.5">{docs.length} tài liệu</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Upload tài liệu
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Upload tài liệu mới</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tên tài liệu *</label>
              <input value={form.title} onChange={(e) => set('title', e.target.value)} required placeholder="Bộ tiêu chuẩn SV5T cấp Trung ương..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Danh mục</label>
                <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-white">
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Loại file</label>
                <select value={form.type} onChange={(e) => set('type', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-white">
                  <option value="pdf">PDF</option>
                  <option value="docx">Word (DOCX)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
              <input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Ghi chú ngắn về tài liệu..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">File tài liệu *</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} required className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-green-50 file:text-green-700 file:text-xs" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium">
                {loading ? (uploading ? 'Đang upload...' : 'Đang lưu...') : 'Upload & Lưu'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {docs.map((doc) => (
          <div key={doc.id} className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-lg shrink-0">📄</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{doc.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{doc.category_name || 'Chưa phân loại'} · {doc.type?.toUpperCase()}</p>
            </div>
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 hover:underline shrink-0">Xem</a>
            <button onClick={() => window.confirm(`Xóa "${doc.title}"?`) && deleteMutation.mutate(doc.id)} className="text-xs text-red-500 hover:underline shrink-0">Xóa</button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
