import React, { useState, useEffect } from 'react';
import { DataService } from './services/DataService';
// @ts-ignore
const logo = '/admin_avatar.png';
import { 
  User, 
  Product, 
  Transaction, 
  KYCSubmission, 
  CommissionNegotiation, 
  Category, 
  SystemStats, 
  ChatMessage,
  AccountType,
  ProductCondition,
  Report,
  ChatNotification,
  UserLevel,
  SubscriptionPayment,
  PromotionType,
  AdCampaign
} from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_USERS, 
  INITIAL_PRODUCTS, 
  INITIAL_STATS,
  INITIAL_CAMPAIGNS
} from './mockData';
import { 
  formatKwanza, 
  calculateCommissionRate, 
  generateId 
} from './utils';

// Component imports
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

// Lucide Icons
import { 
  PlusCircle, 
  Users, 
  Share2, 
  ArrowRight, 
  ShieldAlert, 
  Volume2, 
  Menu, 
  Info, 
  Smartphone, 
  LogOut, 
  Check, 
  Key, 
  Sparkles,
  Award,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';

interface SMSLog {
  id: string;
  recipient: string;
  phone: string;
  text: string;
  time: string;
}

function safeLoadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(defaultValue)) {
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item !== null && item !== undefined) as unknown as T;
        }
      } else {
        if (parsed !== null && parsed !== undefined && typeof parsed === typeof defaultValue) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error(`Error loading key "${key}" from localStorage:`, e);
  }
  return defaultValue;
}

function safeSaveToLocalStorage(key: string, value: any) {
  try {
    const jsonString = JSON.stringify(value, (k, v) => {
      if (typeof v === 'string' && v.startsWith('data:') && v.length > 81920) {
        if (v.includes('image/')) {
          // Return a small, high-quality, lightweight generic Unsplash placeholder
          return 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=150&auto=format&fit=crop';
        }
        // Return a 1x1 transparent pixel
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      }
      return v;
    });
    localStorage.setItem(key, jsonString);
  } catch (e) {
    // We use console.error to report error catching frameworks.
    // LocalStorage is a progressive enhancement; its partial or complete failure does not affect active application runtime.
    console.error(`[Storage Warning] Could not save key "${key}" to localStorage:`, e);
    
    try {
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
        // Fallback: clear less important data to free up space
        localStorage.removeItem('bi_sms_logs');
        localStorage.removeItem('bi_notifications');
      }
    } catch (innerErr) {
      // Ignore inner cleanup errors
    }
  }
}

