export type AccountType = 'particular' | 'individual' | 'profissional' | 'empresa';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  accountType: AccountType;
  referralCode: string; // unique referral code per user
  referredByCode?: string; // code of the referrer
  referralsCount: number;
  isVerified: boolean; // KYC or Company approved
  verificationType?: 'individual' | 'empresa';
  isSuspended: boolean;
  isAdmin?: boolean;
  avatar: string;
  rating: number; // calculated from ratings list
  ratingsCount: number;
  createdAt: string;

  // Plan Details (For Profissional & Empresa)
  planStatus?: 'active' | 'expired' | 'none' | 'pending';
  planType?: 'mensal' | 'anual';
  planExpiresAt?: string;
  highlightCredits?: number; // monthly bonus highlights (e.g. 2 for professional, 5 for company)

  // Page Empresa / Profile details
  companyName?: string;
  nif?: string;
  logo?: string;
  address?: string;
  description?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;

  // Backwards compatibility fields
  walletBalance?: number;
  trustLevel?: string;
  birthDate?: string;
}

// Backwards compatibility type aliases
export type KYCSubmission = VerificationSubmission;

export interface CommissionNegotiation {
  id: string;
  userId?: string;
  userName?: string;
  productId: string;
  productTitle: string;
  price?: number;
  currentRate?: number;
  requestedRate: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  sellerId?: string;
  sellerName?: string;
  originalRate?: number;
  createdAt?: string;
}

export interface ChatNotification {
  id: string;
  title?: string;
  message?: string;
  createdAt: string;
  isRead: boolean;
  targetUserId?: string;
  type?: string;
  text?: string;
  senderId?: string;
  senderName?: string;
  productId?: string;
  productTitle?: string;
}

export type UserLevel = 'bronze' | 'silver' | 'gold' | 'diamond' | 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';

export interface Transaction {
  id: string;
  productId: string;
  productTitle: string;
  productPrice?: number;
  productImage?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  status: 'pending' | 'completed' | 'canceled' | 'simple_chat';
  createdAt: string;
  price?: number;
  commissionRate?: number;
  commissionAmount?: number;
  finalPayout?: number;
  expiresAt?: string;
  isExtended?: boolean;
  adminAssisted?: boolean;
  messages?: any[];
}

export type ProductCondition = 'novo' | 'como_novo' | 'usado';

export interface ProductComment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export type PromotionType = 'plus' | 'premium' | 'vip';

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerType: AccountType;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  likes: number;
  likedBy: string[]; // user IDs who liked it
  comments: ProductComment[];
  condition: ProductCondition;
  createdAt: string;
  
  // Promotion status
  promotionType?: PromotionType;
  promotionExpiresAt?: string;
  
  // Professional Stats (For Profissional & Empresa)
  views?: number;
  clicks?: number;
  messagesCount?: number;
  commissionRate?: number;
  isPromoted?: boolean;
  isAutoPromoted?: boolean;

  // Job specific fields (Category: 'empregos')
  jobType?: string; // e.g. 'Tempo integral', 'Part-time', 'Estágio', 'Freelancer', 'Temporário'
  workMode?: string; // e.g. 'Presencial', 'Remoto', 'Híbrido'
  location?: string; // e.g. 'Luanda, Angola'
  vacanciesCount?: number;
  responsibilities?: string;
  requirements?: string;
  desirableRequirements?: string;
  minEducation?: string;
  minExperience?: string;
  benefits?: string;
  recruiterContact?: string;
  applicationDeadline?: string;
  jobStatus?: 'Aberta' | 'Encerrada';
  companyName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  workSchedule?: string;
}

export interface JobCandidacy {
  id: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  candidateId?: string;
  name: string;
  birthDate?: string;
  gender?: string;
  phone: string;
  email: string;
  city: string;
  address?: string;
  education: string;
  fieldOfStudy: string;
  experienceYears: number;
  coverLetter: string;
  skills: string;
  availability: string;
  salaryExpectation?: string;
  portfolioUrl?: string;
  resumeFileUrl?: string;
  resumeFileName?: string;
  photoFileUrl?: string;
  photoFileName?: string;
  appliedAt: string;
  status: 'Pendente' | 'Em análise' | 'Aprovada' | 'Rejeitada';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string; // supports images in chat
  timestamp: string;
}

export interface Conversation {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  messages: ChatMessage[];
  createdAt: string;
  isReadByBuyer: boolean;
  isReadBySeller: boolean;
}

export interface VerificationSubmission {
  id: string;
  userId: string;
  userName: string;
  type?: 'individual' | 'empresa';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  rejectionReason?: string;
  // Document attachments
  idCardFront?: string;
  idCardBack?: string;
  selfie?: string;
  documentType?: string;
  documentNumber?: string;
  documentImage?: string;
  documentImageFront?: string;
  documentImageBack?: string;
  selfieImage?: string;
  // Corporate verifications
  nif?: string;
  commercialCertificate?: string;
  otherDocs?: string;
}

export interface AdCampaign {
  id: string;
  companyName: string;
  contactPhone: string;
  bannerType: 'inicial' | 'premium' | 'categoria';
  targetCategory?: string; // used when bannerType is 'categoria'
  imageUrl: string;
  linkUrl: string;
  price: number;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  durationMonths: number;
  startDate?: string;
  endDate?: string;
  bankName?: string;
  txId?: string;
  createdAt: string;
  proofImage?: string;
}

export interface UserRating {
  id: string;
  targetId: string; // userId being rated
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number; // 1 to 5 stars
  comment: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  type?: 'user' | 'company' | 'product';
  targetId?: string; // userId, companyId, or productId
  targetTitle?: string; 
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  reportedUserId?: string;
  reportedUserName?: string;
  productTitle?: string;
  productId?: string;
}

export interface SystemStats {
  revenuePlans: number;
  revenuePromotions: number;
  revenuePublicidade: number;
  totalMonthlyRevenue: number;
  totalYearlyRevenue: number;
  totalUsers: number;
  totalProfessionals: number;
  totalCompanies: number;
  totalAds: number;
  totalPromotedAds: number;
  verifiedCompanies: number;
  verifiedUsers: number;
  
  // Backwards compatibility metrics
  adminFunds?: number;
  totalCommissionCollected?: number;
  totalVolume?: number;
}

export interface Category {
  id: string;
  name: string;
  label: string;
  icon: string;
}

export interface SMSLog {
  id: string;
  recipient: string;
  phone: string;
  text: string;
  time: string;
}

export interface SubscriptionPayment {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userType: 'profissional' | 'empresa';
  planType: 'mensal' | 'anual';
  amount: number;
  bankName: string;
  txId: string;
  proofImage?: string; // base64 representation of proof
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  history: string[];
  userId?: string; // set once registered
}

