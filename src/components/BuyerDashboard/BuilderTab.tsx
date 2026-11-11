import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  LandingPage,
  UserProfile,
  Product,
  TemplateId,
  ColorTheme,
  Subscription
} from '../../types';
import { THEMES, THEME_NAMES } from '../../utils/theme';
import { PublicLandingPage } from '../PublicLandingPage';
import {
  Palette,
  Layout,
  Globe,
  Share2,
  CheckCircle,
  AlertCircle,
  Eye,
  Save,
  Send,
  Smartphone,
  Monitor,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  ShieldAlert,
  PhoneCall,
  X
} from 'lucide-react';

interface Props {
  profile: UserProfile;
  landingPage: LandingPage;
  products: Product[];
  subscription: Subscription | null;
  onRefresh: () => void;
}

export const BuilderTab: React.FC<Props> = ({
  profile,
  landingPage,
  products,
  subscription,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<LandingPage>({ ...landingPage });
  const [suggestedSlug, setSuggestedSlug] = useState(landingPage.slug || '');
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'available' | 'taken' | 'current' | null>('current');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('mobile');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPreviewLink, setCopiedPreviewLink] = useState(false);

  // Sync state when landingPage updates from Firestore
  useEffect(() => {
    if (landingPage) {
      setFormData({
        ...landingPage,
        templateId: landingPage.templateId || 'template1',
        colorTheme: landingPage.colorTheme || 'green',
        title: landingPage.title || `Perunding Takaful & Hibah - ${profile.fullName}`,
        bio: landingPage.bio || 'Selamat datang ke laman rasmi perundingan Takaful. Saya sedia membantu anda merancang perlindungan Kad Perubatan, Hibah Takaful, Perlindungan Penyakit Kritikal dan simpanan masa depan secara patuh syariah.',
        slug: landingPage.slug || `ejen-${profile.id.slice(0, 5)}`,
        contactForm: landingPage.contactForm || {
          enabled: false,
          title: 'Borang Permintaan Dihubungi',
          subtitle: 'Sila lengkapkan maklumat di bawah untuk mendapatkan konsultasi percuma dan cadangan pelan Takaful bersesuaian.',
        },
      });
      if (landingPage.slug) {
        setSuggestedSlug(landingPage.slug);
      }
    }
  }, [landingPage, profile]);

  // Unpublish / publish confirmation modal
  const [showPublishModal, setShowPublishModal] = useState(false);

  const isEligibleToPublish =
    (profile.accountStatus === 'Aktif' || profile.role === 'admin') &&
    (subscription?.status === 'Aktif' || profile.role === 'admin');

  const handleSlugChange = async (val: string) => {
    const clean = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSuggestedSlug(clean);

    if (!clean) {
      setSlugStatus(null);
      return;
    }

    if (clean === landingPage.slug) {
      setSlugStatus('current');
      return;
    }

    setSlugChecking(true);
    try {
      const slugDoc = await getDoc(doc(db, 'slugs', clean));
      if (slugDoc.exists() && slugDoc.data().userId !== profile.id) {
        setSlugStatus('taken');
      } else {
        setSlugStatus('available');
      }
    } catch {
      setSlugStatus(null);
    } finally {
      setSlugChecking(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const now = new Date().toISOString();
      let finalSlug = landingPage.slug;

      // Handle slug change if requested and valid
      if (suggestedSlug && suggestedSlug !== landingPage.slug && slugStatus === 'available') {
        finalSlug = suggestedSlug;
        // Register new slug
        await setDoc(doc(db, 'slugs', finalSlug), {
          id: finalSlug,
          userId: profile.id,
          landingPageId: profile.id,
          createdAt: now,
        });
        // Free old slug if exists
        try {
          if (landingPage.slug) {
            await deleteDoc(doc(db, 'slugs', landingPage.slug));
          }
        } catch {
          // ignore cleanup
        }
      }

      const pageRef = doc(db, 'landingPages', profile.id);
      await setDoc(
        pageRef,
        {
          id: profile.id,
          userId: profile.id,
          title: formData.title.trim(),
          bio: formData.bio.trim(),
          templateId: formData.templateId,
          colorTheme: formData.colorTheme,
          whatsappNumber: formData.whatsappNumber.trim(),
          whatsappMessage: formData.whatsappMessage?.trim() || '',
          customNotice: formData.customNotice?.trim() || '',
          socialLinks: formData.socialLinks || {},
          contactForm: formData.contactForm || {
            enabled: false,
            title: 'Borang Permintaan Dihubungi',
            subtitle: 'Sila lengkapkan maklumat di bawah untuk mendapatkan konsultasi percuma dan cadangan pelan Takaful bersesuaian.',
          },
          slug: finalSlug,
          updatedAt: now,
        },
        { merge: true }
      );

      // Always ensure slug document is updated in /slugs collection
      if (finalSlug) {
        try {
          await setDoc(doc(db, 'slugs', finalSlug), {
            id: finalSlug,
            userId: profile.id,
            landingPageId: profile.id,
            createdAt: now,
          }, { merge: true });
        } catch (slugErr) {
          console.warn('Slug doc sync notice:', slugErr);
        }
      }

      setSaveSuccess(true);
      onRefresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving draft:', err);
      setError(err.message || 'Gagal menyimpan draf.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!isEligibleToPublish && !formData.isPublished) {
      setError(
        'Akaun atau langganan anda belum aktif. Admin perlu meluluskan pembayaran terlebih dahulu sebelum landing page boleh diterbitkan ke umum.'
      );
      return;
    }

    setSaving(true);
    setError(null);
    setShowPublishModal(false);

    try {
      const now = new Date().toISOString();
      const newPublishedState = !formData.isPublished;
      const newStatus = newPublishedState ? 'Diterbitkan' : 'Draf';

      const pageRef = doc(db, 'landingPages', profile.id);
      await setDoc(
        pageRef,
        {
          id: profile.id,
          userId: profile.id,
          isPublished: newPublishedState,
          status: newStatus,
          updatedAt: now,
        },
        { merge: true }
      );

      setFormData((prev) => ({ ...prev, isPublished: newPublishedState, status: newStatus }));
      onRefresh();
    } catch (err: any) {
      console.error('Error toggling publish state:', err);
      setError(err.message || 'Gagal mengubah status penerbitan.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#/p/${landingPage.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPreviewLink = () => {
    const url = `${window.location.origin}/#/p/${formData.slug || landingPage.slug}?preview=true`;
    navigator.clipboard.writeText(url);
    setCopiedPreviewLink(true);
    setTimeout(() => setCopiedPreviewLink(false), 2000);
  };

  const templates: { id: TemplateId; name: string; desc: string; icon: string }[] = [
    {
      id: 'template1',
      name: 'Profil Perunding Profesional',
      desc: 'Menonjolkan kepakaran dan kredibiliti ejen Takaful bertauliah di bahagian atas, diikuti butang WhatsApp sebut harga dan katalog pelan Takaful di bawah.',
      icon: '👤',
    },
    {
      id: 'template2',
      name: 'Fokus Pelan & Kad Perubatan',
      desc: 'Mengetengahkan pelan perlindungan Kad Perubatan, Hibah, dan Penyakit Kritikal di bahagian atas dengan butang sebut harga pantas. Profil perunding di bawah.',
      icon: '🎯',
    },
    {
      id: 'template3',
      name: 'Ringkas & Pantas (Mobile)',
      desc: 'Susun atur padat mesra telefon pintar (link-in-bio style), penukaran sebut harga segera tanpa gangguan visual.',
      icon: '⚡',
    },
  ];

  const colorThemes: ColorTheme[] = ['green', 'red', 'blue', 'yellow', 'orange'];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                formData.isPublished
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Status: {formData.isPublished ? '● Diterbitkan (Aktif di Umum)' : '○ Simpan Sebagai Draf (Belum Diterbitkan)'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Reka Bentuk & Tetapan Landing Page Takaful</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih susun atur templat, warna tema, maklumat pelan perlindungan dan pautan peribadi ejen anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Live Preview Button */}
          <button
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Pratonton Interaktif</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow transition inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Draf'}</span>
          </button>

          {/* Publish / Unpublish */}
          <button
            onClick={() => setShowPublishModal(true)}
            disabled={saving}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow transition inline-flex items-center gap-1.5 cursor-pointer ${
              formData.isPublished
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{formData.isPublished ? 'Nyahterbit Halaman' : 'Terbitkan Sekarang'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Perubahan draf landing page berjaya disimpan!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* DUAL LINK SECTION: Preview link (before published) and official public link */}
      {formData.slug && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Agent Preview Link (Ready before published!) */}
          <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                  Pautan Pratonton Ejen (Boleh disemak sebelum terbit)
                </span>
                <span className="text-[10px] text-amber-700 font-bold">Mod Pratonton</span>
              </div>
              <p className="text-xs text-amber-950 mb-2 leading-relaxed font-medium">
                Gunakan pautan ini untuk melihat paparan sebenar landing page anda pada peranti anda sendiri sebelum ia diterbitkan kepada umum.
              </p>
              <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 font-mono text-xs text-slate-800 break-all select-all">
                {window.location.origin}/#/p/{formData.slug}?preview=true
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-end gap-2">
              <button
                onClick={handleCopyPreviewLink}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                {copiedPreviewLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPreviewLink ? 'Disalin!' : 'Salin Pautan Pratonton'}</span>
              </button>

              <a
                href={`/#/p/${formData.slug}?preview=true`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Buka Pratonton</span>
              </a>
            </div>
          </div>

          {/* Card 2: Official Public Link */}
          <div className="bg-emerald-50/70 border border-emerald-300/80 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/70 px-2 py-0.5 rounded-md">
                  Pautan Awam Rasmi (Untuk Prospek)
                </span>
                <span className={`text-[10px] font-bold ${formData.isPublished ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {formData.isPublished ? '● Diterbitkan' : '○ Draf (Belum Terbit)'}
                </span>
              </div>
              <p className="text-xs text-emerald-950 mb-2 leading-relaxed font-medium">
                Pautan slug unik rasmi anda untuk dikongsikan kepada prospek dan di media sosial (Instagram, Facebook, TikTok).
              </p>
              <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200 font-mono text-xs text-slate-800 break-all select-all">
                {window.location.origin}/#/p/{formData.slug}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-end gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Disalin!' : 'Salin Pautan Awam'}</span>
              </button>

              <a
                href={`/#/p/${formData.slug}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Laman Awam</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Template Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layout className="w-4 h-4 text-emerald-600" />
            <span>1. Pilih Susun Atur Templat (3 Templat Berbeza)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap templat mempunyai susunan visual unik bagi memaksimakan penukaran prospek Takaful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setFormData({ ...formData, templateId: tpl.id })}
              className={`border-2 rounded-2xl p-5 cursor-pointer transition relative flex flex-col justify-between ${
                formData.templateId === tpl.id
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{tpl.icon}</span>
                  {formData.templateId === tpl.id && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Dipilih
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{tpl.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{tpl.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/80 text-[11px] font-semibold text-emerald-700">
                Pilih templat ini →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Color Theme Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-600" />
            <span>2. Pilihan Warna Tema</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Warna digunakan pada butang tindakan, lencana, dan aksen visual untuk memastikan kebolehbacaan maksimum.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {colorThemes.map((c) => {
            const meta = THEME_NAMES[c];
            const isSelected = formData.colorTheme === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFormData({ ...formData, colorTheme: c })}
                className={`p-3 rounded-xl border-2 flex items-center gap-3 transition cursor-pointer text-left ${
                  isSelected
                    ? 'border-slate-800 bg-slate-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className={`w-6 h-6 rounded-full shadow ${meta.colorClass} flex-shrink-0`} />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">{meta.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{c}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Custom Slug / URL */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>3. Pautan Slug Peribadi Ejen</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tentukan pautan unik anda sendiri untuk memudahkan perkongsian kepada bakal pelanggan & prospek di media sosial.
          </p>
        </div>

        <div className="max-w-xl">
          <label className="block text-xs font-bold text-slate-700 mb-1">Cadangan Slug Pautan</label>
          <div className="flex items-center">
            <span className="bg-slate-100 text-slate-500 border border-r-0 border-slate-300 px-3.5 py-2.5 rounded-l-xl text-xs sm:text-sm font-mono">
              /p/
            </span>
            <input
              type="text"
              value={suggestedSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="nama-ejen-anda"
              className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-r-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="mt-2 text-xs">
            {slugChecking ? (
              <span className="text-slate-500">Memeriksa ketersediaan slug...</span>
            ) : slugStatus === 'available' ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Pautan slug tersedia untuk digunakan!
              </span>
            ) : slugStatus === 'taken' ? (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Slug ini telah digunakan oleh ejen lain. Sila pilih yang lain.
              </span>
            ) : slugStatus === 'current' ? (
              <span className="text-slate-500 font-medium">Slug semasa anda sedang aktif.</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Step 4: Headline & Contact Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="pb-4 border-b border-slate-100 mb-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>4. Kandungan Teks & Butang Tindakan WhatsApp</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Maklumat ini akan dipaparkan di kepala halaman dan mengaktifkan interaksi langsung dengan prospek.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tajuk Utama Landing Page <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: Perunding Takaful & Khidmat Perancangan Kewangan Keluarga"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Pengenalan Diri / Bio</label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Terangkan kepakaran anda dan komitmen membantu pelanggan merancang perlindungan Takaful terbaik."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombor WhatsApp Rasmi <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="Contoh: 0123456789"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mesej Pratetap WhatsApp (Pilihan)
            </label>
            <input
              type="text"
              value={formData.whatsappMessage || ''}
              onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
              placeholder="Salam, saya berminat untuk dapatkan sebut harga dan rundingan pelan Takaful."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Pautan Media Sosial Ejen (Pilihan)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Facebook URL</label>
              <input
                type="text"
                value={formData.socialLinks?.facebook || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                  })
                }
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Instagram URL</label>
              <input
                type="text"
                value={formData.socialLinks?.instagram || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                  })
                }
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">TikTok URL</label>
              <input
                type="text"
                value={formData.socialLinks?.tiktok || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, tiktok: e.target.value },
                  })
                }
                placeholder="https://tiktok.com/@..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Laman Web Peribadi / Blog</label>
              <input
                type="text"
                value={formData.socialLinks?.website || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, website: e.target.value },
                  })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Custom Notice */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Notis Khas / Pesanan Bawah (Pilihan)
          </label>
          <input
            type="text"
            value={formData.customNotice || ''}
            onChange={(e) => setFormData({ ...formData, customNotice: e.target.value })}
            placeholder="Contoh: Sebut harga dan pelan perlindungan disesuaikan mengikut bajet serta keperluan sebenar anda dan keluarga."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Step 5: Borang Permintaan Dihubungi */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>5. Borang Permintaan Dihubungi</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Benarkan pelanggan dan prospek mengisi butiran diri secara terus pada landing page untuk dihantar ke WhatsApp anda.
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                formData.contactForm?.enabled
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {formData.contactForm?.enabled ? 'Aktif pada Landing Page' : 'Tidak Aktif'}
            </span>

            <button
              type="button"
              onClick={() => {
                const current = Boolean(formData.contactForm?.enabled);
                setFormData({
                  ...formData,
                  contactForm: {
                    enabled: !current,
                    title: formData.contactForm?.title || 'Borang Permintaan Dihubungi',
                    subtitle:
                      formData.contactForm?.subtitle ||
                      'Sila lengkapkan maklumat di bawah untuk mendapatkan konsultasi percuma dan cadangan pelan Takaful bersesuaian.',
                  },
                });
              }}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.contactForm?.enabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={formData.contactForm?.enabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.contactForm?.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {formData.contactForm?.enabled ? (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tajuk Borang
              </label>
              <input
                type="text"
                value={formData.contactForm?.title || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactForm: {
                      ...formData.contactForm,
                      enabled: true,
                      title: e.target.value,
                    },
                  })
                }
                placeholder="Borang Permintaan Dihubungi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Keterangan / Mesej Panduan Borang
              </label>
              <input
                type="text"
                value={formData.contactForm?.subtitle || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactForm: {
                      ...formData.contactForm,
                      enabled: true,
                      subtitle: e.target.value,
                    },
                  })
                }
                placeholder="Sila lengkapkan maklumat di bawah untuk mendapatkan konsultasi percuma dan cadangan pelan Takaful bersesuaian."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Field breakdown summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Maklumat Yang Akan Diisi Oleh Pelanggan & Dihantar ke WhatsApp:</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">1. Nama</span> (Wajib)
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">2. No. Telefon</span> (Wajib)
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">3. Umur</span> (Wajib)
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">4. E-mel</span> (Wajib)
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">5. Lokasi</span> (Wajib)
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">6. Negeri</span> (Wajib)
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">7. Pekerjaan</span> (Wajib)
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">8. Cara Bincang</span> (Pilihan)
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Setiap penghantaran akan membuka WhatsApp ejen pada nombor <strong className="font-mono text-emerald-700">{formData.whatsappNumber || profile.phone || 'belum ditetapkan'}</strong> bersama teks mesej lengkap & tersusun rapi.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Borang ini sedang <strong>dinyahaktifkan</strong>. Aktifkan butang di atas untuk memaparkan borang permintaan pada landing page anda.</span>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          Kandungan profil dan produk kekal tersimpan rapi secara berasingan daripada konfigurasi templat.
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition inline-flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Pratonton Perubahan</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
          </button>
        </div>
      </div>

      {/* Publish / Unpublish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                formData.isPublished ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <Send className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {formData.isPublished ? 'Nyahterbit Landing Page?' : 'Terbitkan Landing Page ke Awam?'}
            </h3>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {formData.isPublished
                ? 'Halaman anda tidak lagi boleh diakses oleh orang awam sehingga anda menerbitkannya semula.'
                : 'Halaman anda akan boleh diakses secara langsung melalui pautan slug unik dan prospek boleh mula menghubungi anda melalui WhatsApp.'}
            </p>

            {!isEligibleToPublish && !formData.isPublished && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Perhatian: Akaun atau langganan anda masih berstatus <strong>Menunggu Pengesahan</strong>. Pembayaran perlu disahkan oleh Admin terlebih dahulu.
                </span>
              </div>
            )}

            <div className="mt-6 flex gap-2 justify-center">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Batal
              </button>

              <button
                onClick={handleTogglePublish}
                disabled={!isEligibleToPublish && !formData.isPublished}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow transition disabled:opacity-50 ${
                  formData.isPublished ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {formData.isPublished ? 'Sahkan Nyahterbit' : 'Sahkan & Terbitkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Live Preview Modal (Desktop & Mobile) */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col">
          {/* Top Bar for Viewport Toggle */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                Pratonton Interaktif
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Templat: {templates.find((t) => t.id === formData.templateId)?.name} • Warna: {formData.colorTheme}
              </span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  previewDevice === 'mobile'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Telefon</span>
              </button>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  previewDevice === 'desktop'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
            </div>

            <button
              onClick={() => setPreviewOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Tutup Pratonton"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-slate-900/40">
            {previewDevice === 'mobile' ? (
              <div className="w-full max-w-[400px] h-[780px] bg-white rounded-[40px] shadow-2xl border-8 border-slate-800 overflow-hidden relative flex flex-col">
                {/* Notch */}
                <div className="h-6 bg-slate-800 w-36 mx-auto rounded-b-xl z-20 flex-shrink-0" />
                <div className="flex-1 overflow-y-auto">
                  <PublicLandingPage
                    slug={formData.slug}
                    previewMode={true}
                    previewData={{
                      landingPage: formData,
                      profile: profile,
                      products: products,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-y-auto border border-slate-700">
                <PublicLandingPage
                  slug={formData.slug}
                  previewMode={true}
                  previewData={{
                    landingPage: formData,
                    profile: profile,
                    products: products,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
