import React, { useState } from 'react';
import { Product, Category, User, ProductCondition, PromotionType, AdCampaign } from '../types';
import { formatKwanza } from '../utils';
import { 
  MessageSquare, 
  Heart, 
  Bookmark, 
  Sparkles, 
  Send, 
  X, 
  PhoneCall, 
  ShieldCheck, 
  Award, 
  Clock, 
  Smartphone,
  MessageCircle,
  Flag,
  Check,
  Zap,
  Building,
  User as UserIcon,
  Crown,
  Share2,
  AlertTriangle,
  FileText,
  Home,
  Car,
  Cpu,
  Settings as SettingsIcon,
  Leaf,
  Hammer,
  Briefcase as BriefcaseIcon,
  GraduationCap,
  HeartPulse,
  Star,
  PlusCircle,
  LayoutGrid,
  Megaphone,
  Mail,
  Trash2
} from 'lucide-react';
import EmojiPicker from './EmojiPicker';

interface FeedProps {
  products: Product[];
  categories: Category[];
  adCampaigns?: AdCampaign[];
  currentUser: User | null;
  users?: User[];
  onLikeProduct: (productId: string) => void;
  onAddComment: (productId: string, text: string) => void;
  onDeleteProduct?: (productId: string) => void;
  onPromoteProduct: (
    productId: string, 
    promoType: PromotionType, 
    price: number, 
    durationDays: number,
    txId: string,
    bankName: string,
    proofImage?: string,
    notes?: string
  ) => void;
  onReportProduct: (type: 'user' | 'company' | 'product', targetId: string, targetTitle: string, reason: string, details: string) => void;
  onStartChat: (productId: string) => void;
  onInitiateEscrowPurchase?: any;
  onActivateDeal?: any;
  onInterestProduct?: any;
  onNegotiateCommission?: any;
  negotiationRequests?: any;
  onPublishClick?: any;
  onSendSms?: any;
  initialCategory?: string;
  initialShowMyProductsOnly?: boolean;
  onGoToAdvertising?: () => void;
  platformBankName?: string;
  platformBeneficiary?: string;
  platformIban?: string;
  onUpdateProduct?: (product: Product) => void;
  onAddNotification?: (
    targetUserId: string,
    senderId: string,
    senderName: string,
    productId: string,
    productTitle: string,
    type: 'like' | 'comment' | 'interest' | 'message',
    text: string
  ) => void;
}

const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'imoveis': return <Home size={18} className="text-[#2563EB]" />;
    case 'automoveis': return <Car size={18} className="text-emerald-400" />;
    case 'tecnologia': return <Cpu size={18} className="text-amber-400" />;
    case 'servicos': return <SettingsIcon size={18} className="text-sky-400" />;
    case 'agricultura': return <Leaf size={18} className="text-green-400" />;
    case 'construcao': return <Hammer size={18} className="text-orange-400" />;
    case 'empregos': return <BriefcaseIcon size={18} className="text-indigo-400" />;
    case 'educacao': return <GraduationCap size={18} className="text-purple-400" />;
    case 'saude': return <HeartPulse size={18} className="text-red-400" />;
    default: return <SettingsIcon size={18} className="text-slate-400" />;
  }
};

const DEFAULT_SIDEBAR_ADS = [
  {
    id: 'sb_pep',
    companyName: 'PEP Angola',
    imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop',
    linkUrl: 'https://pep.co.ao',
    description: 'pep.co.ao'
  },
  {
    id: 'sb_grammarly',
    companyName: 'Your AI writing assistant',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
    linkUrl: 'https://grammarly.com',
    description: 'grammarly.com'
  }
];

