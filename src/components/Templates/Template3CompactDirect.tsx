import React, { useState, useEffect } from 'react';
import { UserProfile, LandingPage, Product } from '../../types';
import { THEMES } from '../../utils/theme';
import {
  MessageCircle,
  Share2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  X,
  Target,
} from 'lucide-react';

import { ContactWhatsAppForm } from '../ContactWhatsAppForm';

interface Props {
  profile: UserProfile;
  landingPage: LandingPage;
  products: Product[];
  isPreview?: boolean;
}

export const Template3CompactDirect: React.FC<Props> = ({
  profile,
  landingPage,
  products,
  isPreview = false,
}) => {
  const theme = THEMES[landingPage.colorTheme || 'green'];
  const activeProducts = products.filter((p) => p.isActive);

  // Independent expand/collapse state per product for "Baca lagi" / "Baca kurang"
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  const toggleProductExpand = (productId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // State for enlarged image modal (lightbox)
  const [enlargedImage, setEnlargedImage] = useState<{
    url: string;
    title: string;
    category?: string;
  } | null>(null);

  // Close enlarged image modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEnlargedImage(null);
      }
    };
    if (enlargedImage) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enlargedImage]);

  const getWhatsAppLink = (customText?: string) => {
    const rawNumber = landingPage.whatsappNumber || profile.phone || '';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanNumber.startsWith('6') ? cleanNumber : `60${cleanNumber.replace(/^0+/, '')}`;
    const text = encodeURIComponent(
      customText || landingPage.whatsappMessage || `Salam ${profile.fullName}, saya ingin mendapatkan sebut harga pelan Takaful segera.`
    );
    return `https://wa.me/${phoneWithCode}?text=${text}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: landingPage.title,
        text: landingPage.bio,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Pautan disalin!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Compact Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center font-bold text-xs ${theme.lightBg} ${theme.primaryText}`}>
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-slate-900 leading-none">{profile.fullName}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Perunding Takaful Sah</span>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            title="Kongsi"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Streamlined Container */}
      <main className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Headline & Concise Bio */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {landingPage.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium leading-relaxed">
            {landingPage.bio || 'Penyelesaian perlindungan pendapatan, hibah, kad perubatan dan simpanan patuh syariah.'}
          </p>
        </div>

        {/* Floating Quick Action Sticky WhatsApp at Top */}
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noreferrer"
          className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${theme.primaryBg} ${theme.primaryHover} active:scale-[0.99]`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Sebut Harga Percuma Pantas (WhatsApp)</span>
        </a>

        {/* Takaful Plans List (Direct Link-in-Bio Style Cards) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Pilihan Pelan Takaful</span>
            <span>{activeProducts.length} Pelan</span>
          </div>

          {activeProducts.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
              <p className="text-xs text-slate-500">Tiada pelan khusus dipaparkan. Sila hubungi perunding untuk sebut harga tersuai.</p>
            </div>
          ) : (
            activeProducts.map((product) => {
              const isExpanded = Boolean(expandedProducts[product.id]);
              const hasBenefits = Boolean(product.benefits && product.benefits.trim());
              const isDescriptionLong = (product.description || '').length > 80;
              const canExpand = isDescriptionLong || hasBenefits;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm hover:border-slate-300 transition"
                >
                  <div className="flex items-start gap-3">
                    {/* Clickable Image Thumbnail to Enlarge */}
                    {product.imageUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEnlargedImage({
                            url: product.imageUrl!,
                            title: product.title,
                            category: product.category,
                          });
                        }}
                        className="relative group w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        title="Tekan untuk besarkan imej poster"
                        aria-label="Tekan untuk besarkan imej poster"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <ZoomIn className="w-4 h-4" />
                        </div>
                      </button>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme.badgeBg} ${theme.badgeText}`}>
                          {product.category || 'Takaful'}
                        </span>
                        {product.priceOrTarget && (
                          <span className="text-xs font-bold text-slate-900">{product.priceOrTarget}</span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mt-1">{product.title}</h3>

                      {/* Description with Expand / Collapse */}
                      <p className={`text-xs text-slate-600 mt-1 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {product.description}
                      </p>

                      {/* Benefits shown when expanded */}
                      {hasBenefits && isExpanded && (
                        <div className="mt-2.5 bg-amber-50/70 border border-amber-200/60 rounded-lg p-2.5 text-[11px] text-amber-950 animate-fadeIn">
                          <strong className="block mb-0.5 text-amber-900 flex items-center gap-1">
                            <Target className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <span>Manfaat Utama Pelan:</span>
                          </strong>
                          <span className="leading-relaxed whitespace-pre-line">{product.benefits}</span>
                        </div>
                      )}

                      {/* Expand / Collapse Button */}
                      {canExpand && (
                        <button
                          type="button"
                          onClick={() => toggleProductExpand(product.id)}
                          className={`text-[11px] font-bold inline-flex items-center gap-1 mt-1.5 ${theme.primaryText} hover:underline cursor-pointer`}
                        >
                          <span>{isExpanded ? 'Baca kurang' : 'Baca lagi'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Direct Action Link */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Konsultasi sebut harga:</span>
                    <a
                      href={product.actionUrl?.startsWith('http') ? product.actionUrl : getWhatsAppLink(`Salam ${profile.fullName}, saya ingin sebut harga bagi pelan: ${product.title}`)}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-1 text-xs font-bold ${theme.primaryText} hover:underline`}
                    >
                      <span>{product.actionText || 'Dapatkan Sebut Harga'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Contact Request Form (when enabled) */}
        {landingPage.contactForm?.enabled && (
          <div className="pt-2">
            <ContactWhatsAppForm
              landingPage={landingPage}
              profile={profile}
              isPreview={isPreview}
            />
          </div>
        )}

        {/* Compact Notice */}
        {landingPage.customNotice && (
          <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-600 text-center font-medium">
            {landingPage.customNotice}
          </div>
        )}

        {/* Micro Footer */}
        <div className="text-center pt-4 text-[11px] text-slate-400">
          <p>Laman Rasmi Perunding Takaful {profile.fullName}</p>
          <p>© {new Date().getFullYear()} TAKAFUL Landing Page Builder</p>
        </div>
      </main>

      {/* Floating Bottom Sticky Bar for Mobile Conversion */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur border-t border-slate-200 z-40 max-w-md mx-auto">
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noreferrer"
          className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 ${theme.primaryBg} ${theme.primaryHover}`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp Perunding ({profile.fullName.split(' ')[0]})</span>
        </a>
      </div>

      {/* Enlarged Image Lightbox Modal */}
      {enlargedImage && (
        <div
          onClick={() => setEnlargedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn cursor-pointer"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full max-h-[90vh] bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col cursor-default"
          >
            {/* Modal Header */}
            <div className="px-4 py-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3 text-white">
              <div className="min-w-0">
                {enlargedImage.category && (
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                    {enlargedImage.category}
                  </span>
                )}
                <h4 className="font-bold text-xs sm:text-sm truncate">{enlargedImage.title}</h4>
              </div>

              <button
                type="button"
                onClick={() => setEnlargedImage(null)}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex-shrink-0"
                title="Tutup (Esc)"
                aria-label="Tutup paparan imej"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with object-contain to preserve original ratio and clarity */}
            <div className="p-3 sm:p-5 bg-slate-950/70 flex-1 flex items-center justify-center overflow-hidden min-h-[260px] max-h-[75vh]">
              <img
                src={enlargedImage.url}
                alt={enlargedImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Modal Footer Note */}
            <div className="px-4 py-2 bg-slate-900 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
              Tekan butang tutup atau klik luar untuk keluar (Esc)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
