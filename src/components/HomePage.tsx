import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle,
  CreditCard,
  Layout,
  MessageCircle,
  Globe,
  ShieldCheck,
  ArrowRight,
  Heart,
  Users,
  Smartphone,
  Eye,
  Clock,
  ChevronRight
} from 'lucide-react';

interface Props {
  onOpenPurchase: () => void;
  onOpenLogin: () => void;
  onPreviewTemplate: (templateId: 'template1' | 'template2' | 'template3') => void;
}

export const HomePage: React.FC<Props> = ({
  onOpenPurchase,
  onOpenLogin,
  onPreviewTemplate,
}) => {
  const [selectedDemoTab, setSelectedDemoTab] = useState<'template1' | 'template2' | 'template3'>('template1');

  return (
    <div className="bg-slate-50 text-slate-800 w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-white pt-16 pb-24 sm:pt-24 sm:pb-32 px-4 sm:px-6 w-full max-w-full">
        {/* Glow decorations */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 w-full min-w-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6 max-w-full">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="truncate">Sistem Landing Page Perunding Takaful Malaysia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight break-words">
            Bina Landing Page Takaful Peribadi Anda Dalam <span className="text-emerald-400">Beberapa Minit</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Dapatkan laman rasmi dengan pautan slug unik, butang WhatsApp sebut harga terus, dan 3 templat eksklusif berimpak tinggi untuk mempromosikan kad perubatan, hibah serta pelan perlindungan keluarga anda.
          </p>

          {/* Pricing Banner Pill */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm max-w-full">
            <span className="text-emerald-300 font-bold">Langganan Tahunan:</span>
            <span className="text-xl font-black text-white">RM150</span>
            <span className="text-slate-300 text-center">• Akses Penuh 365 Hari</span>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenPurchase}
              className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-xl hover:shadow-emerald-500/25 transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Daftar Ejen (RM150)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#templat"
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur transition flex items-center gap-2"
            >
              <Layout className="w-4 h-4 text-emerald-300" />
              <span>Lihat 3 Templat Reka Bentuk</span>
            </a>
          </div>

          {/* Key Trust Signals */}
          <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs text-slate-300 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Pautan Slug /p/nama-anda</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Butang WhatsApp Sebut Harga</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>10 Kategori Pelan Takaful</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>3 Templat Reka Bentuk</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section: 4-Step Process */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Aliran Mudah & Telus
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Bagaimana Sistem Ini Berfungsi?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Dari pendaftaran sehingga landing page anda diterbitkan secara langsung ke orang awam.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-4">
              1
            </span>
            <h3 className="font-bold text-slate-900 text-base mb-1">Daftar Maklumat Perunding</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Isi borang pendaftaran lengkap termasuk maklumat ejen, agensi, hubungan dan kata laluan anda.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-4">
              2
            </span>
            <h3 className="font-bold text-slate-900 text-base mb-1">Bayaran OnPay (RM150) & Slip</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lengkapkan langganan tahunan RM150 melalui borang rasmi OnPay dan muat naik slip pembayaran anda.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-4">
              3
            </span>
            <h3 className="font-bold text-slate-900 text-base mb-1">Pengesahan Admin</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Admin mengesahkan bayaran. Langganan 365 hari dan akses penerbitan laman diaktifkan secara rasmi.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-4">
              4
            </span>
            <h3 className="font-bold text-slate-900 text-base mb-1">Pratonton & Terbit Laman</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pilih templat, susun produk takaful (Kad Perubatan, Hibah), semak pratonton dan kongsikan pautan anda.
            </p>
          </div>
        </div>
      </section>

      {/* Section: 3 Distinct Templates Showcase */}
      <section id="templat" className="py-20 bg-slate-100 border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Kepelbagaian Reka Bentuk
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              3 Templat Eksklusif Berbeza Susun Atur
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Bukan sekadar perubahan warna. Setiap templat direka khas untuk keperluan perundingan Takaful profesional.
            </p>
          </div>

          {/* Template Selector Tabs */}
          <div className="flex justify-center mb-10 w-full px-2">
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-center gap-1 max-w-xl w-full sm:w-auto">
              <button
                onClick={() => setSelectedDemoTab('template1')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  selectedDemoTab === 'template1'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Profil Profesional
              </button>
              <button
                onClick={() => setSelectedDemoTab('template2')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  selectedDemoTab === 'template2'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Fokus Produk & Pelan
              </button>
              <button
                onClick={() => setSelectedDemoTab('template3')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  selectedDemoTab === 'template3'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Ringkas & Terus (Mobile)
              </button>
            </div>
          </div>

          {/* Template Description & Visual Preview Box */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-w-5xl mx-auto">
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                  {selectedDemoTab === 'template1'
                    ? 'Fokus Autoriti & Kredibiliti Perunding'
                    : selectedDemoTab === 'template2'
                    ? 'Fokus Manfaat & Katalog Pelan Takaful'
                    : 'Fokus Penukaran Pantas & Mudah Alih'}
                </span>

                <h3 className="text-2xl font-black text-slate-900 mb-3">
                  {selectedDemoTab === 'template1' && 'Templat 1: Profil Profesional'}
                  {selectedDemoTab === 'template2' && 'Templat 2: Fokus Produk & Pelan'}
                  {selectedDemoTab === 'template3' && 'Templat 3: Ringkas dan Terus'}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {selectedDemoTab === 'template1' &&
                    'Potret perunding dan bio dipaparkan di bahagian atas dengan lencana sah, diikuti butang WhatsApp rasmi dan katalog pelan takaful bersusun kemas di bawah.'}
                  {selectedDemoTab === 'template2' &&
                    'Katalog pelan takaful utama seperti Kad Perubatan dan Hibah diberi tumpuan utama dengan butang sebut harga segera. Profil perunding dipaparkan sebagai penasihat bertauliah di bawah.'}
                  {selectedDemoTab === 'template3' &&
                    'Susun atur ultra padat (link-in-bio style) yang dioptimumkan khas untuk pengguna telefon pintar. Tajuk jelas, senarai pelan takaful ringkas, dan butang WhatsApp terapung.'}
                </p>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>5 Pilihan Warna: Hijau, Merah, Biru, Kuning, Oren</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Sedia dengan 10 Kategori Pelan Takaful Standard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Pautan Pratonton Khusus Sebelum Diterbitkan</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => onPreviewTemplate(selectedDemoTab)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition inline-flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Buka Pratonton Penuh Templat Ini</span>
                </button>
              </div>
            </div>

            {/* Template Miniature Preview Visual */}
            <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-200">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 p-5 space-y-4">
                {selectedDemoTab === 'template1' && (
                  <>
                    <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 rounded-xl text-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white mx-auto mb-2 flex items-center justify-center font-bold text-base">
                        AF
                      </div>
                      <h4 className="font-bold text-sm">Ahmad Fikri bin Rosli</h4>
                      <p className="text-[11px] text-emerald-200">Perunding Takaful Sah • Agensi Utama</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-600 text-white text-center font-bold text-xs">
                      Konsultasi & Sebut Harga WhatsApp
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 rounded-lg border border-slate-200 bg-slate-50">
                        <strong className="block text-slate-800">Kad Perubatan VIP</strong>
                        <span className="text-slate-500">RM85/bulan</span>
                      </div>
                      <div className="p-2 rounded-lg border border-slate-200 bg-slate-50">
                        <strong className="block text-slate-800">Hibah Takaful Waris</strong>
                        <span className="text-slate-500">Pampasan RM500k</span>
                      </div>
                    </div>
                  </>
                )}

                {selectedDemoTab === 'template2' && (
                  <>
                    <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-emerald-300">Pelan Utama</span>
                      <h4 className="font-black text-sm mt-1">Kad Perubatan VIP Had RM1.5 Juta</h4>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-3 bg-white">
                      <h5 className="font-bold text-xs text-slate-900">Perlindungan Hospital Swasta Tanpa Co-takaful</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">Bilik single percuma, had tahunan besar, jaminan kemasukan wad 24/7.</p>
                      <button className="mt-2 w-full py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px]">
                        Dapatkan Sebut Harga (RM85/bln)
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-100 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-300 flex-shrink-0" />
                      <div className="text-[10px]">
                        <span className="font-bold text-slate-900 block">Perunding Takaful Sah Anda</span>
                        <span className="text-slate-500">Siti Maryam • 012-3456789</span>
                      </div>
                    </div>
                  </>
                )}

                {selectedDemoTab === 'template3' && (
                  <>
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        EA
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block leading-tight">Perunding Amirul</span>
                        <span className="text-[10px] text-slate-400">Pautan Rasmi Pelan Takaful</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-600 text-white text-center font-bold text-xs">
                      Sebut Harga Percuma Pantas (WhatsApp)
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2 rounded-lg border border-slate-200 bg-white flex justify-between items-center">
                        <span className="font-semibold text-slate-800">1. Hibah Takaful RM350,000</span>
                        <span className="text-emerald-700 font-bold">RM65/bln →</span>
                      </div>
                      <div className="p-2 rounded-lg border border-slate-200 bg-white flex justify-between items-center">
                        <span className="font-semibold text-slate-800">2. Kad Perubatan Unlimited</span>
                        <span className="text-emerald-700 font-bold">RM90/bln →</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Pricing & Access Details */}
      <section id="pelan" className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/30">
                Pakej Langganan Perunding
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">Pelan Tahunan Penuh</h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                Akses lengkap tanpa had untuk menerbitkan landing page, mengurus katalog produk takaful peribadi, dan mengumpul prospek selama 365 hari.
              </p>

              <div className="mt-6 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>3 Templat Eksklusif Berbeza Susun Atur</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Sedia dengan 10 Kategori Standard Produk Takaful</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>5 Pilihan Tema Warna (Hijau, Merah, Biru, Kuning, Oren)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Pautan Slug Unik (/p/nama-anda) Tanpa Had</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Pautan Pratonton Khas Sebelum Terbit Rasmi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Kemas Kini Maklumat & Pelan Takaful Tanpa Had</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 text-center">
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block mb-1">
                Yuran Langganan Setahun
              </span>
              <div className="flex items-baseline justify-center gap-2 my-2">
                <span className="text-4xl sm:text-5xl font-black text-white">RM150</span>
                <span className="text-xs text-slate-300">/ 365 hari</span>
              </div>
              <p className="text-[11px] text-slate-300 mb-6">
                Pengesahan pantas oleh pentadbir melalui pindahan bank rasmi.
              </p>

              <button
                onClick={onOpenPurchase}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition active:scale-95 cursor-pointer"
              >
                Daftar Ejen (RM150)
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
