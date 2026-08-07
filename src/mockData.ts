import { User, Product, Category, SystemStats, AdCampaign, VerificationSubmission, UserRating, Report } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'imoveis', name: 'Imóveis', label: 'Imóveis', icon: 'Home' },
  { id: 'automoveis', name: 'Automóveis', label: 'Automóveis', icon: 'Car' },
  { id: 'tecnologia', name: 'Tecnologia', label: 'Tecnologia', icon: 'Cpu' },
  { id: 'servicos', name: 'Serviços', label: 'Serviços', icon: 'Settings' },
  { id: 'agricultura', name: 'Agricultura', label: 'Agricultura', icon: 'Leaf' },
  { id: 'construcao', name: 'Construção', label: 'Construção', icon: 'Hammer' },
  { id: 'empregos', name: 'Empregos', label: 'Empregos', icon: 'Briefcase' },
  { id: 'educacao', name: 'Educação', label: 'Educação', icon: 'GraduationCap' },
  { id: 'saude', name: 'Saúde', label: 'Saúde', icon: 'HeartPulse' }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'Administrador',
    email: 'nossosnegocios.ao@gmail.com',
    phone: '+244 923 000 000',
    password: 'Valerio123#',
    accountType: 'empresa',
    referralCode: 'ADMIN001',
    referralsCount: 0,
    isVerified: true,
    isSuspended: false,
    isAdmin: true,
    avatar: '/admin_avatar.png',
    rating: 5,
    ratingsCount: 0,
    walletBalance: 0,
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_STATS: SystemStats = {
  revenuePlans: 0,
  revenuePromotions: 0,
  revenuePublicidade: 0,
  totalMonthlyRevenue: 0,
  totalYearlyRevenue: 0,
  totalUsers: 0,
  totalProfessionals: 0,
  totalCompanies: 0,
  totalAds: 0,
  totalPromotedAds: 0,
  verifiedCompanies: 0,
  verifiedUsers: 0
};

export const INITIAL_CAMPAIGNS: AdCampaign[] = [];

export const INITIAL_VERIFICATIONS: VerificationSubmission[] = [];

export const INITIAL_RATINGS: UserRating[] = [];

export const INITIAL_REPORTS: Report[] = [];