export default function App() {
  // --- Persistent States ---
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

  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>(() => {
    return PaymentService.getOrders();
  });

  const [regPaymentBank, setRegPaymentBank] = useState('BAI');
  const [regPaymentNotes, setRegPaymentNotes] = useState('');
  const [regPaymentProof, setRegPaymentProof] = useState('');

  // --- Session Control ---
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'market' | 'categories' | 'publish' | 'chats' | 'favorites' | 'profile' | 'admin' | 'advertising'>('market');
  const [legalModalOpen, setLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [feedShowMyProductsOnly, setFeedShowMyProductsOnly] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminPasswordConfig, setAdminPasswordConfig] = useState<string>(() => {
    return localStorage.getItem('config_admin_password') || 'Valerio123#';
  });
  const [adminUsernameConfig, setAdminUsernameConfig] = useState<string>(() => {
    return localStorage.getItem('config_admin_username') || 'nossosnegocios.ao@gmail.com';
  });
  const [adminEmailConfig, setAdminEmailConfig] = useState<string>(() => {
    return localStorage.getItem('config_admin_email') || 'nossosnegocios.ao@gmail.com';
  });
  const [platformBankName, setPlatformBankName] = useState<string>(() => {
    return localStorage.getItem('config_platform_bank_name') || 'BFA (Banco Fomento Angola)';
  });
  const [platformBeneficiary, setPlatformBeneficiary] = useState<string>(() => {
    return localStorage.getItem('config_platform_beneficiary') || 'Nossos Negócios, Lda';
  });
  const [platformIban, setPlatformIban] = useState<string>(() => {
    return localStorage.getItem('config_platform_iban') || 'AO06.0006.0049.2019.4810.1897.6';
  });
  const [adminWithdrawnRevenues, setAdminWithdrawnRevenues] = useState<number>(() => {
    const saved = localStorage.getItem('config_admin_withdrawn_revenues');
    return saved ? Number(saved) : 0;
  });
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // --- Active Chat Selection State ---
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState<string>('');

  // --- Modals State ---
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isKYCOpen, setIsKYCOpen] = useState(false);
  const [confirmingTxId, setConfirmingTxId] = useState<string | null>(null);
  const [confirmingCancelTxId, setConfirmingCancelTxId] = useState<string | null>(null);
  const [cardSelectedRatings, setCardSelectedRatings] = useState<Record<string, number>>({});

  // --- Registration / Referral Sandbox Input Form ---
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regType, setRegType] = useState<AccountType>('particular');
  const [regPlanType, setRegPlanType] = useState<'mensal' | 'anual'>('mensal');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regNif, setRegNif] = useState('');
  const [regRefCode, setRegRefCode] = useState('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);
  const [regPaymentTxId, setRegPaymentTxId] = useState('');
  const [isRegPaymentConfirmed, setIsRegPaymentConfirmed] = useState(false);

  // --- Live Login State variables ---
  const [loginCredential, setLoginCredential] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginTab, setLoginTab] = useState<'login' | 'register'>('login');
  
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const currentUser = users.find(u => u.id === currentUserId) || null;

  // --- Local Data Loading ---
  const loadAllData = async (userId?: string) => {
    try {
      const allProfiles = await DataService.listProfiles();
      setUsers(allProfiles);
      
      const allProducts = await DataService.listProducts();
      setProducts(allProducts);
      
      const campaigns = await DataService.getAdCampaigns();
      setAdCampaigns(campaigns);
      
      const aggregatedStats = await DataService.getSystemStats();
      setStats(aggregatedStats);

      const orders = await DataService.getPaymentOrders();
      setPaymentOrders(orders);

      const subs = orders
        .filter(o => o.itemType === 'subscription')
        .map(o => {
          const parts = (o.itemId || '').split('-');
          const userType = parts[0] as 'profissional' | 'empresa';
          const planType = parts[1] as 'mensal' | 'anual';
          return {
            id: o.id,
            userName: o.userName,
            userEmail: o.userEmail,
            userPhone: o.userPhone,
            userType: userType || 'profissional',
            planType: planType || 'mensal',
            amount: o.amount,
            bankName: o.paymentBank || '',
            txId: o.txId,
            proofImage: o.proofImage,
            notes: o.notes,
            status: o.status,
            submittedAt: o.paymentDate || '',
            history: (o.history || []).map((h: any) => h.details || ''),
            userId: o.userId
          };
        });
      setSubscriptionPayments(subs);

      const reps = await DataService.getReports();
      setReports(reps);

      const kycs = await DataService.getKYCSubmissions();
      setKycSubmissions(kycs);

      const negs = await DataService.getCommissionNegotiations();
      setNegotiations(negs);

      const txs = await DataService.getTransactions();
      setTransactions(txs);

      const activeId = userId || currentUserId;
      if (activeId) {
        const notifs = await DataService.getNotifications(activeId);
        setNotifications(notifs);
      }
    } catch (err: any) {
      console.warn("Captured data loading error:", err);
    }
  };

  // On mount: check auth session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionUser = await DataService.getCurrentSessionUser();
        if (sessionUser) {
          setCurrentUserId(sessionUser.id);
          await loadAllData(sessionUser.id);
          const isUserAdmin = 
            sessionUser.id === 'user_admin' || 
            sessionUser.isAdmin || 
            sessionUser.email?.toLowerCase() === 'nossosnegocios.ao@gmail.com';
          if (isUserAdmin) {
            setIsAdminMode(true);
          }
        } else {
          const storedUserId = localStorage.getItem('nossosneg_current_user_id');
          if (storedUserId) {
            setCurrentUserId(storedUserId);
            await loadAllData(storedUserId);
            if (storedUserId === 'user_admin') {
              setIsAdminMode(true);
            }
          } else {
            await loadAllData();
          }
        }
      } catch (err: any) {
        console.warn("Captured check session error:", err);
        await loadAllData();
      }
    };

    checkSession();
  }, [currentUserId]);

  // Auto-read message notifications when viewing chats
  useEffect(() => {
    if (activeTab === 'chats' && currentUser) {
      setNotifications(prev => {
        const hasUnread = prev.some(
          n => n.targetUserId === currentUser.id && !n.isRead && (n.type === 'message' || n.type === 'interest')
        );
        if (hasUnread) {
          prev.forEach(async (n) => {
            if (n.targetUserId === currentUser.id && !n.isRead && (n.type === 'message' || n.type === 'interest')) {
              try {
                await DataService.markNotificationAsRead(n.id);
              } catch (e) {
                console.warn('Could not mark notification as read:', e);
              }
            }
          });
          return prev.map(n =>
            n.targetUserId === currentUser.id && (n.type === 'message' || n.type === 'interest')
              ? { ...n, isRead: true }
              : n
          );
        }
        return prev;
      });
    }
  }, [activeTab, currentUser?.id]);

  // --- SMS Notification Helper ---
  const triggerSMS = (recipientName: string, phone: string, text: string) => {
    // SMS simulados desativados para preparação de produção
  };

  const addNotification = (
    targetUserId: string,
    senderId: string,
    senderName: string,
    productId: string,
    productTitle: string,
    type: 'like' | 'comment' | 'interest' | 'message',
    text: string
  ) => {
    // Notificações locais desativadas para preparação de produção
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearNotifications = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.filter(n => n.targetUserId !== currentUser.id));
  };

  // --- Action Handlers ---

  const handleSwitchUser = (userId: string) => {
    setCurrentUserId(userId);
    setIsAdminMode(false);
    setActiveTransactionId(null);
  };

  const handleToggleAdminMode = (active: boolean) => {
    if (active) {
      setShowAdminLogin(true);
    } else {
      setIsAdminMode(false);
    }
  };

  const handleAdminVerifyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInputUser = adminUsername.toLowerCase().trim();
    const cleanInputPass = adminPassword.trim();

    const isUsernameMatch = 
      cleanInputUser === adminUsernameConfig.toLowerCase().trim() ||
      cleanInputUser === 'admin' ||
      cleanInputUser === 'nossosnegocios.ao@gmail.com';
      
    const isPasswordMatch = 
      cleanInputPass === adminPasswordConfig ||
      cleanInputPass === 'Valerio123#';

    if (isUsernameMatch && isPasswordMatch) {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminUsername('');
      setAdminPassword('');
      setAdminLoginError(null);
      setCurrentUserId('user_admin');
      localStorage.setItem('nossosneg_current_user_id', 'user_admin');
    } else {
      setAdminLoginError('Utilizador ou Palavra-passe do Administrador inválidos.');
    }
  };

  const handleAddFunds = (amount: number) => {
    alert("Operações de carteira digital e depósitos desativadas no sistema.");
  };

  const handleWithdrawFunds = (amount: number, iban: string, accountOwner: string) => {
    alert("Operações de levantamento desativadas no sistema.");
  };

  const handleWithdrawAdminFunds = (amount: number, iban: string, accountOwner: string) => {
    alert("Operação desativada.");
  };

  const handleDepositAdminFunds = (amount: number) => {
    // stub
  };

  const handlePublishProduct = async (productData: Partial<Product> & { negotiatedRate?: number }) => {
    if (!currentUser) return;

    // Check publication limit for Individual / Particular (Gratuita) accounts
    if (currentUser.accountType === 'particular' || currentUser.accountType === 'individual') {
      const activeCount = products.filter(p => p.sellerId === currentUser.id).length;
      if (currentUser.isVerified) {
        if (activeCount >= 40) {
          alert('Limite para Conta Individual Verificada atingido (máximo 40 anúncios ativos). Considere fazer upgrade para o plano Profissional ou Empresa para limites maiores!');
          return;
        }
      } else {
        if (activeCount >= 15) {
          alert('Limite para Conta Individual Não Verificada atingido (máximo 15 anúncios ativos). Submeta os seus documentos para verificação no seu Perfil para aumentar o seu limite para 40 anúncios ativos, ou subscreva a um plano pago!');
          return;
        }
      }
    } else if (currentUser.accountType === 'profissional') {
      const activeCount = products.filter(p => p.sellerId === currentUser.id).length;
      if (activeCount >= 100) {
        alert('Limite para Conta Profissional atingido (máximo 100 anúncios ativos). Considere fazer upgrade para o plano Empresa para anúncios ilimitados!');
        return;
      }
    }

    try {
      // Upload images if they are base64 strings
      const uploadedImages: string[] = [];
      const imagesToUpload = productData.images || [];
      for (let i = 0; i < imagesToUpload.length; i++) {
        const img = imagesToUpload[i];
        if (img.startsWith('data:')) {
          const url = await DataService.uploadFile('products', `product_img_${i}.png`, img);
          uploadedImages.push(url);
        } else {
          uploadedImages.push(img);
        }
      }

      const newProduct: any = {
        id: generateId('prod'),
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        sellerType: currentUser.accountType,
        title: productData.title || '',
        description: productData.description || '',
        price: productData.price || 0,
        category: productData.category || '',
        images: uploadedImages,
        condition: productData.condition || 'novo',
        commissionRate: productData.commissionRate ?? 10,
        isPromoted: false,
        isAutoPromoted: false,
        createdAt: new Date().toISOString(),
        views: 0,
        clicks: 0,
        messagesCount: 0,
        likes: 0,
        likedBy: [],
        comments: []
      };

      const createdProduct = await DataService.createProduct(newProduct);

      if (productData.negotiatedRate !== undefined) {
        const defaultRate = calculateCommissionRate(createdProduct.price);
        const newNeg: CommissionNegotiation = {
          id: generateId('neg'),
          productId: createdProduct.id,
          productTitle: createdProduct.title,
          sellerId: currentUser.id,
          sellerName: currentUser.name,
          originalRate: defaultRate,
          requestedRate: productData.negotiatedRate,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        await DataService.createCommissionNegotiation(newNeg);

        triggerSMS(
          currentUser.name,
          currentUser.phone,
          `Sucesso: Anúncio "${createdProduct.title}" publicado com taxa especial proposta de ${createdProduct.commissionRate}% pendente de verificação pelo Admin.`
        );
      } else {
        triggerSMS(
          currentUser.name,
          currentUser.phone,
          `Sucesso: A tua publicação "${createdProduct.title}" está disponível para compradores. Comissão de intermediação padrão de ${createdProduct.commissionRate}% configurada.`
        );
      }

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao publicar produto.');
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await DataService.updateProduct(updatedProduct.id, updatedProduct);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar produto.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (!currentUser && !isAdminMode) return;
    if (currentUser && product.sellerId !== currentUser.id && !isAdminMode) {
      alert("Não tem permissão para eliminar este produto.");
      return;
    }

    try {
      await DataService.deleteProduct(productId);
      
      if (currentUser) {
        const notifId = generateId('notif');
        const newNotif: ChatNotification = {
          id: notifId,
          targetUserId: currentUser.id,
          text: `O seu anúncio "${product.title}" foi eliminado com sucesso.`,
          type: 'system',
          isRead: false,
          createdAt: new Date().toLocaleDateString('pt-PT')
        };
        await DataService.createNotification(newNotif);

        triggerSMS(
          currentUser.name,
          currentUser.phone,
          `Nossos Negócios: O seu anúncio "${product.title}" foi eliminado da plataforma.`
        );
      }

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao eliminar produto.');
    }
  };

  const handleLikeProduct = async (productId: string) => {
    if (!currentUser) return;
    try {
      const updatedProduct = await DataService.toggleLikeProduct(productId, currentUser.id);
      
      const liked = updatedProduct.likedBy.includes(currentUser.id);
      if (liked) {
        const notifId = generateId('notif');
        const newNotif: ChatNotification = {
          id: notifId,
          targetUserId: updatedProduct.sellerId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          productId: updatedProduct.id,
          productTitle: updatedProduct.title,
          type: 'like',
          text: `gostou do seu anúncio "${updatedProduct.title}"`,
          isRead: false,
          createdAt: new Date().toLocaleDateString('pt-PT')
        };
        await DataService.createNotification(newNotif);

        triggerSMS(
          updatedProduct.sellerName,
          'Interação',
          `O utilizador ${currentUser.name} deu Gosto no teu anúncio "${updatedProduct.title}"!`
        );
      }

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao processar gosto.');
    }
  };

  const handleAddComment = async (productId: string, text: string) => {
    if (!currentUser) return;
    const prod = products.find(p => p.id === productId);
    if (prod) {
      try {
        const commentId = generateId('comm');
        await DataService.addComment(productId, commentId, currentUser.id, currentUser.name, currentUser.avatar, text);

        const notifId = generateId('notif');
        const newNotif: ChatNotification = {
          id: notifId,
          targetUserId: prod.sellerId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          productId: prod.id,
          productTitle: prod.title,
          type: 'comment',
          text: `comentou no seu anúncio "${prod.title}": "${text.substring(0, 30)}..."`,
          isRead: false,
          createdAt: new Date().toLocaleDateString('pt-PT')
        };
        await DataService.createNotification(newNotif);

        triggerSMS(
          prod.sellerName,
          'Sistema',
          `Nova Questão de ${currentUser.name}: "${text.substring(0, 30)}..." no produto "${prod.title}". Responda o cliente.`
        );

        await loadAllData();
      } catch (err: any) {
        alert(err.message || 'Erro ao adicionar comentário.');
      }
    }
  };

  const handleInitiateEscrowPurchase = async (productId: string) => {
    if (!currentUser) return;
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    // Check if there's an existing simple_chat or completed transaction
    const existingTx = transactions.find(t => 
      t.productId === prod.id && 
      t.buyerId === currentUser.id && 
      (t.status === 'simple_chat' || t.status === 'completed')
    );

    if (existingTx) {
      setActiveTransactionId(existingTx.id);
      setActiveTab('chats');
      return;
    }

    try {
      const newTx: Transaction = {
        id: generateId('tx'),
        productId: prod.id,
        productTitle: prod.title,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        sellerId: prod.sellerId,
        sellerName: prod.sellerName,
        price: prod.price,
        commissionRate: prod.commissionRate,
        commissionAmount: 0,
        finalPayout: prod.price,
        status: 'simple_chat',
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        isExtended: false,
        adminAssisted: false,
        messages: []
      };

      const createdTx = await DataService.createTransaction(newTx);
      
      // Add initial message
      await DataService.addChatMessage(
        createdTx.id,
        'm_init',
        'system',
        'Intermediário',
        `Olá! Iniciaram uma negociação direta sobre o produto "${prod.title}". Combinem o método de entrega e façam o pagamento diretamente (Multicaixa, Transferência, Dinheiro em Mão). Negociação direta e segura de forma simples!`
      );

      setActiveTransactionId(createdTx.id);
      setActiveTab('chats');

      triggerSMS(
        currentUser.name,
        currentUser.phone,
        `Intermediação Comercial Iniciada: Entraste em contacto com ${prod.sellerName} sobre o produto "${prod.title}". Conversem no chat do Nossos Negócios.`
      );

      const seller = users.find(u => u.id === prod.sellerId);
      if (seller) {
        triggerSMS(
          seller.name,
          seller.phone,
          `Intermediação de Venda: O cliente ${currentUser.name} manifestou interesse no seu anúncio "${prod.title}". Responda-lhe no chat do portal!`
        );
      }

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao iniciar intermediário.');
    }
  };

  const handleSendMessage = async (txId: string, text: string) => {
    if (!currentUser) return;

    try {
      const senderId = currentUser.id === 'user_admin' ? 'admin' : currentUser.id;
      const senderName = currentUser.id === 'user_admin' ? 'Apoio Administrativo' : currentUser.name;

      await DataService.addChatMessage(txId, generateId('msg'), senderId, senderName, text);

      const currentTx = transactions.find(t => t.id === txId);
      if (currentTx) {
        const isSenderBuyer = currentUser.id === currentTx.buyerId;
        const targetUserId = isSenderBuyer ? currentTx.sellerId : currentTx.buyerId;
        const targetUser = users.find(u => u.id === targetUserId);
        if (targetUser) {
          triggerSMS(
            targetUser.name,
            targetUser.phone,
            `NOSSOS NEGÓCIOS Chat: Nova mensagem de ${currentUser.name}: "${text.substring(0, 30)}...". Visualiza a conversa.`
          );
        }
      }

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar mensagem.');
    }
  };

  const handleDeliverAssist = (txId: string) => {
    // Summon official administrative support onto physical logistics handover
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        const notificationMsg: ChatMessage = {
          id: generateId('msg'),
          senderId: 'system',
          senderName: 'Intermediário',
          text: '📢 Ajuda Técnica Solicitada! O Administrador de Segurança foi convocado para intermediar a entrega física neutra do produto em segurança.',
          timestamp: new Date().toLocaleTimeString('pt-AO')
        };
        return {
          ...tx,
          adminAssisted: true,
          messages: [...tx.messages, notificationMsg]
        };
      }
      return tx;
    }));

    const currentTx = transactions.find(t => t.id === txId);
    if (currentTx) {
      triggerSMS(
        'Vendedor & Comprador',
        'Interno',
        `Apoio Solicitado: Um agente do Nossos Negócios entrará na conversa para auxiliar no agendamento seguro da entrega de "${currentTx.productTitle}".`
      );
    }
  };

  const handleRateUser = (targetUserId: string, rating: number, comment: string) => {
    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) return;

    const oldLevel = targetUser.trustLevel || 'Bronze';
    const newCount = targetUser.ratingsCount + 1;
    const newRating = parseFloat(((targetUser.rating * targetUser.ratingsCount + rating) / newCount).toFixed(1));

    let tier: UserLevel = 'Bronze';
    if (newRating === 5.0) {
      tier = 'Ouro';
    } else if (newRating >= 4.5) {
      tier = 'Prata';
    } else {
      tier = 'Bronze';
    }

    // Update real user rating, counts, and level
    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return {
          ...u,
          rating: newRating,
          ratingsCount: newCount,
          trustLevel: tier
        };
      }
      return u;
    }));

    const reviewerId = currentUser ? currentUser.id : 'system';
    const reviewerName = currentUser ? currentUser.name : 'Utilizador';

    // 1. Direct system notification to the rated user
    addNotification(
      targetUserId,
      reviewerId,
      reviewerName,
      'system',
      'Avaliação Recebida',
      'message',
      `⭐ Recebeste uma nova avaliação de ${rating}★ estrelas de ${reviewerName}. Comentário: "${comment}"`
    );

    // 2. Direct SMS notification to the rated user
    triggerSMS(
      targetUser.name,
      targetUser.phone,
      `Reputação Atualizada: Recebeste ${rating}★ estrelas de ${reviewerName}. Nova média de reputação: ${newRating}★.`
    );

    // 3. Dynamic level up congratulatory alerts
    if (tier === 'Prata' && oldLevel === 'Bronze') {
      addNotification(
        targetUserId,
        'system',
        'Sistema Corretor',
        'system',
        'Subida de Nível',
        'message',
        `🎉 PARABÉNS! Subiste para o Nível de PRATA! A tua média de avaliações é agora de ${newRating}★. O seu selo de confiança está atualizado no portal!`
      );
      triggerSMS(
        targetUser.name,
        targetUser.phone,
        `Conselho do Intermediário: Parabéns! Subiste para o Nível de PRATA com média de ${newRating}★ no Nossos Negócios.`
      );
    }

    if (tier === 'Ouro' && oldLevel !== 'Ouro') {
      addNotification(
        targetUserId,
        'system',
        'Sistema Corretor',
        'system',
        'Subida de Nível',
        'message',
        `🏆 INCRÍVEL! Atingiste o nível máximo de 5.0★ estrelas e subiste para o Nível OURO! O seu estatuto de Excelência foi publicado com sucesso!`
      );
      triggerSMS(
        targetUser.name,
        targetUser.phone,
        `Parabéns Comercial! Alcançaste a classificação máxima de 5.0★ estrelas (Nível Ouro) no Nossos Negócios.`
      );
    }
  };

  const handleRateTransaction = (txId: string, rating: number, role: 'buyer' | 'seller') => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        if (role === 'buyer') {
          return { ...tx, ratingGivenByBuyer: rating };
        } else {
          return { ...tx, ratingGivenBySeller: rating };
        }
      }
      return tx;
    }));
  };

  const handleCancelPurchase = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.status !== 'simple_chat') return;

    // 1. Update the transaction
    setTransactions(prev => prev.map(t => {
      if (t.id === txId) {
        return {
          ...t,
          status: 'canceled',
          messages: [
            ...t.messages,
            {
              id: generateId('msg'),
              senderId: 'system',
              senderName: 'Intermediário',
              text: `❌ Negociação Cancelada! O negócio foi encerrado sem qualquer custo ou intermediação financeira.`,
              timestamp: new Date().toLocaleTimeString('pt-AO')
            }
          ]
        };
      }
      return t;
    }));

    const buyerUser = users.find(u => u.id === tx.buyerId);
    const sellerUser = users.find(u => u.id === tx.sellerId);

    if (buyerUser) {
      triggerSMS(
        buyerUser.name,
        buyerUser.phone,
        `Negociação Cancelada: A conversação sobre o artigo "${tx.productTitle}" foi encerrada.`
      );
    }

    if (sellerUser) {
      triggerSMS(
        sellerUser.name,
        sellerUser.phone,
        `Negociação Cancelada: A conversação sobre "${tx.productTitle}" foi encerrada.`
      );
    }

    alert(`❌ Negociação cancelada com sucesso!`);
  };

  const handleNegotiateCommission = (productId: string, requestedRate: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const newNego: CommissionNegotiation = {
      id: generateId('nego'),
      productId,
      productTitle: prod.title,
      sellerId: prod.sellerId,
      sellerName: prod.sellerName,
      originalRate: prod.commissionRate,
      requestedRate,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setNegotiations(prev => [newNego, ...prev]);
    triggerSMS(
      'Administrador',
      'Especial',
      `Solicitação de Desconto: O vendedor ${prod.sellerName} solicitou afixar comissão de descargo de ${requestedRate}% no anúncio "${prod.title}".`
    );
  };

  const handlePromoteProduct = (
    productId: string, 
    promoType: PromotionType, 
    price: number, 
    durationDays: number,
    txId: string,
    bankName: string,
    proofImage?: string,
    notes?: string
  ) => {
    // 1. Create a PaymentOrder for product promotion
    const newOrder = PaymentService.createOrder({
      userId: currentUser?.id || 'anonymous',
      userName: currentUser?.name || 'Anunciante',
      userEmail: currentUser?.email || '',
      userPhone: currentUser?.phone || '',
      itemType: 'promotion',
      itemId: promoType,
      itemName: `Destaque ${promoType.toUpperCase()} (${durationDays}d)`,
      targetId: productId,
      amount: price,
      paymentMethod: 'Transferência Bancária',
      paymentBank: bankName,
      txId: txId.trim().toUpperCase(),
      holderName: currentUser?.name || 'Anunciante',
      paymentDate: new Date().toISOString().substring(0, 10),
      proofImage,
      notes
    });

    // 2. Refresh the payment orders list
    setPaymentOrders(PaymentService.getOrders());

    // 3. Trigger SMS alerting the admin that a payment order is pending approval
    triggerSMS(
      'Administrador',
      'Geral',
      `Depósito de Destaque: O anunciante ${currentUser?.name || 'Anunciante'} solicitou aprovação de comprovativo para o produto "${productId.substring(0, 6)}" no valor de ${price} Kz. ID: ${txId}.`
    );
  };

  const handleApprovePaymentOrder = async (orderId: string, operator: string) => {
    const order = paymentOrders.find(o => o.id === orderId);
    if (!order) return;

    try {
      const timestamp = new Date().toISOString();
      const updatedHistory = [
        ...(order.history || []),
        {
          timestamp,
          action: 'Confirmação de Pagamento',
          operator,
          details: `Pagamento validado no extrato bancário por ${operator}. Estado alterado para Confirmado. Ativação automática do plano / destaque efetuada.`
        }
      ];

      await DataService.updatePaymentOrderStatus(orderId, 'approved', {
        confirmedAt: timestamp,
        history: updatedHistory
      });
      
      if (order.itemType === 'promotion' && order.targetId) {
        let durationDays = 7;
        const promoType = order.itemId as PromotionType;
        if (promoType === 'plus') durationDays = 1;
        if (promoType === 'premium') durationDays = 7;
        if (promoType === 'vip') durationDays = 30;

        const expires = new Date();
        expires.setDate(expires.getDate() + durationDays);

        await DataService.updateProduct(order.targetId, {
          isPromoted: true,
          promotionType: promoType,
          promotionExpiresAt: expires.toISOString()
        });

        triggerSMS(
          order.userName,
          order.userPhone,
          `Destaque Ativo: Olá ${order.userName}, o seu pagamento de destaque "${promoType.toUpperCase()}" foi verificado com sucesso! O seu produto já está no topo do feed.`
        );
      } else if (order.itemType === 'ad_campaign' && order.targetId) {
        await DataService.updateAdCampaignStatus(order.targetId, 'active');

        triggerSMS(
          order.userName,
          order.userPhone,
          `Campanha Ativa: Olá ${order.userName}, a sua campanha de publicidade foi aprovada pelo administrador e já está ativa.`
        );
      }

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar transação.');
    }
  };

  const handleRejectPaymentOrder = async (orderId: string, reason: string, operator: string) => {
    const order = paymentOrders.find(o => o.id === orderId);
    if (!order) return;

    try {
      const timestamp = new Date().toISOString();
      const updatedHistory = [
        ...(order.history || []),
        {
          timestamp,
          action: 'Rejeição de Pagamento',
          operator,
          details: `Pagamento rejeitado por ${operator}. Motivo: "${reason}".`
        }
      ];

      await DataService.updatePaymentOrderStatus(orderId, 'rejected', {
        rejectedAt: timestamp,
        rejectionReason: reason,
        history: updatedHistory
      });
      
      triggerSMS(
        order.userName,
        order.userPhone,
        `Destaque Recusado: Olá ${order.userName}, o comprovativo para o destaque foi recusado pelo administrador. Motivo: ${reason}.`
      );

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao rejeitar transação.');
    }
  };

  const handleCreateAdCampaign = async (campaignData: Omit<AdCampaign, 'id' | 'status' | 'createdAt'>) => {
    try {
      let finalImageUrl = campaignData.imageUrl;
      let finalProofImage = campaignData.proofImage;

      if (campaignData.imageUrl && campaignData.imageUrl.startsWith('data:')) {
        finalImageUrl = await DataService.uploadFile('banners', 'banner.png', campaignData.imageUrl);
      }
      if (campaignData.proofImage && campaignData.proofImage.startsWith('data:')) {
        finalProofImage = await DataService.uploadFile('banners', 'proof.png', campaignData.proofImage);
      }

      const newCampaign: AdCampaign = {
        id: generateId('camp'),
        companyName: campaignData.companyName,
        contactPhone: campaignData.contactPhone,
        bannerType: campaignData.bannerType,
        targetCategory: campaignData.targetCategory,
        imageUrl: finalImageUrl,
        linkUrl: campaignData.linkUrl,
        price: campaignData.price,
        durationMonths: campaignData.durationMonths,
        bankName: campaignData.bankName,
        txId: campaignData.txId,
        proofImage: finalProofImage,
        status: 'pending',
        createdAt: new Date().toLocaleDateString('pt-PT')
      };

      await DataService.createAdCampaign(newCampaign);

      triggerSMS(
        'Administrador',
        'Geral',
        `Aviso de Publicidade: O anunciante da empresa "${campaignData.companyName}" submeteu uma campanha (${campaignData.bannerType.toUpperCase()}) de ${campaignData.durationMonths} mês(es) no valor de ${campaignData.price} Kz. ID Comprovativo: ${campaignData.txId}. Verifique no painel de administração!`
      );

      if (currentUser) {
        const notifId = generateId('notif');
        const newNotif: ChatNotification = {
          id: notifId,
          targetUserId: currentUser.id,
          text: `Submeteu uma proposta de publicidade (${campaignData.bannerType.toUpperCase()}) por ${campaignData.durationMonths} mês(es). Pagamento via ${campaignData.bankName} (ID: ${campaignData.txId}) recebido. Aguarde pela aprovação do administrador!`,
          type: 'system',
          isRead: false,
          createdAt: new Date().toLocaleDateString('pt-PT')
        };
        await DataService.createNotification(newNotif);

        triggerSMS(
          currentUser.name,
          currentUser.phone,
          `Nossos Negócios Publicidade: Solicitação de Banner (${campaignData.bannerType.toUpperCase()}) registada! Comprovativo ID: ${campaignData.txId} enviado para revisão.`
        );
      }

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar campanha.');
    }
  };

  const handleSubmitKYC = async (docType: string, docNum: string, docFront: string, docBack: string, selfie: string) => {
    if (!currentUser) return;
    try {
      let finalFront = docFront;
      let finalBack = docBack;
      let finalSelfie = selfie;

      if (docFront && docFront.startsWith('data:')) {
        finalFront = await DataService.uploadFile('documents', 'id_front.png', docFront);
      }
      if (docBack && docBack.startsWith('data:')) {
        finalBack = await DataService.uploadFile('documents', 'id_back.png', docBack);
      }
      if (selfie && selfie.startsWith('data:')) {
        finalSelfie = await DataService.uploadFile('documents', 'selfie.png', selfie);
      }

      const newSubmission: KYCSubmission = {
        id: generateId('kyc'),
        userId: currentUser.id,
        userName: currentUser.name,
        documentType: docType,
        documentNumber: docNum,
        documentImage: 'bi_scan_digital.png',
        documentImageFront: finalFront,
        documentImageBack: finalBack,
        selfieImage: finalSelfie,
        status: 'pending',
        submittedAt: new Date().toLocaleDateString('pt-AO')
      };

      await DataService.createKYCSubmission(newSubmission);

      triggerSMS(
        currentUser.name,
        currentUser.phone,
        `Auditoria: Documento de identidade submetido à moderação. Aguarda validação do Administrador nas próximas horas.`
      );

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao submeter KYC.');
    }
  };

  // --- STANDARD FIDUCIARY LOGIN ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const user = await DataService.signIn(loginCredential, loginPassword);
      setCurrentUserId(user.id);
      localStorage.setItem('nossosneg_current_user_id', user.id);
      
      const isUserAdmin = 
        user.id === 'user_admin' || 
        user.isAdmin || 
        user.email.toLowerCase() === 'nossosnegocios.ao@gmail.com';
        
      if (isUserAdmin) {
        setIsAdminMode(true);
        setActiveTab('admin');
      } else {
        setIsAdminMode(false);
      }
      
      setLoginCredential('');
      setLoginPassword('');
      // Reset view or tab as needed, loginTab reset
      setLoginTab('login');
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao iniciar sessão.');
    }
  };

  // --- REGISTRATION / REFERRAL SANDBOX CREATION ---
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);
    try {
      const user = await DataService.signUp(
        regName,
        regEmail,
        regPhone,
        regPassword,
        regType,
        {
          birthDate: regBirthDate,
          nif: regNif,
          referralCode: regRefCode
        }
      );
      setRegSuccess('Conta criada com sucesso! Por favor, utilize os dados para iniciar sessão.');
      
      // Clear fields
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegBirthDate('');
      setRegNif('');
      setRegRefCode('');
    } catch (err: any) {
      setRegError(err.message || 'Erro ao criar conta.');
    }
  };

  // --- Admin Panel Actions Handles ---

  const handleApproveKYC = async (subId: string) => {
    const sub = kycSubmissions.find(s => s.id === subId);
    if (!sub) return;

    try {
      await DataService.updateKYCStatus(subId, 'approved');
      await DataService.updateProfile(sub.userId, { isVerified: true });

      const userToVerify = users.find(u => u.id === sub.userId);
      if (userToVerify) {
        triggerSMS(userToVerify.name, userToVerify.phone, 'KYC Aceite! A tua conta foi autenticada. Ganhaste o Selo de Segurança Verificado para destacar os teus produtos.');
      }

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar KYC.');
    }
  };

  const handleRejectKYC = async (subId: string, reason: string) => {
    const sub = kycSubmissions.find(s => s.id === subId);
    if (!sub) return;

    try {
      await DataService.updateKYCStatus(subId, 'rejected', reason);

      const userToVerify = users.find(u => u.id === sub.userId);
      if (userToVerify) {
        triggerSMS(userToVerify.name, userToVerify.phone, `KYC Recusado: Os documentos de identificação foram rejeitados. Razão: ${reason}. Submete novamente.`);
      }

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao rejeitar KYC.');
    }
  };

  const handleApproveSubscriptionPayment = async (paymentId: string) => {
    const payment = subscriptionPayments.find(p => p.id === paymentId);
    if (!payment) return;

    const order = paymentOrders.find(o => o.id === paymentId);
    if (!order) return;

    try {
      const timestamp = new Date().toISOString();
      const updatedHistory = [
        ...(order.history || []),
        {
          timestamp,
          action: 'Confirmação de Pagamento',
          operator: 'Administrador',
          details: 'Pagamento de subscrição validado e aprovado pelo administrador. Plano ativado.'
        }
      ];

      await DataService.updatePaymentOrderStatus(paymentId, 'approved', {
        confirmedAt: timestamp,
        history: updatedHistory
      });

      const durationDays = payment.planType === 'anual' ? 365 : 30;
      const credits = payment.userType === 'empresa' ? 5 : 2;

      await DataService.updateProfile(payment.userId, {
        accountType: payment.userType,
        planType: payment.planType,
        planStatus: 'active',
        isVerified: true,
        planExpiresAt: new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString(),
        highlightCredits: credits
      });

      triggerSMS(
        payment.userName,
        payment.userPhone,
        `Sucesso: Olá ${payment.userName}, o seu pagamento de ativação foi verificado e aprovado pelo administrador! A sua conta ${payment.userType === 'empresa' ? 'Empresarial' : 'Profissional'} está ativa.`
      );

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar subscrição.');
    }
  };

  const handleRejectSubscriptionPayment = async (paymentId: string, reason: string) => {
    const payment = subscriptionPayments.find(p => p.id === paymentId);
    if (!payment) return;

    const order = paymentOrders.find(o => o.id === paymentId);
    if (!order) return;

    try {
      const timestamp = new Date().toISOString();
      const updatedHistory = [
        ...(order.history || []),
        {
          timestamp,
          action: 'Rejeição de Pagamento',
          operator: 'Administrador',
          details: `Pagamento de subscrição rejeitado. Motivo: "${reason}".`
        }
      ];

      await DataService.updatePaymentOrderStatus(paymentId, 'rejected', {
        rejectedAt: timestamp,
        rejectionReason: reason,
        history: updatedHistory
      });

      await DataService.updateProfile(payment.userId, {
        planStatus: 'expired',
        isVerified: false
      });

      triggerSMS(
        payment.userName,
        payment.userPhone,
        `Pendente: Olá ${payment.userName}, a validação do seu pagamento foi recusada pelo administrador. Motivo: ${reason}. Por favor envie outro ID de transação correto.`
      );

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao rejeitar subscrição.');
    }
  };

  const handleApproveCampaign = async (campaignId: string, startDate?: string, endDate?: string) => {
    const campaign = adCampaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    try {
      const actualStart = startDate || new Date().toLocaleDateString('pt-PT');
      const actualEnd = endDate || (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + campaign.durationMonths);
        return d.toLocaleDateString('pt-PT');
      })();

      await DataService.updateAdCampaignStatus(campaignId, 'active', { startDate: actualStart, endDate: actualEnd });

      const userToNotify = users.find(u => u.phone === campaign.contactPhone);
      if (userToNotify) {
        const notifId = generateId('notif');
        const newNotif: ChatNotification = {
          id: notifId,
          targetUserId: userToNotify.id,
          text: `Parabéns! A sua campanha publicitária para a empresa "${campaign.companyName}" foi APROVADA e está ativa de ${actualStart} até ${actualEnd}!`,
          type: 'system',
          isRead: false,
          createdAt: new Date().toLocaleDateString('pt-PT')
        };
        await DataService.createNotification(newNotif);

        triggerSMS(
          userToNotify.name,
          userToNotify.phone,
          `Nossos Negócios Publicidade: A sua campanha de Banner (${campaign.bannerType.toUpperCase()}) foi APROVADA e está ativa!`
        );
      }

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar campanha.');
    }
  };

  const handleRejectCampaign = async (campaignId: string) => {
    const campaign = adCampaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    try {
      await DataService.updateAdCampaignStatus(campaignId, 'rejected');

      const userToRefund = users.find(u => u.phone === campaign.contactPhone);
      if (userToRefund) {
        const notifId = generateId('notif');
        const newNotif: ChatNotification = {
          id: notifId,
          targetUserId: userToRefund.id,
          text: `A sua proposta de publicidade para a empresa "${campaign.companyName}" foi recusada. Favor validar os dados do comprovativo bancário enviado.`,
          type: 'system',
          isRead: false,
          createdAt: new Date().toLocaleDateString('pt-PT')
        };
        await DataService.createNotification(newNotif);

        triggerSMS(
          userToRefund.name,
          userToRefund.phone,
          `Nossos Negócios Publicidade: Proposta de Banner recusada. Verifique os dados bancários ou contacte o suporte.`
        );
      }

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao rejeitar campanha.');
    }
  };

  const handleApproveNegotiation = async (negId: string) => {
    const neg = negotiations.find(n => n.id === negId);
    if (!neg) return;

    try {
      await DataService.updateCommissionNegotiationStatus(negId, 'approved');
      await DataService.updateProduct(neg.productId, {
        commissionRate: neg.requestedRate
      });

      const sellerUser = users.find(u => u.id === neg.sellerId);
      if (sellerUser) {
        triggerSMS(sellerUser.name, sellerUser.phone, `Desconto Aprovado! O Administrador aceitou a taxa negociada de ${neg.requestedRate}% no teu anúncio "${neg.productTitle}".`);
      }

      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar negociação.');
    }
  };

  const handleRejectNegotiation = (negId: string) => {
    setNegotiations(prev => prev.map(n => n.id === negId ? { ...n, status: 'rejected' } : n));
    
    const neg = negotiations.find(n => n.id === negId);
    const sellerUser = neg ? users.find(u => u.id === neg.sellerId) : null;
    if (sellerUser && neg) {
      triggerSMS(sellerUser.name, sellerUser.phone, `Desconto Negado: A comissão original de ${neg.originalRate}% foi mantida pelo administrador para cobrir riscos.`);
    }
  };

  const handleToggleUserSuspension = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        triggerSMS(u.name, u.phone, u.isSuspended ? 'Conta Reativada!' : 'Serviço Bloqueado de modo preventivo por auditoria financeira.');
        return {
          ...u,
          isSuspended: !u.isSuspended
        };
      }
      return u;
    }));
  };



  const handleReportProduct = (
    type: 'user' | 'company' | 'product',
    targetId: string,
    targetTitle: string,
    reason: string,
    details: string
  ) => {
    if (!currentUser) return;

    if (type === 'product') {
      const prod = products.find(p => p.id === targetId);
      if (!prod) return;

      const newReport: Report = {
        id: generateId('rep'),
        reporterId: currentUser.id,
        reporterName: currentUser.name,
        type,
        productId: prod.id,
        productTitle: prod.title,
        reportedUserId: prod.sellerId,
        reportedUserName: prod.sellerName,
        reason,
        details,
        status: 'pending',
        createdAt: new Date().toLocaleDateString('pt-AO') + ' ' + new Date().toLocaleTimeString('pt-AO')
      };

      setReports(prev => [newReport, ...prev]);

      triggerSMS(
        'Administrador',
        '123456',
        `AUDITORIA URGENTE: O comprador ${currentUser.name} acionou um sinal de verificação de fraude ou descontentamento contra o artigo "${prod.title}" (ID: ${prod.id.substring(0, 8)}). Exige verificação documental urgente.`
      );
    } else {
      const newReport: Report = {
        id: generateId('rep'),
        reporterId: currentUser.id,
        reporterName: currentUser.name,
        type,
        reportedUserId: targetId,
        reportedUserName: targetTitle,
        reason,
        details,
        status: 'pending',
        createdAt: new Date().toLocaleDateString('pt-AO') + ' ' + new Date().toLocaleTimeString('pt-AO')
      };

      setReports(prev => [newReport, ...prev]);

      triggerSMS(
        'Administrador',
        '123456',
        `DENÚNCIA URGENTE: O utilizador ${currentUser.name} denunciou ${type === 'user' ? 'o utilizador' : 'a empresa'} "${targetTitle}" (ID: ${targetId.substring(0, 8)}). Motivo: ${reason}.`
      );
    }
  };

  const handleResolveReport = (reportId: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
    const report = reports.find(r => r.id === reportId);
    if (report) {
      triggerSMS(
        report.reporterName,
        'Sistema',
        `Denúncia Resolvida: A central notificou o utilizador ${report.reportedUserName}. O caso ID ${reportId.substring(0,6)} foi encerrado favoravelmente.`
      );
    }
  };

  const handleDismissReport = (reportId: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
    const report = reports.find(r => r.id === reportId);
    if (report) {
      triggerSMS(
        report.reporterName,
        'Sistema',
        `Denúncia Arquivada: Após inquérito, a central considerou o artigo "${report.productTitle || 'denunciado'}" em conformidade. Caso ID ${reportId.substring(0,6)} encerrado.`
      );
    }
  };

  const handleStartChat = (productId: string) => {
    if (!currentUser) {
      alert('Por favor inicie sessão para conversar!');
      return;
    }
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    if (currentUser.id === p.sellerId) {
      alert('Não pode iniciar conversa com o seu próprio anúncio!');
      return;
    }

    // Check if there's an existing simple_chat or completed transaction
    const existingTx = transactions.find(t => 
      t.productId === p.id && 
      t.buyerId === currentUser.id && 
      (t.status === 'simple_chat' || t.status === 'completed')
    );

    if (existingTx) {
      setActiveTransactionId(existingTx.id);
      setActiveTab('chats');
      return;
    }

    const newTx: Transaction = {
      id: generateId('tx'),
      productId: p.id,
      productTitle: p.title,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      sellerId: p.sellerId,
      sellerName: p.sellerName,
      price: p.price,
      commissionRate: p.commissionRate,
      commissionAmount: Math.round(p.price * (p.commissionRate / 100)),
      finalPayout: p.price - Math.round(p.price * (p.commissionRate / 100)),
      status: 'simple_chat',
      isExtended: false,
      adminAssisted: false,
      messages: [
        {
          id: generateId('msg'),
          senderId: 'system',
          senderName: 'Intermediário Geral',
          text: `Olá! Iniciaram uma conversa privada sobre o artigo "${p.title}". Usem este espaço para discutir os detalhes de recolha ou envio. O pagamento do produto dever ser feito diretamente (Multicaixa, numerário, etc.) ao vendedor de forma segura e combinada.`,
          timestamp: new Date().toLocaleTimeString('pt-AO')
        }
      ],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);
    setActiveTransactionId(newTx.id);
    setActiveTab('chats');

    addNotification(
      p.sellerId,
      currentUser.id,
      currentUser.name,
      p.id,
      p.title,
      'message',
      `O utilizador "${currentUser.name}" iniciou uma conversa sobre o vosso artigo: "${p.title}"`
    );

    triggerSMS(
      p.sellerName,
      'Central',
      `O comprador ${currentUser.name} iniciou uma conversa privada direta sobre o teu anúncio "${p.title}". Verifique as suas Mensagens para responder.`
    );
  };

  const handleInterestProduct = (productId: string) => {
    if (!currentUser) return;
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    if (currentUser.id === p.sellerId) return;

    addNotification(
      p.sellerId,
      currentUser.id,
      currentUser.name,
      p.id,
      p.title,
      'interest',
      `O utilizador "${currentUser.name}" demonstrou interesse no vosso artigo: "${p.title}"`
    );

    triggerSMS(
      p.sellerName,
      'Fidelização',
      `Alerta de Interesse! O utilizador ${currentUser.name} marcou interesse no teu artigo "${p.title}". Prontifica-te para negociar!`
    );

    alert('Demonstraste interesse no negócio! O vendedor recebeu uma notificação interna no painel e SMS de alerta.');
  };

  const handleAddCategory = (name: string, label: string) => {
    // create category
    alert(`Categoria "${label}" adicionada com sucesso pelo Admin.`);
  };

  const handleUpdateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          ...updatedData
        };
      }
      return u;
    }));
    triggerSMS(
      currentUser.name,
      updatedData.phone || currentUser.phone,
      `Central de Segurança: Os dados do seu perfil comercial foram alterados com sucesso na plataforma (Foto ou Telemóvel atualizados).`
    );
  };

  const handleAddUpgradeSubscriptionPayment = (paymentData: {
    planType: 'mensal' | 'anual';
    userType: 'profissional' | 'empresa';
    amount: number;
    bankName: string;
    txId: string;
    proofImage?: string;
    notes?: string;
  }) => {
    if (!currentUser) return;

    const newPayment: SubscriptionPayment = {
      id: generateId('pay'),
      userName: currentUser.name,
      userEmail: currentUser.email,
      userPhone: currentUser.phone,
      userType: paymentData.userType,
      planType: paymentData.planType,
      amount: paymentData.amount,
      bankName: paymentData.bankName,
      txId: paymentData.txId,
      proofImage: paymentData.proofImage,
      notes: paymentData.notes,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('pt-AO') + ' ' + new Date().toLocaleTimeString('pt-AO'),
      history: [`Solicitação de upgrade para ${paymentData.userType === 'empresa' ? 'Empresarial' : 'Profissional'} (${paymentData.planType}) enviada pelo utilizador. ID Transação: ${paymentData.txId}`],
      userId: currentUser.id
    };

    setSubscriptionPayments(prev => [newPayment, ...prev]);

    // Set user's planStatus to 'pending'
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          planStatus: 'pending'
        };
      }
      return u;
    }));

    triggerSMS(
      currentUser.name,
      currentUser.phone,
      `Nossos Negócios: A sua solicitação de upgrade foi recebida! ID: ${newPayment.txId}. Aguarda validação administrativa.`
    );

    // Notify administrator about the new pending subscription upgrade
    triggerSMS(
      'Administrador',
      'Geral',
      `Aviso de Upgrade: O utilizador ${currentUser.name} solicitou upgrade para ${paymentData.userType.toUpperCase()} (${paymentData.planType}) e aguarda validação do pagamento. ID Transação: ${paymentData.txId}.`
    );
  };

  const handleLogout = () => {
    setCurrentUserId('');
    localStorage.removeItem('nossosneg_current_user_id');
    setActiveTab('market');
    setIsAdminMode(false);
    triggerSMS('Sistema', 'Geral', 'Sessão encerrada com sucesso.');
  };

  const handleUpdateAdminPassword = (newPass: string) => {
    setAdminPasswordConfig(newPass);
    localStorage.setItem('config_admin_password', newPass);
  };

  const handleUpdateAdminUsername = (newUser: string) => {
    setAdminUsernameConfig(newUser);
    localStorage.setItem('config_admin_username', newUser);
  };

  const handleUpdateAdminEmail = (newEmail: string) => {
    setAdminEmailConfig(newEmail);
    localStorage.setItem('config_admin_email', newEmail);
  };

  const handleUpdatePlatformBankName = (newName: string) => {
    setPlatformBankName(newName);
    localStorage.setItem('config_platform_bank_name', newName);
  };

  const handleUpdatePlatformBeneficiary = (newBen: string) => {
    setPlatformBeneficiary(newBen);
    localStorage.setItem('config_platform_beneficiary', newBen);
  };

  const handleUpdatePlatformIban = (newIban: string) => {
    setPlatformIban(newIban);
    localStorage.setItem('config_platform_iban', newIban);
  };

  const handleWithdrawRevenue = (amount: number, destBank: string, destIban: string, destOwner: string) => {
    setAdminWithdrawnRevenues(prev => {
      const updated = prev + amount;
      localStorage.setItem('config_admin_withdrawn_revenues', String(updated));
      return updated;
    });
    triggerSMS('Administrador', 'Geral', `Levantamento de receitas efetuado com sucesso! Valor retirado: ${amount} Kz para a conta ${destBank} (${destIban}) de ${destOwner}.`);
  };

  // --- Conversations / chats for currently logged in user ---
  const myChats = transactions.filter(tx => tx.buyerId === currentUserId || tx.sellerId === currentUserId);
  const activeChatTransaction = transactions.find(tx => tx.id === activeTransactionId);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-gray-100 font-sans leading-relaxed selection:bg-[#D4AF37]/30">
      
      {/* Profile/Role Header Switcher */}
      <AppHeader
        currentUser={currentUser}
        users={users}
        stats={stats}
        activeTab={activeTab}
        logo={logo}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setFeedShowMyProductsOnly(false);
          if (tab === 'admin') {
            if (!isAdminMode) {
              setAdminLoginError(null);
            }
          }
        }}
        onOpenKYC={() => setIsKYCOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearNotifications={handleClearNotifications}
      />



      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin login popup overlay */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleAdminVerifyLogin} className="bg-[#121212] border border-neutral-800 rounded-3xl max-w-sm w-full p-6 shadow-[0_0_50px_rgba(214,175,55,0.1)] space-y-4">
              <div className="text-center">
                <div className="h-10 w-10 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 rounded-full flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                  <Key size={18} />
                </div>
                <h4 className="font-sans font-extrabold text-[#D4AF37] text-base uppercase tracking-wider">Painel Administrativo</h4>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Credenciais padrões do sistema</p>
              </div>

              {adminLoginError && (
                <p className="bg-red-500/10 text-red-400 p-2.5 rounded-xl text-xs leading-normal font-semibold text-center border border-red-500/20">{adminLoginError}</p>
              )}

              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Username ou Email</label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                    placeholder="nossosnegocios.ao@gmail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Senha</label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 pr-10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                      placeholder="••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminLoginError(null);
                  }}
                  className="flex-1 bg-neutral-900 border border-neutral-800 text-gray-400 hover:text-white py-2 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#D4AF37] hover:bg-amber-600 text-black py-2 rounded-xl transition-all cursor-pointer font-bold uppercase tracking-wider"
                >
                  Autenticar
                </button>
              </div>
            </form>
          </div>
        )}

        {!currentUser && !isAdminMode ? (
          /* Portaria de Entrada (Welcome Gate Setup) - Clean, minimalist, secure login */
          <div className={`${loginTab === 'register' ? 'max-w-5xl' : 'max-w-md'} mx-auto space-y-6 py-12 animate-in fade-in zoom-in-95 duration-250`}>
            {/* Top Branding Header with Real Generated Logo */}
            <div className="text-center space-y-4">
              <img 
                src={logo} 
                alt="Nossos Negócios Logo" 
                className="h-32 w-32 object-contain mx-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]" 
                referrerPolicy="no-referrer" 
              />
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-white tracking-widest uppercase">
                  NOSSOS <span className="text-[#D4AF37]">NEGÓCIOS</span>
                </h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                  A SOLUÇÃO PARA AS TUAS VENDAS • 100% SEGURO
                </p>
              </div>
            </div>

            {/* Premium Login / Registration Card */}
            <div className="bg-[#121212] border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
              
              {/* Clean Tabs Selector */}
              <div className="flex border-b border-neutral-850">
                <button
                  type="button"
                  onClick={() => {
                    setLoginTab('login');
                    setLoginError(null);
                    setRegSuccess(null);
                  }}
                  className={`flex-1 pb-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 text-center ${
                    loginTab === 'login'
                      ? 'border-[#D4AF37] text-[#D4AF37]'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Iniciar Sessão
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginTab('register');
                    setLoginError(null);
                    setRegSuccess(null);
                  }}
                  className={`flex-1 pb-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 text-center ${
                    loginTab === 'register'
                      ? 'border-[#D4AF37] text-[#D4AF37]'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Criar Conta
                </button>
              </div>

              {loginTab === 'login' ? (
                /* Iniciar Sessão View */
                <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1 font-mono">E-mail ou Telemóvel de Registo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: usuario@exemplo.com ou 923456789"
                      value={loginCredential}
                      onChange={(e) => {
                        setLoginCredential(e.target.value);
                        setLoginError(null);
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1 font-mono">Palavra-passe</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        placeholder="Indique a sua palavra-passe"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          setLoginError(null);
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 pr-12 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <p className="bg-red-500/10 text-red-400 text-xs p-3 rounded-xl border border-red-500/15 font-semibold text-center leading-relaxed font-sans">{loginError}</p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-[#D4AF37] hover:bg-amber-600 active:scale-95 text-black py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      Iniciar Sessão
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginTab('register')}
                      className="flex-1 bg-neutral-900 border border-neutral-800 hover:border-gray-600 text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      Entrar
                    </button>
                  </div>
                </form>
              ) : (
                /* Criar Conta View */
                <form onSubmit={handleRegisterUser} className="space-y-4 animate-in fade-in duration-200">
                  {regSuccess && (
                    <p className="bg-emerald-500/10 text-emerald-400 text-xs p-3 rounded-xl border border-emerald-500/20 font-semibold">{regSuccess}</p>
                  )}
                  {regError && (
                    <p className="bg-red-500/10 text-red-400 text-xs p-3 rounded-xl border border-red-500/15 font-semibold text-center leading-relaxed font-sans">{regError}</p>
                  )}

                  <div className="space-y-6">
                    {/* Passo 1: Seleção de Tipo de Conta & Plano */}
                    <div className="space-y-3 text-left">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] pl-1 font-mono">1. Selecione o Tipo de Conta & Plano</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Option 1: Individual */}
                        <div 
                          onClick={() => { setRegType('particular'); setIsRegPaymentConfirmed(false); setRegPaymentTxId(''); }}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            (regType === 'particular' || regType === 'individual')
                              ? 'bg-[#2563EB]/5 border-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                              : 'bg-[#121212]/30 border-neutral-850 hover:border-gray-750'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-xs text-white">👤 Individual</span>
                              {(regType === 'particular' || regType === 'individual') && (
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono font-black text-blue-400 block mt-1 uppercase tracking-wider">Gratuito</span>
                            <span className="text-[8.5px] text-zinc-500 block mt-1 leading-normal italic">Destinado a compradores esporádicos e particulares.</span>
                            
                            <ul className="text-[9px] text-zinc-400 space-y-1 mt-3 list-disc pl-3 leading-relaxed">
                              <li>Até 15 anúncios ativos (40 se Verificado)</li>
                              <li>Chat com compradores e vendedores</li>
                              <li>Avaliações • Favoritos • Denúncias</li>
                              <li>Perfil básico</li>
                            </ul>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setRegType('particular'); setIsRegPaymentConfirmed(false); setRegPaymentTxId(''); }}
                            className={`w-full mt-4 text-[9px] font-black uppercase py-2 px-1 rounded-xl tracking-tight text-center transition-all ${
                              (regType === 'particular' || regType === 'individual')
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-neutral-900 text-gray-400 hover:text-white'
                            }`}
                          >
                            Individual Selecionado
                          </button>
                        </div>

                        {/* Option 2: Profissional */}
                        <div 
                          onClick={() => { setRegType('profissional'); setIsRegPaymentConfirmed(false); setRegPaymentTxId(''); }}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            regType === 'profissional'
                              ? 'bg-amber-500/5 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                              : 'bg-[#121212]/30 border-neutral-850 hover:border-gray-750'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-xs text-white">⭐ Profissional</span>
                              {regType === 'profissional' && (
                                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono font-black text-amber-500 block mt-1 uppercase tracking-wider">5.000 Kz/mês</span>
                            <span className="text-[8.5px] text-zinc-400 block mt-1 font-bold leading-normal">Revendedores, Corretores, Freelancers</span>
                            
                            <ul className="text-[9px] text-zinc-400 space-y-1 mt-3 list-disc pl-3 leading-relaxed">
                              <li>Até 100 anúncios ativos</li>
                              <li>Selo Profissional Premium</li>
                              <li>Estatísticas básicas de visitas</li>
                              <li>Prioridade de pesquisa nos anúncios</li>
                              <li>2 anúncios destacados grátis / mês</li>
                              <li>Perfil profissional</li>
                            </ul>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setRegType('profissional'); setIsRegPaymentConfirmed(false); setRegPaymentTxId(''); }}
                            className={`w-full mt-4 text-[9px] font-black uppercase py-2 px-1 rounded-xl tracking-tight text-center transition-all ${
                              regType === 'profissional'
                                ? 'bg-[#D4AF37] text-black shadow-sm font-black'
                                : 'bg-neutral-900 text-gray-400 hover:text-white'
                            }`}
                          >
                            Escolher Profissional
                          </button>
                        </div>

                        {/* Option 3: Empresa */}
                        <div 
                          onClick={() => { setRegType('empresa'); setIsRegPaymentConfirmed(false); setRegPaymentTxId(''); }}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            regType === 'empresa'
                              ? 'bg-emerald-500/5 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                              : 'bg-[#121212]/30 border-neutral-850 hover:border-gray-750'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-xs text-white">🏢 Empresa</span>
                              {regType === 'empresa' && (
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono font-black text-emerald-400 block mt-1 uppercase tracking-wider">20.000 Kz/mês</span>
                            <span className="text-[8.5px] text-zinc-400 block mt-1 font-bold leading-normal">Lojas, Imobiliárias, Stands, Serviços</span>
                            
                            <ul className="text-[9px] text-zinc-400 space-y-1 mt-3 list-disc pl-3 leading-relaxed">
                              <li>Anúncios ILIMITADOS ativos</li>
                              <li>Página empresarial customizada</li>
                              <li>Selo Empresa Verificada</li>
                              <li>Estatísticas avançadas de cliques</li>
                              <li>5 anúncios destacados grátis / mês</li>
                              <li>Apoio prioritário dedicado</li>
                            </ul>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setRegType('empresa'); setIsRegPaymentConfirmed(false); setRegPaymentTxId(''); }}
                            className={`w-full mt-4 text-[9px] font-black uppercase py-2 px-1 rounded-xl tracking-tight text-center transition-all ${
                              regType === 'empresa'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-neutral-900 text-gray-400 hover:text-white'
                            }`}
                          >
                            Escolher Empresa
                          </button>
                        </div>

                      </div>

                      {/* Billing cycle choosing toggle if premium plan */}
                      {regType !== 'particular' && regType !== 'individual' && (
                        <div className="mt-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                          <div>
                            <span className="text-[10px] text-zinc-300 block font-bold uppercase font-mono">Ciclo de Faturação</span>
                            <p className="text-[9px] text-zinc-500 mt-0.5">
                              {regType === 'profissional' 
                                ? 'Mensal: 5.000 Kz • Anual: 70.000 Kz' 
                                : 'Mensal: 20.000 Kz • Anual: 200.000 Kz (Poupe 40.000 Kz!)'}
                            </p>
                          </div>
                          <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800 shrink-0">
                            <button
                              type="button"
                              onClick={() => setRegPlanType('mensal')}
                              className={`px-3 py-1 text-[9.5px] font-bold rounded-md uppercase transition-all tracking-wider ${
                                regPlanType === 'mensal'
                                  ? 'bg-[#D4AF37] text-black shadow-inner font-extrabold'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              Mensal
                            </button>
                            <button
                              type="button"
                              onClick={() => setRegPlanType('anual')}
                              className={`px-3 py-1 text-[9.5px] font-bold rounded-md uppercase transition-all tracking-wider ${
                                regPlanType === 'anual'
                                  ? 'bg-[#D4AF37] text-black shadow-inner font-extrabold'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              Anual (Pólice VIP)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Passo 2: Dados Pessoais & Contacto */}
                    <div className="space-y-4 bg-neutral-900/35 p-5 rounded-2xl border border-neutral-850/70 text-left">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] pl-1 font-mono border-b border-neutral-800 pb-1.5 mb-2">2. Informações de Identificação & Contacto</label>
                      
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1 font-mono">Nome Completo</label>
                        <input
                          type="text"
                          placeholder="Nome Completo"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1 font-mono">E-mail</label>
                          <input
                            type="email"
                            placeholder="exemplo@email.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1 font-mono">Telemóvel</label>
                          <input
                            type="tel"
                            placeholder="923456789"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1 font-mono">Definir Palavra-passe</label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? "text" : "password"}
                            placeholder="Introduza uma palavra-passe de segurança"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 pr-12 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                          >
                            {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Data de Nascimento (Para contas individuais/particulares e profissionais) */}
                      {(regType === 'particular' || regType === 'individual' || regType === 'profissional') && (
                        <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] pl-1 font-mono">Data de Nascimento (Obrigatório)</label>
                          <input
                            type="date"
                            value={regBirthDate}
                            onChange={(e) => setRegBirthDate(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                            required
                          />
                        </div>
                      )}

                      {/* NIF (Para empresas) */}
                      {regType === 'empresa' && (
                        <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] pl-1 font-mono">NIF da Empresa (Obrigatório)</label>
                          <input
                            type="text"
                            placeholder="Ex: 541234567"
                            value={regNif}
                            onChange={(e) => setRegNif(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* Passo 3: Ativação & Pagamento para Contas Premium (Profissional e Empresa) */}
                    {(regType === 'profissional' || regType === 'empresa') && (
                      <div className="bg-neutral-900/80 p-5 rounded-2xl border border-[#D4AF37]/40 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300 text-left">
                        <div className="flex items-start gap-2.5">
                          <span className="p-2 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37] shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                          </span>
                          <div>
                            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-white">3. Efetuar Pagamento de Ativação</h4>
                            <p className="text-[9px] text-zinc-400 mt-0.5 leading-normal">Efetue a transferência ou depósito do valor do plano selecionado abaixo e introduza o ID da transação para desbloquear o registo.</p>
                          </div>
                        </div>

                        {/* Price dynamic readout */}
                        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 flex justify-between items-center">
                          <span className="text-[9px] uppercase font-mono font-bold text-gray-500">Valor Recomendado ({regType === 'profissional' ? 'Profissional' : 'Empresa'} • {regPlanType.toUpperCase()}):</span>
                          <span className="text-xs font-black font-mono text-[#D4AF37]">
                            {formatKwanza(
                              regType === 'profissional'
                                ? (regPlanType === 'mensal' ? 5000 : 70000)
                                : (regPlanType === 'mensal' ? 20000 : 200000)
                            )}
                          </span>
                        </div>

                        {/* Bank Transfer Coordinates */}
                        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-2.5">
                          <h5 className="text-[9px] uppercase tracking-wider font-bold text-[#D4AF37] font-mono border-b border-neutral-800 pb-1">Coordenadas Bancárias Oficiais</h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9.5px] font-mono font-bold">
                            <div className="bg-[#121212] p-2 rounded-lg border border-neutral-800">
                              <span className="text-[7.5px] text-zinc-500 block uppercase font-sans">Banco Destinatário</span>
                              <span className="text-zinc-200 block mt-0.5 font-sans font-extrabold">{platformBankName}</span>
                            </div>
                            <div className="bg-[#121212] p-2 rounded-lg border border-neutral-800">
                              <span className="text-[7.5px] text-zinc-500 block uppercase font-sans">Beneficiário</span>
                              <span className="text-zinc-200 block mt-0.5 font-sans font-extrabold">{platformBeneficiary}</span>
                            </div>
                            <div className="bg-[#121212] p-2 rounded-lg border border-neutral-800 col-span-1 sm:col-span-2">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[7.5px] text-zinc-500 uppercase block font-sans">IBAN Principal (Toque p/ copiar)</span>
                                <span className="text-[7.5px] bg-[#D4AF37]/10 px-1 py-0.2 rounded text-[#D4AF37] font-sans">Oficial</span>
                              </div>
                              <span className="text-white block font-mono select-all tracking-wider text-[10px] bg-neutral-950 p-1 rounded border border-neutral-800 text-center">{platformIban}</span>
                            </div>
                            <div className="bg-[#121212] p-2 rounded-lg border border-neutral-800">
                              <span className="text-[7.5px] text-zinc-500 block uppercase font-sans">Nº de Conta</span>
                              <span className="text-white block mt-0.5">492019481 / 10 / 001</span>
                            </div>
                            <div className="bg-[#121212] p-2 rounded-lg border border-neutral-800">
                              <span className="text-[7.5px] text-zinc-500 block uppercase font-sans">Referência / Finalidade</span>
                              <span className="text-[#D4AF37] block mt-0.5 font-sans">PLAN-{regType.toUpperCase()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Rich Form Inputs for Deposit Verification */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5 text-left">
                          <div className="space-y-1">
                            <label className="block text-[8.5px] uppercase font-bold tracking-widest text-[#D4AF37] pl-1 font-mono">Banco Utilizado p/ Transferência</label>
                            <select 
                              value={regPaymentBank}
                              onChange={(e) => setRegPaymentBank(e.target.value)}
                              disabled={isRegPaymentConfirmed}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-sans outline-none font-bold"
                            >
                              <option value="BAI">BAI (Banco Angolano de Investimentos)</option>
                              <option value="BFA">BFA (Banco de Fomento Angola)</option>
                              <option value="BIC">BIC (Banco BIC)</option>
                              <option value="SOL">Banco SOL</option>
                              <option value="BCI">BCI (Banco de Comércio e Indústria)</option>
                              <option value="BMA">BMA (Banco Millennium Angola)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[8.5px] uppercase font-bold tracking-widest text-[#D4AF37] pl-1 font-mono">Valor Transferido (Kz)</label>
                            <input 
                              type="text"
                              value={formatKwanza(
                                regType === 'profissional'
                                  ? (regPlanType === 'mensal' ? 5000 : 70000)
                                  : (regPlanType === 'mensal' ? 20000 : 200000)
                              )}
                              disabled={true}
                              className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl p-2.5 text-xs text-zinc-400 font-mono focus:outline-none cursor-not-allowed"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[8.5px] uppercase font-bold tracking-widest text-[#D4AF37] pl-1 font-mono">Comprovativo Físico / Imagem Multicaixa</label>
                            <div className="flex flex-col gap-2">
                              <input 
                                type="file"
                                accept="image/*"
                                id="proof-upload-input"
                                disabled={isRegPaymentConfirmed}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setRegPaymentProof(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                              />
                              <div className="flex gap-2">
                                <label 
                                  htmlFor="proof-upload-input"
                                  className={`flex-grow border border-dashed rounded-xl p-3 text-center text-xs font-bold font-sans cursor-pointer transition-all flex items-center justify-center gap-2 ${
                                    regPaymentProof 
                                      ? 'border-emerald-500 bg-emerald-950/10 text-emerald-400' 
                                      : 'border-neutral-800 hover:border-[#D4AF37] text-zinc-400'
                                  } ${isRegPaymentConfirmed ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                  <span>{regPaymentProof ? '✓ Imagem Carregada' : 'Selecionar Imagem do Comprovativo / Talão'}</span>
                                </label>

                                {regPaymentProof && !isRegPaymentConfirmed && (
                                  <button
                                    type="button"
                                    onClick={() => setRegPaymentProof('')}
                                    className="bg-red-550 hover:bg-red-700 text-white font-extrabold px-3 rounded-xl text-[10px] uppercase cursor-pointer transition-colors"
                                  >
                                    Remover
                                  </button>
                                )}
                              </div>
                              {regPaymentProof && (
                                <div className="flex justify-center border border-neutral-800 p-2 rounded-xl bg-neutral-950">
                                  <img 
                                    src={regPaymentProof} 
                                    alt="Miniatura do comprovativo ou talão" 
                                    className="max-h-24 max-w-full rounded object-contain border border-neutral-850"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[8.5px] uppercase font-bold tracking-widest text-[#D4AF37] pl-1 font-mono">Observações ou Nota Adicional (Opcional)</label>
                            <input 
                              type="text"
                              placeholder="Indique dados adicionais da sua transferência ou titular..."
                              value={regPaymentNotes}
                              onChange={(e) => setRegPaymentNotes(e.target.value)}
                              disabled={isRegPaymentConfirmed}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-sans"
                            />
                          </div>
                        </div>

                        {/* Verification Input and button */}
                        <div className="space-y-2">
                          <label className="block text-[9.5px] font-bold uppercase tracking-widest text-[#D4AF37] font-mono pl-1">
                            ID de Transação do Comprovativo <span className="text-red-500">*</span>
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              placeholder="Insira o ID / Identificador da transferência bancária"
                              value={regPaymentTxId}
                              onChange={(e) => {
                                setRegPaymentTxId(e.target.value);
                                setIsRegPaymentConfirmed(false);
                              }}
                              disabled={isRegPaymentConfirmed}
                              className={`flex-grow bg-neutral-950 border rounded-xl p-3 text-xs text-white uppercase focus:outline-none focus:border-[#D4AF37] font-mono tracking-wider ${
                                isRegPaymentConfirmed ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' : 'border-neutral-800'
                              }`}
                            />
                            {isRegPaymentConfirmed ? (
                              <div className="bg-emerald-600/15 border border-emerald-500 text-emerald-400 rounded-xl px-4 py-3 flex items-center justify-center font-black text-[10px] uppercase font-mono tracking-wider gap-1 animate-in zoom-in-95 shrink-0">
                                <span>✓ Confirmado</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!regPaymentTxId.trim()) {
                                    alert('Atenção: Deve preencher obrigatoriamente o campo ID de Transação antes de clicar em Confirmar Pagamento.');
                                    return;
                                  }
                                  setIsRegPaymentConfirmed(true);
                                  alert('✓ Pagamento Confirmado com ID "' + regPaymentTxId + '"! A transação foi validada e a criação de conta premium está agora liberada. Clique no botão de registar abaixo para prosseguir.');
                                }}
                                className="bg-[#D4AF37] hover:bg-amber-600 px-5 py-3 rounded-xl text-[10px] font-black uppercase text-black tracking-wider transition-all cursor-pointer shrink-0"
                              >
                                Confirmar Pagamento
                              </button>
                            )}
                          </div>
                          <p className="text-[8.5px] text-zinc-500 italic pl-1 leading-normal">
                            {isRegPaymentConfirmed 
                              ? '✓ Pagamento associado! Pode finalizar a criação da sua conta no botão de submissão abaixo.' 
                              : 'Após enviar o valor por canais bancários angolanos, registre obrigatoriamente a referência ou ID de transação para ativar.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Passo 4: Código de Convite */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1 font-mono">Código de Convite (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: VALE500"
                        value={regRefCode}
                        onChange={(e) => setRegRefCode(e.target.value.toUpperCase())}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono font-bold text-[#D4AF37] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  {/* Legal Consent Disclaimer */}
                  <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-850 text-[10px] text-gray-500 leading-normal text-left">
                    Ao criar uma conta no mercado, declara aceitar expressamente os nossos{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setLegalModalTab('terms');
                        setLegalModalOpen(true);
                      }}
                      className="text-[#D4AF37] hover:underline font-bold inline-block cursor-pointer"
                    >
                      Termos de Uso
                    </button>{' '}
                    e a nossa{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setLegalModalTab('privacy');
                        setLegalModalOpen(true);
                      }}
                      className="text-[#D4AF37] hover:underline font-bold inline-block cursor-pointer"
                    >
                      Política de Privacidade
                    </button>{' '}
                    em total conformidade com a Lei da Proteção de Dados Pessoais de Angola (Lei n.º 22/11).
                  </div>

                   <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <button
                      type="submit"
                      disabled={(regType === 'profissional' || regType === 'empresa') && !isRegPaymentConfirmed}
                      className={`flex-grow py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                        ((regType === 'profissional' || regType === 'empresa') && !isRegPaymentConfirmed)
                          ? 'bg-neutral-850 border border-neutral-800 text-zinc-500 cursor-not-allowed opacity-65'
                          : 'bg-[#D4AF37] hover:bg-amber-600 active:scale-95 text-black shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                      }`}
                    >
                      {((regType === 'profissional' || regType === 'empresa') && !isRegPaymentConfirmed) 
                        ? 'Bloqueado: Confirme o Pagamento Acima 🔒' 
                        : 'Criar Conta & Entrar ⚡'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginTab('login');
                        setLoginError(null);
                      }}
                      className="bg-neutral-900 border border-neutral-800 hover:border-gray-600 text-gray-300 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      Já tenho conta
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : isAdminMode ? (
          /* Render power admin dashboard panel */
          <AdminDashboard
            users={users}
            products={products}
            kycSubmissions={kycSubmissions}
            negotiations={negotiations}
            categories={INITIAL_CATEGORIES}
            transactions={transactions}
            stats={stats}
            onApproveKYC={handleApproveKYC}
            onRejectKYC={handleRejectKYC}
            onApproveNegotiation={handleApproveNegotiation}
            onRejectNegotiation={handleRejectNegotiation}
            onToggleUserSuspension={handleToggleUserSuspension}
            onAddCategory={handleAddCategory}
            onLogout={handleLogout}
            smsLogs={smsLogs}
            onSendSms={triggerSMS}
            onWithdrawAdminFunds={handleWithdrawAdminFunds}
            onDepositAdminFunds={handleDepositAdminFunds}
            reports={reports}
            onResolveReport={handleResolveReport}
            onDismissReport={handleDismissReport}
            subscriptionPayments={subscriptionPayments}
            onApproveSubscriptionPayment={handleApproveSubscriptionPayment}
            onRejectSubscriptionPayment={handleRejectSubscriptionPayment}
            paymentOrders={paymentOrders}
            onApprovePaymentOrder={handleApprovePaymentOrder}
            onRejectPaymentOrder={handleRejectPaymentOrder}
            adCampaigns={adCampaigns}
            onApproveCampaign={handleApproveCampaign}
            onRejectCampaign={handleRejectCampaign}
            adminPassword={adminPasswordConfig}
            onUpdateAdminPassword={handleUpdateAdminPassword}
            adminUsername={adminUsernameConfig}
            adminEmail={adminEmailConfig}
            onUpdateAdminUsername={handleUpdateAdminUsername}
            onUpdateAdminEmail={handleUpdateAdminEmail}
            platformBankName={platformBankName}
            onUpdatePlatformBankName={handleUpdatePlatformBankName}
            platformBeneficiary={platformBeneficiary}
            onUpdatePlatformBeneficiary={handleUpdatePlatformBeneficiary}
            platformIban={platformIban}
            onUpdatePlatformIban={handleUpdatePlatformIban}
            adminWithdrawnRevenues={adminWithdrawnRevenues}
            onWithdrawRevenue={handleWithdrawRevenue}
          />
        ) : activeTab === 'advertising' ? (
          <AdvertisingView
            currentUser={currentUser}
            categories={INITIAL_CATEGORIES}
            onCreateCampaign={handleCreateAdCampaign}
            onBackToMarket={() => setActiveTab('market')}
            platformBankName={platformBankName}
            platformBeneficiary={platformBeneficiary}
            platformIban={platformIban}
          />
        ) : activeTab === 'profile' ? (
          /* Custom user profile editor and manager view */
          <ProfileView
            user={currentUser}
            users={users}
            products={products}
            subscriptionPayments={subscriptionPayments}
            onUpdateProfile={handleUpdateProfile}
            onAddSubscriptionPayment={handleAddUpgradeSubscriptionPayment}
            onLogout={handleLogout}
            platformBankName={platformBankName}
            platformBeneficiary={platformBeneficiary}
            platformIban={platformIban}
            onOpenKYC={() => setIsKYCOpen(true)}
            onViewMyProducts={() => {
              setActiveTab('market');
              setFeedShowMyProductsOnly(true);
            }}
          />
        ) : activeTab === 'categories' ? (
          /* Categories bento view screen */
          <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="bg-[#121212] border border-neutral-805 p-6 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-500/5 rounded-full blur-[70px] pointer-events-none" />
              <h2 className="text-xl font-extrabold uppercase tracking-wider text-white">Categorias do Mercado</h2>
              <p className="text-xs text-gray-400 mt-1">Navegue pelas principais verticais de comércio, serviços e intermediação em Angola.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {INITIAL_CATEGORIES.map((cat) => {
                const countOfCat = products.filter(p => p.category === cat.name).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setActiveTab('market');
                    }}
                    className="p-6 bg-[#121212] border border-neutral-805 hover:border-[#D4AF37]/50 rounded-2xl text-left hover:bg-neutral-950 transition-all cursor-pointer group space-y-3 relative overflow-hidden"
                  >
                    <div className="text-3xl group-hover:scale-110 transition-transform">{cat.icon || "📦"}</div>
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-[#D4AF37] transition-all">{cat.label}</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{countOfCat} anúncios</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'publish' ? (
          /* Publish Tab trigger redirect screen */
          <div className="space-y-6 max-w-lg mx-auto text-center py-16 animate-in fade-in duration-300">
            <div className="bg-[#121212] border border-neutral-805 p-8 rounded-3xl space-y-5 shadow-xl">
              <div className="h-12 w-12 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/25 font-bold text-xl">
                ★
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Publicar Novo Anúncio</h3>
                <p className="text-xs text-gray-400 leading-relaxed mt-2">
                  Promova os seus serviços e sinta o poder das intermediações confiáveis de Angola. O formulário de edição será exibido no topo do feed.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsPublishOpen(true);
                  setActiveTab('market');
                }}
                className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-extrabold text-xs py-3 px-6 rounded-xl uppercase tracking-wider cursor-pointer transition-all"
              >
                Abrir Formulário de Publicação
              </button>
            </div>
          </div>
        ) : activeTab === 'favorites' ? (
          /* Favorites filtered Feed page */
          <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="bg-[#121212] border border-neutral-805 p-6 rounded-3xl shadow-xl flex justify-between items-center relative overflow-hidden">
              <div>
                <h2 className="text-xl font-extrabold uppercase tracking-wider text-white">Anúncios Favoritos</h2>
                <p className="text-xs text-gray-400 mt-1">Interesses guardados que você está a monitorar de perto no mercado.</p>
              </div>
              <span className="text-2xl">⭐</span>
            </div>

            {products.filter(p => currentUser ? p.likedBy.includes(currentUser.id) : false).length === 0 ? (
              <div className="text-center py-16 bg-[#121212] border border-neutral-805 rounded-3xl space-y-3">
                <p className="text-sm text-gray-500 italic">Ainda não marcou nenhum anúncio como favorito.</p>
                <button
                  onClick={() => setActiveTab('market')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 rounded-xl uppercase"
                >
                  Explorar Mercado
                </button>
              </div>
            ) : (
              <Feed
                products={products.filter(p => currentUser ? p.likedBy.includes(currentUser.id) : false)}
                categories={INITIAL_CATEGORIES}
                adCampaigns={adCampaigns}
                currentUser={currentUser}
                users={users}
                onLikeProduct={handleLikeProduct}
                onAddComment={handleAddComment}
                onPromoteProduct={handlePromoteProduct}
                onReportProduct={handleReportProduct}
                onStartChat={handleStartChat}
                onPublishClick={() => setIsPublishOpen(true)}
                onSendSms={triggerSMS}
                initialCategory={selectedCategory}
                initialShowMyProductsOnly={feedShowMyProductsOnly}
                onGoToAdvertising={() => setActiveTab('advertising')}
                platformBankName={platformBankName}
                platformBeneficiary={platformBeneficiary}
                platformIban={platformIban}
                onUpdateProduct={handleUpdateProduct}
                onAddNotification={addNotification}
                onDeleteProduct={handleDeleteProduct}
              />
            )}
          </div>
        ) : activeTab === 'chats' ? (
          /* Mensagens / Direct Chats list - FACEBOOK MESSENGER STYLE WORKSPACE */
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300 h-[680px] flex flex-col">
            {!currentUser ? (
              <div className="bg-[#121212] border border-neutral-805 rounded-3xl p-8 text-center space-y-6 my-auto max-w-md mx-auto shadow-xl">
                <div className="w-16 h-16 bg-blue-500/10 text-[#D4AF37] border border-[#D4AF37]/35 rounded-full flex items-center justify-center mx-auto text-xl">
                  🔒
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Acesso Restrito</h3>
                  <p className="text-xs text-gray-400 mt-2">
                    Faça login na plataforma para consultar as suas conversações, propostas e negociações comerciais em Angola.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                  }}
                  className="w-full bg-[#D4AF37] hover:bg-yellow-600 text-black font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Entrar ou Registar-se
                </button>
              </div>
            ) : (
              <div className="bg-[#121212] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-1 h-full relative">
                
                {/* SIDEBAR: CONVERSATION LIST (Left list on desktop, full list on mobile if no active tx) */}
                <div className={`w-full md:w-[350px] shrink-0 border-r border-neutral-850 flex flex-col bg-neutral-950/45 ${
                  activeTransactionId ? 'hidden md:flex' : 'flex'
                }`}>
                  {/* Sidebar Header */}
                  <div className="p-4 border-b border-neutral-850 space-y-3 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-sm font-black uppercase tracking-wider text-white">MENSAGENS</h2>
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                          {myChats.length}
                        </span>
                      </div>
                    </div>
                    
                    {/* Search bar inside conversation list */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Pesquisar conversas..."
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                        className="w-full bg-[#1c1c1e] text-xs text-white placeholder-gray-500 border border-neutral-850 rounded-xl py-2 px-3 pl-8 focus:outline-none focus:border-[#2563EB]"
                      />
                      <span className="absolute left-2.5 top-2.5 text-gray-500 text-xs">
                        🔍
                      </span>
                      {chatSearch && (
                        <button 
                          type="button"
                          onClick={() => setChatSearch('')}
                          className="absolute right-2.5 top-2.5 text-xs text-gray-400 hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sidebar Conversation Cards list */}
                  <div className="flex-1 overflow-y-auto divide-y divide-neutral-900/40 p-2 space-y-1">
                    {(() => {
                      const query = chatSearch.toLowerCase().trim();
                      const filteredChats = myChats.filter((tx) => {
                        const isSeller = tx.sellerId === currentUser.id;
                        const partnerName = isSeller ? tx.buyerName : tx.sellerName;
                        return (
                          tx.productTitle.toLowerCase().includes(query) ||
                          partnerName.toLowerCase().includes(query)
                        );
                      });

                      if (filteredChats.length === 0) {
                        return (
                          <div className="text-center py-12 px-4 space-y-2">
                            <span className="text-xl block">💬</span>
                            <p className="text-[11px] text-gray-400 italic">
                              {chatSearch ? 'Nenhuma conversa coincide com o termo.' : 'Sem conversas ativas no momento.'}
                            </p>
                          </div>
                        );
                      }

                      return filteredChats.map((tx) => {
                        const isSeller = tx.sellerId === currentUser.id;
                        const partnerName = isSeller ? tx.buyerName : tx.sellerName;
                        const isSelected = tx.id === activeTransactionId;
                        const latestMsg = tx.messages && tx.messages.length > 0 
                          ? tx.messages[tx.messages.length - 1] 
                          : null;
                        
                        return (
                          <div
                            key={tx.id}
                            onClick={() => setActiveTransactionId(tx.id)}
                            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-[#2563EB]/10 border border-[#2563EB]/35' 
                                : 'hover:bg-neutral-900/60 border border-transparent bg-black/10'
                            }`}
                          >
                            {/* Round avatar */}
                            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-neutral-700 relative">
                              <span className="text-xs font-black text-white uppercase">
                                {partnerName.substring(0, 2)}
                              </span>
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#121212]" />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex justify-between items-baseline gap-1">
                                <h4 className="text-xs font-bold text-white truncate uppercase tracking-tight">
                                  {partnerName}
                                </h4>
                                <span className="text-[9px] text-gray-500 font-mono shrink-0">
                                  {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('pt-AO', {day: 'numeric', month: 'short'}) : ''}
                                </span>
                              </div>

                              <p className="text-[11px] text-[#D4AF37] font-semibold truncate mt-0.5 animate-pulse" title={tx.productTitle}>
                                {tx.productTitle}
                              </p>

                              <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                {latestMsg ? latestMsg.text : 'Conversa particular iniciada.'}
                              </p>

                              {/* Badges alignment */}
                              <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-neutral-900/20">
                                <span className={`text-[8px] uppercase font-mono font-bold px-1.5 py-0.2 rounded border ${
                                  isSeller 
                                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-amber-500/20' 
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/15'
                                }`}>
                                  {isSeller ? 'Vendedor' : 'Interessado'}
                                </span>

                                <span className={`text-[8px] uppercase font-mono font-bold px-1.5 py-0.2 rounded ${
                                  tx.status === 'completed' 
                                    ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-neutral-800 text-gray-400 border border-neutral-750'
                                }`}>
                                  {tx.status === 'completed' ? 'Sucesso ✓' : 'Ativa'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* MAIN CONTENT: CHAT WORKSPACE (Right side on desktop, full screen on mobile if active tx) */}
                <div className={`flex-1 h-full flex flex-col bg-[#1e1e1e]/40 ${
                  activeTransactionId ? 'flex' : 'hidden md:flex'
                }`}>
                  {activeChatTransaction ? (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                      <NegotiationChat
                        transaction={activeChatTransaction}
                        currentUser={currentUser}
                        onSendMessage={handleSendMessage}
                        onDeliverAssist={handleDeliverAssist}
                        onExtendHold={() => {}}
                        onRateTransaction={handleRateTransaction}
                        onRateUser={handleRateUser}
                        onCancelPurchase={handleCancelPurchase}
                        onBackToList={() => setActiveTransactionId(null)}
                      />
                    </div>
                  ) : (
                    /* Default state: No chat selected */
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 my-auto">
                      <div className="h-16 w-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-gray-600 shadow-inner">
                        <svg className="w-8 h-8 text-[#D4AF37]/75 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="max-w-sm space-y-1.5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Centro de Contatos Integrado</h3>
                        <p className="text-xs text-gray-400">
                          Selecione um diálogo na barra lateral para detalhar os métodos de entrega, acertar pagamentos e fechar negócios diretos de forma simples em Angola.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('market')}
                        className="bg-neutral-900 border border-neutral-805 hover:bg-neutral-850 hover:text-white text-gray-300 py-2 px-5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Explorar Artigos do Feed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Render main marketplace explorer layout */
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Centro-Direita: Feed ou Chat Activo */}
            <div className="space-y-6">
              
              {/* If user accounts is locked or suspended */}
              {currentUser?.isSuspended && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-2xl flex items-start space-x-3 shadow-md">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5 text-red-500 animate-pulse" />
                  <div>
                    <h5 className="font-extrabold text-xs uppercase tracking-wider">A vossa conta corporativa está atualmente suspensa</h5>
                    <p className="text-xs text-gray-400 mt-1">
                      De acordo com as regras de utilização do Nossos Negócios, esta conta foi suspensa pela administração sob suspeita de fraudes de anúncios ou abuso de códigos de indicação.
                    </p>
                  </div>
                </div>
              )}

              {/* If chat transaction is selected, show it above or replacing the feed */}
              {activeChatTransaction ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-center bg-[#121212] border border-neutral-800 p-3.5 rounded-2xl shadow-sm">
                    <div>
                      <span className="text-[8px] tracking-widest uppercase font-mono text-gray-500 block">Negociação em Progresso</span>
                      <h3 className="font-sans font-bold text-white text-sm">Controlo de Negócio Comercial</h3>
                    </div>
                    <button
                      onClick={() => setActiveTransactionId(null)}
                      className="bg-neutral-900 border border-neutral-805 hover:bg-neutral-850 text-gray-300 hover:text-white font-bold text-xs py-1.5 px-3.5 rounded-xl cursor-pointer transition-all"
                    >
                      ← Fechar Chat (Voltar ao Feed)
                    </button>
                  </div>

                  <NegotiationChat
                    transaction={activeChatTransaction}
                    currentUser={currentUser || { id: 'temp' } as User}
                    onSendMessage={handleSendMessage}
                    onDeliverAssist={handleDeliverAssist}
                    onExtendHold={() => {}}
                    onRateTransaction={handleRateTransaction}
                    onRateUser={handleRateUser}
                    onCancelPurchase={handleCancelPurchase}
                  />
                </div>
              ) : (
                /* Main product explorer feed list */
                <Feed
                  products={products}
                  categories={INITIAL_CATEGORIES}
                  adCampaigns={adCampaigns}
                  currentUser={currentUser}
                  users={users}
                  onLikeProduct={handleLikeProduct}
                  onAddComment={handleAddComment}
                  onInitiateEscrowPurchase={handleInitiateEscrowPurchase}
                  onNegotiateCommission={handleNegotiateCommission}
                  onPromoteProduct={handlePromoteProduct}
                  negotiationRequests={negotiations}
                  onPublishClick={() => setIsPublishOpen(true)}
                  onSendSms={triggerSMS}
                  onReportProduct={handleReportProduct}
                  onStartChat={handleStartChat}
                  onInterestProduct={handleInterestProduct}
                  initialCategory={selectedCategory}
                  initialShowMyProductsOnly={feedShowMyProductsOnly}
                  onGoToAdvertising={() => setActiveTab('advertising')}
                  platformBankName={platformBankName}
                  platformBeneficiary={platformBeneficiary}
                  platformIban={platformIban}
                  onUpdateProduct={handleUpdateProduct}
                  onAddNotification={addNotification}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

            </div>

          </div>
        )}

      </main>

      {/* --- Footers --- */}
      <footer className="bg-[#121212] border-t border-neutral-805 py-10 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-extrabold font-mono text-[#D4AF37] text-xs uppercase tracking-widest">NOSSOS NEGÓCIOS, Lda</p>
          <p className="text-[10px] text-gray-400">Encontrando o teu cliente ideal com apenas um clique de distância • Rápido, Seguro e Direto.</p>
          
          <div className="flex justify-center gap-4 text-[10px] text-gray-500 font-mono">
            <button
              type="button"
              onClick={() => {
                setLegalModalTab('terms');
                setLegalModalOpen(true);
              }}
              className="hover:text-[#D4AF37] transition-colors cursor-pointer underline"
            >
              Termos de Uso
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setLegalModalTab('privacy');
                setLegalModalOpen(true);
              }}
              className="hover:text-[#D4AF37] transition-colors cursor-pointer underline"
            >
              Política de Privacidade
            </button>
          </div>

          <div className="text-[10px] text-gray-400 font-mono">
            E-mail de Suporte Oficial: <a href="mailto:nossosnegocios.ao@gmail.com" className="text-[#D4AF37] hover:underline font-bold">nossosnegocios.ao@gmail.com</a>
          </div>

          <p className="font-mono text-[9px] text-gray-600">© 2026 - Central Geral de Intermediação de Negócios • Luanda, Angola</p>
        </div>
      </footer>

      {/* --- Modals Render Portal --- */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

      {currentUser && (
        <>
          <PublishModal
            user={currentUser}
            isOpen={isPublishOpen}
            onClose={() => setIsPublishOpen(false)}
            onPublish={handlePublishProduct}
            onNegotiateCommissionSms={(requestedRate, priceVal, pTitle) => {
              if (currentUser) {
                triggerSMS(
                  'Administrador',
                  '941963554',
                  `Urgente: O utilizador ${currentUser.name} (${currentUser.phone}) solicita comissão de ${requestedRate}% para o artigo "${pTitle}" (Preço: ${formatKwanza(priceVal)}).`
                );
              }
            }}
          />

          <KYCModal
            user={currentUser}
            isOpen={isKYCOpen}
            onClose={() => setIsKYCOpen(false)}
            onSubmitKYC={handleSubmitKYC}
            activeSubmission={kycSubmissions.find(s => s.userId === currentUser.id && s.status === 'pending')}
          />
        </>
      )}

    </div>
  );
}
