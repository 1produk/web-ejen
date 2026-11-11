import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { LandingPage, UserProfile, Subscription, Product } from '../types';
import { Template1Professional } from './Templates/Template1Professional';
import { Template2ProductFocus } from './Templates/Template2ProductFocus';
import { Template3CompactDirect } from './Templates/Template3CompactDirect';
import { AlertTriangle, Clock, ArrowLeft, Search, ShieldX } from 'lucide-react';

interface Props {
  slug: string;
  onBackToHome?: () => void;
  previewMode?: boolean;
  previewData?: {
    landingPage: LandingPage;
    profile: UserProfile;
    products: Product[];
  };
}

export const PublicLandingPage: React.FC<Props> = ({
  slug,
  onBackToHome,
  previewMode = false,
  previewData,
}) => {
  const [loading, setLoading] = useState<boolean>(!previewMode);
  const [errorState, setErrorState] = useState<'not_found' | 'suspended' | 'expired' | 'unpublished' | null>(null);
  const [pageData, setPageData] = useState<LandingPage | null>(previewData?.landingPage || null);
  const [profileData, setProfileData] = useState<UserProfile | null>(previewData?.profile || null);
  const [productsData, setProductsData] = useState<Product[]>(previewData?.products || []);

  useEffect(() => {
    if (previewMode && previewData) {
      setPageData(previewData.landingPage);
      setProfileData(previewData.profile);
      setProductsData(previewData.products);
      setLoading(false);
      return;
    }

    const fetchLandingPage = async () => {
      setLoading(true);
      setErrorState(null);

      try {
        const cleanSlug = decodeURIComponent(slug).toLowerCase().trim().replace(/^\/+|\/+$/g, '');
        let pageId: string | null = null;

        // 1. Try finding via /slugs/{slug}
        const slugDoc = await getDoc(doc(db, 'slugs', cleanSlug));
        if (slugDoc.exists()) {
          pageId = slugDoc.data().landingPageId || slugDoc.data().userId;
        } else {
          // Fallback A: Query landingPages collection by slug
          const q = query(collection(db, 'landingPages'), where('slug', '==', cleanSlug));
          const snap = await getDocs(q);
          if (!snap.empty) {
            pageId = snap.docs[0].id;
          } else {
            // Fallback B: Check if slug matches a userId directly
            const directUserDoc = await getDoc(doc(db, 'users', cleanSlug));
            if (directUserDoc.exists()) {
              pageId = directUserDoc.id;
            }
          }
        }

        if (!pageId) {
          setErrorState('not_found');
          setLoading(false);
          return;
        }

        // Wait for auth session to be ready
        const { auth } = await import('../firebase/config');
        if (auth.authStateReady) {
          await auth.authStateReady();
        }
        const currentUid = auth.currentUser?.uid;
        const currentEmail = auth.currentUser?.email;

        // 2. Fetch User Profile
        const userDoc = await getDoc(doc(db, 'users', pageId));
        if (!userDoc.exists()) {
          setErrorState('not_found');
          setLoading(false);
          return;
        }
        const user = userDoc.data() as UserProfile;

        // 3. Fetch Landing Page or synthesize if document not yet created
        const pageDoc = await getDoc(doc(db, 'landingPages', pageId));
        let page: LandingPage;
        const now = new Date().toISOString();

        if (pageDoc.exists()) {
          page = pageDoc.data() as LandingPage;
        } else {
          // Fallback synthesized landing page for registered agent
          const isUserActive = user.accountStatus === 'Aktif' || user.role === 'admin';
          page = {
            id: pageId,
            userId: pageId,
            slug: cleanSlug,
            title: `Perunding Takaful & Hibah Keluarga - ${user.fullName}`,
            bio: 'Selamat datang ke laman rasmi perundingan Takaful saya. Dapatkan pelan perlindungan pendapatan, hibah, kad perubatan dan simpanan terbaik untuk masa depan anda dan keluarga tercinta.',
            templateId: 'template1',
            colorTheme: 'green',
            status: isUserActive ? 'Diterbitkan' : 'Draf',
            isPublished: isUserActive,
            whatsappNumber: user.phone || '',
            whatsappMessage: `Salam ${user.fullName}, saya ingin mendapatkan sebut harga dan konsultasi percuma pelan Takaful.`,
            customNotice: 'Perlindungan kewangan dan perubatan terbaik untuk ketenangan minda anda dan keluarga tersayang.',
            socialLinks: {
              whatsapp: user.phone || '',
            },
            createdAt: user.createdAt || now,
            updatedAt: now,
          };

          // If current logged in user is owner or admin, persist this document
          if (currentUid === pageId || currentEmail === 'infaq.my@gmail.com') {
            try {
              const { setDoc: writeSetDoc } = await import('firebase/firestore');
              await writeSetDoc(doc(db, 'landingPages', pageId), page);
              await writeSetDoc(doc(db, 'slugs', cleanSlug), {
                id: cleanSlug,
                userId: pageId,
                landingPageId: pageId,
                createdAt: now,
              });
            } catch (errPersist) {
              console.warn('Auto-persist landing page notice:', errPersist);
            }
          }
        }

        // Check if URL search param or hash contains preview=true, or if user is owner
        const isPreviewParam =
          window.location.search.includes('preview=true') ||
          window.location.hash.includes('preview=true') ||
          previewMode;

        const isOwnerOrAdmin =
          Boolean(currentUid && (currentUid === page.userId || currentEmail === 'infaq.my@gmail.com'));

        const allowUnpublishedPreview = isPreviewParam || isOwnerOrAdmin;

        // Check if published
        if (!page.isPublished || page.status !== 'Diterbitkan') {
          if (!allowUnpublishedPreview) {
            setErrorState('unpublished');
            setLoading(false);
            return;
          }
        }

        // Check Account Status (skip check in owner preview mode)
        if (!allowUnpublishedPreview && (user.accountStatus === 'Digantung' || user.accountStatus === 'Diarkibkan')) {
          setErrorState('suspended');
          setLoading(false);
          return;
        }

        // 4. Fetch & Check Subscription (skip strict expiry block in owner preview mode)
        try {
          const subDoc = await getDoc(doc(db, 'subscriptions', page.userId));
          if (subDoc.exists() && !allowUnpublishedPreview) {
            const sub = subDoc.data() as Subscription;
            if (sub.endDate) {
              const expiryTime = new Date(sub.endDate).getTime();
              if (expiryTime < Date.now()) {
                setErrorState('expired');
                setLoading(false);
                return;
              }
            } else if (sub.status !== 'Aktif' && user.role !== 'admin' && user.accountStatus !== 'Aktif') {
              setErrorState('expired');
              setLoading(false);
              return;
            }
          }
        } catch (subErr) {
          console.warn('Subscription check notice:', subErr);
        }

        // 5. Fetch Products
        let prods: Product[] = [];
        try {
          const prodQuery = query(
            collection(db, 'products'),
            where('userId', '==', page.userId)
          );
          const prodSnap = await getDocs(prodQuery);
          prods = prodSnap.docs
            .map((d) => ({ ...d.data(), id: d.id } as Product))
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        } catch (prodErr) {
          console.warn('Products query notice:', prodErr);
        }

        setPageData(page);
        setProfileData(user);
        setProductsData(prods);
      } catch (err) {
        console.error('Error fetching public landing page:', err);
        setErrorState('not_found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchLandingPage();
    }
  }, [slug, previewMode, previewData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Memuatkan Landing Page Ejen...</h2>
        <p className="text-xs text-slate-500 mt-1">Sila tunggu sebentar.</p>
      </div>
    );
  }

  // Error & Status Messages
  if (errorState) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-200">
          {errorState === 'not_found' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Landing Page Tidak Ditemui</h2>
              <p className="text-sm text-slate-600 mt-2">
                Pautan slug <span className="font-semibold text-slate-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded">/p/{slug}</span> tidak wujud atau telah ditukar oleh ejen.
              </p>
            </>
          )}

          {errorState === 'suspended' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
                <ShieldX className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Akaun Ejen Digantung</h2>
              <p className="text-sm text-slate-600 mt-2">
                Akaun ejen untuk halaman ini sedang digantung oleh pentadbir sistem. Sila hubungi pentadbir untuk maklumat lanjut.
              </p>
            </>
          )}

          {errorState === 'expired' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Langganan Telah Tamat Tempoh</h2>
              <p className="text-sm text-slate-600 mt-2">
                Tempoh sah langganan tahunan bagi landing page ini telah tamat. Ejen boleh memperbaharui langganan melalui Dashboard Pembeli untuk mengaktifkan semula halaman.
              </p>
            </>
          )}

          {errorState === 'unpublished' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Halaman Sedang Tidak Diterbitkan</h2>
              <p className="text-sm text-slate-600 mt-2">
                Ejen belum menerbitkan halaman ini kepada orang awam atau halaman ini sedang disimpan sebagai draf.
              </p>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Laman Utama</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!pageData || !profileData) {
    return null;
  }

  const renderSelectedTemplate = () => {
    switch (pageData.templateId) {
      case 'template2':
        return (
          <Template2ProductFocus
            profile={profileData}
            landingPage={pageData}
            products={productsData}
            isPreview={previewMode}
          />
        );
      case 'template3':
        return (
          <Template3CompactDirect
            profile={profileData}
            landingPage={pageData}
            products={productsData}
            isPreview={previewMode}
          />
        );
      case 'template1':
      default:
        return (
          <Template1Professional
            profile={profileData}
            landingPage={pageData}
            products={productsData}
            isPreview={previewMode}
          />
        );
    }
  };

  return (
    <div className="relative">
      {(previewMode || !pageData.isPublished || pageData.status !== 'Diterbitkan') && (
        <div className="bg-amber-600 text-white text-xs font-bold py-2.5 px-4 sticky top-0 z-50 shadow-md flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold">
              Mod Pratonton Ejen
            </span>
            <span>Laman ini berstatus Draf (Belum Diterbitkan ke Umum). Sedia untuk disemak sebelum diterbitkan.</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#/dashboard"
              className="bg-white text-slate-900 hover:bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition"
            >
              Dashboard Ejen →
            </a>
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                Tutup Pratonton
              </button>
            )}
          </div>
        </div>
      )}

      {renderSelectedTemplate()}
    </div>
  );
};
