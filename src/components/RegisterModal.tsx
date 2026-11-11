import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Briefcase,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Eye,
  Send,
  Sparkles,
  Check
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin,
}) => {
  const { registerBuyer } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    agentId: '',
    country: 'Malaysia',
    state: 'Selangor',
    address: '',
    city: '',
    postalCode: '',
    occupation: 'Perunding Takaful',
    industry: 'Takaful & Perancangan Kewangan',
    dob: '',
    password: '',
    confirmPassword: '',
  });

  // Receipt upload state
  const [receiptFile, setReceiptFile] = useState<{
    dataUrl: string;
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const [receiptNote, setReceiptNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Saiz fail melebihi had 5MB. Sila pilih fail yang lebih kecil.');
      return;
    }

    // Supported formats: JPG, PNG, PDF
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Format fail tidak disokong. Sila muat naik fail format JPG, PNG atau PDF.');
      return;
    }

    setError(null);

    // If image, compress slightly via canvas to ensure safe Firestore document sizing
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setReceiptFile({
              dataUrl: compressed,
              name: file.name,
              size: file.size,
              type: file.type,
            });
          }
        };
        img.src = loadEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // PDF or non-image
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setReceiptFile({
          dataUrl: loadEvent.target?.result as string,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation 1: Personal Info
    if (!formData.fullName.trim()) return setError('Sila masukkan nama penuh.');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      return setError('Sila masukkan alamat emel yang sah.');
    }
    if (!formData.phone.trim()) return setError('Sila masukkan nombor WhatsApp / telefon.');

    // Validation 2: Address
    if (!formData.address.trim()) return setError('Sila masukkan alamat lengkap surat-menyurat.');
    if (!formData.city.trim()) return setError('Sila masukkan bandar.');
    if (!formData.postalCode.trim()) return setError('Sila masukkan poskod.');

    // Validation 3: Occupation
    if (!formData.occupation.trim()) return setError('Sila masukkan pekerjaan.');

    // Validation 4: Password
    if (!formData.password || formData.password.length < 6) {
      return setError('Kata laluan sekurang-kurangnya 6 aksara.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Kata laluan dan pengesahan kata laluan tidak sepadan.');
    }

    // Validation 5: Receipt
    if (!receiptFile) {
      return setError('Sila muat naik resit atau slip pembayaran OnPay anda (wajib).');
    }

    setSubmitting(true);
    try {
      const res = await registerBuyer({
        ...formData,
        receiptUrl: receiptFile.dataUrl,
        receiptNote: receiptNote.trim(),
        paymentMethod: 'OnPay / FPX',
      });

      // Show friendly confirmation screen inside modal
      setSubmittedSuccess(res.orderId);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Emel ini telah didaftarkan. Sila log masuk atau gunakan emel lain.');
      } else {
        setError(err.message || 'Pendaftaran gagal. Sila cuba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    const ordId = submittedSuccess || '';
    setSubmittedSuccess(null);
    onClose();
    onSuccess(ordId);
  };

  const states = [
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-400/30">
              Borang Pendaftaran Ejen & Langganan
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black">Bina Landing Page Takaful Anda</h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-xl">
            Lengkapkan profil perunding dan muat naik bukti bayaran OnPay (RM150) untuk semakan dan kelulusan akaun.
          </p>

          {/* Pricing Highlight Card */}
          <div className="mt-5 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold block">
                Pakej Langganan Tahunan
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-white">RM150</span>
                <span className="text-xs text-emerald-200">/ setahun</span>
              </div>
              <span className="text-xs text-white/80 flex items-center gap-1 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Tempoh akses penuh 365 hari sebaik sahaja admin mengesahkan bayaran anda
              </span>
            </div>

            <div className="text-xs text-emerald-100 sm:text-right space-y-1">
              <div className="flex items-center sm:justify-end gap-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>3 Templat Reka Bentuk Moden</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pautan Slug Unik (/p/nama-anda)</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Butang WhatsApp Sebut Harga Terus</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode: Success Confirmation */}
        {submittedSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Pendaftaran Berjaya Diterima
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Terima Kasih, {formData.fullName}!
              </h3>
              <p className="text-xs font-mono bg-slate-100 text-slate-700 py-1.5 px-4 rounded-xl inline-block">
                No. Pesanan: <strong>{submittedSuccess}</strong>
              </p>
            </div>

            <div className="max-w-lg mx-auto p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed text-left space-y-2">
              <p className="font-bold flex items-center gap-2 text-amber-950">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Pemberitahuan Status Akaun:</span>
              </p>
              <p>
                Terima kasih! Pendaftaran anda telah berjaya dihantar. Bukti pembayaran anda sedang menunggu pengesahan pihak admin. Akaun anda akan diaktifkan selepas pembayaran disahkan.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={handleSuccessClose}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-lg cursor-pointer"
              >
                Faham & Kembali ke Halaman Utama
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Maklumat Asas & Hubungan */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>1. Maklumat Peribadi & Hubungan</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Penuh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Contoh: Muhammad Ali bin Ahmad"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Emel <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nama@contoh.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombor Telefon / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Contoh: 0123456789"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Nombor ini dijadikan nombor WhatsApp default butang landing page
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ID Ejen / Nama Introducer (Jika ada)
                  </label>
                  <input
                    type="text"
                    name="agentId"
                    value={formData.agentId}
                    onChange={handleChange}
                    placeholder="Contoh: INTRO-8821 atau Nama Ejen Pengenal"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Alamat & Lokasi */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>2. Alamat & Lokasi</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Surat-Menyurat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="No. Rumah, Jalan, Kawasan Perumahan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bandar <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Contoh: Shah Alam"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Poskod <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="Contoh: 40000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Negeri <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    >
                      {states.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Pekerjaan & Industri */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>3. Pekerjaan & Industri</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pekerjaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    required
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="Contoh: Perunding Takaful / Wealth Planner"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Industri
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Contoh: Takaful Keluarga, Takaful Am"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tarikh Lahir (Pilihan)
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Keselamatan Kata Laluan */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>4. Keselamatan Kata Laluan</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Laluan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 aksara"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sahkan Kata Laluan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulang kata laluan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Muat Naik Resit Pembayaran (RM150) */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>5. Muat Naik Slip Pembayaran (RM150)</span>
                <span className="text-rose-500">*</span>
              </h3>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Muat naik slip pembayaran yang anda terima daripada transaksi OnPay / perbankan dalam talian. Saiz fail maksimum 5MB (JPG, PNG, PDF).
              </p>

              {/* Upload Drop Area */}
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                />

                {!receiptFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-400/80 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Klik di sini untuk memilih fail slip bayaran
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Menyokong JPG, PNG atau PDF sehingga 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Uploaded File Preview */
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {receiptFile.type.startsWith('image/') ? (
                        <img
                          src={receiptFile.dataUrl}
                          alt="Slip Pembayaran"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-300 shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-7 h-7" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {receiptFile.name}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Fail sedia dihantar ({(receiptFile.size / 1024).toFixed(0)} KB)</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Tukar Fail</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveReceipt}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Padam</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Reference Note / OnPay Transaction ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Rujukan Transaksi OnPay / FPX (Pilihan)
                  </label>
                  <input
                    type="text"
                    value={receiptNote}
                    onChange={(e) => setReceiptNote(e.target.value)}
                    placeholder="Contoh: No. Rujukan OnPay, kod transaksi FPX atau nama pemegang akaun"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Notice */}
            <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 border border-slate-200">
              <p className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  Dengan menghantar pendaftaran ini, anda memahami bahawa akaun ejen dan landing page peribadi akan berada dalam status <strong>Menunggu Pengesahan</strong> sehingga pembayaran disahkan oleh pihak pentadbir.
                </span>
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl font-black text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menghantar Pendaftaran & Bukti Bayaran...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Hantar Pendaftaran untuk Pengesahan</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center text-xs text-slate-500 pt-2">
              Sudah mempunyai akaun ejen?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Log masuk di sini
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
