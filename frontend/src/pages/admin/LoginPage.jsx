import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Mail, KeyRound } from 'lucide-react';


const BG_IMAGE = import.meta.env.VITE_BG_IMAGE_URL;

const ROLE_INFO = {
  admin: {
    label: 'Quản trị viên',
    color: 'from-amber-500 to-orange-500',
    dot: 'bg-amber-400',
    desc: 'Toàn quyền hệ thống',
  },
  editor: {
    label: 'Biên tập viên',
    color: 'from-green-500 to-teal-500',
    dot: 'bg-green-400',
    desc: 'Quản lý nội dung',
  },
};

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const { login, loading, error, clearError, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  // Nếu đã login, redirect về dashboard
  useEffect(() => {
    if (user) navigate('/admin', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const ok = await login(email, password);
    if (ok) navigate('/admin');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

      {/* ── Background: ảnh trường KHXH&NV ─────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${BG_IMAGE}")` }}
      />

      {/* Overlay nhiều lớp để tạo chiều sâu */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-950/80 via-slate-900/70 to-green-900/75" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      {/* Geometric accent — hình thoi trang trí góc */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M150 0 L300 150 L150 300 L0 150 Z" fill="white" />
          <path d="M150 40 L260 150 L150 260 L40 150 Z" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-5 pointer-events-none rotate-45">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="1" />
          <circle cx="100" cy="100" r="50" stroke="white" strokeWidth="0.5" />
        </svg>
      </div>

      {/* ── Main card ─────────────────────────────────────────────────────────── */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo / emblem */}
          <div className="inline-flex items-center justify-center w-16 h-24 rounded-2xl mb-5 ">
            <img
              src="https://mffpeiwwxmxlkrparrzb.supabase.co/storage/v1/object/public/sv5tot-media/background/logo_tamlyhoc.jpg"
              alt="logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h1
            className="text-3xl font-bold text-white mb-1 tracking-tight"
            style={{ fontFamily: "'Georgia', serif", textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
          >
            Quản lý bản tin
          </h1>
          <p className="text-white/60 text-sm font-light tracking-wide">
            Khoa Tâm lý học · ĐH KHXH&NV
          </p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Role indicator tabs */}
          <div className="flex border-b border-white/10">
            {Object.entries(ROLE_INFO).map(([role, info]) => (
              <div key={role} className="flex-1 flex items-center gap-2 px-5 py-3.5">
                <span className={`w-2 h-2 rounded-full ${info.dot} shrink-0`} />
                <div>
                  <p className="text-white/90 text-xs font-semibold">{info.label}</p>
                  <p className="text-white/40 text-[10px]">{info.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-6 font-medium">
              Đăng nhập hệ thống
            </p>

            {/* Error message */}
            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-500/15 border border-red-400/30 rounded-xl px-4 py-3">
                <span className="text-red-400 mt-0.5 text-sm">⚠</span>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2 tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm"><Mail /> </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    required
                    autoComplete="email"
                    placeholder="email@sv5tot.edu.vn"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                    onFocus={(e) => { e.target.style.border = '1px solid rgba(255,255,255,0.35)'; e.target.style.background = 'rgba(255,255,255,0.12)'; }}
                    onBlur={(e)  => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2 tracking-wide">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm"><KeyRound /> </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError(); }}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                    onFocus={(e) => { e.target.style.border = '1px solid rgba(255,255,255,0.35)'; e.target.style.background = 'rgba(255,255,255,0.12)'; }}
                    onBlur={(e)  => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-xs"
                  >
                    {showPass ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-7 w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'rgba(255,255,255,0.15)'
                  : 'linear-gradient(135deg, #166534 0%, #15803d 50%, #16a34a 100%)',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(21,128,61,0.5)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  'Đăng nhập →'
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-white/40 text-xs">
            Hệ thống quản lý nội dung · Sinh viên 5 Tốt
          </p>
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} Khoa Tâm lý học — ĐH KHXH&NV TP.HCM
          </p>
        </div>
      </div>
    </div>
  );
}
