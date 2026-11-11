import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, getDocs, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { UserProfile, LandingPage, Product, Subscription, Order } from '../../types';
import { BuilderTab } from './BuilderTab';
import { ProductsTab } from './ProductsTab';
import { ProfileTab } from './ProfileTab';
import { SubscriptionTab } from './SubscriptionTab';
import { PaymentProofModal } from '../PaymentProofModal';
import {
  Layout,
  Package,
  User,
  CreditCard,
  Globe,
  Share2,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const { user, userProfile, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'builder' | 'products' | 'profile' | 'subscription'>('builder');
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment proof modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Contact Admin modal
  const [contactAdminOpen, setContactAdminOpen] = useState(false);

  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;

    let unsubPage: (() => void) | undefined;
    let unsubProducts: (() => void) | undefined;
    let unsubSub: (() => void) | undefined;
    let unsubOrders: (() => void) | undefined;

    const fetchData = async () => {
      setLoading(true);

      // 1. Landing Page with Auto-Initialization for Takaful if missing
      unsubPage = onSnapshot(
        doc(db, 'landingPages', userId),
        async (snap) => {
          if (snap.exists()) {
            setLandingPage(snap.data() as LandingPage);
          } else {
            // Check if this user already has an existing registered slug in /slugs collection
            let resolvedSlug = '';
            try {
              const qSlug = query(collection(db, 'slugs'), where('userId', '==', userId));
              const snapSlug = await getDocs(qSlug);
              if (!snapSlug.empty) {
                resolvedSlug = snapSlug.docs[0].id;
              }
            } catch (errSlug) {
              console.warn('Error checking existing slug:', errSlug);
            }

            if (!resolvedSlug) {
              const baseSlug = userProfile?.fullName
                ? userProfile.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                : `ejen-${userId.slice(0, 5)}`;
              resolvedSlug = baseSlug || `ejen-${userId.slice(0, 5)}`;
            }

            const isUserActive = userProfile?.accountStatus === 'Aktif' || userProfile?.role === 'admin';
            const now = new Date().toISOString();

            const fallbackPage: LandingPage = {
              id: userId,
              userId: userId,
              slug: resolvedSlug,
              title: `Perunding Takaful & Hibah Keluarga - ${userProfile?.fullName || 'Ejen Takaful'}`,
              bio: `Selamat datang ke laman rasmi perundingan Takaful. Saya sedia membantu anda merancang perlindungan Kad Perubatan, Hibah Takaful, Perlindungan Penyakit Kritikal dan simpanan masa depan secara patuh syariah.`,
              templateId: 'template1',
              colorTheme: 'green',
              status: isUserActive ? 'Diterbitkan' : 'Draf',
              whatsappNumber: userProfile?.phone || '',
              whatsappMessage: `Assalamualaikum ${userProfile?.fullName || ''}, saya ingin dapatkan sebut harga dan konsultasi percuma pelan Takaful.`,
              isPublished: isUserActive,
              socialLinks: {
                whatsapp: userProfile?.phone || '',
              },
              customNotice: 'Perlindungan kewangan dan perubatan patuh syariah untuk ketenangan minda anda dan keluarga.',
              createdAt: now,
              updatedAt: now,
            };

            setLandingPage(fallbackPage);
            try {
              await setDoc(doc(db, 'landingPages', userId), fallbackPage);
              await setDoc(doc(db, 'slugs', resolvedSlug), {
                id: resolvedSlug,
                userId: userId,
                landingPageId: userId,
                createdAt: now,
              });
            } catch (e) {
              console.warn('Auto initialize page notice:', e);
            }
          }
        },
        (err) => {
          console.warn('Buyer page snapshot error:', err.message);
        }
      );

      // 2. Products
      const prodQuery = query(collection(db, 'products'), where('userId', '==', userId));
      unsubProducts = onSnapshot(
        prodQuery,
        (snap) => {
          const prods = snap.docs
            .map((d) => ({ ...d.data(), id: d.id } as Product))
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setProducts(prods);
        },
        (err) => {
          console.warn('Buyer products snapshot error:', err.message);
        }
      );

      // 3. Subscription
      unsubSub = onSnapshot(
        doc(db, 'subscriptions', userId),
        (snap) => {
          if (snap.exists()) {
            setSubscription(snap.data() as Subscription);
          }
        },
        (err) => {
          console.warn('Buyer subscription snapshot error:', err.message);
        }
      );

      // 4. Orders
      const orderQuery = query(collection(db, 'orders'), where('userId', '==', userId));
      unsubOrders = onSnapshot(
        orderQuery,
        (snap) => {
          const ords = snap.docs
            .map((d) => ({ ...d.data(), id: d.id } as Order))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(ords);
          if (ords.length > 0) {
            setSelectedOrderId(ords[0].id);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Buyer orders snapshot error:', err.message);
          setLoading(false);
        }
      );
    };

    fetchData();

    return () => {
      if (unsubPage) unsubPage();
      if (unsubProducts) unsubProducts();
      if (unsubSub) unsubSub();
      if (unsubOrders) unsubOrders();
    };
  }, [userId, userProfile]);

  const [copiedPreviewLink, setCopiedPreviewLink] = useState(false);

  const handleCopyPublicLink = () => {
    if (!landingPage?.slug) return;
    const url = `${window.location.origin}/#/p/${landingPage.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPreviewLink = () => {
    if (!landingPage?.slug) return;
    const url = `${window.location.origin}/#/p/${landingPage.slug}?preview=true`;
    navigator.clipboard.writeText(url);
    setCopiedPreviewLink(true);
    setTimeout(() => setCopiedPreviewLink(false), 2000);
  };

  if (loading || !userProfile || !userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800">Menyediakan Dashboard Ejen Anda...</h2>
      </div>
    );
  }

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    if (!subscription?.endDate) return 0;
    const end = new Date(subscription.endDate).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      {/* Top Welcome & Summary Header */}
      <div className="bg-slate-900 text-white pt-8 pb-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-emerald-500/40 shadow-lg flex-shrink-0">
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xl text-emerald-400 bg-emerald-950/60">
                  {userProfile.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  Dashboard Ejen Takaful
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    userProfile.accountStatus === 'Aktif'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {userProfile.accountStatus}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{userProfile.fullName}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {userProfile.email} {userProfile.agentId ? `• ID: ${userProfile.agentId}` : ''}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Links */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Days remaining badge */}
            <div className="bg-white/10 backdrop-blur border border-white/10 px-4 py-2.5 rounded-xl text-left">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 block font-semibold">
                Baki Langganan
              </span>
              <span className="text-lg font-black text-emerald-300">
                {daysRemaining} Hari
              </span>
            </div>

            {/* Ready Link for Preview Before Publishing */}
            {landingPage?.slug && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Preview Link (Works before published) */}
                <div className="flex items-center bg-amber-500/15 border border-amber-500/30 rounded-xl p-1">
                  <a
                    href={`/#/p/${landingPage.slug}?preview=true`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-amber-300 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition"
                    title="Buka pautan pratonton sebelum diterbitkan"
                  >
                    <span>Pratonton Laman Ejen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={handleCopyPreviewLink}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-amber-300 transition"
                    title="Salin Pautan Pratonton Ejen"
                  >
                    {copiedPreviewLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Official Public Link (When Published) */}
                {landingPage.isPublished && (
                  <div className="flex items-center bg-emerald-600/30 border border-emerald-500/40 rounded-xl p-1">
                    <a
                      href={`/#/p/${landingPage.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg text-emerald-300 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition"
                    >
                      <span>Laman Awam Rasmi</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={handleCopyPublicLink}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-300 transition"
                      title="Salin Pautan Awam Rasmi"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setContactAdminOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
              title="Hubungi Admin"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Bantuan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-1.5 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Reka Bentuk & Templat</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'products'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Pelan Takaful ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil Ejen</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'subscription'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Langganan & Pesanan</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {activeTab === 'builder' && (
            <BuilderTab
              profile={userProfile}
              landingPage={
                landingPage || {
                  id: userId,
                  userId: userId,
                  slug: userProfile.fullName
                    ? userProfile.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                    : `ejen-${userId.slice(0, 5)}`,
                  title: `Perunding Takaful & Hibah Keluarga - ${userProfile.fullName}`,
                  bio: 'Selamat datang ke laman rasmi perundingan Takaful. Saya sedia membantu anda merancang perlindungan Kad Perubatan, Hibah Takaful, Perlindungan Penyakit Kritikal dan simpanan masa depan secara patuh syariah.',
                  templateId: 'template1',
                  colorTheme: 'green',
                  status: 'Draf',
                  whatsappNumber: userProfile.phone || '',
                  whatsappMessage: `Assalamualaikum ${userProfile.fullName}, saya ingin dapatkan sebut harga dan konsultasi percuma pelan Takaful.`,
                  isPublished: false,
                  socialLinks: {
                    whatsapp: userProfile.phone || '',
                  },
                  customNotice: 'Perlindungan kewangan dan perubatan patuh syariah untuk ketenangan minda anda dan keluarga.',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              }
              products={products}
              subscription={subscription}
              onRefresh={refreshProfile}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              userId={userId}
              products={products}
              onRefresh={() => {}}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              profile={userProfile}
              onProfileUpdated={refreshProfile}
            />
          )}

          {activeTab === 'subscription' && (
            <SubscriptionTab
              profile={userProfile}
              subscription={subscription}
              orders={orders}
              onOpenPaymentModal={(orderId) => {
                if (orderId) setSelectedOrderId(orderId);
                setPaymentModalOpen(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Payment Proof Modal */}
      {paymentModalOpen && (
        <PaymentProofModal
          isOpen={paymentModalOpen}
          orderId={selectedOrderId || (orders.length > 0 ? orders[0].id : `ORD-${Date.now()}`)}
          userEmail={userProfile.email}
          userName={userProfile.fullName}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={() => {
            refreshProfile();
          }}
        />
      )}

      {/* Contact Admin Support Modal */}
      {contactAdminOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Hubungi Pentadbir Sistem INFAQ</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Ada sebarang pertanyaan mengenai pengesahan pembayaran, langganan tahunan, atau isu teknikal?
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-4 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Emel Rasmi:</span>
                <span className="font-bold text-slate-900">infaq.my@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Talian WhatsApp:</span>
                <span className="font-bold text-emerald-700">+60 12-901 0345</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Operasi:</span>
                <span className="text-slate-700">Isnin - Jumaat (9:00 AM - 6:00 PM)</span>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setContactAdminOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Tutup
              </button>
              <a
                href="https://wa.me/60129010345?text=Salam%20Admin%20INFAQ,%20saya%20ejen%20perlu%20bantuan."
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Admin</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
