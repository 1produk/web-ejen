import React, { useState, useEffect } from 'react';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ExternalLink,
  ShieldAlert,
  FileText
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  orderId: string;
  userEmail: string;
  userName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentProofModal: React.FC<Props> = ({
  isOpen,
  orderId,
  userEmail,
  userName,
  onClose,
  onSuccess,
}) => {
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptNote, setReceiptNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load and trigger OnPay embed script when modal is opened
  useEffect(() => {
    if (!isOpen) return;

    const scriptId = 'onpay-embed-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (script) {
      script.remove();
    }

    script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://onpay.my/js/embed-order-form.h1df98ef612fd.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Hanya fail gambar (JPG, PNG, WebP) dibenarkan untuk bukti bayaran.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Saiz fail melebihi 8MB. Sila pilih fail yang lebih kecil.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const resultStr = event.target?.result as string;
      // Compress image client-side to ensure it stays well under Firestore document limits
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setReceiptImage(compressed);
        } else {
          setReceiptImage(resultStr);
        }
      };
      img.onerror = () => {
        setReceiptImage(resultStr);
      };
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptImage && !receiptNote.trim()) {
      setError('Sila muat naik bukti bayaran atau masukkan nombor rujukan transaksi bank.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const orderRef = doc(db, 'orders', orderId);

      await setDoc(
        orderRef,
        {
          receiptUrl: receiptImage || '',
          receiptNote: receiptNote.trim(),
          updatedAt: now,
        },
        { merge: true }
      );

      // Also record an in-app system notification for the admin
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: 'admin',
          title: 'Bukti Bayaran Dihantar',
          message: `${userName} (${userEmail}) telah memuat naik bukti bayaran untuk pesanan ${orderId} (RM150). Sila semak dan luluskan.`,
          type: 'payment',
          read: false,
          createdAt: now,
        });
      } catch {
        // Continue even if notification doc write encounters restriction
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error submitting payment proof:', err);
      setError(err.message || 'Gagal menghantar bukti pembayaran. Sila cuba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="bg-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-400/30">
            Langkah 2: Pembayaran & Bukti
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2">Arahan Pembayaran Langganan</h2>
          <p className="text-emerald-100 text-xs mt-1">
            Pesanan: <span className="font-mono font-bold text-white">{orderId}</span> • Jumlah:{' '}
            <strong className="text-white">RM150.00</strong>
          </p>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Bukti Bayaran Berjaya Diterima!</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              Terima kasih. Bukti pembayaran anda telah dihantar kepada pentadbir sistem untuk proses pengesahan.
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left max-w-md mx-auto">
              <strong className="block font-bold mb-1">Status: Menunggu Pengesahan Admin</strong>
              Akaun dan fungsi penerbitan landing page akan diaktifkan secara rasmi sejurus selepas Admin mengesahkan transaksi (biasanya dalam masa 1-24 jam bekerja).
            </div>

            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
            >
              Faham & Ke Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* OnPay Payment Gateway Embed */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Borang Pembayaran Rasmi (OnPay)</span>
                </div>
                <a
                  href="https://infaqconsultancy.onpay.my/order/form/140"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                >
                  <span>Buka di Tab Baru</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Exact OnPay Embed Element */}
              <div
                id="onpay-order-form"
                data-url="https://infaqconsultancy.onpay.my/order/form/140"
                data-only_form="1"
                className="w-full min-h-[500px] bg-white rounded-xl border border-slate-200 p-1 overflow-hidden"
              >
                <iframe
                  src="https://infaqconsultancy.onpay.my/order/form/140?embed=1&only_form=1"
                  className="w-full min-h-[500px] border-0 rounded-lg"
                  title="Borang Pembayaran OnPay"
                />
              </div>
            </div>

            {/* Critical Policy Notice */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Peringatan Pengesahan Bayaran:</strong>
                Langganan TIDAK diaktifkan secara automatik semasa menghantar resit. Admin perlu mengesahkan bayaran terlebih dahulu bagi memastikan keselamatan transaksi.
              </div>
            </div>

            {/* File Upload Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Muat Naik Resit / Bukti Pembayaran (JPG/PNG)
              </label>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-emerald-500 transition bg-slate-50/50">
                {receiptImage ? (
                  <div className="space-y-3">
                    <img
                      src={receiptImage}
                      alt="Pratonton Resit"
                      className="max-h-48 mx-auto rounded-lg object-contain border border-slate-200"
                    />
                    <div className="flex justify-center gap-2">
                      <label className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer">
                        <span>Ganti Gambar</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => setReceiptImage(null)}
                        className="text-xs text-rose-600 font-bold hover:underline"
                      >
                        Padam
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-4">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-700 block">
                      Klik untuk pilih fail resit atau seret fail ke sini
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Format dibenarkan: JPG, PNG, WebP (Maksimum 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Reference Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombor Rujukan Bank / Nota Transaksi (Pilihan)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  placeholder="Contoh: No Invois OnPay, No Rujukan Transaksi, atau Masa Bayaran"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menghantar Bukti...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Hantar Bukti Pembayaran untuk Pengesahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
