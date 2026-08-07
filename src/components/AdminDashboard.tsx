import React, { useState } from 'react';
import { 
  User, 
  Product, 
  VerificationSubmission, 
  CommissionNegotiation, 
  Category, 
  Transaction, 
  SystemStats, 
  SMSLog, 
  Report,
  SubscriptionPayment,
  AdCampaign
} from '../types';
import { formatKwanza } from '../utils';
import { PaymentOrder, PaymentService } from '../services/PaymentService';
import { 
  Users, 
  FileCheck, 
  DollarSign, 
  Tag, 
  MessageSquare, 
  Check, 
  X, 
  Building, 
  UserCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  CreditCard,
  Ban,
  TrendingUp,
  Award,
  Settings,
  Eye,
  EyeOff,
  Search,
  Filter,
  FileText,
  Download
} from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  products: Product[];
  kycSubmissions: VerificationSubmission[];
  negotiations: CommissionNegotiation[];
  categories: Category[];
  transactions: Transaction[];
  stats: SystemStats;
  onApproveKYC: (subId: string) => void;
  onRejectKYC: (subId: string, reason: string) => void;
  onApproveNegotiation: (negId: string) => void;
  onRejectNegotiation: (negId: string) => void;
  onToggleUserSuspension: (userId: string) => void;
  onAddCategory: (name: string, label: string) => void;
  onLogout?: () => void;
  onWithdrawAdminFunds?: (amount: number, iban: string, resolvedOwner: string) => void;
  onDepositAdminFunds?: (amount: number) => void;
  smsLogs?: SMSLog[];
  onSendSms?: (recipientName: string, phone: string, text: string) => void;
  reports?: Report[];
  onResolveReport?: (reportId: string) => void;
  onDismissReport?: (reportId: string) => void;
  subscriptionPayments?: SubscriptionPayment[];
  onApproveSubscriptionPayment?: (paymentId: string) => void;
  onRejectSubscriptionPayment?: (paymentId: string, reason: string) => void;
  
  // New unified manual payment orders properties
  paymentOrders?: PaymentOrder[];
  onApprovePaymentOrder?: (orderId: string, operator: string) => void;
  onRejectPaymentOrder?: (orderId: string, reason: string, operator: string) => void;

  adCampaigns?: AdCampaign[];
  onApproveCampaign?: (campaignId: string, startDate?: string, endDate?: string) => void;
  onRejectCampaign?: (campaignId: string) => void;
  adminPassword?: string;
  onUpdateAdminPassword?: (newPassword: string) => void;
  adminUsername?: string;
  adminEmail?: string;
  onUpdateAdminUsername?: (newUsername: string) => void;
  onUpdateAdminEmail?: (newEmail: string) => void;
  platformBankName?: string;
  onUpdatePlatformBankName?: (newName: string) => void;
  platformBeneficiary?: string;
  onUpdatePlatformBeneficiary?: (newBen: string) => void;
  platformIban?: string;
  onUpdatePlatformIban?: (newIban: string) => void;
  adminWithdrawnRevenues?: number;
  onWithdrawRevenue?: (amount: number, destBank: string, destIban: string, destOwner: string) => void;
}

