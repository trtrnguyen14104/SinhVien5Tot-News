import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: '/',                    label: 'Trang chủ'          },
    { to: '/ban-tin',             label: 'Bản tin'            },
    { to: '/tieu-chuan',          label: 'Tiêu chuẩn sinh vien 5 tốt' },
    { to: '/guong-mat-tieu-bieu', label: 'Gương mặt tiêu biểu'},
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
      
      <img
        src="https://mffpeiwwxmxlkrparrzb.supabase.co/storage/v1/object/public/sv5tot-media/background/ussh_logo.png"
        alt="USSH Logo"
        className="h-8 w-auto object-contain"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />

      <span className="text-gray-500 text-sm hidden sm:block">
        Khoa Tâm lý học - USSH
      </span>

    </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm transition-colors ${
                  isActive
                    ? 'text-green-700 font-medium bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded text-gray-500"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm mb-1 ${
                  isActive ? 'text-green-700 bg-green-50 font-medium' : 'text-gray-600'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-green-900 text-green-200 text-center py-8 mt-12">
      <p className="text-sm font-medium text-white mb-1">
        Ban Chấp hành Chi hội Sinh viên — Khoa Tâm lý học
      </p>
      <p className="text-xs text-green-300">
        Trường Đại học Khoa học Xã hội và Nhân văn – ĐHQG-HCM
      </p>
      <p className="text-xs text-green-400 mt-3">
        © {new Date().getFullYear()} Sinh viên 5 Tốt Khoa Tâm lý học
      </p>
    </footer>
  );
}

export function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
