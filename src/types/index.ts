export type UserRole = 'admin' | 'buyer';
export type AccountStatus = 'Pending' | 'Aktif' | 'Digantung' | 'Diarkibkan';
export type OrderStatus = 'Menunggu Pengesahan' | 'Diluluskan' | 'Ditolak' | 'Dibatalkan';
export type PageStatus = 'Draf' | 'Menunggu Pengesahan' | 'Diterbitkan' | 'Digantung' | 'Tamat Langganan';
export type SubscriptionStatus = 'Menunggu Bayaran' | 'Aktif' | 'Hampir Tamat' | 'Tamat' | 'Diperbaharui';

export type TemplateId = 'template1' | 'template2' | 'template3';
export type ColorTheme = 'green' | 'red' | 'blue' | 'yellow' | 'orange';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
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
  role: UserRole;
  accountStatus: AccountStatus;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLinks {
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
}

export interface ContactFormConfig {
  enabled: boolean;
  title?: string;
  subtitle?: string;
}

export interface LandingPage {
  id: string;
  userId: string;
  slug: string;
  title: string;
  bio: string;
  templateId: TemplateId;
  colorTheme: ColorTheme;
  status: PageStatus;
  whatsappNumber: string;
  whatsappMessage?: string;
  isPublished: boolean;
  socialLinks?: SocialLinks;
  customNotice?: string;
  contactForm?: ContactFormConfig;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  userId: string;
  landingPageId?: string;
  title: string;
  category: string;
  description: string;
  benefits?: string;
  priceOrTarget?: string;
  actionText: string;
  actionUrl: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  planName: string;
  amount: number;
  currency: string;
  orderStatus: OrderStatus;
  paymentMethod: string;
  receiptUrl?: string;
  receiptNote?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  orderId?: string;
  status: SubscriptionStatus;
  startDate?: string;
  endDate?: string;
  daysRemaining?: number;
  renewalCount: number;
  lastRenewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'payment' | 'account' | 'subscription' | 'landing_page' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  details: string;
  timestamp: string;
}
