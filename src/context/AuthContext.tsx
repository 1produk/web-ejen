import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, Order, LandingPage, Subscription } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/error';

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  agentId?: string;
  country: string;
  state: string;
  address: string;
  city: string;
  postalCode: string;
  occupation: string;
  industry: string;
  dob?: string;
  password?: string;
  receiptUrl?: string;
  receiptNote?: string;
  paymentMethod?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  subscription: Subscription | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  registerBuyer: (data: RegisterData) => Promise<{ user: User; orderId: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  reuploadReceipt: (orderId: string, receiptUrl: string, receiptNote: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_BOOTSTRAP_EMAIL = 'infaq.my@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Derived admin state
  const isAdmin =
    (user?.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase()) ||
    userProfile?.role === 'admin';

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    let unsubscribeSub: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const subDocRef = doc(db, 'subscriptions', currentUser.uid);

        // 1. Listen to Subscription in real-time
        unsubscribeSub = onSnapshot(
          subDocRef,
          (subSnap) => {
            if (subSnap.exists()) {
              setSubscription(subSnap.data() as Subscription);
            } else {
              setSubscription(null);
            }
          },
          (err) => {
            console.warn('Subscription snapshot notice:', err.message);
          }
        );

        try {
          // 2. Listen to real-time updates for user profile
          unsubscribeProfile = onSnapshot(
            userDocRef,
            async (snapshot) => {
              if (snapshot.exists()) {
                const data = snapshot.data() as UserProfile;
                // If it's the bootstrapped admin email and not marked as admin, update it
                if (
                  currentUser.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() &&
                  data.role !== 'admin'
                ) {
                  try {
                    await setDoc(userDocRef, { ...data, role: 'admin', accountStatus: 'Aktif' }, { merge: true });
                  } catch {
                    // Ignore background sync errors
                  }
                }
                setUserProfile(data);
              } else {
                // If profile doesn't exist yet
                const isBootstrapAdmin = currentUser.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
                if (isBootstrapAdmin) {
                  // Only auto-create profile if this is the bootstrap admin email!
                  const newProfile: UserProfile = {
                    id: currentUser.uid,
                    email: currentUser.email || '',
                    fullName: currentUser.displayName || 'Admin Takaful',
                    phone: currentUser.phoneNumber || '',
                    country: 'Malaysia',
                    state: 'Selangor',
                    address: '',
                    city: '',
                    postalCode: '',
                    occupation: 'Pengurusan Sistem',
                    industry: 'Kewangan & Takaful',
                    role: 'admin',
                    accountStatus: 'Aktif',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };

                  try {
                    await setDoc(userDocRef, newProfile);
                    setUserProfile(newProfile);
                  } catch (e) {
                    console.warn('Could not bootstrap admin profile:', e);
                  }
                } else {
                  // CRITICAL: User requirement 1:
                  // "Log masuk menggunakan Google Account:
                  // - Semak padanan identiti Google dengan akaun yang telah didaftarkan.
                  // - Jangan mewujudkan profil pelanggan berstatus aktif secara automatik apabila pengguna memilih Google Sign-In.
                  // - Jika tiada padanan akaun berdaftar, sekat akses aplikasi."
                  setUserProfile(null);
                }
              }
              setLoading(false);
            },
            (err) => {
              handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
              setLoading(false);
            }
          );
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setLoading(false);
        }
      } else {
        setUserProfile(null);
        setSubscription(null);
        if (unsubscribeProfile) unsubscribeProfile();
        if (unsubscribeSub) unsubscribeSub();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeSub) unsubscribeSub();
    };
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } finally {
      setLoading(false);
    }
  };

  const registerBuyer = async (data: RegisterData) => {
    setLoading(true);
    try {
      if (!data.password) {
        throw new Error('Kata laluan diperlukan.');
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      const newUser = userCredential.user;
      const now = new Date().toISOString();
      const isBootstrapAdmin = data.email.trim().toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();

      // 1. Create User Document in Firestore
      const newProfile: UserProfile = {
        id: newUser.uid,
        email: data.email.trim(),
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        agentId: data.agentId?.trim() || '',
        country: data.country || 'Malaysia',
        state: data.state || 'Selangor',
        address: data.address.trim(),
        city: data.city.trim(),
        postalCode: data.postalCode.trim(),
        occupation: data.occupation.trim() || 'Perunding Takaful',
        industry: data.industry.trim() || 'Kewangan & Takaful',
        dob: data.dob || '',
        role: isBootstrapAdmin ? 'admin' : 'buyer',
        accountStatus: isBootstrapAdmin ? 'Aktif' : 'Pending',
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, 'users', newUser.uid), newProfile);

      // Generate a default slug from full name
      const baseSlug = data.fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `ejen-${newUser.uid.slice(0, 5)}`;
      const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

      // 2. Initialize Order Document
      const orderId = `ORD-${Date.now()}`;
      const newOrder: Order = {
        id: orderId,
        userId: newUser.uid,
        userEmail: data.email.trim(),
        userName: data.fullName.trim(),
        userPhone: data.phone.trim(),
        planName: 'Langganan Tahunan TAKAFUL Landing Page',
        amount: 150,
        currency: 'MYR',
        orderStatus: 'Menunggu Pengesahan',
        paymentMethod: data.paymentMethod || 'OnPay / FPX',
        receiptUrl: data.receiptUrl || '',
        receiptNote: data.receiptNote || '',
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'orders', orderId), newOrder);

      // 3. Initialize Subscription Document
      const newSub: Subscription = {
        id: newUser.uid,
        userId: newUser.uid,
        orderId: orderId,
        status: isBootstrapAdmin ? 'Aktif' : 'Menunggu Bayaran',
        startDate: isBootstrapAdmin ? now : '',
        endDate: isBootstrapAdmin ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : '',
        daysRemaining: isBootstrapAdmin ? 365 : 0,
        renewalCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'subscriptions', newUser.uid), newSub);

      // 4. Initialize Landing Page Document (Takaful Default)
      const newPage: LandingPage = {
        id: newUser.uid,
        userId: newUser.uid,
        slug: slug,
        title: `Perunding Takaful & Hibah Keluarga - ${data.fullName.trim()}`,
        bio: `Selamat datang ke laman rasmi perundingan Takaful. Saya sedia membantu anda merancang perlindungan Kad Perubatan, Hibah Takaful, Perlindungan Penyakit Kritikal dan simpanan masa depan secara patuh syariah.`,
        templateId: 'template1',
        colorTheme: 'green',
        status: 'Draf',
        whatsappNumber: data.phone.trim(),
        whatsappMessage: `Assalamualaikum ${data.fullName}, saya ingin dapatkan sebut harga dan konsultasi percuma pelan Takaful.`,
        isPublished: false,
        socialLinks: {
          whatsapp: data.phone.trim(),
        },
        customNotice: 'Perlindungan kewangan dan perubatan terbaik untuk ketenangan minda anda dan keluarga tersayang.',
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'landingPages', newUser.uid), newPage);

      // 5. Seed 3 Initial Core Takaful Products so agent's page is rich immediately
      try {
        const seedProducts = [
          {
            userId: newUser.uid,
            landingPageId: newUser.uid,
            title: 'Kad Perubatan VIP Hospital Swasta Tanpa Had Tahunan',
            category: 'Kad Perubatan',
            description: 'Perlindungan kemasukan hospital tanpa had tahunan, bilik penginapan peribadi, dan kemudahan kemasukan tanpa tunai (cashless) di lebih 100 hospital pakar.',
            benefits: 'Tiada ko-takaful, perlindungan rawatan kanser pesakit luar, dan perlindungan pembedahan harian.',
            priceOrTarget: 'Bermula RM90/bulan',
            actionText: 'Dapatkan Sebut Harga Kad',
            actionUrl: '',
            imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
            sortOrder: 0,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            userId: newUser.uid,
            landingPageId: newUser.uid,
            title: 'Pelan Hibah Takaful Penggantian Pendapatan Waris',
            category: 'Hibah Takaful',
            description: 'Pampasan tunai kecemasan terus kepada penama tanpa melalui proses pembahagian pusaka atau faraid yang memakan masa.',
            benefits: 'Pampasan RM250,000 - RM1,000,000, pampasan berganda kemalangan, dan pelepasan cukai pendapatan.',
            priceOrTarget: 'Bermula RM85/bulan',
            actionText: 'Kira Kelayakan Hibah',
            actionUrl: '',
            imageUrl: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=600&q=80',
            sortOrder: 1,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            userId: newUser.uid,
            landingPageId: newUser.uid,
            title: 'Pelan Perlindungan 45 Penyakit Kritikal Awal & Akhir',
            category: 'Penyakit Kritikal',
            description: 'Pampasan tunai one-off bagi menampung kos sara hidup dan rawatan alternatif sekiranya disahkan menghidap penyakit kronik seperti kanser atau serangan jantung.',
            benefits: 'Pembayaran tunai segera, penepian bayaran caruman masa hadapan (waiver of contribution).',
            priceOrTarget: 'Bermula RM75/bulan',
            actionText: 'Konsultasi Percuma',
            actionUrl: '',
            imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
            sortOrder: 2,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
        ];

        for (const p of seedProducts) {
          await addDoc(collection(db, 'products'), p);
        }
      } catch (seedErr) {
        console.warn('Seeding products notice:', seedErr);
      }

      // 6. Register Slug
      try {
        await setDoc(doc(db, 'slugs', slug), {
          id: slug,
          userId: newUser.uid,
          landingPageId: newUser.uid,
          createdAt: now,
        });
      } catch (e) {
        console.warn('Slug reservation notice:', e);
      }

      // 7. Admin Audit Log & Notification
      try {
        await addDoc(collection(db, 'adminAuditLogs'), {
          adminId: 'system',
          adminEmail: 'sistem@infaq.my',
          action: 'Pendaftaran Ejen & Slip Bayaran Dihantar',
          targetUserId: newUser.uid,
          targetUserName: data.fullName.trim(),
          details: `Ejen baru mendaftar (Pesanan ${orderId}, RM150) bersama slip bayaran. Rujukan: ${data.receiptNote || 'Tiada'}. Menunggu pengesahan admin.`,
          timestamp: now,
        });

        await addDoc(collection(db, 'notifications'), {
          userId: 'admin',
          title: 'Pendaftaran Ejen Baru (RM150)',
          message: `Ejen ${data.fullName} telah mendaftar dan memuat naik slip bayaran untuk pesanan ${orderId}. Sila semak di menu Pengesahan Bayaran.`,
          type: 'payment',
          read: false,
          createdAt: now,
        });
      } catch (logErr) {
        console.warn('Audit / Notification log notice:', logErr);
      }

      setUserProfile(newProfile);
      return { user: newUser, orderId };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reuploadReceipt = async (orderId: string, receiptUrl: string, receiptNote: string) => {
    if (!user) throw new Error('Pengguna tidak log masuk.');
    const now = new Date().toISOString();
    await setDoc(
      doc(db, 'orders', orderId),
      {
        receiptUrl,
        receiptNote: receiptNote.trim(),
        orderStatus: 'Menunggu Pengesahan',
        rejectionReason: '',
        updatedAt: now,
      },
      { merge: true }
    );

    await setDoc(
      doc(db, 'users', user.uid),
      {
        accountStatus: 'Pending',
        updatedAt: now,
      },
      { merge: true }
    );

    try {
      await addDoc(collection(db, 'adminAuditLogs'), {
        adminId: 'system',
        adminEmail: 'sistem@infaq.my',
        action: 'Slip Bayaran Dimuat Naik Semula',
        targetUserId: user.uid,
        targetUserName: userProfile?.fullName || user.displayName || 'Ejen',
        details: `Ejen telah memuat naik semula slip bayaran untuk pesanan ${orderId}. Catatan: ${receiptNote.trim() || 'Tiada'}.`,
        timestamp: now,
      });

      await addDoc(collection(db, 'notifications'), {
        userId: 'admin',
        title: 'Slip Bayaran Dimuat Naik Semula',
        message: `Ejen ${userProfile?.fullName || user.email} telah memuat naik semula slip bayaran untuk pesanan ${orderId}.`,
        type: 'payment',
        read: false,
        createdAt: now,
      });
    } catch (e) {
      console.warn('Audit log notice:', e);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setSubscription(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        subscription,
        isAdmin,
        loading,
        loginWithEmail,
        loginWithGoogle,
        registerBuyer,
        logout,
        resetPassword,
        refreshProfile,
        reuploadReceipt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