export default function Feed({
  products,
  categories,
  adCampaigns = [],
  currentUser,
  users = [],
  onLikeProduct,
  onAddComment,
  onPromoteProduct,
  onReportProduct,
  onStartChat,
  onPublishClick,
  onSendSms,
  initialCategory,
  initialShowMyProductsOnly,
  onGoToAdvertising,
  platformBankName = 'BFA (Banco Fomento Angola)',
  platformBeneficiary = 'Nossos Negócios, Lda',
  platformIban = 'AO06.0006.0049.2019.4810.1897.6',
  onUpdateProduct,
  onAddNotification,
  onDeleteProduct
}: FeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [showAdContactModal, setShowAdContactModal] = useState(false);
  const [showMyProductsOnly, setShowMyProductsOnly] = useState(initialShowMyProductsOnly || false);

  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialShowMyProductsOnly !== undefined) {
      setShowMyProductsOnly(initialShowMyProductsOnly);
    }
  }, [initialShowMyProductsOnly]);
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState<'all' | ProductCondition>('all');
  const [onlyPromoted, setOnlyPromoted] = useState(false);

  // Active product details modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  
  // Tab states for promotional flyer info
  const [activeFlyerSection, setActiveFlyerSection] = useState<'none' | 'particular' | 'profissional' | 'empresa'>('none');
  
  // Custom states inside details modal
  const [commentInput, setCommentInput] = useState('');
  const [interestMarker, setInterestMarker] = useState<Record<string, boolean>>({});
  const [promoteOpen, setPromoteOpen] = useState(false);

  const [selectedPromoPkg, setSelectedPromoPkg] = useState<{
    type: PromotionType;
    name: string;
    durationDays: number;
    price: number;
    label: string;
  } | null>(null);
  const [promoPaymentBank, setPromoPaymentBank] = useState('BAI');
  const [promoPaymentProof, setPromoPaymentProof] = useState('');
  const [promoPaymentNotes, setPromoPaymentNotes] = useState('');
  const [promoPaymentTxId, setPromoPaymentTxId] = useState('');
  const [isPromoPaymentConfirmed, setIsPromoPaymentConfirmed] = useState(false);

  React.useEffect(() => {
    if (!promoteOpen || !selectedProduct) {
      setSelectedPromoPkg(null);
      setPromoPaymentTxId('');
      setPromoPaymentProof('');
      setPromoPaymentNotes('');
      setIsPromoPaymentConfirmed(false);
    }
  }, [promoteOpen, selectedProduct]);

  // Local inline SMS and Report state
  const [quickSmsOpenId, setQuickSmsOpenId] = useState<string | null>(null);
  const [quickSmsText, setQuickSmsText] = useState<string>('');
  const [smsSuccessMsg, setSmsSuccessMsg] = useState<string | null>(null);

  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('Anúncio Suspeito / Fraude');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // --- RECRUTAMENTO SYSTEM STATES ---
  const [jobApplications, setJobApplications] = useState<any[]>([]);

  const [isApplying, setIsApplying] = useState(false);
  const [activeCandidateDetail, setActiveCandidateDetail] = useState<any | null>(null);

  // Candidacy Form States
  const [candName, setCandName] = useState('');
  const [candBirthDate, setCandBirthDate] = useState('');
  const [candGender, setCandGender] = useState('Prefiro não dizer');
  const [candPhone, setCandPhone] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candCity, setCandCity] = useState('Luanda');
  const [candAddress, setCandAddress] = useState('');
  const [candEducation, setCandEducation] = useState('Ensino Médio');
  const [candFieldOfStudy, setCandFieldOfStudy] = useState('');
  const [candExperienceYears, setCandExperienceYears] = useState('0');
  const [candCoverLetter, setCandCoverLetter] = useState('');
  const [candSkills, setCandSkills] = useState('');
  const [candAvailability, setCandAvailability] = useState('Imediata');
  const [candSalaryExpectation, setCandSalaryExpectation] = useState('');
  const [candPortfolioUrl, setCandPortfolioUrl] = useState('');
  const [candResumeFileName, setCandResumeFileName] = useState('');
  const [candResumeFileUrl, setCandResumeFileUrl] = useState('');
  const [candPhotoUrl, setCandPhotoUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  React.useEffect(() => {
    setIsApplying(false);
    setActiveCandidateDetail(null);
    setCandName(currentUser?.name || '');
    setCandEmail(currentUser?.email || '');
    setCandPhone(currentUser?.phone || '');
    setCandBirthDate('');
    setCandGender('Prefiro não dizer');
    setCandCity('Luanda');
    setCandAddress('');
    setCandEducation('Ensino Médio');
    setCandFieldOfStudy('');
    setCandExperienceYears('0');
    setCandCoverLetter('');
    setCandSkills('');
    setCandAvailability('Imediata');
    setCandSalaryExpectation('');
    setCandPortfolioUrl('');
    setCandResumeFileName('');
    setCandResumeFileUrl('');
    setCandPhotoUrl('');
    setUploadError(null);
  }, [selectedProduct, currentUser]);

  // --- RECRUTAMENTO ACTION HANDLERS ---
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase();

    if (fileExt !== 'pdf' && fileExt !== 'docx' && fileExt !== 'doc') {
      setUploadError("Formato de ficheiro não permitido. Apenas PDF, DOC ou DOCX são aceites.");
      setCandResumeFileName('');
      setCandResumeFileUrl('');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCandResumeFileName(fileName);
      setCandResumeFileUrl(typeof reader.result === 'string' ? reader.result : 'mock-cv-url');
    };
    reader.readAsDataURL(file);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!selectedProduct) return;

    if (!candName.trim() || !candPhone.trim() || !candEmail.trim() || !candFieldOfStudy.trim() || !candCoverLetter.trim() || !candSkills.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!candResumeFileName) {
      alert("Por favor, anexe o seu currículo em formato PDF ou DOCX.");
      return;
    }

    const appId = 'app_' + Math.random().toString(36).substr(2, 9);
    
    const newApplication = {
      id: appId,
      jobId: selectedProduct.id,
      jobTitle: selectedProduct.title,
      employerId: selectedProduct.sellerId,
      candidateId: currentUser?.id || 'anonymous',
      name: candName,
      birthDate: candBirthDate || undefined,
      gender: candGender,
      phone: candPhone,
      email: candEmail,
      city: candCity,
      address: candAddress || undefined,
      education: candEducation,
      fieldOfStudy: candFieldOfStudy,
      experienceYears: parseInt(candExperienceYears, 10) || 0,
      coverLetter: candCoverLetter,
      skills: candSkills,
      availability: candAvailability,
      salaryExpectation: candSalaryExpectation || undefined,
      portfolioUrl: candPortfolioUrl || undefined,
      resumeFileUrl: candResumeFileUrl,
      resumeFileName: candResumeFileName,
      appliedAt: new Date().toLocaleTimeString('pt-AO') + ' ' + new Date().toLocaleDateString('pt-AO'),
      status: 'Pendente'
    };

    setJobApplications(prev => [newApplication, ...prev]);
    setIsApplying(false);

    if (onAddNotification) {
      onAddNotification(
        selectedProduct.sellerId,
        currentUser?.id || 'anonymous',
        candName,
        selectedProduct.id,
        selectedProduct.title,
        'interest',
        `Nova candidatura recebida de ${candName} para a vaga "${selectedProduct.title}".`
      );
    }

    alert("A sua candidatura foi enviada com sucesso.");
  };

  const handleUpdateCandidateStatus = (appId: string, newStatus: 'Pendente' | 'Em análise' | 'Aprovada' | 'Rejeitada') => {
    setJobApplications(prev => prev.map(app => {
      if (app.id === appId) {
        if (onAddNotification && app.candidateId && app.candidateId !== 'anonymous') {
          onAddNotification(
            app.candidateId,
            currentUser?.id || 'employer',
            selectedProduct?.sellerName || 'Recrutador',
            app.jobId,
            app.jobTitle,
            'message',
            `A sua candidatura para a vaga "${app.jobTitle}" foi atualizada para o estado: ${newStatus}.`
          );
        }
        return { ...app, status: newStatus };
      }
      return app;
    }));

    if (activeCandidateDetail && activeCandidateDetail.id === appId) {
      setActiveCandidateDetail(prev => prev ? { ...prev, status: newStatus } : null);
    }

    alert(`Estado da candidatura atualizado para: ${newStatus}`);
  };

  const handleToggleJobStatus = () => {
    if (!selectedProduct || !onUpdateProduct) return;
    const nextStatus = selectedProduct.jobStatus === 'Encerrada' ? 'Aberta' : 'Encerrada';
    const updated = {
      ...selectedProduct,
      jobStatus: nextStatus as 'Aberta' | 'Encerrada'
    };
    setSelectedProduct(updated);
    onUpdateProduct(updated);
    alert(`A vaga foi ${nextStatus === 'Aberta' ? 'reaberta' : 'encerrada'} com sucesso.`);
  };

  // Filtered campaigns
  const activePromoBanners = adCampaigns.filter(c => c.status === 'active' && c.bannerType === 'premium');
  const activeCategoryBanners = adCampaigns.filter(c => c.status === 'active' && c.bannerType === 'categoria');
  const activeInitialBanners = adCampaigns.filter(c => c.status === 'active' && c.bannerType === 'inicial');
  const totalActiveAds = activePromoBanners.length + activeCategoryBanners.length;

  const getSafeHostname = (url: string) => {
    try {
      const secureUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      return new URL(secureUrl).hostname;
    } catch {
      return url;
    }
  };

  const activeCampaigns = adCampaigns.filter(c => c.status === 'active');
  const sidebarAds = [
    ...activeCampaigns.map(c => ({
      id: c.id,
      companyName: c.companyName,
      imageUrl: c.imageUrl,
      linkUrl: c.linkUrl || `tel:${c.contactPhone}`,
      description: c.linkUrl ? getSafeHostname(c.linkUrl) : `Ligar: ${c.contactPhone}`
    })),
    ...DEFAULT_SIDEBAR_ADS
  ];

  // Filtering products
  const filteredProducts = products.filter(p => {
    if (showMyProductsOnly && currentUser && p.sellerId !== currentUser.id) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (conditionFilter !== 'all' && p.condition !== conditionFilter) return false;
    
    if (onlyPromoted) {
      const hasActivePromo = p.promotionType && (!p.promotionExpiresAt || new Date(p.promotionExpiresAt).getTime() > Date.now());
      if (!hasActivePromo) return false;
    }
    
    if (searchQuery) {
      const matchText = p.title.toLowerCase() + p.description.toLowerCase() + p.sellerName.toLowerCase();
      if (!matchText.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  }).sort((a, b) => {
    // Get active promotion types (treating expired as undefined)
    const getActivePromo = (p: Product) => {
      if (!p.promotionType) return undefined;
      if (p.promotionExpiresAt) {
        if (new Date(p.promotionExpiresAt).getTime() < Date.now()) {
          return undefined; // Expired, back to free
        }
      }
      return p.promotionType;
    };

    const promoA = getActivePromo(a);
    const promoB = getActivePromo(b);

    const getRank = (p: Product, promo: PromotionType | undefined) => {
      if (promo === 'vip') return 5;
      if (promo === 'premium') return 4;
      if (promo === 'plus') return 3;
      
      // Free ads - check if seller is verified
      const seller = users.find(u => u.id === p.sellerId);
      const isSellerVerified = seller ? seller.isVerified : false;
      return isSellerVerified ? 2 : 1;
    };

    const rankA = getRank(a, promoA);
    const rankB = getRank(b, promoB);

    if (rankA !== rankB) {
      return rankB - rankA; // Higher rank first
    }

    // Same rank - sorting of tied plans:
    if (promoA && promoB) {
      const expiresA = a.promotionExpiresAt ? new Date(a.promotionExpiresAt).getTime() : 0;
      const expiresB = b.promotionExpiresAt ? new Date(b.promotionExpiresAt).getTime() : 0;
      if (expiresA !== expiresB) {
        return expiresB - expiresA; // Latest expiration first
      }
    }

    // Secondary fallback: order by newest creation date
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  // Grouping products for custom segregated sections on the Feed
  const vipProducts = filteredProducts.filter(p => {
    const activePromo = p.promotionType && (!p.promotionExpiresAt || new Date(p.promotionExpiresAt).getTime() > Date.now()) ? p.promotionType : undefined;
    return activePromo === 'vip';
  });

  const premiumProducts = filteredProducts.filter(p => {
    const activePromo = p.promotionType && (!p.promotionExpiresAt || new Date(p.promotionExpiresAt).getTime() > Date.now()) ? p.promotionType : undefined;
    return activePromo === 'premium';
  });

  const plusProducts = filteredProducts.filter(p => {
    const activePromo = p.promotionType && (!p.promotionExpiresAt || new Date(p.promotionExpiresAt).getTime() > Date.now()) ? p.promotionType : undefined;
    return activePromo === 'plus';
  });

  const regularProducts = filteredProducts.filter(p => {
    const activePromo = p.promotionType && (!p.promotionExpiresAt || new Date(p.promotionExpiresAt).getTime() > Date.now()) ? p.promotionType : undefined;
    return !activePromo;
  });

  const handlePromoteProductClick = (type: PromotionType, price: number, durationDays: number) => {
    if (!selectedProduct) return;
    onPromoteProduct(
      selectedProduct.id,
      type,
      price,
      durationDays,
      promoPaymentTxId,
      promoPaymentBank,
      promoPaymentProof || undefined,
      promoPaymentNotes || undefined
    );
    
    setPromoteOpen(false);
    alert(`Sucesso! O comprovativo para o destaque "${type.toUpperCase()}" foi submetido. O administrador irá verificar o recebimento e aprovar a ativação.`);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!reportDetails.trim()) {
      alert('Por favor, descreva em detalhe o que está de errado.');
      return;
    }
    onReportProduct('product', selectedProduct.id, selectedProduct.title, reportReason, reportDetails);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setShowReportForm(false);
      setReportDetails('');
    }, 2500);
  };

  const handleSendMockSms = (p: Product) => {
    if (!quickSmsText.trim()) return;
    setSmsSuccessMsg(`✓ SMS enviado com sucesso para ${p.sellerName} (${p.sellerType === 'empresa' ? 'Serviço Corporativo' : 'Vendedor'}).`);
    setTimeout(() => {
      setSmsSuccessMsg(null);
      setQuickSmsOpenId(null);
      setQuickSmsText('');
    }, 3000);
  };

  const renderProductCard = (p: Product, sizeType: 'vip' | 'premium' | 'plus' | 'regular') => {
    const isLiker = currentUser && p.likedBy.includes(currentUser.id);

    // Outer styling per tier
    let cardStyle = '';
    let badgeStyle = '';
    let badgeIcon = null;
    let badgeLabel = '';
    let imageContainerClass = 'aspect-video bg-slate-950 relative overflow-hidden';

    if (sizeType === 'vip') {
      cardStyle = 'border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.25)] ring-2 ring-[#D4AF37]/30 bg-gradient-to-br from-[#1E293B] via-[#1E293B] to-[#141b29] hover:shadow-[0_0_35px_rgba(212,175,55,0.45)] hover:border-yellow-400';
      badgeStyle = 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)] border border-amber-300/40';
      badgeIcon = <Crown size={11} className="animate-bounce" />;
      badgeLabel = 'ELITE VIP';
      // Make the image container larger for VIP
      imageContainerClass = 'aspect-video sm:aspect-[21/9] bg-slate-950 relative overflow-hidden';
    } else if (sizeType === 'premium') {
      cardStyle = 'border-[#8B5CF6] shadow-[0_0_18px_rgba(139,92,246,0.2)] ring-1 ring-[#8B5CF6]/20 bg-gradient-to-br from-[#1E293B] to-[#15172b] hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:border-violet-400';
      badgeStyle = 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]';
      badgeIcon = <Sparkles size={10} />;
      badgeLabel = 'PREMIUM';
    } else if (sizeType === 'plus') {
      cardStyle = 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.12)] bg-[#1e293b]/95 hover:shadow-[0_0_20px_rgba(16,185,129,0.22)] hover:border-emerald-400';
      badgeStyle = 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white';
      badgeIcon = <Zap size={10} />;
      badgeLabel = 'PLUS';
    } else {
      cardStyle = 'border-slate-850 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60 hover:shadow-lg';
    }

    return (
      <div
        key={p.id}
        onClick={() => {
          setSelectedProduct(p);
          setPromoteOpen(false);
          setShowReportForm(false);
        }}
        className={`border rounded-2xl overflow-hidden shadow-md transition-all flex flex-col group cursor-pointer text-left h-full ${cardStyle}`}
      >
        <div className={imageContainerClass}>
          <img
            src={p.images[0]}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />

          {/* Promotion Badge */}
          {sizeType !== 'regular' && (
            <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md flex items-center space-x-1.5 font-sans ${badgeStyle}`}>
              {badgeIcon}
              <span>{badgeLabel}</span>
            </span>
          )}

          {/* Special sticker badge on top right for VIP to increase visual value */}
          {sizeType === 'vip' && (
            <span className="absolute top-3 right-3 bg-black/75 text-[#D4AF37] border border-[#D4AF37]/50 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest font-mono shadow-md animate-pulse">
              ★ RECOMENDADO ★
            </span>
          )}

          {p.category === 'empregos' ? (
            <span className="absolute bottom-2.5 right-2.5 bg-[#2563EB] text-white border border-blue-500/50 px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider font-mono">
              {p.jobType || 'Tempo integral'}
            </span>
          ) : (
            <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white border border-slate-700/50 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider font-mono">
              {p.condition === 'novo' ? 'Selado' : p.condition === 'como_novo' ? 'Como Novo' : 'Usado'}
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              {p.category === 'empregos' ? (
                <span className="uppercase text-emerald-400 font-black tracking-wide">💼 VAGA DE EMPREGO</span>
              ) : (
                <span className={`uppercase font-bold ${
                  sizeType === 'vip' ? 'text-amber-400 font-extrabold' : 
                  sizeType === 'premium' ? 'text-purple-400 font-bold' :
                  sizeType === 'plus' ? 'text-emerald-400 font-bold' : 'text-blue-400'
                }`}>{p.category}</span>
              )}
              <span className="flex items-center space-x-1">
                {p.sellerType === 'empresa' ? <Building size={10} className="text-emerald-400" /> : <UserIcon size={10} />}
                <span className="truncate max-w-[90px]">{p.sellerName}</span>
              </span>
            </div>

            <h4 className={`font-sans font-black text-slate-100 transition-colors leading-snug truncate ${
              sizeType === 'vip' 
                ? 'text-base sm:text-lg text-amber-100 group-hover:text-yellow-400' 
                : 'text-sm group-hover:text-blue-400'
            }`}>
              {p.title}
            </h4>

            {p.category === 'empregos' && (
              <div className="flex flex-wrap gap-1.5 py-0.5">
                <span className="bg-[#0F172A] text-slate-300 text-[9px] px-2 py-0.5 rounded-full font-sans font-semibold border border-slate-800">📍 {p.location || 'Luanda'}</span>
                <span className="bg-[#0F172A] text-slate-300 text-[9px] px-2 py-0.5 rounded-full font-sans font-semibold border border-slate-800">💻 {p.workMode || 'Presencial'}</span>
              </div>
            )}

            <p className={`text-slate-400 line-clamp-2 leading-relaxed ${sizeType === 'vip' ? 'text-xs sm:text-[13px] text-slate-300' : 'text-xs'}`}>
              {p.description}
            </p>
          </div>

          <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
            {p.category === 'empregos' ? (
              <span className="font-mono font-black text-emerald-400 text-xs bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                {p.price > 0 ? `${formatKwanza(p.price)}/mês` : 'Salário a negociar'}
              </span>
            ) : (
              <span className={`font-mono font-black ${sizeType === 'vip' ? 'text-amber-400 text-base' : 'text-rose-450 text-sm'}`}>
                {formatKwanza(p.price)}
              </span>
            )}

            <div className="flex space-x-2 text-slate-400 text-xs shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLikeProduct(p.id);
                }}
                className={`flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer ${isLiker ? 'text-red-500 font-extrabold' : ''}`}
              >
                <Heart size={12} fill={isLiker ? 'currentColor' : 'none'} />
                <span className="text-[10px]">{p.likes}</span>
              </button>

              <span className="flex items-center space-x-1">
                <MessageSquare size={12} />
                <span className="text-[10px] font-mono">{p.comments.length}</span>
              </span>

              {currentUser && currentUser.id === p.sellerId ? (
                deletingProductId === p.id ? (
                  <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteProduct) {
                          onDeleteProduct(p.id);
                        }
                        setDeletingProductId(null);
                      }}
                      className="text-[9px] font-mono bg-red-600 text-white hover:bg-red-700 px-1.5 py-0.5 rounded-md border border-red-500 font-extrabold cursor-pointer transition-colors"
                    >
                      Confirmar ✅
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingProductId(null);
                      }}
                      className="text-[9px] font-mono bg-slate-800 text-slate-300 hover:text-white px-1 py-0.5 rounded-md border border-slate-700 cursor-pointer transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingProductId(p.id);
                    }}
                    className="text-[10px] font-mono bg-red-600/15 text-red-400 hover:bg-red-600 hover:text-white px-2 py-0.5 rounded-md border border-red-500/20 flex items-center gap-1 cursor-pointer transition-colors animate-in fade-in duration-200"
                  >
                    <Trash2 size={10} />
                    <span>Eliminar</span>
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!currentUser) {
                        alert('Por favor, inicie sessão para abrir um chat.');
                        return;
                      }
                      if (currentUser.id === p.sellerId) {
                        alert('Este anúncio foi publicado por si.');
                        return;
                      }
                      onStartChat(p.id);
                    }}
                    className="text-[10px] font-mono bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded-md border border-blue-500/15"
                  >
                    Chat
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (quickSmsOpenId === p.id) {
                        setQuickSmsOpenId(null);
                      } else {
                        setQuickSmsOpenId(p.id);
                        setQuickSmsText(`Olá ${p.sellerName}, tenho muito interesse no anúncio "${p.title}".`);
                      }
                    }}
                    className="text-[10px] font-mono bg-slate-800 text-slate-350 hover:text-white px-1.5 py-0.5 rounded-md border border-slate-700"
                  >
                    SMS
                  </button>
                </>
              )}
            </div>
          </div>

          {/* SMS inline module */}
          {quickSmsOpenId === p.id && (
            <div 
              className="mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center text-[8.5px] text-slate-400 font-black uppercase tracking-wider font-mono">
                <span>Módulo SMS p/ {p.sellerName}</span>
                <button onClick={() => setQuickSmsOpenId(null)} className="text-red-400">Fechar</button>
              </div>

              {smsSuccessMsg ? (
                <div className="p-2 text-emerald-450 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-center text-[10px] font-bold">
                  {smsSuccessMsg}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative flex items-center">
                    <textarea
                      rows={2}
                      value={quickSmsText}
                      onChange={(e) => setQuickSmsText(e.target.value)}
                      className="w-full bg-[#121212] border border-slate-800 p-2 pr-12 text-xs text-white rounded-lg focus:outline-none"
                    />
                    <div className="absolute right-2 bottom-2">
                      <EmojiPicker onEmojiSelect={(emoji) => setQuickSmsText(prev => prev + emoji)} placement="top" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendMockSms(p)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-1.5 rounded-lg text-center"
                  >
                    Enviar Notificação SMS
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* 1. BANNER PRINCIPAL (HERO BANNER) */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-slate-800 rounded-2xl p-4 sm:p-8 text-left relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl -z-10" />
        
        <div className="max-w-2xl space-y-2.5 sm:space-y-3.5">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider font-mono">
            ⚡ MERCADO Intermediário Oficial do Mercado de Angola
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-sans font-black text-white tracking-tight uppercase leading-none">
            NOSSOS <span className="text-[#2563EB]">NEGÓCIOS</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-300 font-sans font-medium leading-normal sm:leading-relaxed max-w-xl">
            Conectamos Compradores, Vendedores, Profissionais Independentes e Empresas. Negócio direto, simples e sem intermediários imprevistos ou custos ocultos!
          </p>
          
          <div className="flex flex-wrap gap-2.5 pt-1.5">
            <button
              onClick={() => onPublishClick ? onPublishClick() : null}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-lg active:scale-98"
            >
              <PlusCircle size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>Publicar Anúncio</span>
            </button>
            <button
              onClick={() => onGoToAdvertising ? onGoToAdvertising() : null}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-lg active:scale-98"
            >
              <Megaphone size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>Publicitar</span>
            </button>
            {currentUser && (
              <button
                onClick={() => {
                  setShowMyProductsOnly(true);
                  const el = document.getElementById('market-search');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all border border-slate-700 shadow-lg active:scale-98"
              >
                <FileText size={12} className="text-blue-400 sm:w-3.5 sm:h-3.5" />
                <span>Ver os Meus Produtos</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Feed Content Column (Takes 3 of 4 columns on large screens) */}
        <div className="lg:col-span-3 space-y-8">

          {/* 🌟 USER BENEFITS EXPLANATORY PANEL COLLAPSED FOR COMFORT */}
      <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl text-left text-white shadow-md relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h4 className="font-sans font-bold text-xs text-white flex items-center gap-1.5 uppercase">
              <Sparkles size={14} className="text-amber-400" />
              Modalidades de Registo e Vantagens
            </h4>
            <p className="text-[10px] text-slate-400">Consulte aqui os planos de utilizador cadastrados na nossa rede.</p>
          </div>
          
          <div className="flex space-x-1 shrink-0">
            {['particular', 'profissional', 'empresa'].map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveFlyerSection(activeFlyerSection === sec ? 'none' : sec as any)}
                className={`py-1 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all border cursor-pointer ${
                  activeFlyerSection === sec
                    ? 'bg-[#2563EB] text-white border-blue-500'
                    : 'bg-neutral-950 text-slate-400 border-neutral-800 hover:text-white'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Individual Panels */}
        {activeFlyerSection === 'particular' && (
          <div className="bg-neutral-950 p-4 rounded-xl mt-3 space-y-1 text-xs text-slate-300 animate-in slide-in-from-top-1 duration-200">
            <span className="font-black text-[#2563EB] block">1. Particular (Grátis)</span>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Perfeito para transações eventuais. Publique até <strong className="text-white">15 anúncios ativos</strong> (ou até <strong className="text-white">40 anúncios ativos</strong> com conta verificada) em simultâneo com chats diretos integrados e favoritos.
            </p>
          </div>
        )}

        {activeFlyerSection === 'profissional' && (
          <div className="bg-neutral-950 p-4 rounded-xl mt-3 space-y-1 text-xs text-slate-300 animate-in slide-in-from-top-1 duration-200">
            <span className="font-black text-blue-400 block">2. Profissional (5.000 Kz/mês • 70.000 Kz/ano)</span>
            <p className="text-[11px] leading-relaxed text-slate-400">
              A escolha de corretores, mecânicos e freelancers. Até <strong className="text-white">100 anúncios ativos</strong>, selo azul de prestador verificado e dois anúncios destacados grátis mensais.
            </p>
          </div>
        )}

        {activeFlyerSection === 'empresa' && (
          <div className="bg-neutral-950 p-4 rounded-xl mt-3 space-y-1 text-xs text-slate-300 animate-in slide-in-from-top-1 duration-200">
            <span className="font-black text-emerald-400 block">3. Empresa (20.000 Kz/mês • 200.000 Kz/ano)</span>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Direcionado para stands, lojas e marcas organizadas. <strong className="text-white">Anúncios ilimitados</strong>, página própria dedicada, selo dourado de verificação jurídica e cinco destaques mensais.
            </p>
          </div>
        )}
      </div>

      {/* 3. CANAL DE PUBLICIDADE E MARCAS PATROCINADAS (HIGH VISIBILITY NOBLE POSITION) */}
      <div className="space-y-4 pt-2 text-left bg-slate-950/20 p-4 rounded-3xl border border-slate-900 shadow-inner">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-sans font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Megaphone size={16} className="text-[#D4AF37] animate-pulse" />
              Canal de Publicidade & Marcas Parceiras
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Campanhas e anúncios institucionais dos patrocinadores oficiais do Nossos Negócios.</p>
          </div>
          <button
            onClick={() => onGoToAdvertising ? onGoToAdvertising() : null}
            className="text-[9.5px] font-black uppercase tracking-wider bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/25 px-3 py-1.5 rounded-xl transition-all cursor-pointer select-none"
          >
            Publicitar Marca / Produto 📢
          </button>
        </div>

        {totalActiveAds > 0 ? (
          <div className="space-y-6 pt-2">
            {/* TIER 1: PATROCINADORES MASTER ELITE (PREMIUM PLAN) */}
            {activePromoBanners.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[#D4AF37] tracking-widest font-mono">
                  <Crown size={12} className="animate-bounce text-[#D4AF37]" />
                  <span>Patrocinadores Master Elite • Plan Premium</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {activePromoBanners.map(c => (
                    <div key={c.id} className="relative rounded-2xl md:rounded-3xl overflow-hidden border-2 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.2)] hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] group transition-all duration-300">
                      <img 
                        src={c.imageUrl} 
                        alt={c.companyName} 
                        className="w-full h-32 sm:h-36 md:h-40 object-cover group-hover:scale-[1.005] transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-transparent flex items-center px-4 sm:px-10">
                        <div className="text-left max-w-sm sm:max-w-md space-y-2">
                          <span className="inline-flex items-center gap-1 text-[8px] bg-[#D4AF37] text-black font-black font-mono tracking-widest uppercase px-2 py-0.5 rounded shadow-sm">
                            👑 RECOMENDADO ELITE MASTER
                          </span>
                          <h2 className="text-sm sm:text-xl font-black uppercase text-white tracking-tight leading-none group-hover:text-yellow-400 transition-colors">
                            {c.companyName}
                          </h2>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <a 
                              href={`tel:${c.contactPhone}`}
                              className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] bg-[#D4AF37] hover:bg-amber-500 text-neutral-950 font-black px-3.5 py-1.5 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all transform hover:scale-101"
                            >
                              <PhoneCall size={10} />
                              <span>Ligar: {c.contactPhone}</span>
                            </a>
                            {c.linkUrl && (
                              <a 
                                href={c.linkUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] bg-slate-900/90 hover:bg-slate-800 text-white font-bold px-2.5 py-1.5 rounded-xl border border-slate-800 transition-all"
                              >
                                <span>Ver Website</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TIER 2: PARCEIROS SECTORIAIS (CATEGORY PLAN) */}
            {activeCategoryBanners.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-violet-400 tracking-widest font-mono">
                  <Sparkles size={11} className="text-violet-400" />
                  <span>Parceiros Sectoriais • Plan Categoria</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeCategoryBanners.map(c => (
                    <div key={c.id} className="relative rounded-2xl overflow-hidden border border-[#8B5CF6]/50 bg-gradient-to-br from-[#1E293B] to-[#131526] p-3 flex gap-3 text-left shadow-[0_0_15px_rgba(139,92,246,0.12)] hover:border-[#8B5CF6] transition-all">
                      <img 
                        src={c.imageUrl} 
                        alt={c.companyName} 
                        className="w-20 h-20 object-cover rounded-xl border border-slate-800 bg-neutral-950 shrink-0 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex flex-col justify-between overflow-hidden py-0.5">
                        <div className="space-y-0.5">
                          <span className="text-[7px] bg-[#8B5CF6]/25 text-violet-300 border border-[#8B5CF6]/20 px-1.5 py-0.5 rounded uppercase font-black tracking-widest font-mono">
                            ✨ PARCEIRO SECTORIAL
                          </span>
                          <h4 className="font-sans font-black text-xs text-white leading-tight truncate mt-1">
                            {c.companyName}
                          </h4>
                          <p className="text-[9.5px] text-slate-400 line-clamp-2 leading-tight">
                            Marca certificada com promoção exclusiva no segmento {c.targetCategory || 'Geral'}.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <a 
                            href={`tel:${c.contactPhone}`}
                            className="text-[9px] text-[#8B5CF6] hover:text-violet-300 font-black flex items-center gap-1"
                          >
                            <PhoneCall size={9} />
                            <span>Contacto: {c.contactPhone}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Demo Static Advertising Info when there are no active campaigns */
          <div className="bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 p-5 rounded-3xl text-left space-y-3 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-black text-xs sm:text-sm text-white uppercase flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                  Divulgue o seu Negócio ou Empresa para milhares de angolanos!
                </h4>
                <p className="text-[10.5px] text-zinc-400 max-w-xl leading-relaxed">
                  Adquira banners promocionais em posições nobres de alta visibilidade com exposição direta dos seus contactos no portal. Destaques diferenciados nos planos Master Premium, Categoria e Inicial para impulsionar as suas vendas em Angola!
                </p>
              </div>
              <button 
                onClick={() => onGoToAdvertising ? onGoToAdvertising() : null}
                className="bg-[#D4AF37] hover:bg-amber-500 text-neutral-950 font-black text-xs py-2.5 px-5 rounded-xl shadow-lg cursor-pointer whitespace-nowrap shrink-0 transition-all select-none"
              >
                Divulgar no Canal 📢
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FILTER PANEL */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md space-y-3">
        
        {/* Core input and conditions */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            id="market-search"
            placeholder="Pesquise por telemóvel, marca de carro, NIF de empresa ou serviços em Angola..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-sans"
          />

          <div className="flex space-x-2 shrink-0 w-full md:w-auto">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value as 'all' | ProductCondition)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-blue-400 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="all">Qualquer Estado</option>
              <option value="novo">Novo (Selado)</option>
              <option value="como_novo">Como Novo</option>
              <option value="usado">Usado</option>
            </select>

            <button
              onClick={() => setOnlyPromoted(!onlyPromoted)}
              className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all flex items-center space-x-1 ${
                onlyPromoted 
                  ? 'bg-[#2563EB] text-white border-blue-500 shadow-md shadow-blue-500/10' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Sparkles size={12} className={onlyPromoted ? 'text-amber-300' : ''} />
              <span>Ver Destaques</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setShowMyProductsOnly(!showMyProductsOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all flex items-center space-x-1 ${
                  showMyProductsOnly 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10' 
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <FileText size={12} className={showMyProductsOnly ? 'text-blue-200' : ''} />
                <span>Minhas Publicações</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories sliding list */}
        <div className="space-y-1.5 pt-0.5">
          <label className="text-[10px] uppercase font-bold text-slate-500 block tracking-widest font-mono text-left">
            Seleção por Categorias Oficiais
          </label>
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                selectedCategory === 'all'
                  ? 'bg-[#2563EB] text-white border-blue-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Qualquer Categoria
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-[#2563EB] transition-all cursor-pointer border flex items-center space-x-1 ${
                  selectedCategory === cat.id
                    ? 'bg-[#2563EB] text-white border-blue-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Grid summary label */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center px-1">
          <p className="text-xs text-slate-400 font-medium text-left">
            Encontrados <strong className="text-white">{filteredProducts.length}</strong> anúncios ativos no pipeline. Prioritário aos destaques fujas.
          </p>
        </div>

        {showMyProductsOnly && currentUser && (
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-3 flex justify-between items-center text-xs text-blue-400 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Mostrando apenas as suas publicações <strong>({filteredProducts.length} anúncios)</strong>.</span>
            </div>
            <button
              onClick={() => setShowMyProductsOnly(false)}
              className="text-[10px] font-black uppercase bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg border border-blue-500/30 transition-all cursor-pointer"
            >
              Ver Todos os Anúncios
            </button>
          </div>
        )}
      </div>

      {/* SEPARATED AND HIGHLIGHTED PRODUCT TIERED SECTIONS */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-2xl text-center space-y-3">
          <p className="text-xs text-slate-500 italic">Nenhum anúncio correspondente aos filtros foi encontrado.</p>
          {showMyProductsOnly && (
            <button
              onClick={() => setShowMyProductsOnly(false)}
              className="text-xs text-[#2563EB] hover:underline font-bold cursor-pointer"
            >
              Remover filtro de "Minhas Publicações" para ver todos os anúncios
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {/* SECTION 1: VITRINA DE ELITE VIP (MAXIMUM FOOTPRINT) */}
          {vipProducts.length > 0 && (
            <div className="space-y-5 text-left border-l-4 border-[#D4AF37] pl-4 py-1 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col gap-1">
                <h3 className="font-sans font-black text-lg sm:text-xl uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                  <Crown size={22} className="text-amber-400 animate-bounce" />
                  Vitrina de Elite VIP
                </h3>
                <p className="text-xs text-amber-300/80 font-medium">
                  Negócios e produtos premium de máxima relevância com prioridade absoluta e destaque exclusivo em Angola.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vipProducts.map(p => renderProductCard(p, 'vip'))}
              </div>
            </div>
          )}

          {/* SECTION 2: DESTAQUES PREMIUM (HIGH VISIBILITY) */}
          {premiumProducts.length > 0 && (
            <div className="space-y-5 text-left border-l-4 border-[#8B5CF6] pl-4 py-1 animate-in fade-in duration-300">
              <div className="flex flex-col gap-1">
                <h3 className="font-sans font-black text-base sm:text-lg uppercase tracking-wider text-[#a78bfa] flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-400" />
                  Destaques Premium
                </h3>
                <p className="text-xs text-purple-300/80">
                  Produtos em evidência para rápido engajamento e alta taxa de cliques no pipeline.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {premiumProducts.map(p => renderProductCard(p, 'premium'))}
              </div>
            </div>
          )}

          {/* SECTION 3: DESTAQUES PLUS */}
          {plusProducts.length > 0 && (
            <div className="space-y-5 text-left border-l-4 border-emerald-500 pl-4 py-1 animate-in fade-in duration-300">
              <div className="flex flex-col gap-1">
                <h3 className="font-sans font-black text-sm sm:text-base uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Zap size={16} className="text-emerald-400 animate-pulse" />
                  Destaques Plus
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Evidência básica com posicionamento preferencial no feed de intermediação.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {plusProducts.map(p => renderProductCard(p, 'plus'))}
              </div>
            </div>
          )}

          {/* SECTION 4: PIPELINE GERAL (ALL UNPROMOTED PRODUCTS) */}
          <div className="space-y-5 text-left border-l-4 border-slate-700 pl-4 py-1 pt-4 border-t border-slate-800/60 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1">
              <h3 className="font-sans font-black text-sm sm:text-base uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <LayoutGrid size={16} className="text-slate-400" />
                Pipeline de Anúncios Gerais
              </h3>
              <p className="text-xs text-slate-400">
                Todos os outros anúncios ativos do feed, classificados por data de publicação.
              </p>
            </div>
            {regularProducts.length === 0 ? (
              <div className="bg-slate-900/10 border border-slate-850 p-6 rounded-xl text-center text-xs text-slate-500 italic">
                Nenhum anúncio geral nesta categoria de momento. Todos os anúncios atuais possuem destaque ativo!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {regularProducts.map(p => renderProductCard(p, 'regular'))}
              </div>
            )}
          </div>
        </div>
      )}



      {/* 5. EMPRESAS EM DESTAQUE */}
      <div className="space-y-4 text-left pt-6 border-t border-slate-800">
        <div>
          <h3 className="font-sans font-black text-sm uppercase tracking-wider text-white flex items-center gap-1.5">
            <Building size={16} className="text-emerald-400" />
            Empresas Parceiras Elite em Destaque
          </h3>
          <p className="text-[10px] text-zinc-400 mt-0.5">Lojas autorizadas, stands oficiais e distribuidores corporativos auditados com NIF válido.</p>
        </div>

        {users.filter(u => u.accountType === 'empresa').length === 0 ? (
          <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl text-center text-xs text-slate-500">
            Nenhuma marca corporativa destacada de momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.filter(u => u.accountType === 'empresa').map(company => (
              <div key={company.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex gap-4 hover:border-emerald-500/30 transition-all items-start text-left">
                <img 
                  src={company.logo || company.avatar} 
                  alt={company.companyName || company.name} 
                  className="w-14 h-14 rounded-xl object-cover border border-slate-800 bg-black shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-extrabold text-xs text-white leading-tight truncate">
                        {company.companyName || company.name}
                      </h4>
                      <span className="text-amber-400 text-[10px]" title="Empresa Verificada">
                        <ShieldCheck size={12} fill="currentColor" className="text-amber-400" />
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 line-clamp-1 mt-0.5">
                      {company.description || "Representação corporativa líder com serviços integrados de excelência em Angola."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={9} 
                          fill={i < Math.floor(company.rating || 5) ? "currentColor" : "none"} 
                          className={i < Math.floor(company.rating || 5) ? "text-amber-400 animate-pulse" : "text-slate-700"} 
                        />
                      ))}
                      <span className="text-[9px] text-slate-400 font-mono ml-1">({company.ratingsCount || 20})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          alert("Por favor, inicie sessão para iniciar a conversação.");
                          return;
                        }
                        if (company.id === currentUser.id) {
                          alert("Este é o seu próprio perfil corporativo.");
                          return;
                        }
                        onStartChat(company.id);
                      }}
                      className="text-[9px] font-black uppercase tracking-wider text-emerald-450 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Solicitar Catálogo →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        </div>

        {/* Right Sidebar Column (Facebook Sponsored Style) */}
        <div className="lg:col-span-1 space-y-4 sticky top-24 hidden lg:block text-left bg-neutral-900/10 border border-neutral-800/40 p-4 rounded-3xl">
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2 mb-2">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
              Patrocinado
            </span>
            <button
              onClick={() => onGoToAdvertising ? onGoToAdvertising() : null}
              className="text-[10.5px] text-blue-500 hover:text-blue-400 font-bold transition-colors cursor-pointer"
            >
              Anunciar aqui
            </button>
          </div>

          <div className="space-y-4">
            {sidebarAds.map((ad) => {
              const hrefVal = ad.linkUrl ? (ad.linkUrl.startsWith('http') || ad.linkUrl.startsWith('tel:') ? ad.linkUrl : `https://${ad.linkUrl}`) : '#';
              return (
                <a
                  key={ad.id}
                  href={hrefVal}
                  target={hrefVal.startsWith('http') ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-neutral-900/40 hover:border-neutral-800/40 transition-all duration-200 group border border-transparent"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-neutral-800 bg-neutral-950">
                    <img
                      src={ad.imageUrl}
                      alt={ad.companyName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className="text-xs font-extrabold text-slate-100 group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                      {ad.companyName}
                    </h4>
                    <span className="text-[10px] text-slate-400 hover:underline block mt-1 truncate">
                      {ad.description}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* DETALHES MODAL (Lightbox Overlay) */}
      {selectedProduct && (
        <div id="product-details-modal" className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl max-w-4xl w-full my-8 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-white">
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-mono text-[#2563EB] font-extrabold">{selectedProduct.category}</span>
                <h3 className="font-sans font-black text-white text-sm sm:text-base tracking-tight leading-tight mt-0.5">{selectedProduct.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {selectedProduct.category === 'empregos' ? (
              /* ================= DENTRO DO MODAL DE EMPREGOS ================= */
              <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-left font-sans animate-in fade-in duration-350">
                {/* Cabeçalho da Vaga com visual corporativo */}
                <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                      Empresa Contratante
                    </span>
                    <h4 className="text-lg font-black text-white font-sans">{selectedProduct.companyName}</h4>
                    <p className="text-xs text-slate-400">📍 {selectedProduct.location || selectedProduct.jobLocation} • {selectedProduct.workSchedule}</p>
                  </div>
                  <div className="text-right sm:text-right font-mono text-xs">
                    <span className="block text-slate-500 text-[10px] uppercase font-bold">Tipo de Vaga</span>
                    <span className="text-blue-400 font-extrabold">{selectedProduct.jobType}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Detalhes da Vaga (Col 1 & 2) */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <h5 className="font-bold text-[11px] text-slate-300 uppercase tracking-widest font-mono border-b border-slate-800 pb-1.5">
                        Descrição do Cargo & Requisitos
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                        {selectedProduct.description}
                      </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <h5 className="font-bold text-[11px] text-slate-300 uppercase tracking-widest font-mono border-b border-slate-800 pb-1.5">
                        Contacto Direto do Recrutador
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 block uppercase font-sans">E-mail para contacto</span>
                          <span className="text-white font-bold select-all">{selectedProduct.recruiterEmail}</span>
                        </div>
                        <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 block uppercase font-sans">Telefone para contacto</span>
                          <span className="text-white font-bold select-all">+244 {selectedProduct.recruiterPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coluna Lateral: Candidatar-se ou Lista de Candidatos (Col 3) */}
                  <div className="space-y-4">
                    {currentUser && selectedProduct.sellerId === currentUser.id ? (
                      /* ================= SEÇÃO DO EMPREGADOR: CANDIDATURAS RECEBIDAS ================= */
                      <>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                          <div className="border-b border-slate-800 pb-2">
                            <h5 className="font-bold text-[11px] text-emerald-400 uppercase tracking-widest font-mono">
                              Candidatos Inscritos ({jobApplications.filter(app => app.jobId === selectedProduct.id).length})
                            </h5>
                            <p className="text-[9px] text-slate-400 mt-0.5">Visualize as informações e descarregue os currículos</p>
                          </div>

                          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                            {jobApplications.filter(app => app.jobId === selectedProduct.id).length === 0 ? (
                              <div className="text-center py-6 text-slate-500 text-xs italic">
                                Nenhuma candidatura recebida ainda para esta vaga.
                              </div>
                            ) : (
                              jobApplications.filter(app => app.jobId === selectedProduct.id).map(app => (
                                <div key={app.id} className="bg-[#0F172A] border border-slate-800 p-3 rounded-xl space-y-2.5 hover:border-slate-700 transition-all">
                                  <div className="flex gap-2.5 items-center">
                                    {app.photoUrl ? (
                                      <img 
                                        src={app.photoUrl} 
                                        alt="Passe" 
                                        className="w-10 h-12 object-cover rounded border border-slate-800 bg-slate-950 shrink-0" 
                                      />
                                    ) : (
                                      <div className="w-10 h-12 bg-slate-950 border border-slate-800 rounded flex items-center justify-center shrink-0">
                                        <span className="text-[8px] text-slate-500 font-bold uppercase">SEM FOTO</span>
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <h6 className="font-sans font-black text-xs text-white truncate">{app.name}</h6>
                                      <p className="text-[9px] text-slate-400 font-mono truncate">{app.email}</p>
                                      <p className="text-[9px] text-slate-400 font-mono">+244 {app.phone}</p>
                                    </div>
                                  </div>

                                  <div className="border-t border-slate-800/60 pt-2 flex flex-col gap-1.5">
                                    {app.resumeFileUrl && (
                                      <a
                                        href={app.resumeFileUrl}
                                        download={app.resumeFileName || 'curriculo.pdf'}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[9px] py-1.5 px-2.5 rounded-lg text-center uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        📄 Baixar Currículo PDF
                                      </a>
                                    )}
                                    <span className="text-[8px] text-slate-500 font-mono text-center">
                                      Enviado em: {app.appliedAt}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* ZONA DE PERIGO PARA VAGA */}
                        <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-5 space-y-3 animate-in fade-in duration-200">
                          <h5 className="font-bold text-[11px] text-red-400 uppercase tracking-widest font-mono">
                            Zona de Perigo
                          </h5>
                          <p className="text-[10px] text-slate-400 leading-snug">Deseja remover esta vaga de emprego do painel de anúncios públicos?</p>
                          {deletingProductId === selectedProduct.id ? (
                            <div className="flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onDeleteProduct) {
                                    onDeleteProduct(selectedProduct.id);
                                  }
                                  setSelectedProduct(null);
                                  setDeletingProductId(null);
                                }}
                                className="w-full text-center text-[10px] font-mono bg-red-650 hover:bg-red-700 text-white py-2 rounded-xl border border-red-500 font-extrabold cursor-pointer transition-colors"
                              >
                                Confirmar Eliminação 🚨
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingProductId(null)}
                                className="w-full text-center text-[10px] font-sans bg-slate-850 text-slate-350 hover:text-white py-1.5 rounded-xl border border-slate-700 cursor-pointer transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingProductId(selectedProduct.id)}
                              className="w-full bg-red-600/15 hover:bg-red-650 text-red-400 hover:text-white font-black text-[10px] py-2 px-3 rounded-xl uppercase tracking-wide cursor-pointer text-center flex items-center justify-center gap-1.5 transition-all border border-red-500/20 shadow-md active:scale-95"
                            >
                              <Trash2 size={12} className="text-red-400" />
                              Eliminar Vaga de Emprego
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      /* ================= SEÇÃO DO CANDIDATO: FORMULÁRIO OU SUCESSO ================= */
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        {isApplying ? (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!candName.trim() || !candEmail.trim() || !candPhone.trim()) {
                              alert("Por favor, preencha todos os campos.");
                              return;
                            }
                            if (!candResumeFileUrl) {
                              alert("Por favor, anexe o seu currículo em formato PDF.");
                              return;
                            }
                            if (!candPhotoUrl) {
                              alert("Por favor, carregue a sua fotografia tipo passe.");
                              return;
                            }

                            const appId = 'app_' + Math.random().toString(36).substr(2, 9);
                            const newApp = {
                              id: appId,
                              jobId: selectedProduct.id,
                              jobTitle: selectedProduct.title,
                              employerId: selectedProduct.sellerId,
                              candidateId: currentUser?.id || 'anonymous',
                              name: candName,
                              email: candEmail,
                              phone: candPhone,
                              resumeFileUrl: candResumeFileUrl,
                              resumeFileName: candResumeFileName || 'curriculo.pdf',
                              photoUrl: candPhotoUrl,
                              appliedAt: new Date().toLocaleTimeString('pt-AO') + ' ' + new Date().toLocaleDateString('pt-AO'),
                              status: 'Pendente'
                            };

                            setJobApplications(prev => [newApp, ...prev]);
                            setIsApplying(false);
                            alert("Candidatura enviada com sucesso!");
                          }} className="space-y-3.5">
                            <h5 className="font-bold text-[11px] text-blue-400 uppercase tracking-widest font-mono border-b border-slate-800 pb-1.5">
                              Enviar Candidatura
                            </h5>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">Nome Completo</label>
                              <input 
                                type="text"
                                placeholder="Seu nome completo"
                                value={candName}
                                onChange={(e) => setCandName(e.target.value)}
                                className="w-full bg-[#0F172A] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">E-mail</label>
                              <input 
                                type="email"
                                placeholder="seu.email@provedor.com"
                                value={candEmail}
                                onChange={(e) => setCandEmail(e.target.value)}
                                className="w-full bg-[#0F172A] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">Número de Telefone</label>
                              <input 
                                type="tel"
                                placeholder="924567890"
                                value={candPhone}
                                onChange={(e) => setCandPhone(e.target.value)}
                                className="w-full bg-[#0F172A] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">Currículo (PDF)</label>
                              <input 
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.type !== 'application/pdf') {
                                      alert("Por favor, carregue um ficheiro apenas em formato PDF.");
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setCandResumeFileName(file.name);
                                      setCandResumeFileUrl(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="w-full text-slate-400 text-xs font-sans file:bg-slate-850 file:text-slate-300 file:border-0 file:rounded-lg file:p-2 file:text-xs file:font-bold hover:file:bg-slate-800 file:cursor-pointer cursor-pointer file:mr-2"
                                required
                              />
                              {candResumeFileName && <p className="text-[9px] text-emerald-400 mt-0.5 font-mono">✓ {candResumeFileName}</p>}
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">Fotografia Tipo Passe</label>
                              <input 
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setCandPhotoUrl(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="w-full text-slate-400 text-xs font-sans file:bg-slate-850 file:text-slate-300 file:border-0 file:rounded-lg file:p-2 file:text-xs file:font-bold hover:file:bg-slate-800 file:cursor-pointer cursor-pointer file:mr-2"
                                required
                              />
                              {candPhotoUrl && (
                                <img 
                                  src={candPhotoUrl} 
                                  alt="Passe mini" 
                                  className="w-10 h-12 object-cover rounded mt-1.5 border border-slate-700" 
                                />
                              )}
                            </div>

                            <div className="pt-2 flex gap-2 font-bold text-xs">
                              <button
                                type="submit"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-center cursor-pointer transition-all uppercase tracking-tight text-xs"
                              >
                                Enviar Candidatura 🚀
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsApplying(false)}
                                className="bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-755 px-3 py-2.5 rounded-xl"
                              >
                                Cancelar
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-4 text-center py-6">
                            <div className="h-12 w-12 bg-blue-600/10 border border-blue-500/20 text-[#2563EB] rounded-full flex items-center justify-center mx-auto">
                              <BriefcaseIcon size={20} />
                            </div>
                            <div className="space-y-1">
                              <h6 className="font-sans font-black text-xs text-white uppercase">Tem interesse nesta vaga?</h6>
                              <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-normal">Candidate-se enviando as suas informações, currículo atualizado e foto tipo passe de forma segura.</p>
                            </div>

                            {jobApplications.some(app => app.jobId === selectedProduct.id && app.candidateId === (currentUser?.id || 'anonymous')) ? (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] p-2.5 rounded-xl font-bold">
                                ✓ Já se candidatou a esta vaga!
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setIsApplying(true)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 px-4 rounded-xl shadow-lg transition-all hover:scale-102 flex items-center justify-center space-x-2 cursor-pointer tracking-wide text-xs uppercase"
                              >
                                <span>Candidatar-se à Vaga 💼</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              
              {/* Left Column */}
              <div className="space-y-4 text-left">
                <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {selectedProduct.promotionType && (!selectedProduct.promotionExpiresAt || new Date(selectedProduct.promotionExpiresAt).getTime() > Date.now()) && (
                    <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 ${
                      selectedProduct.promotionType === 'vip' 
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-md border border-amber-300/30' 
                        : selectedProduct.promotionType === 'premium'
                          ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-md'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white'
                    }`}>
                      {selectedProduct.promotionType === 'vip' ? <Crown size={9} /> : selectedProduct.promotionType === 'premium' ? <Sparkles size={9} /> : <Zap size={9} />}
                      <span>Destaque {selectedProduct.promotionType.toUpperCase()}</span>
                    </span>
                  )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Preço Indicado</span>
                    <span className="font-mono font-black text-emerald-400 text-base">
                      {formatKwanza(selectedProduct.price)}
                    </span>
                  </div>

                  <div className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                    🤝 <strong>Vantagem do Acordo Profissional:</strong> Toda a publicidade e promoção são tratadas de forma automatizada pelo marketplace do <strong>Nossos Negócios</strong>, conectando investidores sem intermediações bancárias restritivas.
                  </div>

                  {currentUser && selectedProduct.sellerId === currentUser.id && (
                    <div className="border-t border-slate-800 pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-300 font-bold">Gerir Promoções do Produto</span>
                        <button
                          type="button"
                          onClick={() => setPromoteOpen(!promoteOpen)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[9.5px] px-3 py-1.5 rounded-lg uppercase tracking-wide cursor-pointer text-center flex items-center gap-1 transition-all shadow-md active:scale-95 animate-pulse"
                        >
                          Promover Produto 🚀
                        </button>
                      </div>

                      {promoteOpen && (() => {
                        const accountType = currentUser?.accountType || 'particular';
                        const isProfissional = accountType === 'profissional';
                        const isEmpresa = accountType === 'empresa';
                        
                        const promoPackages = isProfissional ? [
                          { type: 'plus' as PromotionType, name: 'Destaque Plus (1d)', durationDays: 1, price: 800, label: '800 Kz' },
                          { type: 'premium' as PromotionType, name: 'Destaque Premium (7d)', durationDays: 7, price: 7000, label: '7.000 Kz' },
                          { type: 'vip' as PromotionType, name: 'Destaque VIP (30d)', durationDays: 30, price: 17000, label: '17.000 Kz' }
                        ] : isEmpresa ? [
                          { type: 'plus' as PromotionType, name: 'Destaque Plus (1d)', durationDays: 1, price: 1200, label: '1.200 Kz' },
                          { type: 'premium' as PromotionType, name: 'Destaque Premium (7d)', durationDays: 7, price: 10000, label: '10.000 Kz' },
                          { type: 'vip' as PromotionType, name: 'Destaque VIP (30d)', durationDays: 30, price: 20000, label: '20.000 Kz' }
                        ] : [
                          // particular or individual
                          { type: 'plus' as PromotionType, name: 'Destaque Plus (1d)', durationDays: 1, price: 500, label: '500 Kz' },
                          { type: 'premium' as PromotionType, name: 'Destaque Premium (7d)', durationDays: 7, price: 4000, label: '4.000 Kz' },
                          { type: 'vip' as PromotionType, name: 'Destaque VIP (30d)', durationDays: 30, price: 12000, label: '12.000 Kz' }
                        ];

                        const accountLabel = isProfissional ? 'Conta Profissional' : isEmpresa ? 'Conta Empresa' : 'Conta Individual / Particular';

                        return (
                          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-3 animate-in fade-in duration-150 mt-2">
                            <div className="flex justify-between items-center">
                              <div className="space-y-0.5">
                                <span className="text-[9.5px] font-black text-amber-500 uppercase font-mono block">Escolher Plano de Promoção:</span>
                                <span className="text-[8.5px] text-slate-400 font-sans block">{accountLabel}</span>
                              </div>
                              <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded uppercase">Destaques Angola</span>
                            </div>

                            {!selectedPromoPkg ? (
                              <>
                                <div className="grid grid-cols-3 gap-2 text-[10px]">
                                  {promoPackages.map((pkg) => (
                                    <button
                                      key={pkg.type}
                                      type="button"
                                      onClick={() => setSelectedPromoPkg(pkg)}
                                      className="bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-lg p-2 text-center transition-all hover:scale-102 flex flex-col items-center justify-center space-y-1 cursor-pointer"
                                    >
                                      <span className="block font-black text-slate-200 text-[8.5px] leading-tight">{pkg.name}</span>
                                      <span className="text-amber-400 font-mono font-black text-[10.5px]">
                                        {pkg.label}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                                <span className="text-[8px] text-slate-500 block leading-tight">Ao promover, o seu anúncio será movido para o topo e obterá prioridade de cliques no feed de Angola.</span>
                              </>
                            ) : (
                              <div className="space-y-4 text-left">
                                <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-lg flex justify-between items-center">
                                  <div>
                                    <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Plano de Destaque:</span>
                                    <span className="text-[11px] font-extrabold text-white">{selectedPromoPkg.name}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedPromoPkg(null);
                                      setIsPromoPaymentConfirmed(false);
                                      setPromoPaymentTxId('');
                                      setPromoPaymentProof('');
                                    }}
                                    className="text-[9.5px] text-amber-400 hover:underline font-bold font-sans cursor-pointer"
                                  >
                                    Mudar Plano ↺
                                  </button>
                                </div>

                                {/* Seção de Pagamento para Destaque de Produto */}
                                <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-[#D4AF37]/40 space-y-3 animate-in fade-in duration-350 text-left">
                                  <div className="flex items-start gap-2">
                                    <span className="p-1.5 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20 text-[#D4AF37] shrink-0">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                                    </span>
                                    <div>
                                      <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-white">Efetuar Pagamento de Ativação</h4>
                                      <p className="text-[8.5px] text-zinc-400 mt-0.5 leading-normal">Efetue o pagamento do destaque selecionado e introduza o ID da transação para desbloquear a promoção.</p>
                                    </div>
                                  </div>

                                  {/* Price dynamic readout */}
                                  <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-850 flex justify-between items-center">
                                    <span className="text-[8px] uppercase font-mono font-bold text-gray-500">Valor Recomendado ({selectedPromoPkg.name}):</span>
                                    <span className="text-xs font-black font-mono text-[#D4AF37]">
                                      {formatKwanza(selectedPromoPkg.price)}
                                    </span>
                                  </div>

                                  {/* Bank Transfer Coordinates */}
                                  <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 space-y-2">
                                    <h5 className="text-[8px] uppercase tracking-wider font-bold text-[#D4AF37] font-mono border-b border-neutral-800 pb-1">Coordenadas Bancárias Oficiais</h5>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[8.5px] font-mono font-bold">
                                      <div className="bg-[#121212] p-1.5 rounded border border-neutral-800">
                                        <span className="text-[7px] text-zinc-500 block uppercase font-sans">Banco Destinatário</span>
                                        <span className="text-zinc-200 block mt-0.5 font-sans font-extrabold">{platformBankName}</span>
                                      </div>
                                      <div className="bg-[#121212] p-1.5 rounded border border-neutral-800">
                                        <span className="text-[7px] text-zinc-500 block uppercase font-sans">Beneficiário</span>
                                        <span className="text-zinc-200 block mt-0.5 font-sans font-extrabold">{platformBeneficiary}</span>
                                      </div>
                                      <div className="bg-[#121212] p-1.5 rounded border border-neutral-800 col-span-1 sm:col-span-2">
                                        <div className="flex justify-between items-center mb-0.5">
                                          <span className="text-[7px] text-zinc-500 uppercase block font-sans">IBAN Principal (Toque p/ copiar)</span>
                                        </div>
                                        <span 
                                          onClick={() => {
                                            navigator.clipboard.writeText(platformIban);
                                            alert('IBAN copiado com sucesso!');
                                          }}
                                          className="text-white block font-mono select-all tracking-wider text-[9px] bg-neutral-950 p-1 rounded border border-neutral-800 text-center cursor-pointer hover:bg-neutral-900"
                                        >
                                          {platformIban}
                                        </span>
                                      </div>
                                      <div className="bg-[#121212] p-1.5 rounded border border-neutral-800">
                                        <span className="text-[7px] text-zinc-500 block uppercase font-sans">Nº de Conta</span>
                                        <span className="text-white block mt-0.5">492019481 / 10 / 001</span>
                                      </div>
                                      <div className="bg-[#121212] p-1.5 rounded border border-neutral-800">
                                        <span className="text-[7px] text-zinc-500 block uppercase font-sans">Referência / Finalidade</span>
                                        <span className="text-[#D4AF37] block mt-0.5 font-sans">PROMO-{selectedProduct.id.substring(0, 8).toUpperCase()}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Deposit Verification Form */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                                    <div className="space-y-1">
                                      <label className="block text-[8px] uppercase font-bold tracking-widest text-[#D4AF37] pl-1 font-mono">Banco de Transferência</label>
                                      <select 
                                        value={promoPaymentBank}
                                        onChange={(e) => setPromoPaymentBank(e.target.value)}
                                        disabled={isPromoPaymentConfirmed}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-sans outline-none"
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
                                      <label className="block text-[8px] uppercase font-bold tracking-widest text-[#D4AF37] pl-1 font-mono">Valor Pago (Kz)</label>
                                      <input 
                                        type="text"
                                        value={formatKwanza(selectedPromoPkg.price)}
                                        disabled={true}
                                        className="w-full bg-neutral-950/70 border border-neutral-800 rounded-lg p-2 text-xs text-zinc-400 font-mono focus:outline-none cursor-not-allowed"
                                      />
                                    </div>

                                    <div className="space-y-1 sm:col-span-2">
                                      <label className="block text-[8px] uppercase font-bold tracking-widest text-[#D4AF37] pl-1 font-mono">Comprovativo Físico / Imagem Multicaixa</label>
                                      <div className="flex flex-col gap-1.5">
                                        <input 
                                          type="file"
                                          accept="image/*"
                                          id="promo-proof-upload"
                                          disabled={isPromoPaymentConfirmed}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                setPromoPaymentProof(reader.result as string);
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                          className="hidden"
                                        />
                                        <div className="flex gap-2">
                                          <label 
                                            htmlFor="promo-proof-upload"
                                            className={`flex-grow border border-dashed rounded-lg p-2 text-center text-xs font-bold font-sans cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                                              promoPaymentProof 
                                                ? 'border-emerald-500 bg-emerald-950/10 text-emerald-400' 
                                                : 'border-neutral-800 hover:border-[#D4AF37] text-zinc-400'
                                            } ${isPromoPaymentConfirmed ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                            <span>{promoPaymentProof ? '✓ Imagem Carregada' : 'Selecionar Imagem do Comprovativo / Talão'}</span>
                                          </label>

                                          {promoPaymentProof && !isPromoPaymentConfirmed && (
                                            <button
                                              type="button"
                                              onClick={() => setPromoPaymentProof('')}
                                              className="bg-red-650 hover:bg-red-700 text-white font-extrabold px-2.5 rounded-lg text-[9px] uppercase cursor-pointer transition-colors"
                                            >
                                              Remover
                                            </button>
                                          )}
                                        </div>
                                        {promoPaymentProof && (
                                          <div className="flex justify-center border border-neutral-800 p-1.5 rounded-lg bg-neutral-950">
                                            <img 
                                              src={promoPaymentProof} 
                                              alt="Miniatura do comprovativo" 
                                              className="max-h-20 max-w-full rounded object-contain border border-neutral-850"
                                              referrerPolicy="no-referrer"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="space-y-1 sm:col-span-2">
                                      <label className="block text-[8px] uppercase font-bold tracking-widest text-[#D4AF37] pl-1 font-mono">Observações (Opcional)</label>
                                      <input 
                                        type="text"
                                        placeholder="Indique dados adicionais da sua transferência..."
                                        value={promoPaymentNotes}
                                        onChange={(e) => setPromoPaymentNotes(e.target.value)}
                                        disabled={isPromoPaymentConfirmed}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-sans"
                                      />
                                    </div>
                                  </div>

                                  {/* Verification Input & Action */}
                                  <div className="space-y-2 pt-2 border-t border-neutral-800">
                                    <label className="block text-[8.5px] font-bold uppercase tracking-widest text-[#D4AF37] font-mono pl-1">
                                      ID de Transação do Comprovativo <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <input
                                        type="text"
                                        placeholder="Insira o ID / Identificador da transferência"
                                        value={promoPaymentTxId}
                                        onChange={(e) => setPromoPaymentTxId(e.target.value)}
                                        disabled={isPromoPaymentConfirmed}
                                        className="flex-grow bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] font-mono"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (!promoPaymentTxId.trim()) {
                                            alert('Atenção: Deve preencher obrigatoriamente o campo ID de Transação antes de clicar em Confirmar Pagamento.');
                                            return;
                                          }
                                          setIsPromoPaymentConfirmed(true);
                                          alert(`✓ Identificador do comprovativo "${promoPaymentTxId}" registado com sucesso! Clique em "Submeter Pedido de Destaque" abaixo para enviar para aprovação do administrador.`);
                                        }}
                                        disabled={isPromoPaymentConfirmed}
                                        className={`px-3 py-2 rounded-lg font-black font-sans uppercase tracking-wider text-[9px] cursor-pointer shrink-0 text-center transition-all ${
                                          isPromoPaymentConfirmed 
                                            ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/30' 
                                            : 'bg-[#D4AF37] hover:bg-amber-500 text-black shadow-md font-extrabold'
                                        }`}
                                      >
                                        {isPromoPaymentConfirmed ? '✓ Registado' : 'Confirmar Pagamento'}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Confirm promotion submit */}
                                  <div className="pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!isPromoPaymentConfirmed) {
                                          alert('Por favor, indique o ID de Transação e confirme o seu pagamento antes de clicar em Ativar Destaque.');
                                          return;
                                        }
                                        handlePromoteProductClick(selectedPromoPkg.type, selectedPromoPkg.price, selectedPromoPkg.durationDays);
                                      }}
                                      className={`w-full py-2.5 rounded-lg font-bold font-sans text-[10.5px] uppercase tracking-wider transition-all text-center cursor-pointer ${
                                        isPromoPaymentConfirmed 
                                          ? 'bg-[#D4AF37] hover:bg-amber-500 text-slate-950 shadow-lg' 
                                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                                      }`}
                                    >
                                      Submeter Pedido de Destaque para Validação 🚀
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {currentUser && selectedProduct.sellerId === currentUser.id && (
                    <div className="border-t border-red-500/20 pt-3.5 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-xs text-red-400 font-bold block">Zona de Perigo</span>
                          <span className="text-[9px] text-slate-400 block font-sans">Remover permanentemente este anúncio</span>
                        </div>
                        {deletingProductId === selectedProduct.id ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              type="button"
                              onClick={() => {
                                if (onDeleteProduct) {
                                  onDeleteProduct(selectedProduct.id);
                                }
                                setSelectedProduct(null);
                                setDeletingProductId(null);
                              }}
                              className="text-[10px] font-mono bg-red-650 text-white hover:bg-red-700 px-3 py-1.5 rounded-lg border border-red-500 font-extrabold cursor-pointer transition-colors"
                            >
                              Confirmar Eliminação 🚨
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingProductId(null)}
                              className="text-[10px] font-mono bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 cursor-pointer transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingProductId(selectedProduct.id)}
                            className="bg-red-600/15 hover:bg-red-650 text-red-400 hover:text-white font-black text-[9.5px] px-3 py-1.5 rounded-lg uppercase tracking-wide cursor-pointer text-center flex items-center gap-1 transition-all border border-red-500/20 shadow-md active:scale-95"
                          >
                            <Trash2 size={11} className="text-red-400" />
                            Eliminar Anúncio
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 flex flex-col justify-between text-left">
                <div className="space-y-4">
                  
                  {/* Seller info card */}
                  {(() => {
                    const sellerObj = users.find(u => u.id === selectedProduct.sellerId);
                    const sellerPhoneVal = sellerObj?.phone || '941963554';
                    return (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex gap-3 items-center">
                        <div className="h-10 w-10 bg-[#2563EB]/10 border border-blue-500/30 rounded-xl flex items-center justify-center font-black text-[#2563EB]">
                          {selectedProduct.sellerType === 'empresa' ? 'CORP' : (selectedProduct.sellerType === 'profissional' ? 'PRO' : 'PART')}
                        </div>
                        <div>
                          <span className="font-extrabold text-xs block text-white">Anunciante: {selectedProduct.sellerName}</span>
                          <span className="text-[10px] text-slate-400 block uppercase">
                            Nível {selectedProduct.sellerType === 'empresa' ? 'Corporate' : (selectedProduct.sellerType === 'profissional' ? 'Profissional' : 'Vendedor Particular')} • +244 {sellerPhoneVal}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-1">
                    <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest font-mono">Descrição Técnica</h5>
                    <p className="text-xs text-slate-350 leading-relaxed font-sans">{selectedProduct.description}</p>
                  </div>

                  {/* Public Q&A Comments */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest font-mono">Perguntas Públicas ({selectedProduct.comments.length})</h5>
                    
                    <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 text-[11px] custom-scrollbar">
                      {selectedProduct.comments.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic">Nenhum comentário público. Deixe uma pergunta abaixo!</p>
                      ) : (
                        selectedProduct.comments.map(c => (
                          <div key={c.id} className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                            <strong>{c.userName}:</strong> <span className="text-slate-300">{c.text}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {currentUser && (
                      <div className="flex gap-2">
                        <div className="relative flex-1 flex items-center">
                          <input
                            type="text"
                            placeholder="Perguntar ao anunciante..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 pr-12 text-xs focus:outline-none focus:border-blue-500"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <EmojiPicker onEmojiSelect={(emoji) => setCommentInput(prev => prev + emoji)} placement="top" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!commentInput.trim()) return;
                            onAddComment(selectedProduct.id, commentInput);
                            setCommentInput('');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-3.5 rounded-lg"
                        >
                          Enviar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations Section for Buyers */}
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  {currentUser && selectedProduct.sellerId === currentUser.id ? (
                    <div className="bg-blue-600/10 border border-blue-500/25 p-3 rounded-xl text-center text-[10px] text-blue-400 font-bold">
                      Este anúncio é seu. Utilize os planos de promoção para obter destaque de vendas em Angola.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUser) {
                            alert('Por favor, inicie sessão para conversar.');
                            return;
                          }
                          onStartChat(selectedProduct.id);
                          setSelectedProduct(null);
                        }}
                        className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-black py-2.5 px-4 rounded-xl shadow-lg transition-all hover:scale-102 flex items-center justify-center space-x-2 cursor-pointer tracking-wide text-xs uppercase"
                      >
                        <MessageSquare size={14} />
                        <span>Contactar Vendedor / Enviar Mensagem</span>
                      </button>

                      <a
                        href={'tel:' + (users.find(u => u.id === selectedProduct.sellerId)?.phone || '941963554')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl shadow-lg transition-all hover:scale-102 flex items-center justify-center space-x-2 cursor-pointer tracking-wide text-xs text-center uppercase"
                      >
                        <PhoneCall size={14} />
                        <span>{'Ligar para Vendedor (+244 ' + (users.find(u => u.id === selectedProduct.sellerId)?.phone || '941963554') + ')'}</span>
                      </a>
                    </div>
                  )}

                      {/* Client reports section inside lightbox */}
                      {(!currentUser || selectedProduct.sellerId !== currentUser.id) && (
                        <>
                          <div className="flex justify-between items-center px-1 text-[10px]">
                            <span className="text-slate-500">O produto é fraudulento ou suspeito?</span>
                            <button
                              type="button"
                              onClick={() => setShowReportForm(!showReportForm)}
                              className="text-red-400 hover:underline font-bold flex items-center gap-0.5"
                            >
                              <Flag size={10} />
                              <span>Denunciar Anúncio</span>
                            </button>
                          </div>

                          {showReportForm && (
                            <form onSubmit={handleReportSubmit} className="bg-slate-950 p-3 rounded-2xl border border-red-500/10 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase text-red-400 font-mono flex items-center gap-1">
                                  <AlertTriangle size={11} />
                                  Módulo de Denúncia
                                </span>
                              </div>

                              {reportSubmitted ? (
                                <div className="p-3 bg-red-500/10 text-red-300 text-center text-[10px] font-bold rounded-lg leading-normal">
                                  ✓ Denúncia enviada com sucesso ao Admin! Investigação interna agendada.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <select
                                      value={reportReason}
                                      onChange={(e) => setReportReason(e.target.value)}
                                      className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-white font-serif"
                                    >
                                      <option value="Fraude / Burla">Fraude / Burla</option>
                                      <option value="Preço Fictício">Preço Fictício</option>
                                      <option value="Duplicate listing">Duplicado</option>
                                      <option value="Assédio / Ofensa">Assédio / Ofensa</option>
                                    </select>
                                    <span className="text-[8.5px] text-slate-500 py-1.5 leading-snug">Denúncias falsas sistemáticas serão punidas.</span>
                                  </div>
                                  <div className="relative flex items-center">
                                    <textarea
                                      value={reportDetails}
                                      onChange={(e) => setReportDetails(e.target.value)}
                                      placeholder="Diga-nos de forma concreta o que de se passa de suspeito..."
                                      className="w-full bg-slate-900 border border-slate-800 p-2 pr-12 text-xs rounded-lg text-white"
                                      rows={2}
                                      required
                                    />
                                    <div className="absolute right-2 bottom-2">
                                      <EmojiPicker onEmojiSelect={(emoji) => setReportDetails(prev => prev + emoji)} placement="top" />
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      type="submit"
                                      className="bg-red-650 hover:bg-red-700 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg"
                                    >
                                      Enviar Denúncia
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setShowReportForm(false)}
                                      className="text-slate-450 text-[10px]"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              )}
                            </form>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                </div>
              )}
                
              </div>

            </div>
      )}

      {showAdContactModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-6 text-left relative overflow-hidden shadow-2xl">
            
            {/* Header / Title */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-black font-mono uppercase tracking-wider">
                  Publicidade & Campanhas
                </span>
                <h3 className="text-sm font-black text-white font-sans uppercase tracking-tight">
                  Quero Anunciar no Portal ⚡
                </h3>
              </div>
              <button 
                onClick={() => setShowAdContactModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Description */}
            <p className="text-[11px] text-slate-400 leading-normal font-sans">
              No <strong>Nossos Negócios</strong>, dispomos de dois formatos principais para promover negócios e produtos na maior rede profissional de intermediários comerciais de Angola:
            </p>

            {/* Formats Container */}
            <div className="space-y-3">
              {/* Option A: Default Classified Ad */}
              <div className="bg-[#121212]/50 border border-slate-900 p-3.5 rounded-2xl hover:border-blue-500/20 transition-all text-left">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/10 shrink-0">
                    <Zap size={14} className="text-amber-400" />
                  </div>
                  <div className="space-y-1 w-full">
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wide">
                      1. Publicar Anúncio de Produto/Serviço
                    </h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Crie um anúncio de venda ou serviço no nosso marketplace principal. Gratuito para particulares, com realces opcionais!
                    </p>
                    <button
                      onClick={() => {
                        setShowAdContactModal(false);
                        if (currentUser) {
                          if (onPublishClick) {
                            onPublishClick();
                          } else {
                            const tabBtn = document.getElementById('tab-publish');
                            if (tabBtn) tabBtn.click();
                          }
                        } else {
                          alert('Por favor, inicie sessão ou crie uma conta para publicar o seu anúncio no marketplace!');
                        }
                      }}
                      className="mt-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-black text-[9.5px] py-1.5 px-3.5 rounded-lg flex items-center space-x-1 uppercase tracking-wider cursor-pointer transition-all"
                    >
                      <span>Publicar Anúncio Agora</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Option B: Premium Header Banner */}
              <div className="bg-[#121212]/50 border border-slate-900 p-3.5 rounded-2xl hover:border-[#D4AF37]/20 transition-all text-left">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/10 shrink-0">
                    <Award size={14} className="text-[#D4AF37]" />
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[11px] font-bold text-white uppercase tracking-wide">
                        2. Banner Publicitário Premium (Topo)
                      </h4>
                      <span className="text-[8px] bg-amber-500/20 text-[#D4AF37] border border-amber-500/20 font-mono font-bold px-1 py-0.2 rounded uppercase">
                        75.000 Kz/Mês
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                      Destaque a sua marca corporativa, loja ou serviço na cabeceira principal do portal que todos os investidores veem de imediato.
                    </p>
                    
                    {/* Support Contact Info */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 mt-2 space-y-1.5 text-[10px]">
                      <span className="text-zinc-500 block uppercase font-mono text-[8.5px]">Fale diretamente com o suporte comercial:</span>
                      
                      <div className="flex flex-col sm:flex-row gap-2 font-semibold">
                        <a 
                          href="tel:+244941963554"
                          className="bg-slate-900 hover:bg-slate-850 p-1.5 border border-slate-800 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-colors w-full"
                        >
                          <PhoneCall size={10} className="text-blue-400 shrink-0" />
                          <span>941 963 554</span>
                        </a>
                        <a 
                          href="tel:+244957150407"
                          className="bg-slate-900 hover:bg-slate-850 p-1.5 border border-slate-800 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-colors w-full"
                        >
                          <PhoneCall size={10} className="text-blue-400 shrink-0" />
                          <span>957 150 407</span>
                        </a>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 font-bold text-[9px]">
                        <a 
                          href="https://wa.me/244941963554" 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-emerald-600/10 hover:bg-emerald-600/15 text-emerald-400 p-1.5 border border-emerald-500/20 rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer transition-colors w-full text-center"
                        >
                          <MessageSquare size={10} className="shrink-0" />
                          <span>WhatsApp</span>
                        </a>
                        <a 
                          href="mailto:nossosnegocios.ao@gmail.com"
                          className="bg-amber-500/10 hover:bg-amber-500/15 text-amber-400 p-1.5 border border-amber-500/20 rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer transition-colors w-full text-center"
                        >
                          <Mail size={10} className="shrink-0" />
                          <span>E-mail</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button Footer */}
            <div className="pt-2 border-t border-slate-900">
              <button
                onClick={() => setShowAdContactModal(false)}
                className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
