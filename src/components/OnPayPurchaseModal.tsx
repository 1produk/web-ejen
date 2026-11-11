import React, { useEffect, useState } from 'react';
import { X, ExternalLink, ArrowRight, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProceedToRegister: () => void;
}

export const OnPayPurchaseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onProceedToRegister,
}) => {
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadError(false);

    const scriptId = 'onpay-embed-script-checkout';
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://onpay.my/js/embed-order-form.h1df98ef612fd.js';
    script.async = true;
    script.onerror = () => {
      setLoadError(true);
    };

    document.body.appendChild(script);

    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 relative flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 sm:p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Langkah 1: Pembayaran OnPay (RM150)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Langgan Pakej Ejen Tahunan</h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Yuran langganan RM150 setahun untuk akses penuh 365 hari membina & menerbitkan landing page Takaful anda.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Quick Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Panduan Pembelian:</strong>
              Lengkapkan bayaran melalui borang OnPay di bawah. Setelah mendapat resit atau nombor rujukan bayaran, klik butang <strong>"Teruskan ke Borang Pendaftaran"</strong> untuk melengkapkan profil & muat naik slip.
            </div>
          </div>

          {/* Direct link fallback */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs">
            <span className="text-slate-600">Pelayar menyekat borang embed?</span>
            <a
              href="https://infaqconsultancy.onpay.my/order/form/140"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Buka OnPay di Tab Baru</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* OnPay Embed Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 sm:p-3 overflow-hidden">
            {loadError && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs text-center mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <span>Borang OnPay mengambil masa untuk dimuatkan. Sila gunakan butang "Buka OnPay di Tab Baru" di atas.</span>
              </div>
            )}

            <div
              id="onpay-order-form"
              data-url="https://infaqconsultancy.onpay.my/order/form/140"
              data-only_form="1"
              className="w-full min-h-[500px] bg-white rounded-xl border border-slate-200/80 p-1"
            >
              {/* Fallback iframe to ensure instantaneous rendering */}
              <iframe
                src="https://infaqconsultancy.onpay.my/order/form/140?embed=1&only_form=1"
                className="w-full min-h-[520px] border-0 rounded-lg"
                title="Borang Pesanan OnPay"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer: Proceed to Register button */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
          >
            Tutup
          </button>

          <button
            onClick={() => {
              onClose();
              onProceedToRegister();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Sudah Selesai Bayar di OnPay? Teruskan ke Borang Pendaftaran</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
