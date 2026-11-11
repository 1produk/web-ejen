import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationsDropdown } from './NotificationsDropdown';
import {
  Sparkles,
  ShieldCheck,
  User,
  LogOut,
  CreditCard,
  Layout,
  Menu,
  X,
  BookOpen,
  Home,
  LogIn
} from 'lucide-react';

interface Props {
  currentView: 'home' | 'buyer' | 'admin' | 'public';
  onNavigate: (view: 'home' | 'buyer' | 'admin') => void;
  onOpenLogin: () => void;
  onOpenPurchase: () => void;
  onOpenConfigGuide: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentView,
  onNavigate,
  onOpenLogin,
  onOpenPurchase,
  onOpenConfigGuide,
}) => {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0 flex-shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition flex-shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-black text-sm sm:text-lg tracking-tight text-white">TAKAFUL</span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                Builder
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-1 font-medium hidden sm:block truncate">
              Sistem Landing Page Perunding Takaful
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs font-semibold text-slate-300 flex-shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className={`hover:text-white transition flex items-center gap-1.5 cursor-pointer ${
              currentView === 'home' ? 'text-emerald-400 font-bold' : ''
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Laman Utama</span>
          </button>

          <a
            href="#pelan"
            onClick={(e) => {
              if (currentView !== 'home') {
                e.preventDefault();
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('pelan')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pelan RM150/Tahun</span>
          </a>

          <a
            href="#templat"
            onClick={(e) => {
              if (currentView !== 'home') {
                e.preventDefault();
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('templat')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Layout className="w-3.5 h-3.5" />
            <span>3 Templat Reka Bentuk</span>
          </a>

          <button
            onClick={onOpenConfigGuide}
            className="hover:text-white transition flex items-center gap-1.5 text-slate-400 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Panduan & Integrasi</span>
          </button>
        </nav>

        {/* Right User Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Notification Bell */}
              <NotificationsDropdown userId={user.uid} />

              {/* Admin Panel Link */}
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                  }`}
                  title="Panel Admin"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Panel Admin</span>
                </button>
              )}

              {/* Buyer Dashboard Link */}
              <button
                onClick={() => onNavigate('buyer')}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  currentView === 'buyer'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Dashboard Ejen"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden min-[420px]:inline">Dashboard Ejen</span>
              </button>

              {/* Logout (hidden on small mobile, accessible via dropdown) */}
              <button
                onClick={logout}
                className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition cursor-pointer"
                title="Log Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Log Masuk button: visible on sm screens, inside menu on small mobile */}
              <button
                onClick={onOpenLogin}
                className="hidden sm:inline-flex px-3.5 py-2 rounded-xl font-semibold text-xs text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                Log Masuk
              </button>

              {/* Compact CTA on mobile, full text on desktop */}
              <button
                onClick={onOpenPurchase}
                className="px-2.5 min-[380px]:px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                <span className="hidden min-[380px]:inline">Daftar Ejen (RM150)</span>
                <span className="min-[380px]:hidden">Daftar (RM150)</span>
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 text-xs sm:text-sm animate-fadeIn">
          {!user && (
            <div className="pb-3 mb-2 border-b border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Log Masuk</span>
              </button>
              <button
                onClick={() => {
                  onOpenPurchase();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Daftar RM150</span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-slate-200 flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Laman Utama</span>
          </button>

          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('pelan')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-slate-200 flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>Pelan RM150/Tahun</span>
          </button>

          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('templat')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-slate-200 flex items-center gap-2 cursor-pointer"
          >
            <Layout className="w-4 h-4 text-slate-400" />
            <span>3 Templat Reka Bentuk</span>
          </button>

          <button
            onClick={() => {
              onOpenConfigGuide();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/5 text-slate-200 flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Panduan Konfigurasi & Integrasi</span>
          </button>

          {user && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  onNavigate('buyer');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-emerald-600/30 text-emerald-300 font-bold flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Dashboard Ejen</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-xl bg-amber-500/20 text-amber-300 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Panel Admin</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-rose-500/10 text-rose-300 font-semibold flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Keluar ({user.email})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
