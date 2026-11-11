import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { BuyerDashboard } from './components/BuyerDashboard/BuyerDashboard';
import { AdminPanel } from './components/AdminPanel/AdminPanel';
import { PublicLandingPage } from './components/PublicLandingPage';
import { RegisterModal } from './components/RegisterModal';
import { LoginModal } from './components/LoginModal';
import { OnPayPurchaseModal } from './components/OnPayPurchaseModal';
import { UnsubscribedModal } from './components/UnsubscribedModal';
import { ReuploadReceiptModal } from './components/ReuploadReceiptModal';
import { ConfigGuideModal } from './components/ConfigGuideModal';
import { LandingPage, UserProfile, Product, TemplateId, Order } from './types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/config';
import {
  Clock,
  ShieldAlert,
  CreditCard,
  LogOut,
  RefreshCw,
  Home,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

function AppContent() {
  const { user, userProfile, subscription, isAdmin, loading, logout } = useAuth();

  const [currentView, setCurrentView] = useState<'home' | 'buyer' | 'admin' | 'public'>('home');
  const [publicSlug, setPublicSlug] = useState<string>('');

  // Modals
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [configGuideOpen, setConfigGuideOpen] = useState(false);
  const [reuploadModal, setReuploadModal] = useState<{ open: boolean; orderId: string }>({
    open: false,
    orderId: '',
  });

  // User's latest order for status tracking
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);

  // Demo Template Preview Modal
  const [demoPreview, setDemoPreview] = useState<{
    open: boolean;
    templateId: TemplateId;
  }>({ open: false, templateId: 'template1' });

  // Listen to user's orders if logged in
  useEffect(() => {
    if (!user) {
      setLatestOrder(null);
      return;
    }

    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const ords = snap.docs
            .map((d) => ({ ...d.data(), id: d.id } as Order))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setLatestOrder(ords[0]);
        }
      },
      (err) => {
        console.warn('Orders snapshot notice:', err.message);
      }
    );

    return () => unsub();
  }, [user]);

  // Handle URL Hash and Routing (/p/:slug, #/p/:slug, ?p=slug, #/admin, #/dashboard)
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const paramSlug = searchParams.get('p');

      if (paramSlug) {
        setPublicSlug(paramSlug);
        setCurrentView('public');
        return;
      }

      if (hash.startsWith('#/p/')) {
        const slug = hash.replace('#/p/', '').split('?')[0];
        if (slug) {
          setPublicSlug(slug);
          setCurrentView('public');
          return;
        }
      }

      if (pathname.startsWith('/p/')) {
        const slug = pathname.replace('/p/', '').split('/')[0];
        if (slug) {
          setPublicSlug(slug);
          setCurrentView('public');
          return;
        }
      }

      if (hash === '#/admin') {
        setCurrentView('admin');
        return;
      }

      if (hash === '#/dashboard') {
        setCurrentView('buyer');
        return;
      }

      // Default home
      if (currentView === 'public' && !hash.includes('/p/')) {
        setCurrentView('home');
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [currentView]);

  const navigateTo = (view: 'home' | 'buyer' | 'admin') => {
    setCurrentView(view);
    if (view === 'home') {
      window.location.hash = '';
    } else if (view === 'buyer') {
      window.location.hash = '#/dashboard';
    } else if (view === 'admin') {
      window.location.hash = '#/admin';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterSuccess = (orderId: string) => {
    setRegisterOpen(false);
    // User registration completed with slip; show pending screen in dashboard view
    navigateTo('buyer');
  };

  // Demo data for prospective agents testing templates on homepage
  const demoProfile: UserProfile = {
    id: 'demo-agent',
    email: 'firdaus.takaful@gmail.com',
    fullName: 'Ahmad Firdaus bin Rahman',
    phone: '0129010345',
    agentId: 'TKF-MY-8821',
    country: 'Malaysia',
    state: 'Selangor',
    address: 'Menara Takaful Ikhlas, Seksyen 13',
    city: 'Shah Alam',
    postalCode: '40100',
    occupation: 'Perunding Takaful Kanan (Senior Wealth Planner)',
    industry: 'Perkhidmatan Kewangan & Takaful',
    role: 'buyer',
    accountStatus: 'Aktif',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const demoLandingPage: LandingPage = {
    id: 'demo-page',
    userId: 'demo-agent',
    slug: 'firdaus-takaful',
    title: 'Perunding Takaful & Khidmat Perancangan Kewangan Keluarga Bersama Ahmad Firdaus',
    bio: 'Membantu anda dan keluarga memiliki payung kewangan patuh syariah yang komprehensif melalui pelan Kad Perubatan VIP, Hibah Takaful waris, dan perlindungan pendapatan keluarga.',
    templateId: demoPreview.templateId,
    colorTheme: 'green',
    status: 'Diterbitkan',
    whatsappNumber: '0129010345',
    whatsappMessage: 'Salam En. Firdaus, saya berminat untuk dapatkan konsultasi dan sebut harga pelan Takaful.',
    isPublished: true,
    socialLinks: {
      whatsapp: '0129010345',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      website: 'https://takaful.my',
    },
    customNotice: 'Sebut harga dan pelan perlindungan disesuaikan mengikut bajet bulanan serta keperluan sebenar anda dan keluarga.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const demoProducts: Product[] = [
    {
      id: 'demo-prod-1',
      userId: 'demo-agent',
      title: 'Kad Perubatan VIP Hospital Swasta (Tanpa Had Tahunan)',
      category: 'Kad Perubatan',
      description: 'Membantu menampung kos rawatan dan kemasukan ke hospital swasta dengan kemudahan bilik peribadi dan kemasukan tanpa tunai (cashless).',
      benefits: 'Tiada ko-takaful, perlindungan dialisis buah pinggang & rawatan kanser pesakit luar, elaun harian hospital, had seumur hidup tanpa had.',
      priceOrTarget: 'Bermula RM90 / bulan',
      actionText: 'Dapatkan Sebut Harga Kad',
      actionUrl: '',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      sortOrder: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-prod-2',
      userId: 'demo-agent',
      title: 'Pelan Hibah Takaful Penggantian Pendapatan Waris',
      category: 'Hibah Takaful',
      description: 'Menyediakan manfaat kewangan kepada penerima apabila peserta meninggal dunia atau mengalami hilang upaya kekal, mengikut sijil tanpa melalui proses faraid yang rumit.',
      benefits: 'Pampasan tunai segera RM250,000 - RM1,000,000 terus kepada waris, perlindungan pampasan berganda kemalangan, pelepasan cukai pendapatan sehingga RM3,000.',
      priceOrTarget: 'Bermula RM85 / bulan',
      actionText: 'Kira Kelayakan Hibah',
      actionUrl: '',
      imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-prod-3',
      userId: 'demo-agent',
      title: 'Perlindungan Komprehensif 45 Penyakit Kritikal (Awal & Akhir)',
      category: 'Penyakit Kritikal',
      description: 'Manfaat kewangan apabila peserta disahkan menghidap penyakit kritikal yang dilindungi bagi menampung kos sara hidup dan rawatan alternatif.',
      benefits: 'Pampasan tunai sekaligus (lump-sum) peringkat awal dan akhir, penepian bayaran caruman seterusnya (waiver of contribution).',
      priceOrTarget: 'Bermula RM75 / bulan',
      actionText: 'Konsultasi Percuma',
      actionUrl: '',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
      sortOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Navbar: Visible unless viewing public landing page in standalone mode */}
      {currentView !== 'public' && (
        <Navbar
          currentView={currentView}
          onNavigate={navigateTo}
          onOpenLogin={() => setLoginOpen(true)}
          onOpenPurchase={() => setPurchaseOpen(true)}
          onOpenConfigGuide={() => setConfigGuideOpen(true)}
        />
      )}

      {/* Main Body Routing */}
      <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden">
        {currentView === 'public' && (
          <PublicLandingPage
            slug={publicSlug}
            onBackToHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'home' && (
          <HomePage
            onOpenPurchase={() => setPurchaseOpen(true)}
            onOpenLogin={() => setLoginOpen(true)}
            onPreviewTemplate={(tplId) => setDemoPreview({ open: true, templateId: tplId })}
          />
        )}

        {/* Buyer View with Strict Access Control */}
        {currentView === 'buyer' && (
          !user ? (
            /* Scenario 1: Not Logged In */
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center shadow-lg border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Sila Log Masuk Terlebih Dahulu</h2>
              <p className="text-xs text-slate-500 mb-6">
                Akses Dashboard Ejen memerlukan anda log masuk dengan akaun berdaftar.
              </p>
              <button
                onClick={() => setLoginOpen(true)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow cursor-pointer"
              >
                Log Masuk Sekarang
              </button>
            </div>
          ) : !isAdmin && !userProfile ? (
            /* Scenario 2: Logged in (e.g. Google), but no registered customer profile found */
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl text-center shadow-xl border border-slate-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Anda Belum Melanggan</h2>
              {user.email && (
                <p className="text-xs font-mono bg-slate-100 text-slate-700 py-1 px-3 rounded-lg inline-block mt-2">
                  {user.email}
                </p>
              )}
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                Maaf, alamat akaun anda belum mempunyai rekod langganan aktif dalam sistem INFAQ Landing Page Builder.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium leading-relaxed">
                Untuk menggunakan sistem ini, sila buat pembelian langganan RM150 dan lengkapkan pendaftaran profil ejen anda.
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => setPurchaseOpen(true)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Daftar Ejen (RM150)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigateTo('home')}
                  className="w-full py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Kembali ke Halaman Utama</span>
                </button>

                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-slate-600 pt-1"
                >
                  Log Keluar
                </button>
              </div>
            </div>
          ) : !isAdmin && userProfile?.accountStatus === 'Pending' ? (
            /* Scenario 3: Account Pending Verification */
            <div className="max-w-lg mx-auto my-14 p-8 sm:p-10 bg-white rounded-3xl text-center shadow-xl border border-slate-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Menunggu Pengesahan Pembayaran
              </span>

              <h2 className="text-2xl font-black text-slate-900 mt-3">Status Pendaftaran</h2>

              {latestOrder?.id && (
                <p className="text-xs font-mono bg-slate-100 text-slate-700 py-1 px-3 rounded-lg inline-block mt-2">
                  No Pesanan: <strong>{latestOrder.id}</strong>
                </p>
              )}

              <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed font-semibold">
                Pendaftaran anda telah diterima dan sedang menunggu pengesahan pembayaran oleh pihak admin.
              </p>

              {latestOrder?.orderStatus === 'Ditolak' ? (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-left text-xs text-rose-800">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 mb-1">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Nota Penolakan Admin:</span>
                  </div>
                  <p className="text-rose-700 leading-relaxed">
                    {latestOrder.rejectionReason || 'Bukti bayaran tidak lengkap atau transaksi tidak ditemui.'}
                  </p>
                  <button
                    onClick={() => setReuploadModal({ open: true, orderId: latestOrder.id })}
                    className="mt-3 w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Muat Naik Semula Slip Bayaran</span>
                  </button>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs text-slate-600 space-y-2">
                  <p className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Slip bayaran telah diterima dan disimpan dalam sistem.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Akaun anda dan dashboard pembina landing page akan dibuka sebaik sahaja pihak admin meluluskan bayaran anda.</span>
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2.5">
                {latestOrder && latestOrder.orderStatus !== 'Ditolak' && (
                  <button
                    onClick={() => setReuploadModal({ open: true, orderId: latestOrder.id })}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Kemas Kini / Muat Naik Semula Slip
                  </button>
                )}

                <button
                  onClick={() => navigateTo('home')}
                  className="w-full py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Kembali ke Halaman Utama</span>
                </button>

                <button
                  onClick={logout}
                  className="w-full py-2.5 px-5 rounded-2xl text-slate-500 hover:text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Keluar</span>
                </button>
              </div>
            </div>
          ) : !isAdmin && userProfile?.accountStatus === 'Digantung' ? (
            /* Scenario 4: Suspended */
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl text-center shadow-xl border border-slate-200">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Akaun Digantung</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                Akaun perunding anda telah digantung oleh pentadbir sistem. Sila hubungi pihak pengurusan di <strong className="text-slate-900 font-mono">infaq.my@gmail.com</strong> untuk sebarang semakan atau pengaktifan semula.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => navigateTo('home')}
                  className="w-full py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Kembali ke Halaman Utama</span>
                </button>
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-slate-600 py-1"
                >
                  Log Keluar
                </button>
              </div>
            </div>
          ) : !isAdmin && subscription && subscription.status === 'Tamat' ? (
            /* Scenario 5: Expired */
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl text-center shadow-xl border border-slate-200">
              <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Langganan Telah Tamat Tempoh</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                Tempoh langganan tahunan (365 hari) anda telah tamat. Sila perbaharui langganan anda sebanyak RM150 untuk terus menerbitkan landing page peribadi anda.
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => setPurchaseOpen(true)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Perbaharui Langganan (RM150)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateTo('home')}
                  className="w-full py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Kembali ke Halaman Utama
                </button>
              </div>
            </div>
          ) : (
            /* Scenario 6: Active Customer or Admin -> Full Dashboard Access */
            <BuyerDashboard />
          )
        )}

        {currentView === 'admin' && (
          isAdmin ? (
            <AdminPanel />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center shadow-lg border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Terhad Pentadbir</h2>
              <p className="text-xs text-slate-500 mb-6">
                Hanya akaun dengan peranan pentadbir (termasuk infaq.my@gmail.com) boleh mengakses halaman ini.
              </p>
              <button
                onClick={() => setLoginOpen(true)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Log Masuk Akaun Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer: Visible on non-public pages */}
      {currentView !== 'public' && (
        <Footer onOpenConfigGuide={() => setConfigGuideOpen(true)} />
      )}

      {/* Step 1: OnPay Purchase Popup Modal (embed order form) */}
      <OnPayPurchaseModal
        isOpen={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        onProceedToRegister={() => {
          setPurchaseOpen(false);
          setRegisterOpen(true);
        }}
      />

      {/* Step 2: Register Modal (with 4 sections + Section 5 for Slip Upload) */}
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setPurchaseOpen(true);
        }}
      />

      {/* Re-upload Receipt Modal */}
      {reuploadModal.open && (
        <ReuploadReceiptModal
          isOpen={reuploadModal.open}
          orderId={reuploadModal.orderId}
          onClose={() => setReuploadModal({ open: false, orderId: '' })}
          onSuccess={() => {
            // Updated
          }}
        />
      )}

      {/* Configuration & Integration Guide Modal */}
      <ConfigGuideModal
        isOpen={configGuideOpen}
        onClose={() => setConfigGuideOpen(false)}
      />

      {/* Demo Template Preview Modal */}
      {demoPreview.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                Pratonton Contoh Templat
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                • {demoPreview.templateId === 'template1' ? 'Profil Profesional' : demoPreview.templateId === 'template2' ? 'Fokus Produk' : 'Ringkas & Terus'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setDemoPreview({ open: false, templateId: 'template1' });
                  setPurchaseOpen(true);
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow cursor-pointer"
              >
                Langgan Templat Ini (RM150)
              </button>

              <button
                onClick={() => setDemoPreview({ open: false, templateId: 'template1' })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <PublicLandingPage
              slug="demo-preview"
              previewMode={true}
              onBackToHome={() => setDemoPreview({ open: false, templateId: 'template1' })}
              previewData={{
                landingPage: { ...demoLandingPage, templateId: demoPreview.templateId },
                profile: demoProfile,
                products: demoProducts,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
