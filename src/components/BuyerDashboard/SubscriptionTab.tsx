import React, { useState } from 'react';
import { UserProfile, Subscription, Order } from '../../types';
import {
  CreditCard,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Upload,
  RefreshCw,
  Building,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface Props {
  profile: UserProfile;
  subscription: Subscription | null;
  orders: Order[];
  onOpenPaymentModal: (orderId?: string) => void;
}

export const SubscriptionTab: React.FC<Props> = ({
  profile,
  subscription,
  orders,
  onOpenPaymentModal,
}) => {
  // Calculate remaining days
  const calculateDaysRemaining = () => {
    if (!subscription?.endDate) return 0;
    const end = new Date(subscription.endDate).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining();
  const latestOrder = orders.length > 0 ? orders[0] : null;

  // Warning thresholds
  const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
  const isCriticalExpiring = daysRemaining <= 14 && daysRemaining > 0;
  const isUrgentExpiring = daysRemaining <= 3 && daysRemaining > 0;
  const isExpired = subscription?.endDate ? new Date(subscription.endDate).getTime() < Date.now() : false;

  return (
    <div className="space-y-6">
      {/* Expiry Warning Milestones: 30 days, 14 days, 3 days, or expired */}
      {isExpired && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold">Langganan Anda Telah Tamat Tempoh</strong>
            Landing page anda telah dinyahterbitkan buat sementara waktu. Sila buat pembayaran pembaharuan RM150 untuk mengaktifkan semula halaman anda bagi tempoh 365 hari akan datang.
            <button
              onClick={() => onOpenPaymentModal(latestOrder?.id)}
              className="mt-3 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Perbaharui Langganan Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {isUrgentExpiring && !isExpired && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-rose-700">Peringatan Kritikal: Tinggal {daysRemaining} Hari Lagi!</strong>
            Langganan anda hampir tamat dalam tempoh 3 hari. Segera perbaharui agar landing page anda tidak terhenti daripada menerima prospek dan sebut harga Takaful.
          </div>
        </div>
      )}

      {isCriticalExpiring && !isUrgentExpiring && !isExpired && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-amber-800">Peringatan: Tinggal {daysRemaining} Hari Lagi (14 Hari)</strong>
            Langganan tahunan anda akan tamat tidak lama lagi. Anda disarankan membuat pembaharuan awal.
          </div>
        </div>
      )}

      {isExpiringSoon && !isCriticalExpiring && !isUrgentExpiring && !isExpired && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-blue-800">Peringatan Awal: Tinggal {daysRemaining} Hari Lagi (30 Hari)</strong>
            Tempoh sah langganan tahunan anda berbaki kurang daripada sebulan.
          </div>
        </div>
      )}

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Account Status Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Status Akaun Ejen
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full ${
                profile.accountStatus === 'Aktif'
                  ? 'bg-emerald-100 text-emerald-800'
                  : profile.accountStatus === 'Pending'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {profile.accountStatus}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
            {profile.accountStatus === 'Aktif'
              ? 'Akaun anda disahkan sah dan aktif dalam sistem TAKAFUL Builder.'
              : 'Menunggu kelulusan dan pengesahan bayaran dari pihak pentadbir.'}
          </p>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Status Langganan
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full ${
                subscription?.status === 'Aktif'
                  ? 'bg-emerald-100 text-emerald-800'
                  : subscription?.status === 'Hampir Tamat'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {subscription?.status || 'Menunggu Bayaran'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Pakej: <strong>Tahunan (RM150 / 365 Hari)</strong>
          </p>
        </div>

        {/* Days Remaining Big Counter */}
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block mb-1">
              Baki Tempoh Akses
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black">{daysRemaining}</span>
              <span className="text-sm font-semibold text-emerald-200">hari berbaki</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 text-[11px] text-emerald-100 flex items-center justify-between">
            <span>Akses 365 Hari</span>
            <button
              onClick={() => onOpenPaymentModal(latestOrder?.id)}
              className="text-xs font-bold text-amber-300 hover:text-white underline cursor-pointer"
            >
              Perbaharui
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Timeline & Dates Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h3 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100 mb-6 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Maklumat Tempoh Langganan Semasa</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-400 block mb-1">Tarikh Mula Langganan</span>
            <span className="text-sm font-bold text-slate-800">
              {subscription?.startDate
                ? new Date(subscription.startDate).toLocaleDateString('ms-MY', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Belum diaktifkan'}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-400 block mb-1">Tarikh Tamat Langganan</span>
            <span className="text-sm font-bold text-slate-800">
              {subscription?.endDate
                ? new Date(subscription.endDate).toLocaleDateString('ms-MY', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Menunggu pengesahan bayaran'}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-400 block mb-1">Bilangan Pembaharuan</span>
            <span className="text-sm font-bold text-slate-800">
              {subscription?.renewalCount || 0} kali
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Kemajuan Tempoh Langganan</span>
            <span>{daysRemaining} / 365 Hari</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                daysRemaining > 60 ? 'bg-emerald-500' : daysRemaining > 14 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (daysRemaining / 365) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Orders & Invoices History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Sejarah Pesanan & Bukti Pembayaran</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekod pesanan langganan tahunan dan status pengesahan oleh pentadbir.
            </p>
          </div>

          <button
            onClick={() => onOpenPaymentModal(latestOrder?.id)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Hantar Bukti Pembayaran</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Tiada rekod pesanan ditemui.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">No. Pesanan</th>
                  <th className="py-3 px-3">Pelan</th>
                  <th className="py-3 px-3">Jumlah</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Bukti Resit</th>
                  <th className="py-3 px-3">Tarikh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-800">{o.id}</td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">{o.planName}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      RM {o.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          o.orderStatus === 'Diluluskan'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.orderStatus === 'Ditolak'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {o.receiptUrl ? (
                        <a
                          href={o.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                        >
                          <span>Lihat Resit</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => onOpenPaymentModal(o.id)}
                          className="text-amber-700 font-bold hover:underline"
                        >
                          Muat naik resit
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString('ms-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
