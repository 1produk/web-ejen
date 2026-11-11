import React from 'react';
import { AlertCircle, Clock, ShieldX, ArrowRight, Home, CreditCard, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  type: 'not_subscribed' | 'pending' | 'suspended' | 'expired';
  email?: string;
  orderId?: string;
  rejectionReason?: string;
  onClose: () => void;
  onOpenPurchase: () => void;
  onReuploadReceipt?: () => void;
}

export const UnsubscribedModal: React.FC<Props> = ({
  isOpen,
  type,
  email,
  orderId,
  rejectionReason,
  onClose,
  onOpenPurchase,
  onReuploadReceipt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-8 relative">
        {/* State: Not Subscribed */}
        {type === 'not_subscribed' && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Anda Belum Melanggan</h2>

            {email && (
              <p className="text-xs font-mono bg-slate-100 text-slate-700 py-1 px-3 rounded-lg inline-block mt-2">
                {email}
              </p>
            )}

            <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
              Maaf, alamat emel anda belum mempunyai langganan aktif dalam sistem INFAQ Landing Page Builder.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium leading-relaxed">
              Untuk menggunakan sistem ini, sila buat pendaftaran dan langgan pakej RM150 terlebih dahulu.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  onOpenPurchase();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Daftar Ejen (RM150)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Halaman Utama</span>
              </button>
            </div>
          </div>
        )}

        {/* State: Pending Admin Verification */}
        {type === 'pending' && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Menunggu Pengesahan Admin
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-3">Status Pendaftaran</h2>

            {orderId && (
              <p className="text-xs font-mono bg-slate-100 text-slate-700 py-1 px-3 rounded-lg inline-block mt-2">
                No Pesanan: <strong>{orderId}</strong>
              </p>
            )}

            <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed font-medium">
              Pendaftaran anda telah diterima dan sedang menunggu pengesahan pembayaran oleh pihak admin.
            </p>

            {rejectionReason ? (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-left text-xs text-rose-800">
                <strong className="block font-bold mb-1">Nota Penolakan Admin:</strong>
                <p className="text-rose-700">{rejectionReason}</p>
                {onReuploadReceipt && (
                  <button
                    onClick={() => {
                      onClose();
                      onReuploadReceipt();
                    }}
                    className="mt-3 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Muat Naik Semula Slip Bayaran</span>
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Akaun anda dan fungsi pembina landing page akan diaktifkan sebaik sahaja admin mengesahkan slip transaksi OnPay anda.
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2">
              {onReuploadReceipt && !rejectionReason && (
                <button
                  onClick={() => {
                    onClose();
                    onReuploadReceipt();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Kemas Kini / Muat Naik Semula Slip
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Halaman Utama</span>
              </button>
            </div>
          </div>
        )}

        {/* State: Suspended */}
        {type === 'suspended' && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
              <ShieldX className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Akaun Digantung</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
              Akaun perunding anda telah digantung oleh pentadbir sistem. Sila hubungi pentadbir di <strong className="text-slate-900 font-mono">infaq.my@gmail.com</strong> untuk semakan dan maklumat lanjut.
            </p>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Halaman Utama</span>
            </button>
          </div>
        )}

        {/* State: Expired */}
        {type === 'expired' && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Langganan Telah Tamat Tempoh</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
              Tempoh akses tahunan (365 hari) bagi akaun anda telah tamat. Sila perbaharui langganan anda sebanyak RM150 untuk mengaktifkan semula landing page dan akses dashboard.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  onOpenPurchase();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Perbaharui Langganan (RM150)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Halaman Utama</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
