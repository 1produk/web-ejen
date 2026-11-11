import React, { useState } from 'react';
import { UserProfile, LandingPage, Product } from '../../types';
import { THEMES } from '../../utils/theme';
import {
  MessageCircle,
  Share2,
  Heart,
  CheckCircle,
  ExternalLink,
  Target,
  UserCheck,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
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

export const Template2ProductFocus: React.FC<Props> = ({
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
    const text = encodeURIComponent(
      customText || landingPage.whatsappMessage || `Salam ${profile.fullName}, saya ingin mendapatkan konsultasi dan sebut harga pelan Takaful.`
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
      alert('Pautan berjaya disalin ke papan keratan!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-16">
      {/* Hero Section Focusing on Campaign & Mission */}
      <section className={`bg-gradient-to-b ${theme.gradient} text-white pt-16 pb-20 px-4 sm:px-6 relative overflow-hidden`}>
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 -left-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Pelan Takaful Patuh Syariah & Berlesen
            </span>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full transition text-white text-xs font-medium"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kongsi Laman</span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 max-w-3xl leading-tight">
            {landingPage.title}
          </h1>

          <p className="text-white/90 text-base sm:text-lg max-w-2xl font-light mb-8 leading-relaxed">
            {landingPage.bio || 'Menyediakan penyelesaian perlindungan kewangan, perubatan, hibah dan simpanan terbaik untuk kesejahteraan masa depan keluarga anda.'}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                document.getElementById('senarai-pelan-takaful')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-50 shadow-lg transition inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Lihat Senarai Pelan Takaful</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl font-semibold bg-white/20 hover:bg-white/30 text-white backdrop-blur transition inline-flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5 text-emerald-300" />
              <span>Tanya Perunding Takaful</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Campaign Products Catalog First */}
      <main id="senarai-pelan-takaful" className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="space-y-8">
          {activeProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-md">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-800">Senarai Pelan Sedang Dikemas Kini</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                Perunding takaful kami sedang mengemaskini maklumat pelan terkini. Anda boleh menghubungi perunding secara terus untuk sebut harga segera.
              </p>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                className={`mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow ${theme.primaryBg} ${theme.primaryHover}`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Hubungi Perunding Takaful</span>
              </a>
            </div>
          ) : (
            activeProducts.map((product, idx) => {
              const isExpanded = Boolean(expandedProducts[product.id]);
              const hasBenefits = Boolean(product.benefits && product.benefits.trim());
              const isDescriptionLong = (product.description || '').length > 120;
              const canExpand = isDescriptionLong || hasBenefits;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 transition hover:shadow-xl grid grid-cols-1 md:grid-cols-12"
                >
                  {/* Visual / Image Side with Exact 1:1 Aspect Ratio & object-contain to preserve infographics */}
                  <div className="md:col-span-5 relative bg-slate-100 flex items-center justify-center aspect-square w-full overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-contain p-2 sm:p-3"
                      />
                    ) : (
                      <div className={`w-full h-full flex flex-col items-center justify-center p-8 ${theme.lightBg} ${theme.primaryText}`}>
                        <Heart className="w-16 h-16 opacity-30 mb-2" />
                        <span className="font-bold text-sm tracking-wider uppercase opacity-60">Pelan Takaful #{idx + 1}</span>
                      </div>
                    )}

                    {product.category && (
                      <span className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {/* Content Details Side */}
                  <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
                          Patuh Syariah
                        </span>
                        {product.priceOrTarget && (
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <Target className="w-3.5 h-3.5 text-slate-400" />
                            Caruman: <strong className="text-slate-800">{product.priceOrTarget}</strong>
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3 leading-snug">
                        {product.title}
                      </h2>

                      {/* Description with Expand / Collapse */}
                      <p className={`text-slate-600 text-sm leading-relaxed mb-3 ${isExpanded ? '' : 'line-clamp-3'}`}>
                        {product.description}
                      </p>

                      {/* Benefits with Expand / Collapse */}
                      {hasBenefits && isExpanded && (
                        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5 mb-4 text-xs text-amber-950 animate-fadeIn">
                          <strong className="block mb-1 text-amber-900">Manfaat Utama Pelan:</strong>
                          <span className="leading-relaxed whitespace-pre-line">{product.benefits}</span>
                        </div>
                      )}

                      {/* Expand / Collapse Button */}
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

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                    <a
                      href={product.actionUrl?.startsWith('http') ? product.actionUrl : getWhatsAppLink(`Salam ${profile.fullName}, saya ingin sebut harga bagi pelan: ${product.title}`)}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex-1 text-center py-3 px-5 rounded-xl text-white font-bold text-sm shadow transition ${theme.primaryBg} ${theme.primaryHover} inline-flex items-center justify-center gap-2`}
                    >
                      <span>{product.actionText || 'Dapatkan Sebut Harga'}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <a
                      href={getWhatsAppLink(`Salam ${profile.fullName}, saya ingin minta maklumat lanjut tentang pelan: ${product.title}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3 px-4 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm transition inline-flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Konsultasi Percuma</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
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

        {/* Dedicated Agent Introducer / Contact Section */}
        <section className="mt-12 sm:mt-16 bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-md bg-slate-100 border-2 border-slate-100">
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
              <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-lg shadow" title="Ejen Berdaftar">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Perunding Takaful Sah Anda</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-1">{profile.fullName}</h2>
              <p className="text-sm text-slate-500 font-medium mb-3">
                {profile.occupation || 'Perunding Takaful Bertauliah'} {profile.agentId ? `(ID: ${profile.agentId})` : ''}
              </p>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Sebarang pertanyaan sebut harga, perundingan manfaat perubatan & hibah, atau permohonan pelan perlindungan boleh diajukan terus kepada saya sebagai wakil berdaftar anda.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow ${theme.primaryBg} ${theme.primaryHover}`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Hubungi Perunding Takaful</span>
                </a>

                {landingPage.whatsappNumber && (
                  <a
                    href={`tel:${landingPage.whatsappNumber}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{landingPage.whatsappNumber}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-slate-400">
          <p className="font-semibold text-slate-600 mb-1">Portal Perunding Takaful Sah & Berdaftar</p>
          <p>© {new Date().getFullYear()} Dikuasakan oleh TAKAFUL Landing Page Builder.</p>
        </div>
      </main>
    </div>
  );
};
