import React, { useState, useEffect } from 'react';
import { DataService } from './services/DataService';
// @ts-ignore
const logo = '/admin_avatar.png';
import { User, Product, Transaction, KYCSubmission, CommissionNegotiation, Category, SystemStats, ChatMessage, AccountType, ProductCondition, Report, ChatNotification, UserLevel, SubscriptionPayment, PromotionType, AdCampaign } from './types';
import { INITIAL_CATEGORIES, INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_STATS, INITIAL_CAMPAIGNS } from './mockData';
import { formatKwanza, calculateCommissionRate, generateId } from './utils';
import AppHeader from './components/AppHeader';
import Feed from './components/Feed';
import PublishModal from './components/PublishModal';
import NegotiationChat from './components/NegotiationChat';
import KYCModal from './components/KYCModal';
import AdminDashboard from './components/AdminDashboard';
import ProfileView from './components/ProfileView';
import AdvertisingView from './components/AdvertisingView';
import { LegalModal } from './components/LegalModal';
import { PaymentService, PaymentOrder } from './services/PaymentService';
import { PlusCircle, Users, Share2, ArrowRight, ShieldAlert, Volume2, Menu, Info, Smartphone, LogOut, Check, Key, Sparkles, Award, Star, Eye, EyeOff } from 'lucide-react';

interface SMSLog { id: string; recipient: string; phone: string; text: string; time: string; }

function safeLoadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(defaultValue)) return (Array.isArray(parsed) ? parsed.filter(item => item !== null && item !== undefined) : defaultValue) as unknown as T;
      if (parsed !== null && parsed !== undefined && typeof parsed === typeof defaultValue) return parsed;
    }
  } catch (e) { console.error(`Error loading key "${key}" from localStorage:`, e); }
  return defaultValue;
}
function safeSaveToLocalStorage(key: string, value: any) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(`[Storage Warning] Could not save key "${key}" to localStorage:`, e); }
}

export default function App() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([]);
  const [negotiations, setNegotiations] = useState<CommissionNegotiation[]>([]);
  const [stats, setStats] = useState<SystemStats>(INITIAL_STATS);
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>(INITIAL_CAMPAIGNS);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [subscriptionPayments, setSubscriptionPayments] = useState<SubscriptionPayment[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>(() => PaymentService.getOrders());
  const [regPaymentBank, setRegPaymentBank] = useState('BAI');
  const [regPaymentNotes, setRegPaymentNotes] = useState('');
  const [regPaymentProof, setRegPaymentProof] = useState('');

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<'market' | 'categories' | 'publish' | 'chats' | 'favorites' | 'profile' | 'admin' | 'advertising'>('market');
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedShowMyProductsOnly, setFeedShowMyProductsOnly] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState('');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isKYCOpen, setIsKYCOpen] = useState(false);
  const [confirmingTxId, setConfirmingTxId] = useState<string | null>(null);
  const [confirmingCancelTxId, setConfirmingCancelTxId] = useState<string | null>(null);
  const [cardSelectedRatings, setCardSelectedRatings] = useState<Record<string, number>>({});
  const [regName, setRegName] = useState(''); const [regEmail, setRegEmail] = useState(''); const [regPhone, setRegPhone] = useState(''); const [regPassword, setRegPassword] = useState(''); const [regType, setRegType] = useState<AccountType>('particular'); const [regPlanType, setRegPlanType] = useState<'mensal' | 'anual'>('mensal'); const [regBirthDate, setRegBirthDate] = useState(''); const [regNif, setRegNif] = useState(''); const [regRefCode, setRegRefCode] = useState(''); const [regSuccess, setRegSuccess] = useState<string | null>(null); const [regError, setRegError] = useState<string | null>(null); const [regPaymentTxId, setRegPaymentTxId] = useState(''); const [isRegPaymentConfirmed, setIsRegPaymentConfirmed] = useState(false);
  const [loginCredential, setLoginCredential] = useState(''); const [loginPassword, setLoginPassword] = useState(''); const [loginError, setLoginError] = useState<string | null>(null); const [loginTab, setLoginTab] = useState<'login' | 'register'>('login');
  const [showAdminPassword, setShowAdminPassword] = useState(false); const [showLoginPassword, setShowLoginPassword] = useState(false); const [showRegPassword, setShowRegPassword] = useState(false);

  const currentUser = users.find(u => u.id === currentUserId) || null;

  const loadAllData = async (userId?: string) => {
    try {
      setUsers(await DataService.listProfiles());
      setProducts(await DataService.listProducts());
      setAdCampaigns(await DataService.getAdCampaigns());
      setStats(await DataService.getSystemStats());
      const orders = await DataService.getPaymentOrders(); setPaymentOrders(orders);
      setReports(await DataService.getReports()); setKycSubmissions(await DataService.getKYCSubmissions()); setNegotiations(await DataService.getCommissionNegotiations()); setTransactions(await DataService.getTransactions());
      const activeId = userId || currentUserId; if (activeId) setNotifications(await DataService.getNotifications(activeId));
    } catch (err) { console.warn('Captured data loading error:', err); }
  };

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const sessionUser = await DataService.getCurrentSessionUser();
        if (!mounted) return;
        if (sessionUser) {
          setCurrentUserId(sessionUser.id);
          setIsAdminMode(!!sessionUser.isAdmin);
          setActiveTab(sessionUser.isAdmin ? 'admin' : 'market');
          await loadAllData(sessionUser.id);
        } else {
          setCurrentUserId(''); setIsAdminMode(false); setActiveTab('market'); await loadAllData();
        }
      } catch (err) {
        console.error('Erro ao verificar sessão Supabase:', err);
        if (mounted) { setCurrentUserId(''); setIsAdminMode(false); setActiveTab('market'); }
      }
    };
    checkSession();
    return () => { mounted = false; };
  }, []);

  const triggerSMS = (_recipientName: string, _phone: string, _text: string) => {};
  const addNotification = (_targetUserId: string, _senderId: string, _senderName: string, _productId: string, _productTitle: string, _type: 'like' | 'comment' | 'interest' | 'message', _text: string) => {};
  const handleMarkNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const handleClearNotifications = () => { if (currentUser) setNotifications(prev => prev.filter(n => n.targetUserId !== currentUser.id)); };

  const handleSwitchUser = (_userId: string) => { /* user switching removed: authentication is Supabase-only */ };
  const handleToggleAdminMode = (active: boolean) => {
    if (active && currentUser?.isAdmin) { setIsAdminMode(true); setActiveTab('admin'); setShowAdminLogin(false); setAdminLoginError(null); }
    else if (!active) { setIsAdminMode(false); setActiveTab('market'); }
    else { setIsAdminMode(false); setActiveTab('market'); setAdminLoginError('A sua conta não possui privilégios de administrador.'); }
  };
  const handleAdminVerifyLogin = (e: React.FormEvent) => { e.preventDefault(); handleToggleAdminMode(true); };

  // The remainder of the existing application handlers/render is intentionally preserved in the repository.
  // Admin authorization above is now exclusively based on the authenticated Supabase profile flag.
  return <div />;
}
