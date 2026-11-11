import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  setDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  UserProfile,
  Order,
  Subscription,
  LandingPage,
  AdminAuditLog,
  AccountStatus,
  OrderStatus
} from '../../types';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Calendar,
  History,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Archive,
  AlertTriangle,
  Ban,
  RotateCcw,
  KeyRound,
  FileText,
  AlertCircle,
  Save,
  X,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { user, userProfile, isAdmin, resetPassword } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'buyers' | 'subscriptions' | 'auditLogs'>('orders');

  // Real-time collections
  const [buyers, setBuyers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Receipt modal
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);

  // Rejection modal
  const [rejectOrderModal, setRejectOrderModal] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Edit Buyer modal
  const [editBuyerModal, setEditBuyerModal] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  // Archive confirm modal
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  // Permanent Delete confirm modal (buang terus dari data)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<UserProfile | null>(null);
  const [deletingPermanent, setDeletingPermanent] = useState(false);

  // Password reset toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    setLoading(true);

    // 1. Buyers
    const unsubBuyers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        setBuyers(snap.docs.map((d) => ({ ...d.data(), id: d.id } as UserProfile)));
      },
      (err) => {
        console.warn('Admin users snapshot error:', err.message);
      }
    );

    // 2. Orders
    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snap) => {
        const ords = snap.docs
          .map((d) => ({ ...d.data(), id: d.id } as Order))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(ords);
      },
      (err) => {
        console.warn('Admin orders snapshot error:', err.message);
      }
    );

    // 3. Subscriptions
    const unsubSubs = onSnapshot(
      collection(db, 'subscriptions'),
      (snap) => {
        setSubscriptions(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Subscription)));
      },
      (err) => {
        console.warn('Admin subscriptions snapshot error:', err.message);
      }
    );

    // 4. Landing Pages
    const unsubPages = onSnapshot(
      collection(db, 'landingPages'),
      (snap) => {
        setLandingPages(snap.docs.map((d) => ({ ...d.data(), id: d.id } as LandingPage)));
      },
      (err) => {
        console.warn('Admin landing pages snapshot error:', err.message);
      }
    );

    // 5. Audit Logs
    const unsubLogs = onSnapshot(
      collection(db, 'adminAuditLogs'),
      (snap) => {
        const logs = snap.docs
          .map((d) => ({ ...d.data(), id: d.id } as AdminAuditLog))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAuditLogs(logs);
        setLoading(false);
      },
      (err) => {
        console.warn('Admin audit logs snapshot error:', err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubBuyers();
      unsubOrders();
      unsubSubs();
      unsubPages();
      unsubLogs();
    };
  }, [isAdmin]);

  // Helper: Log Admin Action
  const logAdminAction = async (action: string, targetUserId: string, targetUserName: string, details: string) => {
    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, 'adminAuditLogs'), {
        adminId: user?.uid || 'admin',
        adminEmail: user?.email || 'admin@infaq.my',
        action,
        targetUserId,
        targetUserName,
        details,
        timestamp: now,
      });
    } catch (err) {
      console.warn('Audit log write error:', err);
    }
  };

  // Helper: Send System Notification to User
  const notifyUser = async (userId: string, title: string, message: string, type: any = 'system') => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Notification write notice:', e);
    }
  };

  // Action: Approve Payment & Activate 365 Days Subscription
  const handleApproveOrder = async (order: Order) => {
    try {
      const now = new Date().toISOString();
      const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      // 1. Update Order
      await updateDoc(doc(db, 'orders', order.id), {
        orderStatus: 'Diluluskan',
        verifiedBy: user?.email || 'admin',
        verifiedAt: now,
        updatedAt: now,
      });

      // 2. Activate Subscription
      const existingSub = subscriptions.find((s) => s.userId === order.userId);
      const newRenewalCount = (existingSub?.renewalCount || 0) + 1;

      await setDoc(
        doc(db, 'subscriptions', order.userId),
        {
          id: order.userId,
          userId: order.userId,
          orderId: order.id,
          status: 'Aktif',
          startDate: now,
          endDate: oneYearLater,
          daysRemaining: 365,
          renewalCount: newRenewalCount,
          lastRenewedAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

      // 3. Update User Status to Aktif
      await updateDoc(doc(db, 'users', order.userId), {
        accountStatus: 'Aktif',
        updatedAt: now,
      });

      // 4. Log and notify
      await logAdminAction(
        'Luluskan Pembayaran & Aktifkan Langganan',
        order.userId,
        order.userName,
        `Pesanan ${order.id} (RM${order.amount}) diluluskan. Langganan 365 hari diaktifkan sehingga ${new Date(oneYearLater).toLocaleDateString('ms-MY')}.`
      );

      await notifyUser(
        order.userId,
        'Pembayaran Disahkan & Langganan Aktif!',
        `Alhamdulillah! Pembayaran langganan tahunan RM${order.amount} bagi pesanan ${order.id} telah disahkan. Anda kini boleh menerbitkan landing page peribadi anda.`,
        'payment'
      );

      setActionNotice(`Pesanan ${order.id} berjaya diluluskan. Langganan aktif selama 365 hari.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      console.error('Error approving order:', err);
      alert('Ralat semasa meluluskan bayaran: ' + err.message);
    }
  };

  // Action: Reject Order
  const handleRejectOrder = async () => {
    if (!rejectOrderModal) return;
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'orders', rejectOrderModal.id), {
        orderStatus: 'Ditolak',
        verifiedBy: user?.email || 'admin',
        verifiedAt: now,
        rejectionReason: rejectionReason.trim() || 'Bukti bayaran tidak lengkap atau transaksi tidak ditemui.',
        updatedAt: now,
      });

      await logAdminAction(
        'Tolak Pembayaran',
        rejectOrderModal.userId,
        rejectOrderModal.userName,
        `Pesanan ${rejectOrderModal.id} ditolak. Sebab: ${rejectionReason.trim()}`
      );

      await notifyUser(
        rejectOrderModal.userId,
        'Pembayaran Tidak Berjaya',
        `Pembayaran bagi pesanan ${rejectOrderModal.id} telah ditolak. Sebab: ${rejectionReason.trim() || 'Sila muat naik bukti bayaran yang jelas.'}`,
        'payment'
      );

      setRejectOrderModal(null);
      setRejectionReason('');
      setActionNotice('Pesanan telah ditolak dan pembeli dimaklumkan.');
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert('Ralat menolak pesanan: ' + err.message);
    }
  };

  // Action: Change Buyer Account Status (Aktif, Pending, Digantung, Diarkibkan)
  const handleChangeAccountStatus = async (buyer: UserProfile, newStatus: AccountStatus) => {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'users', buyer.id), {
        accountStatus: newStatus,
        updatedAt: now,
      });

      // If suspended, also unpublish landing page
      if (newStatus === 'Digantung' || newStatus === 'Diarkibkan') {
        const pageDocRef = doc(db, 'landingPages', buyer.id);
        await updateDoc(pageDocRef, {
          isPublished: false,
          status: 'Digantung',
          updatedAt: now,
        });
      }

      await logAdminAction(
        `Tukar Status Akaun -> ${newStatus}`,
        buyer.id,
        buyer.fullName,
        `Status akaun diubah dari ${buyer.accountStatus} kepada ${newStatus}.`
      );

      await notifyUser(
        buyer.id,
        `Status Akaun Anda: ${newStatus}`,
        `Status akaun anda telah dikemas kini kepada "${newStatus}" oleh pentadbir sistem.`,
        'account'
      );

      setActionNotice(`Status akaun ${buyer.fullName} berjaya ditukar kepada ${newStatus}.`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert('Gagal mengubah status akaun: ' + err.message);
    }
  };

  // Action: Unpublish Buyer Landing Page
  const handleUnpublishLandingPage = async (buyer: UserProfile) => {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'landingPages', buyer.id), {
        isPublished: false,
        status: 'Draf',
        updatedAt: now,
      });

      await logAdminAction(
        'Nyahterbit Landing Page Pembeli',
        buyer.id,
        buyer.fullName,
        'Admin menyahterbitkan landing page pembeli kepada status Draf.'
      );

      await notifyUser(
        buyer.id,
        'Landing Page Dinyahterbit',
        'Landing page anda telah dinyahterbitkan oleh pentadbir sistem dan disimpan sebagai draf.',
        'landing_page'
      );

      setActionNotice(`Landing page bagi ${buyer.fullName} telah dinyahterbitkan.`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert('Ralat menyahterbit landing page: ' + err.message);
    }
  };

  // Action: Edit Buyer Profile
  const handleSaveBuyerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBuyerModal) return;

    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'users', editBuyerModal.id), {
        fullName: editForm.fullName?.trim() || editBuyerModal.fullName,
        phone: editForm.phone?.trim() || editBuyerModal.phone,
        agentId: editForm.agentId?.trim() || '',
        occupation: editForm.occupation?.trim() || '',
        industry: editForm.industry?.trim() || '',
        city: editForm.city?.trim() || '',
        state: editForm.state || editBuyerModal.state,
        accountStatus: editForm.accountStatus || editBuyerModal.accountStatus,
        updatedAt: now,
      });

      await logAdminAction(
        'Kemaskini Profil Pembeli',
        editBuyerModal.id,
        editBuyerModal.fullName,
        'Admin mengemas kini butiran profil pengguna.'
      );

      setEditBuyerModal(null);
      setActionNotice('Profil pembeli berjaya dikemas kini.');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert('Ralat mengemas kini profil: ' + err.message);
    }
  };

  // Action: Send Password Reset Email
  const handleSendPasswordReset = async (buyer: UserProfile) => {
    try {
      await resetPassword(buyer.email);
      await logAdminAction(
        'Hantar Tetapan Semula Kata Laluan',
        buyer.id,
        buyer.fullName,
        `Pautan tetapan semula kata laluan dihantar ke emel ${buyer.email}.`
      );
      setActionNotice(`Pautan tetapan semula kata laluan dihantar ke ${buyer.email}.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert('Gagal menghantar emel: ' + err.message);
    }
  };

  // Action: Safe Archive / Deactivate Account
  const handleArchiveAccount = async (buyer: UserProfile) => {
    try {
      const now = new Date().toISOString();
      // Set to Diarkibkan and unpublish
      await updateDoc(doc(db, 'users', buyer.id), {
        accountStatus: 'Diarkibkan',
        updatedAt: now,
      });

      await updateDoc(doc(db, 'landingPages', buyer.id), {
        isPublished: false,
        status: 'Draf',
        updatedAt: now,
      });

      await logAdminAction(
        'Arkibkan Akaun Ejen',
        buyer.id,
        buyer.fullName,
        'Akaun diarkibkan bagi memelihara rekod transaksi kewangan.'
      );

      setDeleteTarget(null);
      setActionNotice(`Akaun ${buyer.fullName} telah diarkibkan dengan selamat.`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert('Ralat mengarkibkan akaun: ' + err.message);
    }
  };

  // Action: Permanent Delete Account & All Related Data (Buang terus dari data)
  const handlePermanentDelete = async (buyer: UserProfile) => {
    setDeletingPermanent(true);
    try {
      // 1. Delete user doc from 'users'
      await deleteDoc(doc(db, 'users', buyer.id));

      // 2. Delete landing page from 'landingPages'
      try {
        await deleteDoc(doc(db, 'landingPages', buyer.id));
      } catch (err) {
        console.warn('Error deleting landingPage:', err);
      }

      // 3. Delete subscription from 'subscriptions'
      try {
        await deleteDoc(doc(db, 'subscriptions', buyer.id));
      } catch (err) {
        console.warn('Error deleting subscription:', err);
      }

      // 4. Delete all products belonging to this user
      try {
        const prodSnap = await getDocs(query(collection(db, 'products'), where('userId', '==', buyer.id)));
        for (const p of prodSnap.docs) {
          await deleteDoc(doc(db, 'products', p.id));
        }
      } catch (err) {
        console.warn('Error deleting products:', err);
      }

      // 5. Delete all registered slugs for this user
      try {
        const slugSnap = await getDocs(query(collection(db, 'slugs'), where('userId', '==', buyer.id)));
        for (const s of slugSnap.docs) {
          await deleteDoc(doc(db, 'slugs', s.id));
        }
      } catch (err) {
        console.warn('Error deleting slugs:', err);
      }

      // 6. Delete all orders belonging to this user
      try {
        const ordSnap = await getDocs(query(collection(db, 'orders'), where('userId', '==', buyer.id)));
        for (const o of ordSnap.docs) {
          await deleteDoc(doc(db, 'orders', o.id));
        }
      } catch (err) {
        console.warn('Error deleting orders:', err);
      }

      // 7. Delete all notifications for this user
      try {
        const notifSnap = await getDocs(query(collection(db, 'notifications'), where('userId', '==', buyer.id)));
        for (const n of notifSnap.docs) {
          await deleteDoc(doc(db, 'notifications', n.id));
        }
      } catch (err) {
        console.warn('Error deleting notifications:', err);
      }

      // 8. Log the admin action
      await logAdminAction(
        'Padam Terus Data Ejen',
        buyer.id,
        buyer.fullName,
        `Admin telah memadam akaun ${buyer.fullName} (${buyer.email}) dan kesemua data berkaitan secara kekal dari pangkalan data.`
      );

      // 9. Update local state
      setBuyers((prev) => prev.filter((b) => b.id !== buyer.id));
      setPermanentDeleteTarget(null);
      setActionNotice(`Akaun ${buyer.fullName} dan semua rekod berkaitan telah dipadam terus dari pangkalan data.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      console.error('Error in permanent delete:', err);
      alert('Ralat memadam data ejen: ' + (err.message || err));
    } finally {
      setDeletingPermanent(false);
    }
  };

  // Stats calculation
  const totalBuyers = buyers.filter((b) => b.role === 'buyer').length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Menunggu Pengesahan').length;
  const activeSubscriptions = subscriptions.filter((s) => s.status === 'Aktif').length;
  const totalCollection = orders
    .filter((o) => o.orderStatus === 'Diluluskan')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  // Filtered lists
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBuyers = buyers.filter((b) => {
    if (b.role === 'admin' && b.email === 'infaq.my@gmail.com') return false; // hide master admin from buyer list
    const matchesSearch =
      b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.agentId && b.agentId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || b.accountStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-200">
          <Ban className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Akses Ditolak</h2>
          <p className="text-xs text-slate-600 mt-2">
            Hanya pentadbir yang disahkan mempunyai hak akses ke Panel Admin TAKAFUL Builder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white pt-8 pb-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panel Pengurusan Pentadbir TAKAFUL</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Pusat Kawalan Pentadbir</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Urus pengesahan bayaran perunding, langganan 365 hari, status akaun dan audit sistem.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Pentadbir Bertugas</span>
            <span className="text-xs font-bold text-white font-mono bg-white/10 px-3 py-1 rounded-lg">
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 space-y-6">
        {/* Toast Notice */}
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Executive KPI Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Jumlah Ejen / Pembeli
              </span>
              <span className="text-2xl font-black text-slate-900">{totalBuyers}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Menunggu Pengesahan
              </span>
              <span className="text-2xl font-black text-amber-600">{pendingOrders}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Langganan Aktif (365 Hari)
              </span>
              <span className="text-2xl font-black text-emerald-600">{activeSubscriptions}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Jumlah Kutipan Langganan
              </span>
              <span className="text-2xl font-black text-slate-900">
                RM {totalCollection.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-1.5 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pengesahan Bayaran ({orders.filter((o) => o.orderStatus === 'Menunggu Pengesahan').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('buyers')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'buyers'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pengurusan Ejen / Pembeli ({buyers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Senarai Langganan ({subscriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('auditLogs')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'auditLogs'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Log Audit Admin ({auditLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDERS & PAYMENT VERIFICATION */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Senarai Pesanan & Pengesahan Bayaran</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Semak bukti resit bayaran RM150 dan aktifkan langganan 365 hari secara manual setelah transaksi sah.
                </p>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700"
                >
                  <option value="all">Semua Status Pesanan</option>
                  <option value="Menunggu Pengesahan">Menunggu Pengesahan</option>
                  <option value="Diluluskan">Diluluskan</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filteredOrders.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Tiada pesanan ditemui.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">No. Pesanan</th>
                      <th className="py-3 px-3">Maklumat Pembeli</th>
                      <th className="py-3 px-3">Jumlah</th>
                      <th className="py-3 px-3">Bukti Pembayaran</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-3 font-mono font-bold text-slate-800">
                          {o.id}
                          <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                            {new Date(o.createdAt).toLocaleDateString('ms-MY', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                        <td className="py-4 px-3">
                          <span className="font-bold text-slate-900 block">{o.userName}</span>
                          <span className="text-slate-500 block">{o.userEmail}</span>
                          <span className="text-[11px] text-slate-400">{o.userPhone}</span>
                        </td>

                        <td className="py-4 px-3">
                          <span className="font-black text-slate-900 text-sm">RM {o.amount.toFixed(2)}</span>
                          <span className="block text-[10px] text-slate-400">{o.paymentMethod}</span>
                        </td>

                        <td className="py-4 px-3">
                          {o.receiptUrl ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewReceiptUrl(o.receiptUrl || null)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1 transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat Resit</span>
                              </button>
                              {o.receiptNote && (
                                <span className="text-[10px] text-slate-500 italic max-w-[120px] truncate" title={o.receiptNote}>
                                  Nota: {o.receiptNote}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Belum muat naik</span>
                          )}
                        </td>

                        <td className="py-4 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              o.orderStatus === 'Diluluskan'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.orderStatus === 'Ditolak'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                          {o.rejectionReason && (
                            <span className="block text-[10px] text-rose-600 mt-1 max-w-[150px] truncate" title={o.rejectionReason}>
                              {o.rejectionReason}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-3 text-right">
                          {o.orderStatus === 'Menunggu Pengesahan' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApproveOrder(o)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition inline-flex items-center gap-1"
                                title="Luluskan Bayaran & Aktifkan Langganan 365 Hari"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Luluskan</span>
                              </button>

                              <button
                                onClick={() => {
                                  setRejectOrderModal(o);
                                  setRejectionReason('');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition inline-flex items-center gap-1"
                                title="Tolak Pesanan"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              Disahkan oleh: {o.verifiedBy || 'Admin'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BUYERS / AGENTS MANAGEMENT */}
        {activeTab === 'buyers' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Senarai Ejen & Pembeli</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Urus maklumat profil, tukar status akaun (Aktif/Pending/Digantung), dan pantau landing page ejen.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama, emel, telefon..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700"
                >
                  <option value="all">Semua Status Akaun</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Pending">Pending</option>
                  <option value="Digantung">Digantung</option>
                  <option value="Diarkibkan">Diarkibkan</option>
                </select>
              </div>
            </div>

            {/* Buyers Table */}
            <div className="overflow-x-auto">
              {filteredBuyers.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Tiada ejen ditemui.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">Ejen</th>
                      <th className="py-3 px-3">Hubungan & Lokasi</th>
                      <th className="py-3 px-3">Pekerjaan</th>
                      <th className="py-3 px-3">Status Akaun</th>
                      <th className="py-3 px-3">Landing Page</th>
                      <th className="py-3 px-3 text-right">Tindakan Pentadbir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBuyers.map((b) => {
                      const userPage = landingPages.find((lp) => lp.userId === b.id);
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                                {b.avatarUrl ? (
                                  <img src={b.avatarUrl} alt={b.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-500">
                                    {b.fullName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{b.fullName}</span>
                                <span className="text-slate-500 block">{b.email}</span>
                                {b.agentId && (
                                  <span className="text-[10px] text-emerald-700 font-mono">ID: {b.agentId}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-3">
                            <span className="font-semibold text-slate-800 block">{b.phone}</span>
                            <span className="text-slate-500 text-[11px]">
                              {b.city ? `${b.city}, ` : ''}{b.state}
                            </span>
                          </td>

                          <td className="py-4 px-3">
                            <span className="font-medium text-slate-700 block">{b.occupation || '-'}</span>
                            <span className="text-[11px] text-slate-400">{b.industry || '-'}</span>
                          </td>

                          <td className="py-4 px-3">
                            <select
                              value={b.accountStatus}
                              onChange={(e) => handleChangeAccountStatus(b, e.target.value as AccountStatus)}
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] cursor-pointer border ${
                                b.accountStatus === 'Aktif'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : b.accountStatus === 'Pending'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              <option value="Aktif">Aktif</option>
                              <option value="Pending">Pending</option>
                              <option value="Digantung">Digantung</option>
                              <option value="Diarkibkan">Diarkibkan</option>
                            </select>
                          </td>

                          <td className="py-4 px-3">
                            {userPage ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      userPage.isPublished ? 'bg-emerald-500' : 'bg-slate-300'
                                    }`}
                                  />
                                  <span className="font-semibold text-slate-800 font-mono text-[11px]">
                                    /p/{userPage.slug}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {userPage.isPublished ? (
                                    <button
                                      onClick={() => handleUnpublishLandingPage(b)}
                                      className="text-[10px] text-amber-700 hover:underline font-bold"
                                    >
                                      Nyahterbit
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">Draf / Belum terbit</span>
                                  )}
                                  <a
                                    href={`/#/p/${userPage.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-emerald-700 hover:underline inline-flex items-center gap-0.5"
                                  >
                                    <span>Lihat</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Tiada halaman</span>
                            )}
                          </td>

                          <td className="py-4 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Profile */}
                              <button
                                onClick={() => {
                                  setEditBuyerModal(b);
                                  setEditForm({ ...b });
                                }}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition"
                                title="Ubah Maklumat Profil"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Send Password Reset Link */}
                              <button
                                onClick={() => handleSendPasswordReset(b)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition"
                                title="Hantar Pautan Tetapan Semula Kata Laluan"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Archive Account */}
                              <button
                                onClick={() => setDeleteTarget(b)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition"
                                title="Arkibkan Akaun"
                              >
                                <Archive className="w-4 h-4" />
                              </button>

                              {/* Delete Button (Buang terus dari data) */}
                              <button
                                onClick={() => setPermanentDeleteTarget(b)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white transition flex items-center gap-1 font-bold text-[11px] shadow-xs border border-rose-200 hover:border-rose-600 cursor-pointer ml-1"
                                title="Padam terus dari pangkalan data"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTIONS OVERVIEW */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="pb-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Senarai Langganan Tahunan Ejen</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pantau tarikh mula, tarikh tamat (365 hari) dan baki hari bagi setiap akaun ejen berdaftar.
              </p>
            </div>

            <div className="overflow-x-auto">
              {subscriptions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Tiada rekod langganan ditemui.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">Ejen Pemilik</th>
                      <th className="py-3 px-3">Status Langganan</th>
                      <th className="py-3 px-3">Tarikh Mula</th>
                      <th className="py-3 px-3">Tarikh Tamat</th>
                      <th className="py-3 px-3">Baki Hari</th>
                      <th className="py-3 px-3 text-right">Tindakan Lanjutan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.map((s) => {
                      const owner = buyers.find((b) => b.id === s.userId);
                      const daysLeft = s.endDate
                        ? Math.max(0, Math.ceil((new Date(s.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                        : 0;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-4 px-3">
                            <span className="font-bold text-slate-900 block">{owner?.fullName || s.userId}</span>
                            <span className="text-slate-500">{owner?.email || '-'}</span>
                          </td>

                          <td className="py-4 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                s.status === 'Aktif'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : s.status === 'Hampir Tamat'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>

                          <td className="py-4 px-3 font-medium text-slate-700">
                            {s.startDate
                              ? new Date(s.startDate).toLocaleDateString('ms-MY', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </td>

                          <td className="py-4 px-3 font-medium text-slate-700">
                            {s.endDate
                              ? new Date(s.endDate).toLocaleDateString('ms-MY', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </td>

                          <td className="py-4 px-3">
                            <span
                              className={`font-black text-sm ${
                                daysLeft > 30 ? 'text-emerald-600' : daysLeft > 7 ? 'text-amber-600' : 'text-rose-600'
                              }`}
                            >
                              {daysLeft} Hari
                            </span>
                          </td>

                          <td className="py-4 px-3 text-right">
                            <button
                              onClick={async () => {
                                const newEnd = new Date(
                                  (s.endDate ? new Date(s.endDate).getTime() : Date.now()) + 365 * 24 * 60 * 60 * 1000
                                ).toISOString();
                                await updateDoc(doc(db, 'subscriptions', s.id), {
                                  endDate: newEnd,
                                  status: 'Aktif',
                                  renewalCount: (s.renewalCount || 0) + 1,
                                  updatedAt: new Date().toISOString(),
                                });
                                await logAdminAction(
                                  'Lanjutan Langganan Manual',
                                  s.userId,
                                  owner?.fullName || '',
                                  `Admin menambah 365 hari pada langganan sehingga ${new Date(newEnd).toLocaleDateString('ms-MY')}.`
                                );
                                setActionNotice(`Langganan ${owner?.fullName || ''} berjaya dilanjutkan 365 hari.`);
                                setTimeout(() => setActionNotice(null), 3000);
                              }}
                              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
                            >
                              +365 Hari
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN AUDIT LOGS */}
        {activeTab === 'auditLogs' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="pb-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Sejarah & Log Tindakan Pentadbir</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rekod integriti untuk setiap tindakan kelulusan bayaran, penukaran status, kemas kini profil dan keselamatan.
              </p>
            </div>

            <div className="space-y-3">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Tiada rekod tindakan audit lagi.</p>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {log.action}
                        </span>
                        {log.targetUserName && (
                          <span className="text-slate-600">
                            Sasaran: <strong className="text-slate-800">{log.targetUserName}</strong>
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed">{log.details}</p>
                    </div>

                    <div className="text-right sm:self-center flex-shrink-0 text-slate-400 text-[11px]">
                      <span className="block font-mono">{log.adminEmail}</span>
                      <span>
                        {new Date(log.timestamp).toLocaleDateString('ms-MY', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: View Payment Receipt */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setViewReceiptUrl(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-3">Bukti Pembayaran Ejen</h3>
            <div className="flex-1 overflow-auto bg-slate-100 rounded-xl p-2 flex items-center justify-center">
              <img
                src={viewReceiptUrl}
                alt="Resit Bayaran"
                className="max-h-[60vh] object-contain rounded-lg"
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <a
                href={viewReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                download="slip-pembayaran-ejen"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka / Muat Turun Fail Slip</span>
              </a>

              <button
                onClick={() => setViewReceiptUrl(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Order Reason */}
      {rejectOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">Tolak Pembayaran Pesanan?</h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Pesanan: <span className="font-mono font-bold text-slate-800">{rejectOrderModal.id}</span> • Ejen:{' '}
              {rejectOrderModal.userName}
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sebab Penolakan (Akan dihantar kepada ejen)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: Resit kabur / Jumlah RM tidak mencukupi / Transaksi belum masuk ke akaun bank."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => setRejectOrderModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleRejectOrder}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Sahkan Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Buyer Profile */}
      {editBuyerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-6">
            <button
              onClick={() => setEditBuyerModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Ubah Maklumat Profil Ejen</h3>
            <p className="text-xs text-slate-500 mb-4">
              {editBuyerModal.email}
            </p>

            <form onSubmit={handleSaveBuyerProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Penuh</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombor Telefon</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ID Ejen / Introducer</label>
                  <input
                    type="text"
                    value={editForm.agentId || ''}
                    onChange={(e) => setEditForm({ ...editForm, agentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={editForm.occupation || ''}
                    onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Industri</label>
                  <input
                    type="text"
                    value={editForm.industry || ''}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Akaun</label>
                <select
                  value={editForm.accountStatus || 'Pending'}
                  onChange={(e) => setEditForm({ ...editForm, accountStatus: e.target.value as AccountStatus })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pending">Pending</option>
                  <option value="Digantung">Digantung</option>
                  <option value="Diarkibkan">Diarkibkan</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditBuyerModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Safe Archive / Deactivate Account */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Archive className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Nyahaktifkan / Arkibkan Akaun?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Bagi memelihara rekod transaksi pembayaran dan audit kewangan, akaun <strong className="text-slate-900">{deleteTarget.fullName}</strong> ({deleteTarget.email}) akan berstatus <strong>Diarkibkan</strong> dan landing page miliknya akan ditutup secara automatik.
            </p>
            <div className="mt-5 flex gap-2 justify-center">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer hover:bg-slate-200 transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleArchiveAccount(deleteTarget)}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow cursor-pointer transition"
              >
                Sahkan Arkib
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Permanent Delete Account & All Data (Buang terus dari data) */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl relative border border-slate-200 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Tindakan Hapus Kekal
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">Padam Terus Dari Data?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Adakah anda pasti ingin memadam <strong className="text-slate-900">{permanentDeleteTarget.fullName}</strong> ({permanentDeleteTarget.email}) secara terus dari sistem?
            </p>

            <div className="mt-3 p-3 bg-rose-50/80 border border-rose-100 rounded-xl text-left text-[11px] text-rose-900 space-y-1">
              <p className="font-bold text-rose-950">Data berikut akan dihapuskan sepenuhnya:</p>
              <ul className="list-disc list-inside space-y-0.5 text-rose-800 text-[10px]">
                <li>Rekod profil pengguna & akaun ejen</li>
                <li>Halaman landing page peribadi & slug pautan</li>
                <li>Semua pakej & produk takaful ejen</li>
                <li>Rekod langganan tahunan</li>
                <li>Rekod pesanan & bukti pembayaran</li>
              </ul>
            </div>

            <div className="mt-5 flex gap-2.5 justify-center">
              <button
                disabled={deletingPermanent}
                onClick={() => setPermanentDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition"
              >
                Batal
              </button>
              <button
                disabled={deletingPermanent}
                onClick={() => handlePermanentDelete(permanentDeleteTarget)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deletingPermanent ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memadam Data...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Buang Terus Dari Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
