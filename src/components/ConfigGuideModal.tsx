import React from 'react';
import { X, Server, Key, Mail, CreditCard, Shield, ExternalLink, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-400/30">
              Dokumentasi & Panduan Rasmi
            </span>
          </div>
          <h2 className="text-2xl font-black">Panduan Konfigurasi & Integrasi Luaran</h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-xl">
            Perincian status penyediaan pangkalan data, keselamatan Firestore, dan senarai integrasi manual (Payment Gateway & Emel Transaksi).
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto text-xs sm:text-sm text-slate-700">
          {/* Section 1: Firebase Configuration */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>1. Status Konfigurasi Firebase Semasa</span>
            </h3>
            <p className="text-slate-600 leading-relaxed mb-3">
              Projek ini telah dikonfigurasikan dengan Firebase Authentication, Cloud Firestore (Database ID: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-emerald-700">ai-studio-infaqlandingpage-345eed3a-7ee2-4eb8-ba72-2a22b8ed3974</code>), dan Security Rules yang telah dideploy secara langsung.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Firestore Database Aktif</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Firebase Authentication Aktif</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Firestore Security Rules Dideploy</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Admin Bootstrapped: infaq.my@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Section 2: Payment Gateways (Manual Integration Required) */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>2. Integrasi Gerbang Pembayaran Automatik (FPX / ToyyibPay / Billplz)</span>
            </h3>
            <p className="text-slate-600 leading-relaxed mb-3">
              Sistem kini menyokong mod manual bank transfer dengan muat naik bukti resit dan semakan selamat oleh Admin. Sekiranya ingin menyambungkan gerbang FPX automatik:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-xs pl-1">
              <li><strong>ToyyibPay / Billplz / Chip-in:</strong> Dapatkan API Secret Key & Category Code dari portal penyedia.</li>
              <li>Simpan Secret Key dalam Cloud Functions atau persekitaran selamat pelayan pelindung (bukan dalam kod frontend).</li>
              <li>Sediakan Cloud Function webhook endpoint contohnya <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">/api/payment-callback</code> untuk mengesahkan tandatangan transaksi.</li>
            </ul>
          </div>

          {/* Section 3: Email Providers (Resend / SendGrid / Nodemailer) */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>3. Integrasi Penghantaran Emel Transaksi (Cloud Functions)</span>
            </h3>
            <p className="text-slate-600 leading-relaxed mb-3">
              Notifikasi dalam aplikasi (in-app notifications) berfungsi sepenuhnya dalam Firestore. Untuk penghantaran emel sebenar ke peti masuk pengguna:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-xs pl-1">
              <li><strong>Penyedia Emel Dicadangkan:</strong> Resend API, Postmark, atau SendGrid.</li>
              <li>Sediakan pemicu Cloud Firestore <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">onDocumentCreated('orders/{'{orderId}'}')</code> untuk menjana emel invois.</li>
              <li>Emel peringatan langganan tamat tempoh pada 30, 14 dan 3 hari boleh dijalankan melalui Cloud Scheduler (cron job harian).</li>
            </ul>
          </div>

          {/* Section 4: Security Rules Summary */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>4. Kawalan Keselamatan & Hak Akses (Zero Trust)</span>
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              Sistem menguatkuasakan perlindungan ketat di peringkat pangkalan data Firestore. Pengguna biasa disekat daripada mengubah peranan (role), status akaun, tarikh tamat langganan atau pengesahan pembayaran. Hanya pentadbir yang disahkan boleh mengurus transaksi dan pembeli.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