export default function AdminDashboard({
  users,
  products,
  kycSubmissions,
  negotiations,
  categories,
  transactions,
  stats,
  onApproveKYC,
  onRejectKYC,
  onApproveNegotiation,
  onRejectNegotiation,
  onToggleUserSuspension,
  onAddCategory,
  onLogout,
  onWithdrawAdminFunds,
  onDepositAdminFunds,
  smsLogs = [],
  onSendSms,
  reports = [],
  onResolveReport,
  onDismissReport,
  subscriptionPayments = [],
  onApproveSubscriptionPayment,
  onRejectSubscriptionPayment,
  
  // Destructured new properties
  paymentOrders = [],
  onApprovePaymentOrder,
  onRejectPaymentOrder,

  adCampaigns = [],
  onApproveCampaign,
  onRejectCampaign,
  adminPassword = '123456',
  onUpdateAdminPassword,
  adminUsername = 'admin',
  adminEmail = 'nossosnegocios.ao@gmail.com',
  onUpdateAdminUsername,
  onUpdateAdminEmail,
  platformBankName = 'BFA (Banco Fomento Angola)',
  onUpdatePlatformBankName,
  platformBeneficiary = 'Nossos Negócios, Lda',
  onUpdatePlatformBeneficiary,
  platformIban = 'AO06.0006.0049.2019.4810.1897.6',
  onUpdatePlatformIban,
  adminWithdrawnRevenues = 0,
  onWithdrawRevenue
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'kyc' | 'commissions' | 'categories' | 'sms' | 'reports' | 'payments' | 'publicidade' | 'finance' | 'config'>('users');
  
  const [bNameInput, setBNameInput] = useState(platformBankName);
  const [bBenInput, setBBenInput] = useState(platformBeneficiary);
  const [bIbanInput, setBIbanInput] = useState(platformIban);

  const [admUserInput, setAdmUserInput] = useState(adminUsername);
  const [admEmailInput, setAdmEmailInput] = useState(adminEmail);
  const [admPassInput, setAdmPassInput] = useState(adminPassword);
  const [showAdmPass, setShowAdmPass] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [destBank, setDestBank] = useState('BFA (Banco Fomento Angola)');
  const [destIban, setDestIban] = useState('AO06.0006.0000.9988.7766.5544.3');
  const [destOwner, setDestOwner] = useState('Administrador');
  const [withdrawnSuccessMsg, setWithdrawnSuccessMsg] = useState('');

  const [rejectionReason, setRejectionReason] = useState('');
  const [activeKycRejectId, setActiveKycRejectId] = useState<string | null>(null);

  // New category inputs
  const [catName, setCatName] = useState('');
  const [catLabel, setCatLabel] = useState('');

  // Premium subscription payments states
  const [paymentSubTab, setPaymentSubTab] = useState<'subscriptions' | 'promotions'>('subscriptions');
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [subscriptionRejectReason, setSubscriptionRejectReason] = useState('');
  const [showSubscriptionRejectInputId, setShowSubscriptionRejectInputId] = useState<string | null>(null);
  
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [paymentRejectReason, setPaymentRejectReason] = useState('');
  const [showPaymentRejectInputId, setShowPaymentRejectInputId] = useState<string | null>(null);
  const [selectedProofImageUrl, setSelectedProofImageUrl] = useState<string | null>(null);

  // New manual payments filters & search
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'canceled'>('all');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');

  // Manual fast SMS messenger
  const [targetPhone, setTargetPhone] = useState('');
  const [targetSmsName, setTargetSmsName] = useState('');
  const [smsMessageText, setSmsMessageText] = useState('');

  // Totalized values that fall back securely on defaults
  const currentAdminFunds = stats.adminFunds ?? 0;
  const currentCommissionCollected = stats.totalCommissionCollected ?? 0;
  const currentVolume = stats.totalVolume ?? 0;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catLabel) {
      alert('Por favor, indique o ID e o Nome Legível da Categoria.');
      return;
    }
    onAddCategory(catName, catLabel);
    setCatName('');
    setCatLabel('');
    alert('Nova categoria comercial adicionada à árvore com sucesso!');
  };

  const handleSendManualMessage = () => {
    if (!targetPhone || !smsMessageText) {
      alert('Preencha o telemóvel e o texto da mensagem.');
      return;
    }
    if (onSendSms) {
      onSendSms(targetSmsName || 'Utilizador', targetPhone, smsMessageText);
      setSmsMessageText('');
      alert(`✓ SMS enviada com sucesso para o canal ${targetPhone}.`);
    }
  };

  return (
    <div className="bg-[#0F172A] w-full overflow-hidden text-slate-100 rounded-2xl md:rounded-3xl border border-slate-800 p-3 sm:p-5 md:p-6 space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
            <span>🛡️</span> PAINEL ADMINISTRATIVO CENTRAL
          </h2>
          <p className="text-[10.5px] text-slate-450 mt-0.5">Gerenciamento de publicidade, auditoria reputacional e conformidade comercial de Angola</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 hover:border-slate-700 transition">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">Senha Central Admin:</span>
            <input
              type="text"
              value={adminPassword}
              onChange={(e) => onUpdateAdminPassword && onUpdateAdminPassword(e.target.value)}
              className="bg-transparent border-b border-dashed border-slate-600 focus:border-blue-500 text-white font-mono text-xs w-24 outline-none text-center font-extrabold pb-0.5"
              placeholder="123456"
            />
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="bg-red-650 hover:bg-red-750 text-white font-bold py-1.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Sair do Painel Admin 🚪
            </button>
          )}
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        
        <div className="bg-[#1E293B] border border-slate-700 p-4.5 rounded-2xl space-y-1 shadow">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-widest block">Receitas de Planos</span>
          <span className="text-base font-black font-mono text-white block">{formatKwanza(stats.revenuePlans)}</span>
          <span className="text-[8.5px] text-slate-450 block">Assinaturas Profissionais/Empresa</span>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 p-4.5 rounded-2xl space-y-1 shadow">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-widest block">Receitas de Destaques</span>
          <span className="text-base font-black font-mono text-amber-400 block">{formatKwanza(stats.revenuePromotions)}</span>
          <span className="text-[8.5px] text-slate-450 block">Realces Básico / Plus / Prem / VIP</span>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 p-4.5 rounded-2xl space-y-1 shadow">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-widest block">Receitas Publicidade</span>
          <span className="text-base font-black font-mono text-emerald-400 block">{formatKwanza(stats.revenuePublicidade)}</span>
          <span className="text-[8.5px] text-slate-450 block">Campanhas e Banners de Marcas</span>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 p-4.5 rounded-2xl space-y-1 shadow">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-widest block">Fundo de Financiamento Admin</span>
          <span className="text-base font-black font-mono text-blue-400 block">{formatKwanza(currentAdminFunds)}</span>
          <span className="text-[8.5px] text-slate-450 block">As compensações são debitadas daqui</span>
        </div>

      </div>

      {/* TAB NAVIGATION */}
      <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex overflow-x-auto whitespace-nowrap scrollbar-none md:flex-wrap gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users' ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users size={12} />
          <span>Utilizadores ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 relative ${
            activeTab === 'kyc' ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck size={12} />
          <span>Auditoria KYC (B.I.)</span>
          {kycSubmissions.filter(s => s.status === 'pending').length > 0 && (
            <span className="bg-red-500 text-white font-bold px-1.5 rounded-full text-[8.5px] min-w-[15px] text-center">
              {kycSubmissions.filter(s => s.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sms')}
          className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sms' ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare size={12} />
          <span>Auditoria SMS ({smsLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 relative ${
            activeTab === 'reports' ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle size={12} />
          <span>Denúncias / Queixas</span>
          {reports.filter(r => r.status === 'pending').length > 0 && (
            <span className="bg-red-500 text-white font-bold h-4 w-4 rounded-full text-[9px] flex items-center justify-center animate-bounce">
              {reports.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'categories' ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tag size={12} />
          <span>Árvore Categorias ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 relative ${
            activeTab === 'payments' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard size={12} />
          <span>Controle de Transações ({paymentOrders.length})</span>
          {paymentOrders.filter(s => s.status === 'pending').length > 0 && (
            <span className="bg-red-500 text-white font-black px-1.5 rounded-full text-[8.5px] min-w-[15px] text-center animate-pulse">
              {paymentOrders.filter(s => s.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('publicidade')}
          className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 relative ${
            activeTab === 'publicidade' ? 'bg-[#2563EB] text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award size={12} />
          <span>Espaços Publicitários ({adCampaigns.length})</span>
          {adCampaigns.filter(c => c.status === 'pending').length > 0 && (
            <span className="bg-red-500 text-white font-black px-1.5 rounded-full text-[8.5px] min-w-[15px] text-center animate-bounce">
              {adCampaigns.filter(c => c.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 relative ${
            activeTab === 'finance' ? 'bg-[#10B981] text-black shadow font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign size={12} />
          <span>Finanças & Receitas</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 relative ${
            activeTab === 'config' ? 'bg-[#D4AF37] text-black shadow font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings size={12} />
          <span>Configurações</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB BODY */}
      <div className="bg-slate-900 border border-slate-800 p-3 sm:p-5 rounded-xl md:rounded-2xl text-left overflow-hidden">
        
        {/* USERS / COMPANIES */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-sans font-black text-white text-sm uppercase tracking-tight">Registo de Utilizadores & Empresas</h4>
                <p className="text-[10.5px] text-slate-400 mt-0.5">Clique em "Gerir Utilizador" para alterar planos de promoção, verificar documentos ou suspender infratores.</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-850 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-850 text-[10px] font-bold uppercase text-slate-400 font-mono">
                    <th className="p-3">Conta</th>
                    <th className="p-3">Telemóvel</th>
                    <th className="p-3">Categoria Fiscal</th>
                    <th className="p-3">Selo Oficial</th>
                    <th className="p-3 text-right">Plano de Subscrição</th>
                    <th className="p-3 text-center">Controlo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className={`${u.isSuspended ? 'bg-red-500/10' : 'hover:bg-slate-950/20'}`}>
                      <td className="p-3 flex items-center gap-2">
                        <img src={u.avatar} alt={u.name} className="h-7 w-7 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                        <div>
                          <span className="font-black text-white block">{u.name}</span>
                          <span className="text-[9.5px] text-slate-400 block font-mono">{u.email}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-350">{u.phone}</td>
                      <td className="p-3">
                        <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${
                          u.accountType === 'empresa' ? 'bg-[#2563EB]/10 text-blue-400 border-blue-500/20' : 'bg-slate-850 text-slate-400 border-slate-705'
                        }`}>
                          {u.accountType}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.isVerified ? (
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black uppercase px-2 py-0.5 rounded-md">
                            ✓ Ativo Verificado
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-850">
                            Não Verificado
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold">
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md ${
                          u.accountType === 'empresa' 
                            ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-950'
                            : u.accountType === 'profissional'
                            ? 'text-amber-400 bg-amber-950/40 border border-amber-950'
                            : 'text-zinc-400 bg-neutral-900 border border-neutral-950'
                        }`}>
                          {u.accountType === 'empresa' ? 'Empresa' : u.accountType === 'profissional' ? 'Profissional' : 'Individual'}
                        </span>
                      </td>
                      <td className="p-3 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => onToggleUserSuspension(u.id)}
                          className={`px-3 py-1 rounded border text-[9.5px] font-black uppercase transition-colors shrink-0 cursor-pointer ${
                            u.isSuspended
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {u.isSuspended ? 'Ativar' : 'Banir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KYC AUDIT SUBMISSIONS */}
        {activeTab === 'kyc' && (
          <div className="space-y-4 text-left">
            <div>
              <h4 className="font-sans font-black text-white text-sm uppercase tracking-tight">Auditoria de Bilhetes de Identidade e NIF</h4>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Examine a autenticidade de documentos de utilizadores comuns solicitando o selo oficial (1.000 Kz).</p>
            </div>

            {kycSubmissions.length === 0 ? (
              <div className="p-10 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                Sem auditorias individuais ativas ou pendentes no stack momentâneo.
              </div>
            ) : (
              <div className="space-y-4">
                {kycSubmissions.map((sub) => (
                  <div key={sub.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-white text-xs">{sub.userName}</strong>
                        <span className={`text-[8.5px] font-black uppercase px-2 py-0.2 rounded ${
                          sub.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {sub.status.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">Tipo: {sub.type === 'empresa' ? 'Empresa / Certidão' : 'Singular / BI'}</span>
                      </div>

                      {sub.type === 'empresa' ? (
                        <div className="text-xs text-slate-400 space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 max-w-sm">
                          <p>🏢 <strong>NIF Corporativo:</strong> <span className="font-mono text-white">{sub.nif || 'Não Indicado'}</span></p>
                          <p>📄 <strong>Certidão de Registo Comercial:</strong> <span className="text-[#2563EB] hover:underline font-bold cursor-pointer">certidao_comercial.pdf</span></p>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 max-w-sm">
                          <p>🔑 Front/Back ID & Selfie física enviados de forma digital garantida.</p>
                        </div>
                      )}

                      <p className="text-[9.5px] text-slate-500">Submetido em: {sub.submittedAt}</p>
                    </div>

                    {sub.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                        <button
                          onClick={() => {
                            onApproveKYC(sub.id);
                            alert('Submissão de documento de verificação aprovada com sucesso! O utilizador recebeu o selo de autenticidade.');
                          }}
                          className="bg-emerald-650 hover:bg-emerald-700 text-white font-bold p-1 px-3 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={11} />
                          <span>Aprovar</span>
                        </button>
                        
                        {activeKycRejectId === sub.id ? (
                          <div className="flex gap-1.5 items-center bg-[#1E293B] p-2 rounded-xl border border-slate-700 animate-in fade-in duration-100">
                            <input 
                              type="text" 
                              placeholder="Razão da recusa..." 
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="bg-slate-900 border border-slate-850 text-xs p-1.5 rounded focus:outline-none focus:border-red-500 text-white max-w-[130px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onRejectKYC(sub.id, rejectionReason || 'Documentação ilegível ou incorreta.');
                                setActiveKycRejectId(null);
                                setRejectionReason('');
                                alert('Documentação rejeitada de forma formal com notificação via SMS.');
                              }}
                              className="bg-red-650 text-white p-1 rounded hover:bg-red-700"
                            >
                              Confirmar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveKycRejectId(sub.id)}
                            className="bg-red-650 hover:bg-red-700 text-white font-bold p-1 px-3 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <X size={11} />
                            <span>Rejeitar</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INCIDENTS / REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4 text-left">
            <div>
              <h4 className="font-sans font-black text-white text-sm uppercase tracking-tight">Controlo de Denúncias e Fraudes</h4>
              <p className="text-[10.5px] text-slate-450 mt-0.5">Analise alertas de artigos indevidos ou queixas formais de abuso comercial.</p>
            </div>

            {reports.length === 0 ? (
              <div className="p-10 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500 font-sans">
                Nenhum incidente relatado pendente de investigação.
              </div>
            ) : (
              <div className="space-y-3.5">
                {reports.map((rep) => (
                  <div key={rep.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[8.5px] bg-red-600/15 text-red-400 border border-red-500/20 font-black px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">
                          Incidente #{rep.id} • {rep.type.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold font-mono">Relator ID: {rep.reporterName}</span>
                        <span className={`text-[8px] uppercase tracking-wide font-black px-1.5 rounded-full ${
                          rep.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-350'
                        }`}>
                          {rep.status}
                        </span>
                      </div>
                      
                      <p className="text-xs text-white font-extrabold leading-tight">
                        Alvo sob queixa: <span className="text-[#2563EB]">{rep.targetTitle}</span> (Target ID: {rep.targetId})
                      </p>

                      <p className="text-xs text-slate-350 leading-relaxed font-sans pt-1">
                        <strong>Motivação:</strong> "{rep.reason}"
                      </p>

                      <p className="text-[11px] text-slate-455 bg-slate-900 border border-slate-850 p-2 rounded-lg leading-relaxed italic text-slate-400">
                        "{rep.details}"
                      </p>
                    </div>

                    {rep.status === 'pending' && (
                      <div className="flex items-center gap-1.5 self-start md:self-center shrink-0">
                        <button
                          onClick={() => {
                            if (onResolveReport) onResolveReport(rep.id);
                            alert('Incidente marcado como Resolvido. Alerta encaminhado para arquivo do sistema.');
                          }}
                          className="bg-emerald-650 hover:bg-emerald-700 text-white font-black text-[9.5px] py-1 px-3.5 rounded-lg cursor-pointer"
                        >
                          Anotar & Resolver
                        </button>
                        <button
                          onClick={() => {
                            if (onDismissReport) onDismissReport(rep.id);
                            alert('Denúncia arquivada sem aplicação de sanções.');
                          }}
                          className="bg-slate-800 text-slate-350 hover:text-white font-bold text-[9.5px] py-1 px-3 rounded-lg cursor-pointer"
                        >
                          Dispensar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CATEGORY TREE */}
        {activeTab === 'categories' && (
          <div className="space-y-4 text-left">
            <div>
              <h4 className="font-sans font-black text-white text-sm uppercase tracking-tight">Árvore de Categorias Ativas</h4>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Adicione novas opções de filtros imediatos na rede de publicações de Angola.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* List */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <span className="block text-[8px] uppercase tracking-widest text-slate-500 font-mono font-black">Categorias Disponíveis</span>
                <div className="divide-y divide-slate-850">
                  {categories.map((c) => (
                    <div key={c.id} className="py-2 flex justify-between items-center text-xs">
                      <span className="font-bold text-white font-sans">{c.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{c.id}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateCategory} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
                <span className="block text-[8px] uppercase tracking-widest text-[#2563EB] font-mono font-black">Adicionar Nova Categoria</span>
                
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="block text-slate-450 text-[10px] font-bold font-mono">ID Único (Ex: servicos, cosmeticos)</label>
                    <input
                      type="text"
                      placeholder="servicos"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      className="w-full bg-[#0F172A] border border-slate-850 rounded-lg p-2.5 outline-none focus:border-blue-500 text-white font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-450 text-[10px] font-bold font-mono">Nome Legível de Exibição (Ex: Serviços de Angola)</label>
                    <input
                      type="text"
                      placeholder="Serviços Técnicos"
                      value={catLabel}
                      onChange={(e) => setCatLabel(e.target.value)}
                      className="w-full bg-[#0F172A] border border-slate-850 rounded-lg p-2.5 outline-none focus:border-blue-500 text-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-black py-2 rounded-xl"
                  >
                    Gravar Categoria
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* SMS / COMMUNICATIONS AUDITOR */}
        {activeTab === 'sms' && (
          <div className="space-y-4 text-left">
            <div>
              <h4 className="font-sans font-black text-white text-sm uppercase tracking-tight">Monitor Centralizador de SMS e Alertas</h4>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Envie alertas em massa ou audite comunicações de negociação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Live list logger */}
              <div className="md:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <span className="block text-[8px] uppercase tracking-widest text-[#2563EB] font-bold font-mono">Registro Histórico de Auditoria SMS</span>
                
                <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1.5">
                  {smsLogs.length === 0 ? (
                    <div className="text-center py-10 text-[10px] text-slate-600 italic">Nenhum registo de comunicações disparadas.</div>
                  ) : (
                    smsLogs.map((log) => (
                      <div key={log.id} className="bg-[#121212] border border-slate-850 p-2.5 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <strong className="text-blue-400">Canal: {log.recipient} ({log.phone})</strong>
                          <span className="text-slate-500">{log.time}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{log.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick direct transmitter */}
              <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
                <span className="block text-[8px] uppercase tracking-widest text-amber-400 font-bold font-mono">Transmissor Analógico Direto SMS</span>
                
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="block text-slate-450 text-[9px] uppercase font-bold font-mono">Nome de Contacto</label>
                    <input
                      type="text"
                      placeholder="Ex: Sandra Silva"
                      value={targetSmsName}
                      onChange={(e) => setTargetSmsName(e.target.value)}
                      className="w-full bg-[#0F172A] border border-slate-850 rounded-lg p-2 focus:border-blue-500 text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-450 text-[9px] uppercase font-bold font-mono">Telemóvel Destino (+244)</label>
                    <input
                      type="text"
                      placeholder="941963554"
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                      className="w-full bg-[#0F172A] border border-slate-850 rounded-lg p-2 focus:border-blue-500 text-white font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-450 text-[9px] uppercase font-bold font-mono">Mensagem de Texto</label>
                    <textarea
                      placeholder="Digite a mensagem SMS de contacto..."
                      value={smsMessageText}
                      onChange={(e) => setSmsMessageText(e.target.value)}
                      rows={3}
                      className="w-full bg-[#0F172A] border border-slate-850 rounded-lg p-2 focus:border-blue-500 text-white outline-none font-sans"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendManualMessage}
                    className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send size={11} />
                    <span>Transmitir SMS Alerta</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
        {activeTab === 'payments' && (() => {
          // Calculate filtered list for regular payment orders
          const filteredOrders = paymentOrders.filter(o => {
            // Status filter
            if (paymentStatusFilter !== 'all' && o.status !== paymentStatusFilter) {
              return false;
            }
            // Search query (Name, Phone, Order ID, Transaction ID)
            if (paymentSearchQuery.trim()) {
              const q = paymentSearchQuery.toLowerCase();
              const name = o.userName?.toLowerCase() || '';
              const phone = o.userPhone?.toLowerCase() || '';
              const orderNo = o.id?.toLowerCase() || '';
              const txId = o.txId?.toLowerCase() || '';
              return name.includes(q) || phone.includes(q) || orderNo.includes(q) || txId.includes(q);
            }
            return true;
          });

          // Calculate filtered list for subscriptions/upgrades
          const filteredSubscriptions = subscriptionPayments.filter(s => {
            // Status filter
            const mappedStatus = s.status === 'approved' ? 'confirmed' : s.status;
            if (paymentStatusFilter !== 'all' && mappedStatus !== paymentStatusFilter) {
              return false;
            }
            // Search query (Name, Phone, Transaction ID)
            if (paymentSearchQuery.trim()) {
              const q = paymentSearchQuery.toLowerCase();
              const name = s.userName?.toLowerCase() || '';
              const phone = s.userPhone?.toLowerCase() || '';
              const txId = s.txId?.toLowerCase() || '';
              return name.includes(q) || phone.includes(q) || txId.includes(q);
            }
            return true;
          });

          return (
            <div className="space-y-4 text-left animate-in fade-in duration-250">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-sans font-black text-white text-sm uppercase tracking-tight">Ativações, Transações e Controle de Pagamentos</h4>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Valide as transferências manuais, depósitos bancários e solicitações de planos de contas com rigor financeiro.</p>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#D4AF37] bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono">
                  <span>Operador Principal:</span>
                  <span className="text-white select-all">{adminUsername || 'Administrador'}</span>
                </div>
              </div>

              {/* SUB-TABS SELECTOR */}
              <div className="flex border-b border-slate-800 gap-6 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentSubTab('subscriptions');
                    setSelectedSubscriptionId(null);
                    setSelectedPaymentId(null);
                  }}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all relative ${
                    paymentSubTab === 'subscriptions' 
                      ? 'text-[#D4AF37]' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Controle de Assinaturas & Planos ({subscriptionPayments.length})
                  {paymentSubTab === 'subscriptions' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
                  )}
                  {subscriptionPayments.filter(s => s.status === 'pending').length > 0 && (
                    <span className="ml-1.5 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                      {subscriptionPayments.filter(s => s.status === 'pending').length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentSubTab('promotions');
                    setSelectedSubscriptionId(null);
                    setSelectedPaymentId(null);
                  }}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all relative ${
                    paymentSubTab === 'promotions' 
                      ? 'text-[#D4AF37]' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Destaques e Campanhas ({paymentOrders.length})
                  {paymentSubTab === 'promotions' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
                  )}
                  {paymentOrders.filter(p => p.status === 'pending').length > 0 && (
                    <span className="ml-1.5 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                      {paymentOrders.filter(p => p.status === 'pending').length}
                    </span>
                  )}
                </button>
              </div>

              {/* SEARCH & FILTERS BOX */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3.5">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder={paymentSubTab === 'subscriptions' ? "Pesquisar por Nome, Telefone ou ID Transação do plano..." : "Pesquisar por Nome, Telefone, Nº Pedido ou ID Transação..."}
                      value={paymentSearchQuery}
                      onChange={(e) => setPaymentSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-[#D4AF37] text-white text-xs pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all placeholder:text-slate-550"
                    />
                    {paymentSearchQuery && (
                      <button 
                        onClick={() => setPaymentSearchQuery('')}
                        className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter tabs/pills */}
                  <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {(['all', 'pending', 'confirmed', 'rejected'] as const).map((st) => {
                      const label = {
                        all: 'Todos',
                        pending: 'Pendentes',
                        confirmed: paymentSubTab === 'subscriptions' ? 'Ativos' : 'Confirmados',
                        rejected: 'Recusados'
                      }[st];
                      
                      const count = st === 'all' 
                        ? (paymentSubTab === 'subscriptions' ? subscriptionPayments.length : paymentOrders.length)
                        : (paymentSubTab === 'subscriptions' 
                            ? subscriptionPayments.filter(s => (s.status === 'approved' ? 'confirmed' : s.status) === st).length 
                            : paymentOrders.filter(o => o.status === st).length);

                      const isActive = paymentStatusFilter === st;

                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setPaymentStatusFilter(st)}
                          className={`text-[9.5px] font-bold px-2.5 py-1.5 rounded-lg transition-all uppercase cursor-pointer ${
                            isActive 
                              ? 'bg-amber-500 text-black shadow-sm' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          {label} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT DISPLAY FOR SUB-TABS */}
              {paymentSubTab === 'subscriptions' ? (
                /* SECTION 1: SUBSCRIPTION PAYMENTS (ACCOUNT ACTIVATIONS) */
                filteredSubscriptions.length === 0 ? (
                  <div className="p-14 border border-dashed border-slate-800 rounded-3xl text-center text-xs text-slate-500">
                    <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    Nenhuma solicitação de ativação de conta localizada com os filtros atuais.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-left text-xs min-w-[800px]">
                        <thead className="bg-[#1E293B] text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-3.5 pl-4 font-bold">Pedido Ref</th>
                            <th className="p-3.5 font-bold">Cliente</th>
                            <th className="p-3.5 font-bold">Tipo de Conta Solicitada</th>
                            <th className="p-3.5 font-bold">Valor do Plano</th>
                            <th className="p-3.5 font-bold">Banco de Destino</th>
                            <th className="p-3.5 font-bold">ID Transação</th>
                            <th className="p-3.5 font-bold">Estado</th>
                            <th className="p-3.5 text-right pr-4 font-bold">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium">
                          {filteredSubscriptions.map((s) => {
                            const isSelected = selectedSubscriptionId === s.id;
                            return (
                              <tr 
                                key={s.id}
                                onClick={() => setSelectedSubscriptionId(s.id)}
                                className={`hover:bg-slate-900 cursor-pointer transition-colors group ${
                                  isSelected ? 'bg-slate-900/50 border-l-2 border-[#D4AF37]' : ''
                                }`}
                              >
                                <td className="p-3.5 pl-4">
                                  <div className="font-mono text-white text-[10px] font-bold">{`SUB-${s.id.substring(0, 6)}`}</div>
                                  <div className="text-[9px] text-slate-400 mt-0.5 font-mono">{s.submittedAt}</div>
                                </td>
                                <td className="p-3.5">
                                  <div className="font-bold text-white group-hover:text-[#D4AF37] transition-all text-xs">{s.userName}</div>
                                  <div className="text-[9.5px] text-slate-500 mt-0.5">{s.userPhone}</div>
                                </td>
                                <td className="p-3.5 uppercase font-bold text-slate-300">
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded mr-1.5 ${
                                    s.userType === 'empresa' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                  }`}>
                                    {s.userType === 'empresa' ? 'EMPRESA' : 'PROFISSIONAL'}
                                  </span>
                                  <span className="text-[10px] text-slate-300 font-mono">({s.planType})</span>
                                </td>
                                <td className="p-3.5 font-black text-white font-mono text-[11px]">
                                  {formatKwanza(s.amount)}
                                </td>
                                <td className="p-3.5 text-slate-300 font-sans text-[10.5px]">
                                  {s.bankName || 'BAI'}
                                </td>
                                <td className="p-3.5 font-mono text-slate-400 text-[10.5px] select-all">
                                  {s.txId}
                                </td>
                                <td className="p-3.5">
                                  <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border ${
                                    s.status === 'pending' 
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' 
                                      : s.status === 'approved'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                        : 'bg-red-500/10 text-red-400 border-red-500/25'
                                  }`}>
                                    {s.status === 'pending' ? 'Pendente' : s.status === 'approved' ? 'Ativo' : 'Recusado'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSubscriptionId(s.id)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold tracking-tight transition-all"
                                  >
                                    Analisar Ficha 🔍
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* DETAILED PANEL FOR SUBSCRIPTION ACTIVATION */}
                    {selectedSubscriptionId && (() => {
                      const s = subscriptionPayments.find(sub => sub.id === selectedSubscriptionId);
                      if (!s) return null;
                      return (
                        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 space-y-5 animate-in zoom-in-95 text-left mt-4 shadow-xl">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-4 gap-2">
                            <div>
                              <span className="text-[8.5px] bg-slate-900 border border-slate-800 text-amber-400 px-2 py-0.5 rounded-md font-mono font-bold tracking-wider">
                                REF: SUB-{s.id.substring(0, 8)}
                              </span>
                              <h4 className="text-sm font-black uppercase tracking-wider text-white mt-1.5 flex items-center gap-1.5">
                                <span>Análise de Ativação Manual de Conta Premium</span>
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Identificador Único: {s.id}</p>
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedSubscriptionId(null);
                                setShowSubscriptionRejectInputId(null);
                                setSubscriptionRejectReason('');
                              }}
                              className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-1.5 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer self-stretch sm:self-auto text-center"
                            >
                              Fechar Análise ✕
                            </button>
                          </div>

                          <div className="bg-amber-950/40 border border-amber-500/35 p-3.5 rounded-2xl flex items-start gap-3">
                            <span className="text-xl shrink-0 mt-0.5">⚠️</span>
                            <div className="text-[10px] text-amber-300 leading-relaxed font-semibold">
                              <strong className="block text-white uppercase text-[10.5px] font-bold tracking-wide">CONFIRMAÇÃO EXIGIDA DO ADMINISTRADOR:</strong>
                              Valide o recebimento de <span className="text-white font-black">{formatKwanza(s.amount)}</span> no banco <span className="text-[#D4AF37] font-black">{s.bankName || 'BAI'}</span> com ID de transação <span className="font-mono text-white bg-amber-500/10 px-1 rounded select-all font-black">{s.txId}</span>. O plano só deve ser ativado após constatar o crédito no extrato bancário.
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Col 1 */}
                            <div className="space-y-3 bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                              <h5 className="text-[9px] uppercase tracking-wider font-extrabold text-[#D4AF37] border-b border-slate-800 pb-1 font-mono">1. Dados Cadastrais do Cliente</h5>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Nome do Cliente:</span>
                                  <strong className="text-white text-right font-sans">{s.userName}</strong>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Contacto de Registo:</span>
                                  <strong className="text-white font-mono select-all text-right">{s.userPhone}</strong>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">E-mail associado:</span>
                                  <span className="text-slate-300 font-mono text-right select-all">{s.userEmail || 'Não fornecido'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Enviado em:</span>
                                  <span className="text-slate-300 font-mono text-right">{s.submittedAt}</span>
                                </div>
                              </div>
                            </div>

                            {/* Col 2 */}
                            <div className="space-y-3 bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                              <h5 className="text-[9px] uppercase tracking-wider font-extrabold text-[#D4AF37] border-b border-slate-800 pb-1 font-mono">2. Parâmetros de Plano e Ativação</h5>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Tipo de Conta Alvo:</span>
                                  <strong className="text-blue-400 uppercase text-[9.5px] text-right">Conta {s.userType === 'empresa' ? 'Empresa / Corporate' : 'Profissional / Destaque'}</strong>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Duração / Faturação:</span>
                                  <strong className="text-white uppercase font-mono text-right">{s.planType === 'anual' ? 'Anual (12 Meses)' : 'Mensal (30 Dias)'}</strong>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Valor exato do depósito:</span>
                                  <strong className="text-emerald-400 font-mono font-black text-[12.5px] text-right">{formatKwanza(s.amount)}</strong>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Banco Selecionado:</span>
                                  <span className="text-[#D4AF37] font-black uppercase text-right">{s.bankName || 'BAI'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">ID / Transação Bancária:</span>
                                  <strong className="text-zinc-200 font-mono text-right uppercase select-all">{s.txId}</strong>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Uploaded receipt image */}
                          <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-3">
                            <h5 className="text-[9px] uppercase tracking-wider font-extrabold text-white font-mono border-b border-slate-800 pb-2">3. Comprovativo Bancário Anexado</h5>
                            {s.proofImage ? (
                              <div className="border border-slate-850 rounded-xl overflow-hidden bg-[#121212] p-2 flex flex-col items-center justify-center max-h-[300px]">
                                <img 
                                  src={s.proofImage} 
                                  alt="Comprovativo Oficial de Upgrade" 
                                  className="max-w-full max-h-[260px] object-contain rounded-lg shadow-inner select-none cursor-pointer"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : (
                              <div className="bg-slate-900/50 p-4 rounded-xl text-center text-xs text-slate-500 italic">
                                Nenhum comprovativo visual carregado pelo cliente. Confirmação baseada apenas na referência de transação bancária.
                              </div>
                            )}
                          </div>

                          {/* Audit logs */}
                          <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-2">
                            <h5 className="text-[9px] uppercase tracking-wider font-extrabold text-[#D4AF37] border-b border-slate-800 pb-1 font-mono">4. Histórico de Auditoria do Pedido</h5>
                            <div className="space-y-1.5 font-mono text-[9.5px] text-slate-400">
                              {s.history && s.history.length > 0 ? (
                                s.history.map((log, index) => (
                                  <div key={index} className="flex items-start gap-1.5">
                                    <span className="text-amber-500">▸</span>
                                    <span>{log}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="italic text-slate-550">Nenhum registo auditável de alterações.</div>
                              )}
                            </div>
                          </div>

                          {/* Decision buttons (pending status) */}
                          {s.status === 'pending' && (
                            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-850 justify-end">
                              {showSubscriptionRejectInputId === s.id ? (
                                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-slate-950 p-4 rounded-2xl border border-red-500/20 animate-in slide-in-from-right-1 w-full justify-between">
                                  <div className="space-y-1 flex-1 text-left">
                                    <label className="block text-red-400 text-[8.5px] uppercase font-bold font-mono pl-1">Motivo de recusa do plano (Obrigatório):</label>
                                    <input 
                                      type="text" 
                                      placeholder="Ex: Depósito não creditado, comprovativo ilegível ou incorreto..." 
                                      value={subscriptionRejectReason}
                                      onChange={(e) => setSubscriptionRejectReason(e.target.value)}
                                      className="w-full bg-[#0F172A] border border-slate-800 text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-sans"
                                    />
                                  </div>
                                  <div className="flex gap-1.5 items-end justify-end mt-2 sm:mt-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!subscriptionRejectReason.trim()) {
                                          alert('Atenção: Deve preencher o motivo da recusa.');
                                          return;
                                        }
                                        if (onRejectSubscriptionPayment) {
                                          onRejectSubscriptionPayment(s.id, subscriptionRejectReason);
                                          setShowSubscriptionRejectInputId(null);
                                          setSubscriptionRejectReason('');
                                        }
                                      }}
                                      className="bg-red-650 hover:bg-red-750 text-white font-extrabold py-2 px-4 rounded-xl text-[10px] uppercase cursor-pointer"
                                    >
                                      Confirmar Recusa
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowSubscriptionRejectInputId(null);
                                        setSubscriptionRejectReason('');
                                      }}
                                      className="bg-slate-850 text-[#94A3B8] hover:text-white py-2 px-3 rounded-xl text-[10px] uppercase font-semibold"
                                    >
                                      Voltar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onApproveSubscriptionPayment) {
                                        onApproveSubscriptionPayment(s.id);
                                        // Auto-close details or refresh
                                      }
                                    }}
                                    className="flex-1 sm:flex-none bg-[#D4AF37] hover:bg-amber-600 text-black font-black p-3 px-6 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
                                  >
                                    <Check size={12} strokeWidth={3} />
                                    <span>Validar Depósito & Ativar Conta</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowSubscriptionRejectInputId(s.id);
                                    }}
                                    className="flex-1 sm:flex-none bg-red-650 hover:bg-red-750 text-white font-bold p-3 px-4 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                                  >
                                    <X size={12} strokeWidth={3} />
                                    <span>Recusar Ativação</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Status Badge */}
                          {s.status === 'approved' && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-[10.5px] text-emerald-400 font-bold uppercase tracking-wide flex justify-between items-center font-mono">
                              <span>Plano de Conta: Ativado & Verificado ✓</span>
                              <span className="text-[9px] text-white">Plano Ativo no Utilizador</span>
                            </div>
                          )}
                          {s.status === 'rejected' && (
                            <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl text-[10.5px] text-red-400 font-bold tracking-wide font-mono">
                              <span className="uppercase block font-black">Estado: Recusado & Cancelado ✕</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )
              ) : (
                /* SECTION 2: PROMOTIONS & CAMPAIGN ORDERS (Original logic) */
                filteredOrders.length === 0 ? (
                  <div className="p-14 border border-dashed border-slate-800 rounded-3xl text-center text-xs text-slate-500">
                    <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    Nenhum pedido de pagamento de destaque localizado com os filtros selecionados.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Responsive Table View */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-left text-xs min-w-[800px]">
                        <thead className="bg-[#1E293B] text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-3.5 pl-4 font-bold">Pedido / Data</th>
                            <th className="p-3.5 font-bold">Cliente</th>
                            <th className="p-3.5 font-bold">Produto / Plano</th>
                            <th className="p-3.5 font-bold">Valor</th>
                            <th className="p-3.5 font-bold">Método / Banco</th>
                            <th className="p-3.5 font-bold">ID Transação</th>
                            <th className="p-3.5 font-bold">Estado</th>
                            <th className="p-3.5 text-right pr-4 font-bold">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium">
                          {filteredOrders.map((o) => {
                            const isSelected = selectedPaymentId === o.id;
                            return (
                              <tr 
                                key={o.id} 
                                onClick={() => setSelectedPaymentId(o.id)}
                                className={`hover:bg-slate-900 cursor-pointer transition-colors group ${
                                  isSelected ? 'bg-slate-900/50 border-l-2 border-[#D4AF37]' : ''
                                }`}
                              >
                                <td className="p-3.5 pl-4">
                                  <div className="font-mono text-white text-[10px] font-bold">{`PED-${o.id}`}</div>
                                  <div className="text-[9px] text-slate-400 mt-0.5 font-mono">{o.createdAt.substring(0, 10)} {o.createdAt.substring(11, 16)}</div>
                                </td>
                                <td className="p-3.5">
                                  <div className="font-bold text-white group-hover:text-[#D4AF37] transition-all text-xs">{o.userName}</div>
                                  <div className="text-[9.5px] text-slate-500 mt-0.5">{o.userPhone}</div>
                                </td>
                                <td className="p-3.5 capitalize font-bold text-slate-300">
                                  <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded mr-1.5 capitalize ${
                                    o.itemType === 'subscription' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  }`}>
                                    {o.itemType === 'subscription' ? 'Assinatura' : o.itemType === 'promotion' ? 'Destaque' : 'Campanha'}
                                  </span>
                                  <span className="text-[10.5px] text-slate-100 uppercase font-sans">{o.itemName}</span>
                                </td>
                                <td className="p-3.5 font-black text-white font-mono text-[11px]">
                                  {formatKwanza(o.amount)}
                                </td>
                                <td className="p-3.5 text-slate-300 font-mono text-[10px]">
                                  <span className="block font-bold text-[#D4AF37]">{o.paymentMethod === 'bank_transfer' ? 'Transferência' : 'Express'}</span>
                                  <span className="text-[9px] text-slate-400 font-sans block mt-0.5">{o.paymentBank || 'Kwanza'}</span>
                                </td>
                                <td className="p-3.5 font-mono text-slate-400 text-[10.5px]">
                                  {o.txId}
                                </td>
                                <td className="p-3.5">
                                  <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border ${
                                    o.status === 'pending' 
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' 
                                      : o.status === 'confirmed'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                        : o.status === 'rejected'
                                          ? 'bg-red-500/10 text-red-400 border-red-500/25'
                                          : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}>
                                    {o.status === 'pending' ? 'Pendente' : o.status === 'confirmed' ? 'Pago' : o.status === 'rejected' ? 'Rejeitado' : 'Cancelado'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPaymentId(o.id)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold tracking-tight transition-all"
                                  >
                                    Analisar Ficha 🔍
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* EXPANDED FICHA INTEGRAL DETALHADA */}
                    {selectedPaymentId && (() => {
                      const o = paymentOrders.find(order => order.id === selectedPaymentId);
                      if (!o) return null;
                      return (
                        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 space-y-5 animate-in zoom-in-95 text-left mt-4 shadow-xl">
                          
                          {/* Header details */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-4 gap-2">
                            <div>
                              <span className="text-[8.5px] bg-slate-900 border border-slate-800 text-amber-400 px-2 py-0.5 rounded-md font-mono font-bold tracking-wider">
                                Nº PEDIDO: {`PED-${o.id}`}
                              </span>
                              <h4 className="text-sm font-black uppercase tracking-wider text-white mt-1.5 flex items-center gap-1.5">
                                <span>Ficha Integral de Transação Manual</span>
                                {o.invoiceStatus === 'ready_for_billing' && (
                                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase px-1.5 py-0.2 rounded font-mono">
                                    Pronto para Faturação ✓
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID Interno Imutável: {o.id}</p>
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedPaymentId(null);
                                setShowPaymentRejectInputId(null);
                                setPaymentRejectReason('');
                              }}
                              className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-1.5 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer self-stretch sm:self-auto text-center"
                            >
                              Fechar Análise ✕
                            </button>
                          </div>

                          {/* RIGOROUS BANK STATEMENT STATEMENT VERIFICATION NOTICE */}
                          <div className="bg-amber-950/40 border border-amber-500/35 p-3.5 rounded-2xl flex items-start gap-3">
                            <span className="text-xl shrink-0 mt-0.5">⚠️</span>
                            <div className="text-[10px] text-amber-300 leading-relaxed font-semibold">
                              <strong className="block text-white uppercase text-[10.5px] font-bold tracking-wide">AVISO OBRIGATÓRIO PARA O ADMINISTRADOR:</strong>
                              Consulte o extrato da conta bancária da empresa no BFA, BAI ou Express e confirme se o crédito com o ID de transação <span className="font-mono text-white bg-amber-500/10 px-1 rounded select-all font-black">{o.txId}</span> foi devidamente creditado. 
                              <span className="text-white block mt-1">A validação financeira nunca deve basear-se unicamente no ficheiro comprovativo submetido pelo utilizador para evitar burlas de comprovativos falsos.</span>
                            </div>
                          </div>

                          {/* Grid of detail data columns */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Col 1: Client data */}
                            <div className="space-y-3 bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                              <h5 className="text-[9px] uppercase tracking-wider font-extrabold text-[#D4AF37] border-b border-slate-800 pb-1 font-mono">1. Dados Cadastrais do Cliente</h5>
                              
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Nome do Solicitante:</span>
                                  <strong className="text-white text-right font-sans">{o.userName}</strong>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Contacto de Registo:</span>
                                  <strong className="text-white font-mono select-all text-right">{o.userPhone}</strong>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">E-mail associado:</span>
                                  <span className="text-slate-300 font-mono text-right select-all">{o.userEmail || 'Não fornecido'}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Titular Declarado:</span>
                                  <strong className="text-white text-right font-sans">{o.holderName || o.userName}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Submetido via Terminal em:</span>
                                  <span className="text-slate-300 font-mono text-right">{o.createdAt}</span>
                                </div>
                              </div>
                            </div>

                            {/* Col 2: Finance Association details */}
                            <div className="space-y-3 bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                              <h5 className="text-[9px] uppercase tracking-wider font-extrabold text-[#D4AF37] border-b border-slate-800 pb-1 font-mono">2. Parâmetros Financeiros Declarados</h5>
                              
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Tipo de Ativação:</span>
                                  <span className="text-blue-400 font-bold uppercase text-[9.5px] text-right">
                                    {o.itemType === 'subscription' ? 'Upgrade de Conta / Plano' : o.itemType === 'promotion' ? 'Destaque de Anúncio' : 'Campanha de Publicidade'}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Plano / Item Adquirido:</span>
                                  <strong className="text-white uppercase font-mono text-right">{o.itemName}</strong>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Valor Exato de Cobrança:</span>
                                  <strong className="text-emerald-400 font-mono font-black text-[12.5px] text-right">{formatKwanza(o.amount)}</strong>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                  <span className="text-slate-500">Banco de Destino:</span>
                                  <span className="text-[#D4AF37] font-black uppercase text-right">{o.paymentBank || 'Não especificado'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Método Utilizado:</span>
                                  <strong className="text-slate-200 text-right uppercase text-[10px] font-mono">
                                    {o.paymentMethod === 'bank_transfer' ? 'Transferência Bancária (BFA/BAI)' : 'Multicaixa Express'}
                                  </strong>
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* Row 3: Transaction Proof Asset */}
                          <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                              <h5 className="text-[9px] uppercase tracking-wider font-extrabold text-white font-mono">3. Comprovativo Oficial de Depósito Anexado</h5>
                              <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-bold font-mono uppercase">
                                Formato Arquivo Digital
                              </span>
                            </div>

                            {o.proofImage ? (
                              <div className="border border-slate-850 rounded-xl overflow-hidden bg-[#121212] p-2 flex flex-col items-center justify-center max-h-[380px]">
                                {o.proofImage.startsWith('data:application/pdf') || o.proofImage.endsWith('.pdf') ? (
                                  <div className="p-10 text-center space-y-3">
                                    <span className="text-4xl block">📄</span>
                                    <p className="text-xs font-bold text-white">Comprovativo Submetido em formato PDF</p>
                                    <a 
                                      href={o.proofImage} 
                                      download={`comprovativo_${o.id}.pdf`}
                                      className="inline-block bg-[#2563EB] hover:bg-blue-700 text-white font-black text-[10px] px-4 py-2 rounded-xl uppercase tracking-wider"
                                    >
                                      Fazer Download do PDF 📥
                                    </a>
                                  </div>
                                ) : (
                                  <img 
                                    src={o.proofImage} 
                                    alt="Comprovativo oficial enviado pelo cliente" 
                                    className="max-w-full max-h-[340px] object-contain rounded-lg shadow-inner select-none cursor-pointer"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                              </div>
                            ) : (
                              /* Simulated backup layout if none present */
                              <div className="bg-white text-zinc-900 p-5 rounded-2xl font-mono border-4 border-double border-zinc-400 max-w-sm mx-auto shadow-2xl flex flex-col space-y-3 text-left">
                                <div className="text-center border-b border-dashed border-zinc-300 pb-3">
                                  <h6 className="font-extrabold text-[12px] tracking-tight uppercase">NOSSOS NEGÓCIOS / ANGOLA</h6>
                                  <p className="text-[7.5px] text-zinc-500 mt-1">COMPROVATIVO DE LIQUIDAÇÃO DE TAXA</p>
                                  <p className="text-[8px] text-zinc-400 font-mono">{o.createdAt}</p>
                                </div>
                                <div className="text-[9px] space-y-1.5 leading-tight">
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">OPERANTE:</span>
                                    <strong className="text-zinc-800 uppercase">ATIVAR PLANO EM PORTARIA</strong>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">CLIENTE:</span>
                                    <strong className="text-zinc-900 uppercase">{o.userName}</strong>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">TELEMÓVEL:</span>
                                    <strong className="text-zinc-900">{o.userPhone}</strong>
                                  </div>
                                  <div className="flex justify-between border-t border-dashed border-zinc-300 pt-1.5">
                                    <span className="text-zinc-500">ID DA TRANSAÇÃO:</span>
                                    <strong className="text-blue-700 bg-blue-50 px-1 rounded font-bold">{o.txId}</strong>
                                  </div>
                                  <div className="flex justify-between font-bold">
                                    <span className="text-zinc-500">VALOR DA TRANSAÇÃO:</span>
                                    <strong className="text-red-700">{formatKwanza(o.amount)}</strong>
                                  </div>
                                </div>
                                <div className="text-center border-t border-dashed border-zinc-300 pt-2.5 text-[7px] text-zinc-400 uppercase leading-snug">
                                  <p className="font-bold text-emerald-800">✓ COMUNICAÇÃO OFICIAL VINCULADA AO ID</p>
                                  <p className="text-[6px]">EMITIDO DIRETAMENTE EM CONFORMIDADE COM BANCO DESTINO BFA</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Row 4: Changes history Audit trail */}
                          <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-2">
                            <h5 className="text-[9px] uppercase tracking-wider font-extrabold text-[#D4AF37] border-b border-slate-800 pb-1 font-mono">4. Histórico de Alterações & Auditoria Permanente</h5>
                            <div className="space-y-2 font-mono text-[9.5px] text-slate-400 text-left">
                              {o.history && o.history.length > 0 ? (
                                o.history.map((log, index) => (
                                  <div key={index} className="flex items-start gap-2 border-b border-slate-900/40 pb-1.5 last:border-0 text-left">
                                    <span className="text-[#D4AF37] shrink-0">▸</span>
                                    <span className="leading-relaxed">
                                      [{log.timestamp}] {log.action} por {log.operator} {log.details ? `(${log.details})` : ''}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="italic text-slate-550">Nenhum registo auditável de alterações localizado.</div>
                              )}
                            </div>
                          </div>

                          {/* Decision buttons (Only visible if pending) */}
                          {o.status === 'pending' && (
                            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-850 justify-end">
                              {showPaymentRejectInputId === o.id ? (
                                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-slate-950 p-4 rounded-2xl border border-red-500/20 animate-in slide-in-from-right-1 w-full justify-between">
                                  <div className="space-y-1 flex-1 text-left">
                                    <label className="block text-red-400 text-[8.5px] uppercase font-bold font-mono pl-1">Motivo decorrente da recusa do pagamento (Obrigatório):</label>
                                    <input 
                                      type="text" 
                                      placeholder="Ex: Valor não creditado na conta, comprovativo ilegível, ID inválido..." 
                                      value={paymentRejectReason}
                                      onChange={(e) => setPaymentRejectReason(e.target.value)}
                                      className="w-full bg-[#0F172A] border border-slate-800 text-xs p-2.5 rounded-xl text-white outline-none focus:border-red-500 font-sans"
                                    />
                                  </div>
                                  <div className="flex gap-1.5 items-end justify-end mt-2 sm:mt-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!paymentRejectReason.trim()) {
                                          alert('Atenção: Deve preencher o motivo da rejeição bancária.');
                                          return;
                                        }
                                        if (onRejectPaymentOrder) {
                                          onRejectPaymentOrder(o.id, paymentRejectReason, adminUsername || 'admin');
                                          setShowPaymentRejectInputId(null);
                                          setPaymentRejectReason('');
                                        }
                                      }}
                                      className="bg-red-650 hover:bg-red-750 text-white font-extrabold py-2 px-4 rounded-xl text-[10px] uppercase cursor-pointer"
                                    >
                                      Confirmar Rejeição
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowPaymentRejectInputId(null);
                                        setPaymentRejectReason('');
                                      }}
                                      className="bg-slate-850 text-[#94A3B8] hover:text-white py-2 px-3 rounded-xl text-[10px] uppercase font-semibold"
                                    >
                                      Voltar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onApprovePaymentOrder) {
                                        onApprovePaymentOrder(o.id, adminUsername || 'admin');
                                      }
                                    }}
                                    className="flex-1 sm:flex-none bg-[#D4AF37] hover:bg-amber-600 text-black font-black p-3 px-6 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
                                  >
                                    <Check size={12} strokeWidth={3} />
                                    <span>Confirmar Recebimento & Ativar Produto/Plano</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowPaymentRejectInputId(o.id);
                                    }}
                                    className="flex-1 sm:flex-none bg-red-650 hover:bg-red-750 text-white font-bold p-3 px-4 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                                  >
                                    <X size={12} strokeWidth={3} />
                                    <span>Recusar Depósito</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Status Message if approved or rejected */}
                          {o.status === 'confirmed' && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-[10.5px] text-emerald-400 font-bold uppercase tracking-wide flex justify-between items-center font-mono">
                              <span>Estado da Transação: Pago & Ativo ✓</span>
                              <span className="text-[9px] text-white">Pronto para Faturação</span>
                            </div>
                          )}
                          {o.status === 'rejected' && (
                            <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl text-[10.5px] text-red-400 font-bold tracking-wide font-mono">
                              <span className="uppercase block font-black">Estado da Transação: Rejeitado e Bloqueado ✕</span>
                              <span className="text-[9.5px] text-white block mt-1 normal-case font-sans">
                                Motivo da Recusa: <span className="italic">{o.rejectionReason || 'Não documentado'}</span>
                              </span>
                            </div>
                          )}
                          {o.status === 'canceled' && (
                            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl text-[10.5px] text-slate-400 font-bold uppercase tracking-wide font-mono">
                              Estado da Transação: Cancelado pelo Utilizador ✕
                            </div>
                          )}

                        </div>
                      );
                    })()}

                  </div>
                )
              )}
            </div>
          );
        })()}

        {/* ESPAÇOS PUBLICITÁRIOS & CAMPANHAS */}
        {activeTab === 'publicidade' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-sans font-black text-white text-sm uppercase tracking-tight">Gestão de Campanhas e Banners de Marcas</h4>
                <p className="text-[10.5px] text-slate-400 mt-0.5">Aprove, negoceie ou recuse banners corporativos solicitados via portal.</p>
              </div>
              <div className="bg-[#1E293B] border border-slate-700 px-4 py-2 rounded-xl text-left">
                <span className="text-[9px] uppercase font-mono text-slate-400 font-extrabold block">Acumulado em Caixa (Publicidade)</span>
                <span className="text-sm font-black font-mono text-emerald-400">{formatKwanza(stats.revenuePublicidade)}</span>
              </div>
            </div>

            {adCampaigns.length === 0 ? (
              <div className="text-center py-16 bg-[#121212] border border-neutral-805 rounded-3xl">
                <p className="text-xs text-slate-500 italic">Nenhuma campanha publicitária solicitada até ao momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adCampaigns.map((c) => {
                  return (
                    <div key={c.id} className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl space-y-4 shadow text-left relative overflow-hidden animate-in fade-in duration-200">
                      <div className="absolute top-0 right-0">
                        {c.status === 'pending' && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-bl-xl border-l border-b">Pendente</span>}
                        {c.status === 'active' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-bl-xl border-l border-b">Ativo</span>}
                        {c.status === 'rejected' && <span className="bg-red-500/10 text-red-150 border border-red-550/20 font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-bl-xl border-l border-b">Recusado</span>}
                        {c.status === 'completed' && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-bl-xl border-l border-b">Concluído</span>}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-800/60 pb-3 lg:pb-0 pr-0 lg:pr-2.5 space-y-2">
                          <span className="text-[8px] bg-slate-800 text-slate-400 font-mono font-black py-0.5 px-1.5 rounded uppercase">{c.bannerType.toUpperCase()}</span>
                          <h5 className="font-extrabold text-white text-xs uppercase leading-tight">{c.companyName}</h5>
                          <div className="space-y-0.5 text-[10.5px] text-slate-400">
                            <p>📞 {c.contactPhone}</p>
                            <p>🗓️ Duração: {c.durationMonths} {c.durationMonths === 1 ? 'Mês' : 'Mêses'}</p>
                            {c.targetCategory && <p>🏷️ Categoria: <span className="text-blue-400 font-bold">{c.targetCategory}</span></p>}
                            {c.bankName && <p>🏦 Banco: <span className="text-amber-400 font-bold">{c.bankName}</span></p>}
                            {c.txId && <p>🔑 ID Transação: <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1 py-0.5 rounded">{c.txId}</span></p>}
                          </div>
                        </div>

                        <div className="lg:col-span-1.5 space-y-1.5 border-b lg:border-b-0 pb-3 lg:pb-0">
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold block">Banner / Imagem Corporativo</span>
                          <div className="rounded-xl overflow-hidden border border-slate-800 bg-neutral-950 max-h-24 flex items-center justify-center">
                            <img src={c.imageUrl} alt="Banner" className="object-cover w-full h-full max-h-24 hover:scale-101 transition-all" />
                          </div>
                          {c.linkUrl && (
                            <p className="text-[9.5px] text-gray-400 truncate mt-1">
                              🔗 Link: <a href={c.linkUrl} target="_blank" rel="noreferrer" className="text-[#2563EB] font-semibold hover:underline">{c.linkUrl}</a>
                            </p>
                          )}
                        </div>

                        <div className="lg:col-span-1.5 space-y-1.5 border-b lg:border-b-0 pb-3 lg:pb-0 lg:border-r border-slate-800/60 lg:pr-2.5">
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold block">Comprovativo de Pagamento</span>
                          {c.proofImage ? (
                            <div 
                              onClick={() => setSelectedProofImageUrl(c.proofImage || null)}
                              className="group relative rounded-xl overflow-hidden border border-amber-500/30 bg-neutral-950 h-24 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/70 transition-all"
                            >
                              <img src={c.proofImage} alt="Comprovativo" className="object-cover w-full h-full opacity-60 group-hover:opacity-40 transition-opacity" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                                <span className="text-[8.5px] bg-amber-500/90 text-slate-900 font-black uppercase py-1 px-2 rounded-lg shadow-md tracking-wider">Ver Comprovativo 🔍</span>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/40 h-24 flex flex-col items-center justify-center text-center p-3">
                              <span className="text-xl">📄</span>
                              <span className="text-[9.5px] text-slate-550 block mt-1 leading-snug">Sem imagem física. Validar apenas por ID.</span>
                            </div>
                          )}
                        </div>

                        <div className="lg:col-span-1 flex flex-col justify-between items-start lg:items-end border-t lg:border-t-0 pt-3 lg:pt-0 text-left lg:text-right w-full">
                          <div className="text-left lg:text-right w-full">
                            <span className="text-[9px] uppercase font-mono text-slate-400 font-semibold block">Valor de Campanha</span>
                            <span className="text-sm font-black font-mono text-amber-500 block">{formatKwanza(c.price)}</span>
                            {c.startDate && (
                              <div className="text-[10px] text-slate-400 font-mono mt-1 space-y-0.5 text-left lg:text-right">
                                <p>Início: {c.startDate}</p>
                                <p>Fim: {c.endDate}</p>
                              </div>
                            )}
                          </div>

                          {c.status === 'pending' && (
                            <div className="flex gap-2 w-full mt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onApproveCampaign) {
                                    onApproveCampaign(c.id);
                                  }
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold p-2 rounded-xl text-[10px] uppercase cursor-pointer text-center tracking-wider"
                              >
                                Aprovar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onRejectCampaign) {
                                    onRejectCampaign(c.id);
                                  }
                                }}
                                className="flex-1 bg-red-650 hover:bg-red-750 text-white font-extrabold p-2 rounded-xl text-[10px] uppercase cursor-pointer text-center tracking-wider"
                              >
                                Recusar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FINANÇAS & LEVANTAMENTO DE RECEITAS */}
        {activeTab === 'finance' && (() => {
          const totalRevenue = stats.revenuePlans + stats.revenuePromotions + stats.revenuePublicidade;
          const availableRevenue = Math.max(0, totalRevenue - adminWithdrawnRevenues);

          const handleSaveBank = (e: React.FormEvent) => {
            e.preventDefault();
            if (onUpdatePlatformBankName) onUpdatePlatformBankName(bNameInput);
            if (onUpdatePlatformBeneficiary) onUpdatePlatformBeneficiary(bBenInput);
            if (onUpdatePlatformIban) onUpdatePlatformIban(bIbanInput);
            alert('✓ Dados bancários do aplicativo atualizados com sucesso!');
          };

          const handleWithdrawSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const val = parseFloat(withdrawAmount);
            if (isNaN(val) || val <= 0) {
              alert('Por favor, insira um valor válido para levantamento.');
              return;
            }
            if (val > availableRevenue) {
              alert(`Margem indisponível! O saldo disponível máximo é de ${formatKwanza(availableRevenue)}`);
              return;
            }
            if (!destBank || !destIban || !destOwner) {
              alert('Preencha os campos bancários de destino corretamente.');
              return;
            }

            if (onWithdrawRevenue) {
              onWithdrawRevenue(val, destBank, destIban, destOwner);
            }
            setWithdrawnSuccessMsg(`✓ Transferência de ${formatKwanza(val)} autorizada e enviada para ${destOwner} (${destBank} - ${destIban})!`);
            setWithdrawAmount('');
          };

          return (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="font-sans font-black text-white text-sm uppercase tracking-tight">Finanças & Levantamentos</h4>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Defina as coordenadas oficiais para depositar subscrições, e levante as receitas acumuladas.</p>
                </div>
              </div>

              {/* PAINEL FINANCEIRO DE INDICADORES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left">
                  <span className="text-[9px] uppercase font-mono text-slate-400 font-extrabold block">1. Total de Receitas Geradas</span>
                  <span className="text-sm font-black font-mono text-white block mt-1">{formatKwanza(totalRevenue)}</span>
                  <span className="text-[8.5px] text-slate-500 block mt-0.5">Planos + Destaques + Publicidade</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left">
                  <span className="text-[9px] uppercase font-mono text-slate-400 font-extrabold block">2. Total de Receitas Retiradas</span>
                  <span className="text-sm font-black font-mono text-red-400 block mt-1">-{formatKwanza(adminWithdrawnRevenues)}</span>
                  <span className="text-[8.5px] text-slate-500 block mt-0.5">Retirado para conta administrativa</span>
                </div>
                <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900 text-left">
                  <span className="text-[9px] uppercase font-mono text-emerald-400 font-extrabold block">3. Saldo Disponível para Levantamento</span>
                  <span className="text-base font-black font-mono text-emerald-400 block mt-1">{formatKwanza(availableRevenue)}</span>
                  <span className="text-[8.5px] text-emerald-505 block mt-0.5">Pode levantar para qualquer conta</span>
                </div>
              </div>

              {withdrawnSuccessMsg && (
                <div className="bg-emerald-950/40 border border-emerald-800 p-4 rounded-xl text-xs text-emerald-400 animate-pulse text-left space-y-1">
                  <p className="font-bold">{withdrawnSuccessMsg}</p>
                  <p className="text-[9.5px] text-slate-400">Um SMS de comprovativo de transação financeira foi também despachado para auditoria do sistema em tempo real.</p>
                  <button onClick={() => setWithdrawnSuccessMsg('')} className="text-[9px] underline font-bold mt-1 text-slate-300">Fechar Nota</button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* INSERIR/EDITAR COORDENADAS BANCÁRIAS DA APP */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                  <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-[#D4AF37] border-b border-slate-800 pb-2">📋 Configurar Dados Bancários do App</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Estes dados serão apresentados aos utilizadores para transferências ao atualizar para contas de Profissionais, de Empresas ou ao adquirir banners publicitários.</p>
                  <form onSubmit={handleSaveBank} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="block text-[8px] uppercase tracking-widest font-mono text-slate-400 font-bold">Banco Destinatário</label>
                      <input 
                        type="text" 
                        value={bNameInput} 
                        onChange={(e) => setBNameInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                        placeholder="Ex: BFA (Banco Fomento Angola)"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] uppercase tracking-widest font-mono text-slate-400 font-bold">Nome do Beneficiário</label>
                      <input 
                        type="text" 
                        value={bBenInput} 
                        onChange={(e) => setBBenInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                        placeholder="Ex: Nossos Negócios, Lda"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] uppercase tracking-widest font-mono text-slate-400 font-bold">IBAN Oficial do Aplicativo</label>
                      <input 
                        type="text" 
                        value={bIbanInput} 
                        onChange={(e) => setBIbanInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-2.5 font-mono rounded-lg focus:outline-none focus:border-[#D4AF37]"
                        placeholder="Ex: AO06.0006..."
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-600 font-extrabold uppercase py-2.5 px-4 rounded-xl text-[10px] text-black transition-all cursor-pointer shadow mt-2"
                    >
                      Guardar Dados Bancários do App
                    </button>
                  </form>
                </div>

                {/* LEVANTAMENTO DE TODAS AS RECEITAS ACUMULADAS */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                  <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">💸 Levantar Receitas do Aplicativo</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Retire os fundos disponíveis gerados por taxas de destaque e campanhas de anúncios para uma conta externa administrativa imediata.</p>
                  
                  <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-[8px] uppercase tracking-widest font-mono text-slate-400 font-bold">Valor a Levantar (Kwanza)</label>
                        <button 
                          type="button" 
                          onClick={() => setWithdrawAmount(String(availableRevenue))}
                          className="text-[9px] text-[#D4AF37] hover:underline font-extrabold cursor-pointer"
                        >
                          Levantar Valor Total ({formatKwanza(availableRevenue)})
                        </button>
                      </div>
                      <input 
                        type="number" 
                        value={withdrawAmount} 
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono font-bold p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                        placeholder="Ex: 50000"
                        max={availableRevenue}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] uppercase tracking-widest font-mono text-slate-400 font-bold">Banco de Destino</label>
                      <input 
                        type="text" 
                        value={destBank} 
                        onChange={(e) => setDestBank(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-2.5 rounded-lg focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] uppercase tracking-widest font-mono text-slate-400 font-bold">IBAN da Conta de Destino</label>
                      <input 
                        type="text" 
                        value={destIban} 
                        onChange={(e) => setDestIban(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white font-mono p-2.5 rounded-lg focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] uppercase tracking-widest font-mono text-slate-400 font-bold">Titular da Conta / Beneficiário Administrador</label>
                      <input 
                        type="text" 
                        value={destOwner} 
                        onChange={(e) => setDestOwner(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-2.5 rounded-lg focus:outline-none"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={availableRevenue <= 0}
                      className={`w-full font-extrabold uppercase py-2.5 px-4 rounded-xl text-[10px] transition-all cursor-pointer ${
                        availableRevenue <= 0 
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-black shadow'
                      }`}
                    >
                      Efetuar Levantamento Bancário
                    </button>
                  </form>
                </div>

              </div>
            </div>
          );
        })()}

        {/* CONFIGURAÇÃO DE CREDENCIAIS (USER / PASSWORD) */}
        {activeTab === 'config' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h4 className="font-sans font-black text-white text-sm uppercase tracking-tight">Configurações de Credenciais</h4>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Altere o nome de utilizador de administrador, endereço de e-mail e palavra-passe secreta de acesso.</p>
            </div>

            <div className="max-w-xl bg-slate-950 p-5 rounded-3xl border border-slate-850 space-y-5 text-left">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-[#D4AF37] border-b border-slate-800 pb-2">⚙️ Alterar Credenciais Administrativas</h5>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-400 font-bold">Nome de Utilizador / Credencial de Entrada</label>
                  <input
                    type="text"
                    value={admUserInput}
                    onChange={(e) => setAdmUserInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    placeholder="admin"
                  />
                  <p className="text-[8.5px] text-slate-500 font-bold">Este valor substituirá o valor predefinido "admin" para iniciar sessão como administrador.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-400 font-bold">Endereço de E-mail do Admin</label>
                  <input
                    type="email"
                    value={admEmailInput}
                    onChange={(e) => setAdmEmailInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                    placeholder="nossosnegocios.ao@gmail.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] uppercase tracking-widest font-mono text-slate-400 font-bold">Nova Palavra-passe de Segurança</label>
                  <div className="relative">
                    <input
                      type={showAdmPass ? "text" : "password"}
                      value={admPassInput}
                      onChange={(e) => setAdmPassInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs font-mono p-2.5 pr-10 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                      placeholder="Ex: NovaPalavraChave"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdmPass(!showAdmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showAdmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateAdminUsername) onUpdateAdminUsername(admUserInput);
                    if (onUpdateAdminEmail) onUpdateAdminEmail(admEmailInput);
                    if (onUpdateAdminPassword) onUpdateAdminPassword(admPassInput);
                    alert("✓ As credenciais e canais de acesso do administrador foram modificados com êxito! Utilize as novas credenciais no próximo login.");
                  }}
                  className="w-full bg-[#D4AF37] hover:bg-amber-600 font-black uppercase text-black text-[10.5px] py-3 rounded-2xl transition-all cursor-pointer text-center"
                >
                  Guardar Configurações de Acesso
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIGHTBOX FOR CAMPAIGN PAYMENT PROOF */}
        {selectedProofImageUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
                <span className="text-xs uppercase font-black text-amber-400 tracking-wider font-mono">Verificação de Comprovativo de Pagamento</span>
                <button
                  type="button"
                  onClick={() => setSelectedProofImageUrl(null)}
                  className="text-slate-400 hover:text-white font-black text-xs bg-slate-800 hover:bg-slate-700 py-1 px-3 rounded-lg cursor-pointer transition-colors"
                >
                  ✕ Fechar
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex items-center justify-center bg-neutral-950 flex-grow min-h-[300px]">
                <img 
                  src={selectedProofImageUrl} 
                  alt="Talão de Transferência" 
                  className="object-contain max-h-[50vh] max-w-full rounded-xl shadow-lg border border-slate-850"
                />
              </div>
              <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
                <p className="text-[10px] text-zinc-400">Verifique atentamente o ID da transação, o banco, o beneficiário e o valor transferido antes de aprovar.</p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
