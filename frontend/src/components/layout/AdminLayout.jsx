import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { BookOpenText, House, ImagePlus, UserCog, FileText, LogOut,CircleStar } from 'lucide-react';

const NAV_ITEMS_COMMON = [
  { to: '/admin',           label: 'Dashboard',            icon: <House />, end: true },
  { to: '/admin/posts',     label: 'Bài viết',             icon: <FileText />            },
  { to: '/admin/students/new',  label: 'Sinh viên tiêu biểu',  icon: <CircleStar />            },
  { to: '/admin/documents/new', label: 'Tài liệu & Tiêu chuẩn',icon: <BookOpenText />            },
  { to: '/admin/banners/new',   label: 'Banner',               icon: <ImagePlus />            },
];

const NAV_ITEMS_ADMIN = [
  { to: '/admin/users', label: 'Quản lý tài khoản', icon: <UserCog /> },
];

const ROLE_BADGE = {
  admin:  { label: 'Admin',  bg: 'bg-amber-500/20',  text: 'text-amber-300',  dot: 'bg-amber-400'  },
  editor: { label: 'Editor', bg: 'bg-green-500/20',  text: 'text-green-300',  dot: 'bg-green-400'  },
};

export function AdminLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const badge = ROLE_BADGE[user?.role] || ROLE_BADGE.editor;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0f2d1a] flex flex-col shrink-0 shadow-xl">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <img
              src="https://mffpeiwwxmxlkrparrzb.supabase.co/storage/v1/object/public/sv5tot-media/background/logo_tamlyhoc.jpg"
              alt="logo"
              className="w-full h-full object-contain"
            />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">Admin</p>
              <p className="text-green-400/70 text-xs mt-0.5">Khoa Tâm lý học</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS_COMMON.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-white/15 text-white font-medium shadow-sm'
                    : 'text-white/55 hover:bg-white/8 hover:text-white/85'
                }`
              }
            >
              <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}

          {/* Admin-only section */}
          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-white/25 text-[10px] uppercase tracking-widest font-medium">Quản trị</p>
              </div>
              {NAV_ITEMS_ADMIN.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 font-medium'
                        : 'text-white/55 hover:bg-white/8 hover:text-white/85'
                    }`
                  }
                >
                  <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User info + logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-2">
            {/* Avatar initials */}
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user?.name?.split(' ').slice(-1)[0]?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                <span className={`text-[10px] font-medium ${badge.text}`}>{badge.label}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg text-sm transition-all"
          >
            <span className="text-base w-5 text-center shrink-0"><LogOut /></span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
