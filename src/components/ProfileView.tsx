import React, { useState, useEffect } from 'react';
import { User, SubscriptionPayment } from '../types';
import { formatKwanza } from '../utils';
import { 
  Camera, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Share2, 
  LogOut, 
  Check, 
  Award, 
  User as UserIcon,
  Sparkles,
  Briefcase,
  Smartphone,
  Shield,
  Zap,
  Crown,
  FileText,
  Lock,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  users: User[];
  products?: any[];
  subscriptionPayments?: SubscriptionPayment[];
  onUpdateProfile: (updatedData: Partial<User>) => void;
  onLogout: () => void;
  onAddSubscriptionPayment?: (paymentData: {
    planType: 'mensal' | 'anual';
    userType: 'profissional' | 'empresa';
    amount: number;
    bankName: string;
    txId: string;
    proofImage?: string;
    notes?: string;
  }) => void;
  platformBankName?: string;
  platformBeneficiary?: string;
  platformIban?: string;
  onOpenKYC?: () => void;
  onViewMyProducts?: () => void;
}

export default function ProfileView({ 
  user, 
  users, 
  products = [], 
  subscriptionPayments = [], 
  onUpdateProfile, 
  onLogout,
  onAddSubscriptionPayment,
  platformBankName = 'BFA (Banco Fomento Angola)',
  platformBeneficiary = 'Nossos Negócios, Lda',
  platformIban = 'AO06.0006.0049.2019.4810.1897.6',
  onOpenKYC,
  onViewMyProducts
}: ProfileViewProps) {
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showUpgradePanel, setShowUpgradePanel] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Selected plan for upgrading
  const [selectedPlanUpgrade, setSelectedPlanUpgrade] = useState<{
    userType: 'profissional' | 'empresa';
    planType: 'mensal' | 'anual';
    amount: number;
  } | null>(null);

  // Upgrade payment inputs
  const [upgradeBank, setUpgradeBank] = useState('BAI');
  const [upgradeTxId, setUpgradeTxId] = useState('');
  const [upgradeProof, setUpgradeProof] = useState('');
  const [upgradeNotes, setUpgradeNotes] = useState('');
  const [isUpgradePaymentConfirmed, setIsUpgradePaymentConfirmed] = useState(false);

  // Credentials change states
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [emailSentAlert, setEmailSentAlert] = useState<{ code: string; email: string } | null>(null);
  const [credentialError, setCredentialError] = useState('');
  const [credentialSuccess, setCredentialSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Sync newEmail if user changes
  useEffect(() => {
    if (user) {
      setNewEmail(user.email);
    }
  }, [user]);

  const handleRequestCredentialChange = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialError('');
    setCredentialSuccess('');

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setCredentialError('O campo de E-mail é obrigatório.');
      return;
    }

    // If changing password, validate
    if (newPassword) {
      if (newPassword.length < 4) {
        setCredentialError('A nova palavra-passe deve ter pelo menos 4 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setCredentialError('As palavras-passe não coincidem.');
        return;
      }
    }

    // Check if anything is actually being changed
    const isEmailChanged = cleanEmail !== user.email.toLowerCase();
    const isPasswordChanged = !!newPassword;

    if (!isEmailChanged && !isPasswordChanged) {
      setCredentialError('Introduza um novo e-mail ou uma nova palavra-passe para poder efetuar a alteração.');
      return;
    }

    // Check if the new email is already in use by another user
    const emailInUse = users.some(u => u.id !== user.id && u.email.toLowerCase() === cleanEmail);
    if (emailInUse) {
      setCredentialError('Este endereço de e-mail já está em uso por outro utilizador no mercado.');
      return;
    }

    // Update profile directly without simulation
    const updatePayload: Partial<User> = {};
    if (cleanEmail !== user.email) {
      updatePayload.email = cleanEmail;
    }
    if (newPassword && newPassword !== user.password) {
      updatePayload.password = newPassword;
    }

    onUpdateProfile(updatePayload);
    setCredentialSuccess('As suas credenciais de acesso foram atualizadas com sucesso!');
    
    // Clear forms/inputs
    setNewPassword('');
    setConfirmPassword('');
    setPendingEmail('');
    setPendingPassword('');
    setVerificationCode('');
    setEnteredCode('');
    setShowVerificationInput(false);
    setEmailSentAlert(null);

    // Hide success message after 4 seconds
    setTimeout(() => {
      setCredentialSuccess('');
    }, 4000);
  };

  const handleVerifyCredentialChange = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCancelCredentialChange = () => {
    setNewPassword('');
    setConfirmPassword('');
    setPendingEmail('');
    setPendingPassword('');
    setVerificationCode('');
    setEnteredCode('');
    setShowVerificationInput(false);
    setEmailSentAlert(null);
    setCredentialError('');
  };

  const handleCopyReferral = () => {
    if (!user) return;
    const shareUrl = `${window.location.origin}/?ref=${user.referralCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    onUpdateProfile({ phone, avatar });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!user) {
    return (
      <div className="text-center py-20 text-slate-400 bg-slate-900/30 border border-slate-800 rounded-3xl max-w-xl mx-auto p-8 space-y-4">
        <p className="text-sm font-sans">Por favor, inicie sessão ou crie uma conta para visualizar e gerir o seu perfil de negócios em Angola.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Visual Identity Profile Banner Card */}
      <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* Active User Avatar display with camera overlay */}
          <label htmlFor="avatar-file-upload" className="relative group shrink-0 cursor-pointer">
            <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.25)] bg-neutral-950 hover:border-amber-450 transition-colors">
              <img src={avatar} alt={user.name} className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <Camera size={20} className="text-[#D4AF37]" />
            </div>
          </label>

          <div className="text-center md:text-left space-y-2 flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">{user.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1 sm:pt-0">
                <span className={`text-[9px] uppercase font-mono font-extrabold px-2 py-0.5 rounded border ${
                  user.accountType === 'empresa' 
                    ? 'bg-amber-500/10 text-[#D4AF37] border-amber-500/30' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {user.accountType === 'empresa' ? 'Corporate' : 'Particular'}
                </span>
                {user.isVerified ? (
                  <span className="flex items-center text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
                    <ShieldCheck size={10} className="mr-0.5" fill="currentColor" stroke="black" /> Verificado
                  </span>
                ) : (
                  onOpenKYC && (
                    <button
                      type="button"
                      onClick={onOpenKYC}
                      className="flex items-center text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 px-2 py-0.5 rounded font-mono font-black uppercase cursor-pointer transition-all gap-1 active:scale-95"
                    >
                      <ShieldCheck size={10} /> Solicitar Verificação
                    </button>
                  )
                )}
              </div>
            </div>

            <p className="text-xs text-gray-400 max-w-lg leading-relaxed">
              Perfil comercial verificado com nível de reputação <span className="text-[#D4AF37] font-bold">{user.trustLevel}</span>. 
              Pontuação reputacional de <span className="text-amber-400 font-mono font-extrabold">★ {user.rating.toFixed(1)}</span> baseada em {user.ratingsCount} negociações concluídas.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-500 pt-1 font-mono">
              <span className="flex items-center"><Mail size={12} className="mr-1 text-gray-600" /> {user.email}</span>
              <span className="flex items-center"><Phone size={12} className="mr-1 text-gray-600" /> +244 {user.phone}</span>
              <span className="flex items-center"><MapPin size={12} className="mr-1 text-gray-600" /> Luanda, AO</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETALHES DA ASSINATURA & PLANO INTEGRADO */}
      <div className="bg-[#121212] border border-neutral-805 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-blue-600/5 rounded-full blur-[50px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-850 pb-4 gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Status da Assinatura & Plano</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Gerenciamento de credenciais, limites de anúncios e selos de confiança no Nossos Negócios.</p>
          </div>
          <button
            onClick={() => setShowUpgradePanel(!showUpgradePanel)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center space-x-1.5 uppercase tracking-wide"
          >
            <Zap size={13} className="animate-pulse" />
            <span>{showUpgradePanel ? "Ocultar Planos" : "Atualizar Plano"}</span>
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-semibold animate-in fade-in duration-200">
            ✓ {successMsg}
          </div>
        )}

        {/* Dashboard of subscription specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="bg-neutral-950/70 p-4 rounded-2xl border border-neutral-850">
            <span className="text-[9px] uppercase font-bold text-gray-500 block font-mono">Tipo de Conta</span>
            <span className="text-sm font-black text-white block mt-1.5 uppercase tracking-wide">
              {user.accountType === 'particular' ? "👤 Individual" : user.accountType === 'profissional' ? "⭐ Profissional" : "🏢 Empresa"}
            </span>
          </div>

          <div className="bg-neutral-950/70 p-4 rounded-2xl border border-neutral-850 flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-500 block font-mono">Estado de Verificação</span>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mt-2 ${
                user.isVerified 
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30" 
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }`}>
                {user.isVerified ? (user.accountType === 'empresa' ? "Empresa Verificada" : "Utilizador Verificado") : "Não Verificado"}
              </span>
            </div>
            {!user.isVerified && onOpenKYC && (
              <button
                type="button"
                onClick={onOpenKYC}
                className="mt-3 bg-[#2563EB] hover:bg-blue-700 text-white text-[9.5px] font-black uppercase py-1.5 px-3 rounded-lg transition-all cursor-pointer shadow-sm tracking-wider w-full text-center active:scale-95"
              >
                Verificar Conta
              </button>
            )}
          </div>

          <div className="bg-neutral-950/70 p-4 rounded-2xl border border-neutral-850">
            <span className="text-[9px] uppercase font-bold text-gray-500 block font-mono">Plano Atual</span>
            <span className="text-xs font-bold text-white block mt-1.5">
              {user.accountType === 'particular' ? "Utilizador Individual (Gratuito)" : user.accountType === 'profissional' ? `Profissional ${user.planType === 'anual' ? 'Anual' : 'Mensal'}` : `Empresa ${user.planType === 'anual' ? 'Anual' : 'Mensal'}`}
            </span>
          </div>

          <div className="bg-neutral-950/70 p-4 rounded-2xl border border-neutral-850">
            <span className="text-[9px] uppercase font-bold text-gray-500 block font-mono">Validade / Expiração</span>
            <span className="text-xs font-mono text-gray-300 block mt-1.5">
              {user.accountType === 'particular' ? "Vigência Permanente" : user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString('pt-AO') : "Ativo permanente"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#18181B] p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between space-y-3">
            <div className="flex justify-between items-center w-full">
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-500 block">Anúncios Ativos</span>
                <span className="text-xl font-mono font-extrabold text-white mt-1 block">
                  {products.filter(p => p.sellerId === user.id).length} / {user.accountType === 'particular' ? (user.isVerified ? "40" : "15") : user.accountType === 'profissional' ? "100" : "Ilimitados"}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-sans max-w-[150px] text-right leading-tight">
                {user.accountType === 'particular' ? (user.isVerified ? "Até 40 anúncios ativos (Conta Verificada)" : "Até 15 anúncios ativos (Não Verificada)") : user.accountType === 'profissional' ? "Até 100 anúncios ativos" : "Anúncios sem limites"}
              </span>
            </div>
            {onViewMyProducts && (
              <button
                type="button"
                onClick={onViewMyProducts}
                className="w-full bg-blue-600/10 hover:bg-blue-600 hover:text-white border border-blue-500/20 text-blue-400 font-bold text-[10.5px] uppercase py-2 px-3 rounded-xl transition-all cursor-pointer text-center active:scale-95 flex items-center justify-center gap-1.5"
              >
                <FileText size={12} />
                <span>Ver as minhas publicações</span>
              </button>
            )}
          </div>

          <div className="bg-[#18181B] p-4 rounded-2xl border border-neutral-800 flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-500 block">Selo de Destaque Mensal</span>
              <span className="text-xl font-mono font-extrabold text-amber-400 mt-1 block">
                {user.highlightCredits || 0}★
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-sans max-w-[150px] text-right leading-tight">
              Anúncios destacados grátis por mês
            </span>
          </div>
        </div>

        {/* Upgrade Plan Selection Panel (Toggled by user action) */}
        {showUpgradePanel && (
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
            {(() => {
              const userPendingPayments = subscriptionPayments?.filter(
                (p) => (p.userId === user.id || p.userEmail === user.email) && p.status === 'pending'
              ) || [];

              if (user.planStatus === 'pending' || userPendingPayments.length > 0) {
                return (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-6 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      <span className="font-sans font-extrabold uppercase text-xs text-[#D4AF37]">Ativação de Plano em Análise</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      O seu comprovativo de pagamento/transferência bancária associado à conta foi enviado e encontra-se sob verificação e validação por parte da equipa administrativa.
                    </p>
                    {userPendingPayments.length > 0 && (
                      <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 space-y-1.5 font-mono text-[10px] text-left">
                        <div>
                          <span className="text-gray-500 font-sans">ID de Transação:</span>{' '}
                          <span className="text-white font-bold">{userPendingPayments[0].txId}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-sans">Banco Informado:</span>{' '}
                          <span className="text-amber-500 font-bold">{userPendingPayments[0].bankName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-sans">Valor Transacionado:</span>{' '}
                          <span className="text-emerald-400 font-bold">{formatKwanza(userPendingPayments[0].amount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-sans">Estado:</span>{' '}
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 font-sans font-bold uppercase text-[9px] rounded">Pendente</span>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 italic">
                      A ativação do plano e a consequente alteração automática do tipo de conta serão concluídas de imediato assim que a validação administrativa for efetuada.
                    </p>
                  </div>
                );
              }

              if (selectedPlanUpgrade) {
                return (
                  <div className="bg-neutral-900 border border-neutral-805 rounded-xl p-5 space-y-4 text-left animate-in fade-in duration-300">
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-[#D4AF37] block">Sessão Segura de Pagamento</span>
                        <p className="text-[10px] text-gray-500 mt-0.5">Efetue o seu pedido de adesão para o plano {selectedPlanUpgrade.userType === 'empresa' ? '🏢 Empresa' : '⭐ Profissional'} ({selectedPlanUpgrade.planType})</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPlanUpgrade(null)}
                        className="text-[10px] uppercase font-bold text-gray-500 hover:text-white bg-neutral-950 px-2.5 py-1 rounded-xl border border-neutral-800 transition-colors cursor-pointer"
                      >
                        Voltar
                      </button>
                    </div>

                    {/* Price dynamic readout */}
                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 flex justify-between items-center">
                      <span className="text-[9px] uppercase font-mono font-bold text-gray-500">Valor a Transferir:</span>
                      <span className="text-xs font-black font-mono text-[#D4AF37]">
                        {formatKwanza(selectedPlanUpgrade.amount)}
                      </span>
                    </div>

                    {/* Bank Transfer Coordinates */}
                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-2.5">
                      <h5 className="text-[9px] uppercase tracking-wider font-bold text-[#D4AF37] font-mono border-b border-neutral-800 pb-1">Coordenadas Bancárias de Depósito</h5>
                      
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
                          <span className="text-[7.5px] text-zinc-500 block uppercase font-sans">IBAN Principal (Toque p/ copiar)</span>
                          <span className="text-white block font-mono select-all tracking-wider text-[10px] bg-neutral-950 p-1 rounded border border-neutral-800 text-center font-bold">{platformIban}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rich Form Inputs for Deposit Verification */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5 text-left">
                      <div className="space-y-1">
                        <label className="block text-[8.5px] uppercase font-bold tracking-widest text-[#D4AF37] pl-1 font-mono">Banco da sua Transferência</label>
                        <select 
                          value={upgradeBank}
                          onChange={(e) => setUpgradeBank(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-sans outline-none font-bold cursor-pointer"
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
                        <label className="block text-[8.5px] uppercase font-bold tracking-widest text-[#D4AF37] pl-1 font-mono">ID de Transação do Comprovativo <span className="text-red-500">*</span></label>
                        <input 
                          type="text"
                          placeholder="Insira o ID identificador da transferência"
                          value={upgradeTxId}
                          onChange={(e) => setUpgradeTxId(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono placeholder-neutral-700 focus:outline-none focus:border-[#D4AF37] uppercase font-bold"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-[8.5px] uppercase font-bold tracking-widest text-[#D4AF37] pl-1 font-mono">Comprovativo de Transferência (Opcional)</label>
                        <div className="flex flex-col gap-2">
                          <input 
                            type="file"
                            accept="image/*"
                            id="upgrade-proof-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setUpgradeProof(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                          <div className="flex gap-2 font-sans">
                            <label 
                              htmlFor="upgrade-proof-upload"
                              className={`flex-grow border border-dashed rounded-xl p-3 text-center text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                                upgradeProof 
                                  ? 'border-emerald-500 bg-emerald-950/10 text-emerald-400' 
                                  : 'border-neutral-800 hover:border-[#D4AF37] text-zinc-400'
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                              <span>{upgradeProof ? '✓ Comprovativo Carregado' : 'Carregar Imagem de Talão'}</span>
                            </label>

                            {upgradeProof && (
                              <button
                                type="button"
                                onClick={() => setUpgradeProof('')}
                                className="bg-red-550 hover:bg-red-700 text-white font-extrabold px-3 rounded-xl text-[10px] uppercase cursor-pointer transition-colors"
                              >
                                Remover
                              </button>
                            )}
                          </div>
                          {upgradeProof && (
                            <div className="flex justify-center border border-neutral-800 p-2 rounded-xl bg-neutral-950 font-sans">
                              <img 
                                src={upgradeProof} 
                                alt="Comprovativo de Upgrade" 
                                className="max-h-24 max-w-full rounded object-contain border border-neutral-850"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-[8.5px] uppercase font-bold tracking-widest text-[#D4AF37] pl-1 font-mono">Observações (Opcional)</label>
                        <input 
                          type="text"
                          placeholder="Indique dados adicionais se necessário..."
                          value={upgradeNotes}
                          onChange={(e) => setUpgradeNotes(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-sans"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-3 border-t border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setSelectedPlanUpgrade(null)}
                        className="bg-neutral-800 hover:bg-neutral-700 text-zinc-300 font-bold px-4 py-2 rounded-xl text-xs uppercase cursor-pointer transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={!upgradeTxId.trim()}
                        onClick={() => {
                          if (!upgradeTxId.trim()) {
                            alert("Erro: O preenchimento do ID de Transação é obrigatório.");
                            return;
                          }
                          if (onAddSubscriptionPayment) {
                            onAddSubscriptionPayment({
                              planType: selectedPlanUpgrade.planType,
                              userType: selectedPlanUpgrade.userType,
                              amount: selectedPlanUpgrade.amount,
                              bankName: upgradeBank,
                              txId: upgradeTxId,
                              proofImage: upgradeProof || undefined,
                              notes: upgradeNotes || undefined,
                            });
                            setSuccessMsg("Comprovativo de pagamento submetido com sucesso! A alteração da sua conta aguarda validação administrativa.");
                            setSelectedPlanUpgrade(null);
                            setUpgradeTxId('');
                            setUpgradeProof('');
                            setUpgradeNotes('');
                            setShowUpgradePanel(false);
                            setTimeout(() => setSuccessMsg(''), 6000);
                          }
                        }}
                        className={`font-black px-6 py-2 rounded-xl text-xs uppercase tracking-wider transition-all ${
                          upgradeTxId.trim()
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-black cursor-pointer'
                            : 'bg-neutral-800 text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        Submeter Pagamento
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block">Selecione o seu Plano de Upgrade</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Option 1: Individual */}
                    <div className="border border-neutral-800 p-4 rounded-xl bg-neutral-900/40 relative flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">Utilizador Individual</span>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 block mt-1">Gratuito</span>
                        <ul className="text-[10px] text-gray-400 space-y-1.5 mt-3 list-disc pl-3">
                          <li>Até 15 anúncios ativos (40 se Verificado)</li>
                          <li>Chat ilimitado compradores/vendedores</li>
                          <li>Avaliações e favoritos</li>
                        </ul>
                      </div>
                      <button
                        disabled={user.accountType === 'particular'}
                        onClick={() => {
                          onUpdateProfile({ 
                            accountType: 'particular', 
                            planStatus: 'none', 
                            planExpiresAt: undefined, 
                            highlightCredits: 0 
                          });
                          setSuccessMsg(" downgrade para utilizador individual efetuado com sucesso!");
                          setTimeout(() => setSuccessMsg(''), 5500);
                        }}
                        className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase mt-4 transition-all cursor-pointer ${
                          user.accountType === 'particular' 
                            ? "bg-neutral-800 text-gray-500 cursor-not-allowed" 
                            : "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/35 hover:bg-[#D4AF37]/30"
                        }`}
                      >
                        {user.accountType === 'particular' ? "Plano Ativo" : "Mudar para Grátis"}
                      </button>
                    </div>

                    {/* Option 2: Professional */}
                    <div className="border border-blue-500/20 p-4 rounded-xl bg-[#2563EB]/5 relative flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white block">⭐ Profissional</span>
                          <span className="text-[8px] bg-blue-500/20 text-blue-400 font-mono px-1 rounded font-bold uppercase">Mais Popular</span>
                        </div>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 block mt-1">
                          5.000 Kz/mês • 70.000 Kz/ano
                        </span>
                        <p className="text-[9px] text-gray-400 mt-1">Revendedores, prestadores de serviços, corretores e independentes.</p>
                        <ul className="text-[10px] text-gray-400 space-y-1 mt-3.5 list-disc pl-3">
                          <li>Até 100 anúncios ativos</li>
                          <li>Selo Profissional Exclusivo</li>
                          <li>Duas publicações destacadas grátis por mês</li>
                          <li>Estatísticas de cliques e visualização</li>
                        </ul>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlanUpgrade({
                              userType: 'profissional',
                              planType: 'mensal',
                              amount: 5000
                            });
                          }}
                          className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white`}
                        >
                          Ativar Mensal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlanUpgrade({
                              userType: 'profissional',
                              planType: 'anual',
                              amount: 70000
                            });
                          }}
                          className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer bg-[#D4AF37] text-black hover:bg-amber-600`}
                        >
                          Ativar Anual
                        </button>
                      </div>
                    </div>

                    {/* Option 3: Empresa */}
                    <div className="border border-emerald-500/20 p-4 rounded-xl bg-emerald-500/5 relative flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">🏢 Empresa Registada</span>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#D4AF37] block mt-1">
                          20.000 Kz/mês • 200.000 Kz/ano
                        </span>
                        <p className="text-[9px] text-gray-400 mt-1">Lojas, imobiliárias, stands e empresas de serviços.</p>
                        <ul className="text-[10px] text-gray-400 space-y-1 mt-3.5 list-disc pl-3">
                          <li>Anúncios ilimitados ativos</li>
                          <li>Página empresarial própria dedicada</li>
                          <li>Selo de Empresa Verificada</li>
                          <li>5 anúncios destacados grátis por mês</li>
                          <li>Apoio prioritário premium</li>
                        </ul>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlanUpgrade({
                              userType: 'empresa',
                              planType: 'mensal',
                              amount: 20000
                            });
                          }}
                          className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white`}
                        >
                          Ativar Mensal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlanUpgrade({
                              userType: 'empresa',
                              planType: 'anual',
                              amount: 200000
                            });
                          }}
                          className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer bg-[#D4AF37] text-black hover:bg-amber-600`}
                        >
                          Ativar Anual
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Main Form Fields Layout Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Edit avatar and phone */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Avatar Switcher */}
          <div className="bg-[#121212] border border-neutral-805 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Foto de Perfil</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Carregue a sua própria foto ou logótipo comercial a partir da sua galeria para transmitir maior credibilidade ao mercado.</p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40 hover:border-[#D4AF37]/50 transition-all text-center space-y-4 relative">
              <input 
                type="file"
                accept="image/*"
                id="avatar-file-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64Url = reader.result as string;
                      setAvatar(base64Url);
                      onUpdateProfile({ avatar: base64Url });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
              
              <div className="relative shrink-0">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-[#D4AF37] bg-neutral-900 shadow-md">
                  <img src={avatar} alt={user.name} className="h-full w-full object-cover" />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-300 font-bold">Selecione uma imagem da sua galeria</p>
                <p className="text-[9px] text-slate-500">Formatos suportados: PNG, JPG ou JPEG.</p>
              </div>

              <label 
                htmlFor="avatar-file-upload"
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-[#D4AF37] hover:bg-amber-600 text-black font-black text-xs uppercase rounded-xl cursor-pointer transition-all shadow-md active:scale-98"
              >
                <Camera size={13} />
                <span>Escolher Imagem</span>
              </label>
            </div>
          </div>

          {/* Change Phone and basic variables form */}
          <form onSubmit={handleSavePhone} className="bg-[#121212] border border-neutral-805 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Editar Dados de Contacto</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Mantenha os seus dados comerciais atualizados para receber notificações SMS e chamadas de intermediação.</p>
            </div>

            {isSaved && (
              <p className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl text-xs border border-emerald-500/20 font-semibold animate-bounce">
                Dados do perfil atualizados com sucesso !
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">E-mail de Registo</label>
                <div className="w-full bg-neutral-950/60 border border-neutral-850 text-gray-500 rounded-xl p-3 text-xs flex items-center font-mono">
                  <Mail size={12} className="mr-2" />
                  {user.email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Terminal de Telemóvel (+244)</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 923456789"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono font-bold pl-8"
                    required
                  />
                  <Smartphone className="absolute left-2.5 top-3.5 text-gray-500 h-3.5 w-3.5" />
                </div>
              </div>

              {user.accountType === 'empresa' && (
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] font-mono">NIF da Empresa Registado (Obrigatório)</label>
                  <div className="w-full bg-neutral-950/40 border border-[#D4AF37]/20 text-[#D4AF37] rounded-xl p-3 text-xs flex items-center font-mono font-bold">
                    <Briefcase size={12} className="mr-2 text-[#D4AF37]/70" />
                    <span>NIF: {user.nif || 'Não definido'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-[#D4AF37] hover:bg-amber-600 text-black px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md uppercase tracking-wider"
              >
                Guardar Configurações
              </button>
            </div>
          </form>

          {/* Change Credentials Form */}
          <div className="bg-[#121212] border border-neutral-805 rounded-2xl p-6 shadow-xl space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="text-[#D4AF37]" size={16} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Credenciais de Acesso</h3>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Altere o seu e-mail de acesso e a sua palavra-passe de forma segura. Um código de verificação será enviado automaticamente para confirmação imediata.
              </p>
            </div>

            {credentialSuccess && (
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl text-xs border border-emerald-500/20 font-semibold animate-pulse">
                {credentialSuccess}
              </div>
            )}

            {credentialError && (
              <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs border border-red-500/20 font-semibold">
                {credentialError}
              </div>
            )}

            <form onSubmit={handleRequestCredentialChange} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Novo E-mail de Acesso</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                        setCredentialError('');
                      }}
                      placeholder="Novo e-mail de acesso"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono pl-8"
                      required
                    />
                    <Mail className="absolute left-2.5 top-3.5 text-gray-500 h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Nova Palavra-passe</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setCredentialError('');
                      }}
                      placeholder="Min. 4 caracteres"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 pr-10 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono pl-8"
                    />
                    <Lock className="absolute left-2.5 top-3.5 text-gray-500 h-3.5 w-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-2.5 top-3.5 text-gray-500 hover:text-white"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Confirmar Nova Palavra-passe</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setCredentialError('');
                      }}
                      placeholder="Confirme a palavra-passe"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 pr-10 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono pl-8"
                    />
                    <Key className="absolute left-2.5 top-3.5 text-gray-500 h-3.5 w-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-2.5 top-3.5 text-gray-500 hover:text-white"
                    >
                      {showConfirmPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#D4AF37] hover:bg-amber-600 text-black px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md uppercase tracking-wider"
                >
                  Alterar Credenciais
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Col: Invite card, referrals status, Sign out */}
        <div className="space-y-6">
          
          {/* Elegant Invite Card */}
          <div className="bg-gradient-to-br from-[#121212] to-neutral-950 border border-neutral-805 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-xl" />
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/25 text-[#D4AF37]">
                <Share2 size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Convidar Amigos</h4>
                <p className="text-[10px] text-gray-500">Programa de Recomendações de Utilizadores</p>
              </div>
            </div>

            {(() => {
              const isIndivOrProf = user.accountType === 'particular' || user.accountType === 'individual' || user.accountType === 'profissional';
              const isInviteLocked = isIndivOrProf && (!user.isVerified || user.trustLevel === 'Bronze');

              return (
                <>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-sans pt-1">
                    {isInviteLocked ? (
                      <span>Para contas Individuais e Profissionais, a partilha de convites requer que o perfil esteja <strong>Verificado</strong> e tenha classificação média de nível <strong>Prata (mínimo de 4.5★)</strong>.</span>
                    ) : user.trustLevel === 'Ouro' ? (
                      <span>Como és nível máximo <strong>Ouro (5.0★)</strong>, ganhas <span className="text-[#D4AF37] font-bold">1.000 pontos reputacionais</span> imediatamente por cada novo inscrito que se registe com o teu link!</span>
                    ) : (
                      <span>Partilha o teu link de afiliação. Como és nível <strong>{user.trustLevel}</strong>, tu e o teu convidado ganham <span className="text-[#D4AF37] font-bold">500 pontos reputacionais</span> após o registo!</span>
                    )}
                  </p>

                  <div className="bg-black/50 p-2.5 rounded-xl border border-neutral-850 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-gray-400">Código:</span>
                    <span className="text-[#D4AF37] font-extrabold tracking-wider">{user.referralCode}</span>
                  </div>

                  {isInviteLocked ? (
                    <div className="bg-neutral-950 border border-red-950/40 text-red-400/80 p-3 rounded-xl text-center text-[10px] font-mono leading-relaxed space-y-1">
                      <div className="font-bold text-red-400">🔒 CONVITE BLOQUEADO</div>
                      <div>Requisitos para libertar o link de convite:</div>
                      <div className="flex justify-between items-center gap-1.5 mt-2 bg-black/30 p-1.5 rounded border border-neutral-900">
                        <span>Verificação de Conta:</span>
                        <span className={user.isVerified ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                          {user.isVerified ? "✅ Verificada" : "❌ Pendente"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-1.5 bg-black/30 p-1.5 rounded border border-neutral-900">
                        <span>Classificação Média:</span>
                        <span className={user.trustLevel !== 'Bronze' ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                          {user.ratingsCount > 0 ? `${user.rating}★` : 'Nenhuma'} ({user.trustLevel || 'Bronze'})
                        </span>
                      </div>
                      <div className="text-[9px] text-gray-500 pt-1">
                        Necessita de Conta Verificada + Nível Prata (4.5★+).
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleCopyReferral}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                        copySuccess 
                          ? 'bg-emerald-500 text-black' 
                          : 'bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 shadow-sm'
                      }`}
                    >
                      {copySuccess ? (
                        <>
                          <Check size={14} />
                          <span>Link Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={14} />
                          <span>Copiar Link de Convite</span>
                        </>
                      )}
                    </button>
                  )}
                </>
              );
            })()}

            <div className="text-center pt-1 border-t border-neutral-900">
              <span className="text-[9px] uppercase font-bold text-gray-500 block">Indicações Efetuadas</span>
              <span className="text-lg font-bold text-emerald-400 font-mono block mt-0.5">{user.referralsCount}</span>
            </div>
          </div>

          {/* Secure Logout Actions Container */}
          <div className="bg-[#121212] border border-neutral-805 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Gerir Sessão</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Encerre a sessão do perfil de maneira segura e volte ao portal principal.</p>
            </div>

            <button
              onClick={onLogout}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-2 shadow-[0_4px_12px_rgba(239,68,68,0.05)] uppercase tracking-wider"
            >
              <LogOut size={14} className="animate-pulse" />
              <span>Sair da Conta (Logout)</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
