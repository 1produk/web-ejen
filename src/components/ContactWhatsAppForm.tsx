import React, { useState } from 'react';
import { UserProfile, LandingPage } from '../types';
import { THEMES } from '../utils/theme';
import {
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Send,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface Props {
  landingPage: LandingPage;
  profile: UserProfile;
  className?: string;
  isPreview?: boolean;
}

const MALAYSIAN_STATES = [
  'Selangor',
  'WP Kuala Lumpur',
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Terengganu',
  'WP Labuan',
  'WP Putrajaya',
];

const DISCUSSION_OPTIONS = [
  'Bertemu muka',
  'WhatsApp',
  'Online (Zoom, panggilan video dan lain-lain)',
];

export const ContactWhatsAppForm: React.FC<Props> = ({
  landingPage,
  profile,
  className = '',
  isPreview = false,
}) => {
  const theme = THEMES[landingPage.colorTheme || 'green'];
  const config = landingPage.contactForm;

  // Form states
  const [nama, setNama] = useState('');
  const [phone, setPhone] = useState('');
  const [umur, setUmur] = useState('');
  const [email, setEmail] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [negeri, setNegeri] = useState('Selangor');
  const [pekerjaan, setPekerjaan] = useState('');
  const [caraBerbincang, setCaraBerbincang] = useState<string>('');
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Normalize agent WhatsApp number safely
  const normalizeAgentNumber = (num: string): string => {
    const clean = (num || '').replace(/[^0-9]/g, '');
    if (!clean) return '';
    if (clean.startsWith('60')) return clean;
    if (clean.startsWith('0')) return '60' + clean.replace(/^0+/, '');
    if (clean.startsWith('1')) return '60' + clean;
    return clean;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validation
    if (!nama.trim()) {
      setError('Sila masukkan nama penuh anda.');
      return;
    }

    const cleanClientPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanClientPhone || cleanClientPhone.length < 8) {
      setError('Sila masukkan nombor telefon yang sah.');
      return;
    }

    const ageNum = parseInt(umur, 10);
    if (!umur || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Sila masukkan umur yang sah.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Sila masukkan alamat e-mel yang sah.');
      return;
    }

    if (!lokasi.trim()) {
      setError('Sila masukkan lokasi anda (bandar atau kawasan).');
      return;
    }

    if (!negeri.trim()) {
      setError('Sila pilih negeri anda.');
      return;
    }

    if (!pekerjaan.trim()) {
      setError('Sila masukkan pekerjaan anda.');
      return;
    }

    if (!agreed) {
      setError('Sila tandakan persetujuan penggunaan maklumat sebelum menghantar.');
      return;
    }

    // 2. Validate agent WhatsApp number
    const rawAgentNumber = landingPage.whatsappNumber || profile.phone || '';
    const normalizedAgent = normalizeAgentNumber(rawAgentNumber);

    if (!normalizedAgent || normalizedAgent.length < 9) {
      setError(
        'Nombor WhatsApp perunding belum ditetapkan atau tidak sah. Sila hubungi ejen secara terus menggunakan maklumat hubungan yang tertera.'
      );
      return;
    }

    // 3. Compose WhatsApp message with complete customer data
    const messageLines = [
      `Assalamualaikum / Salam sejahtera ${profile.fullName},`,
      ``,
      `Saya berminat untuk mendapatkan rundingan & sebut harga pelan Takaful. Berikut adalah butiran saya:`,
      ``,
      `👤 *Nama:* ${nama.trim()}`,
      `📱 *No. Telefon:* ${phone.trim()}`,
      `🎂 *Umur:* ${ageNum} tahun`,
      `✉️ *E-mel:* ${email.trim()}`,
      `📍 *Lokasi:* ${lokasi.trim()}, ${negeri}`,
      `💼 *Pekerjaan:* ${pekerjaan.trim()}`,
      caraBerbincang ? `💬 *Saya bersedia berbincang secara:* ${caraBerbincang}` : null,
      ``,
      `Saya bersetuju maklumat ini digunakan untuk menghubungi saya berkenaan permintaan takaful.`,
      `Terima kasih.`,
    ].filter((line) => line !== null);

    const fullMessage = messageLines.join('\n');
    const encodedMessage = encodeURIComponent(fullMessage);
    const waUrl = `https://wa.me/${normalizedAgent}?text=${encodedMessage}`;

    // 4. Open WhatsApp
    setSentSuccess(true);
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      setSentSuccess(false);
    }, 6000);
  };

  const formTitle = config?.title || 'Borang Permintaan Dihubungi';
  const formSubtitle =
    config?.subtitle ||
    'Sila lengkapkan maklumat di bawah untuk mendapatkan konsultasi percuma dan cadangan pelan Takaful bersesuaian.';

  return (
    <div
      id="borang-permintaan"
      className={`w-full max-w-full rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme.gradient} text-white p-5 sm:p-7 relative`}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Permintaan Konsultasi Percuma</span>
          </span>
          {isPreview && (
            <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
              Pratonton
            </span>
          )}
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          {formTitle}
        </h3>
        <p className="text-xs sm:text-sm text-white/90 mt-1 leading-relaxed max-w-xl">
          {formSubtitle}
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {sentSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-bold">Mesej sedia dihantar!</strong>
              Pautan WhatsApp telah dibuka dengan semua butiran maklumat anda. Tekan butang hantar di WhatsApp untuk menyambung sembang.
            </div>
          </div>
        )}

        {/* 1 Column Layout on Mobile, 2 on Desktop for space optimization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Nama */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Penuh <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Muhammad Ali bin Ahmad"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[44px]"
              />
            </div>
          </div>

          {/* Nombor Telefon */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombor Telefon / WhatsApp <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 012-3456789"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[44px]"
              />
            </div>
          </div>

          {/* Umur */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Umur <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="number"
                required
                min={1}
                max={120}
                value={umur}
                onChange={(e) => setUmur(e.target.value)}
                placeholder="Contoh: 32"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[44px]"
              />
            </div>
          </div>

          {/* E-mel */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat E-mel <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@contoh.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[44px]"
              />
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lokasi (Bandar / Kawasan) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Contoh: Shah Alam / Petaling Jaya"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[44px]"
              />
            </div>
          </div>

          {/* Negeri */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Negeri <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={negeri}
              onChange={(e) => setNegeri(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white min-h-[44px]"
            >
              {MALAYSIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Pekerjaan */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pekerjaan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={pekerjaan}
                onChange={(e) => setPekerjaan(e.target.value)}
                placeholder="Contoh: Jurutera / Peniaga / Penjawat Awam"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Pilihan Cara Berbincang (Pilihan / Tidak Wajib) */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Saya bersedia berbincang secara: <span className="text-slate-400 font-normal">(Pilihan)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DISCUSSION_OPTIONS.map((opt) => {
              const isSelected = caraBerbincang === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCaraBerbincang(isSelected ? '' : opt)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer min-h-[44px] flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="leading-snug">{opt}</span>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ml-1.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Persetujuan (Wajib) */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition">
            <input
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer flex-shrink-0"
            />
            <span className="text-xs text-slate-700 leading-relaxed font-medium">
              Saya bersetuju maklumat ini digunakan untuk menghubungi saya berkenaan permintaan takaful.
            </span>
          </label>
        </div>

        {/* Butang Hantar */}
        <div className="pt-2">
          <button
            type="submit"
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] min-h-[48px] ${theme.primaryBg} ${theme.primaryHover}`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Hantar melalui WhatsApp</span>
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Maklumat anda dihantar terus ke aplikasi WhatsApp rasmi perunding Takaful.</span>
          </p>
        </div>
      </form>
    </div>
  );
};
