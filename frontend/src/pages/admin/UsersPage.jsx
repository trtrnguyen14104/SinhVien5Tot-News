import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../services/api';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import useAuthStore from '../../store/authStore';

const ROLE_BADGE = {
  admin:  'bg-amber-50 text-amber-700 border-amber-200',
  editor: 'bg-green-50 text-green-700 border-green-200',
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' });
  const [pwError, setPwError] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: usersApi.getAll });
  const users = data?.data?.users || [];

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => { queryClient.invalidateQueries(['users']); setShowForm(false); setForm({ name: '', email: '', password: '', role: 'editor' }); },
    onError: (err) => alert(err.response?.data?.message || 'Lỗi tạo tài khoản'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => usersApi.update(id, { role }),
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => queryClient.invalidateQueries(['users']),
    onError: (err) => alert(err.response?.data?.message || 'Lỗi xóa tài khoản'),
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setPwError('Mật khẩu phải có ít nhất 8 ký tự'); return; }
    setPwError('');
    createMutation.mutate(form);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý tài khoản</h1>
          <p className="text-gray-400 text-sm mt-0.5">{users.length} tài khoản trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Tạo tài khoản
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Tạo tài khoản mới</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Họ và tên *</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Nguyễn Văn A" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="editor@sv5tot.edu.vn" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mật khẩu *</label>
                <input type="password" value={form.password} onChange={(e) => { set('password', e.target.value); setPwError(''); }} required placeholder="Ít nhất 8 ký tự" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${pwError ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-green-400'}`} />
                {pwError && <p className="text-xs text-red-500 mt-1">{pwError}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vai trò</label>
                <select value={form.role} onChange={(e) => set('role', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-white">
                  <option value="editor">Editor — Biên tập viên</option>
                  <option value="admin">Admin — Quản trị viên</option>
                </select>
              </div>
            </div>

            {/* Role explanation */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <p className="font-semibold text-green-800 mb-1">🟢 Editor</p>
                <p className="text-green-700 leading-relaxed">Tạo/sửa bài viết, quản lý sinh viên tiêu biểu, upload tài liệu & tiêu chuẩn, chỉnh sửa banner. <strong>Không thể xóa</strong> dữ liệu hoặc quản lý tài khoản.</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="font-semibold text-amber-800 mb-1">🟡 Admin</p>
                <p className="text-amber-700 leading-relaxed">Toàn quyền hệ thống: xóa dữ liệu, quản lý tài khoản Editor, xem dashboard thống kê, thay đổi vai trò người dùng.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={createMutation.isPending} className="bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium">
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* User list */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Tài khoản</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Vai trò</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium hidden md:table-cell">Ngày tạo</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const initials = u.name.split(' ').slice(-2).map((w) => w[0]).join('');
                return (
                  <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${isSelf ? 'bg-green-50/30' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {u.name}
                            {isSelf && <span className="ml-2 text-xs text-green-600 font-normal">(bạn)</span>}
                          </p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {isSelf ? (
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${ROLE_BADGE[u.role]}`}>
                          {u.role === 'admin' ? 'Admin' : 'Editor'}
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => {
                            if (window.confirm(`Đổi vai trò của ${u.name} thành ${e.target.value}?`))
                              updateRoleMutation.mutate({ id: u.id, role: e.target.value });
                          }}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-green-400"
                        >
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-gray-400">
                        {format(new Date(u.created_at), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!isSelf ? (
                        <button
                          onClick={() => window.confirm(`Xóa tài khoản của ${u.name}? Hành động này không thể hoàn tác.`) && deleteMutation.mutate(u.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Xóa
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
