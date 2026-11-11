import React, { useState } from 'react';
import { UserProfile, LandingPage, Product } from '../../types';
import { THEMES } from '../../utils/theme';
import {
  MessageCircle,
  Share2,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Heart,
  Globe,
  Sparkles,
  Shield,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { ContactWhatsAppForm } from '../ContactWhatsAppForm';

interface Props {
  profile: UserProfile;
  landingPage: LandingPage;
  products: Product[];
  isPreview?: boolean;
}

export const Template1Professional: React.FC<Props> = ({
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

  const getWhatsAppLink = (customText?: string) => {
    const rawNumber = landingPage.whatsappNumber || profile.phone || '';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanNumber.startsWith('6') ? cleanNumber : `60${cleanNumber.replace(/^0+/, '')}`;
    const text = encodeURIComponent(customText || landingPage.whatsappMessage || `Salam ${profile.fullName}, saya ingin mendapatkan sebut harga dan konsultasi pelan Takaful.`);
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
      alert('Pautan berjaya disalin ke papan keratan!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Top Header Banner */}
      <div className={`bg-gradient-to-r ${theme.gradient} text-white pt-10 sm:pt-14 pb-20 sm:pb-28 px-4 sm:px-6 relative z-0 shadow-md`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center text-xs sm:text-sm text-white/80 pb-5 sm:pb-6 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="font-semibold tracking-wide uppercase truncate">Perunding Takaful Berdaftar</span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full transition text-white font-medium flex-shrink-0 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Kongsi Halaman</span>
          </button>
        </div>
      </div>

      {/* Profile Card Container: Guaranteed z-10 and adjusted top negative offset to prevent any header overlap */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-16">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme.lightBg} ${theme.primaryText} text-3xl font-bold`}>
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow" title="Ejen Disahkan">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
                  {profile.fullName}
                </h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${theme.badgeBg} ${theme.badgeText}`}>
                  Perunding Takaful Sah
                </span>
              </div>

              <p className="text-slate-500 text-xs sm:text-sm font-medium mb-3">
                {profile.occupation || 'Perunding Takaful Bertauliah'} {profile.industry ? `• ${profile.industry}` : ''}
                {profile.agentId ? ` • ID: ${profile.agentId}` : ''}
              </p>

              <p className="text-slate-700 text-base leading-relaxed mb-6 max-w-2xl">
                {landingPage.bio || 'Selamat datang ke laman rasmi perundingan Takaful saya. Dapatkan pelan perlindungan pendapatan, hibah, kad perubatan dan simpanan terbaik untuk masa depan anda dan keluarga tercinta.'}
              </p>

              {/* Direct Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition transform active:scale-95 ${theme.primaryBg} ${theme.primaryHover}`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Konsultasi & Sebut Harga WhatsApp</span>
                </a>

                {landingPage.whatsappNumber && (
                  <a
                    href={`tel:${landingPage.whatsappNumber}`}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Panggilan</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Social Links & Info Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
            <div className="flex flex-wrap items-center gap-4">
              {profile.state && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {profile.city ? `${profile.city}, ` : ''}{profile.state}
                </span>
              )}
              {profile.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {profile.email}
                </span>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {landingPage.socialLinks?.facebook && (
                <a
                  href={landingPage.socialLinks.facebook.startsWith('http') ? landingPage.socialLinks.facebook : `https://${landingPage.socialLinks.facebook}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition"
                  title="Facebook"
                >
                  <span className="font-bold text-xs">FB</span>
                </a>
              )}
              {landingPage.socialLinks?.instagram && (
                <a
                  href={landingPage.socialLinks.instagram.startsWith('http') ? landingPage.socialLinks.instagram : `https://${landingPage.socialLinks.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-pink-600 flex items-center justify-center transition"
                  title="Instagram"
                >
                  <span className="font-bold text-xs">IG</span>
                </a>
              )}
              {landingPage.socialLinks?.tiktok && (
                <a
                  href={landingPage.socialLinks.tiktok.startsWith('http') ? landingPage.socialLinks.tiktok : `https://${landingPage.socialLinks.tiktok}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-black flex items-center justify-center transition"
                  title="TikTok"
                >
                  <span className="font-bold text-xs">TT</span>
                </a>
              )}
              {landingPage.socialLinks?.website && (
                <a
                  href={landingPage.socialLinks.website.startsWith('http') ? landingPage.socialLinks.website : `https://${landingPage.socialLinks.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                  title="Laman Web"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Custom Notice */}
        {landingPage.customNotice && (
          <div className={`mt-6 p-4 rounded-xl border ${theme.border} ${theme.lightBg} text-sm ${theme.primaryText} flex items-center gap-3`}>
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{landingPage.customNotice}</p>
          </div>
        )}

        {/* Section: Takaful Packages & Protection Plans */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Pilihan Pelan & Skim Perlindungan Takaful</h2>
              <p className="text-sm text-slate-500">Ketahui pelan perlindungan komprehensif mengikut keperluan kewangan dan keluarga anda</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
              {activeProducts.length} Pelan Ditawarkan
            </span>
          </div>

          {activeProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-700">Tiada pelan takaful dipaparkan buat masa ini</h3>
              <p className="text-sm text-slate-500 mt-1">Sila hubungi ejen secara terus melalui WhatsApp untuk sebut harga pelan yang bersesuaian.</p>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                className={`mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium ${theme.primaryBg} ${theme.primaryHover}`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konsultasi Percuma Sekarang</span>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeProducts.map((product) => {
                const isExpanded = Boolean(expandedProducts[product.id]);
                const hasBenefits = Boolean(product.benefits && product.benefits.trim());
                const isDescriptionLong = (product.description || '').length > 110;
                const canExpand = isDescriptionLong || hasBenefits;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-slate-200 flex flex-col justify-between"
                  >
                    {product.imageUrl && (
                      <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                        {product.category && (
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-xs font-semibold text-slate-800 shadow">
                            {product.category}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {!product.imageUrl && product.category && (
                          <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 ${theme.badgeBg} ${theme.badgeText}`}>
                            {product.category}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{product.title}</h3>

                        {/* Description with Expand / Collapse */}
                        <p className={`text-sm text-slate-600 leading-relaxed mb-3 ${isExpanded ? '' : 'line-clamp-3'}`}>
                          {product.description}
                        </p>

                        {/* Benefits with Expand / Collapse */}
                        {hasBenefits && isExpanded && (
                          <div className="mb-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 animate-fadeIn">
                            <span className="font-bold text-slate-900 block mb-1">Manfaat Utama Pelan:</span>
                            <p className="leading-relaxed whitespace-pre-line">{product.benefits}</p>
                          </div>
                        )}

                        {/* Expand / Collapse Button: Shown only if text can be expanded */}
                        {canExpand && (
                          <button
                            type="button"
                            onClick={() => toggleProductExpand(product.id)}
                            className={`text-xs font-bold inline-flex items-center gap-1 mb-4 ${theme.primaryText} hover:underline cursor-pointer`}
                          >
                            <span>{isExpanded ? 'Baca kurang' : 'Baca lagi'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        {product.priceOrTarget ? (
                          <div>
                            <span className="text-xs text-slate-400 block">Anggaran Caruman</span>
                            <span className="text-base font-bold text-slate-900">{product.priceOrTarget}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Pelan Patuh Syariah
                          </span>
                        )}
                      </div>

                      <a
                        href={product.actionUrl?.startsWith('http') ? product.actionUrl : getWhatsAppLink(`Salam ${profile.fullName}, saya berminat untuk mendapatkan sebut harga bagi pelan: ${product.title}`)}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white shadow transition ${theme.primaryBg} ${theme.primaryHover}`}
                      >
                        <span>{product.actionText || 'Dapatkan Sebut Harga'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>

        {/* Contact Request Form (when enabled) */}
        {landingPage.contactForm?.enabled && (
          <div className="mt-12 sm:mt-16">
            <ContactWhatsAppForm
              landingPage={landingPage}
              profile={profile}
              isPreview={isPreview}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-slate-400 border-t border-slate-200 pt-8">
          <p className="font-semibold text-slate-600 mb-1">Portal Perunding Takaful Berdaftar</p>
          <p>© {new Date().getFullYear()} Dikuasakan oleh TAKAFUL Landing Page Builder. Hak cipta terpelihara.</p>
        </div>
      </div>
    </div>
  );
};
