import React, { useState } from 'react';
import { User, VerificationSubmission } from '../types';
import { X, Shield, Upload, FileCheck, Camera, Check, Building, FileText, Sparkles, TrendingUp, BarChart3, Award, Info } from 'lucide-react';
import { formatKwanza } from '../utils';

interface KYCModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmitVerification?: (
    type: 'individual' | 'empresa',
    docFields: {
      idCardFront?: string;
      idCardBack?: string;
      selfie?: string;
      nif?: string;
      commercialCertificate?: string;
      otherDocs?: string;
    }
  ) => void;
  onSubmitKYC?: (docType: string, docNum: string, docFront: string, docBack: string, selfie: string) => void;
  activeSubmission?: VerificationSubmission;
}

export default function KYCModal({ 
  user, 
  isOpen, 
  onClose, 
  onSubmitVerification, 
  onSubmitKYC,
  activeSubmission 
}: KYCModalProps) {
  
  const defaultType = user.accountType === 'empresa' ? 'empresa' : 'individual';
  const [activeType, setActiveType] = useState<'individual' | 'empresa'>(defaultType);
  const [success, setSuccess] = useState(false);

  // Benefits state
  const defaultBenefitTab = user.accountType === 'empresa' ? 'empresa' : user.accountType === 'profissional' ? 'profissional' : 'individual';
  const [selectedBenefitTab, setSelectedBenefitTab] = useState<'individual' | 'profissional' | 'empresa' | 'comuns'>(defaultBenefitTab);

  // Individual fields
  const [idCardFront, setIdCardFront] = useState<string>('https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=350&auto=format&fit=crop');
  const [frontFileName, setFrontFileName] = useState<string>('BI_Frente.jpg (Modelo)');
  
  const [idCardBack, setIdCardBack] = useState<string>('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=350&auto=format&fit=crop');
  const [backFileName, setBackFileName] = useState<string>('BI_Verso.jpg (Modelo)');

  const [selfie, setSelfie] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350&auto=format&fit=crop');
  const [selfieFileName, setSelfieFileName] = useState<string>('Selfie_Foto.jpg (Modelo)');

  // Empresa fields
  const [nifValue, setNifValue] = useState<string>(user.nif || '');
  const [certCom, setCertCom] = useState<string>('https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=350&auto=format&fit=crop');
  const [certFileName, setCertFileName] = useState<string>('Certidao_Comercial_Scrib.pdf (Modelo)');

  const [otherDoc, setOtherDoc] = useState<string>('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=350&auto=format&fit=crop');
  const [otherFileName, setOtherFileName] = useState<string>('Alvara_Atividades.jpg (Modelo)');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      switch(field) {
        case 'front':
          setIdCardFront(url);
          setFrontFileName(file.name);
          break;
        case 'back':
          setIdCardBack(url);
          setBackFileName(file.name);
          break;
        case 'selfie':
          setSelfie(url);
          setSelfieFileName(file.name);
          break;
        case 'cert':
          setCertCom(url);
          setCertFileName(file.name);
          break;
        case 'other':
          setOtherDoc(url);
          setOtherFileName(file.name);
          break;
        default:
          break;
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeType === 'individual') {
      if (!idCardFront || !idCardBack || !selfie) {
        alert('Por favor, carregue todos os documentos necessários (B.I. Frente, Verso e Selfie).');
        return;
      }
      if (onSubmitVerification) {
        onSubmitVerification('individual', {
          idCardFront,
          idCardBack,
          selfie
        });
      } else if (onSubmitKYC) {
        onSubmitKYC('B.I.', '941963554', idCardFront, idCardBack, selfie);
      }
    } else {
      if (!nifValue.trim()) {
        alert('Por favor, indique o Número de Identificação Fiscal (NIF) da sua empresa.');
        return;
      }
      if (!certCom) {
        alert('Por favor, carregue a cópia digitalizada da Certidão Comercial.');
        return;
      }
      if (onSubmitVerification) {
        onSubmitVerification('empresa', {
          nif: nifValue.toUpperCase(),
          commercialCertificate: certCom,
          otherDocs: otherDoc
        });
      } else if (onSubmitKYC) {
        onSubmitKYC('NIF', nifValue.toUpperCase(), certCom, certCom, '');
      }
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div id="verification-modal" className="fixed inset-0 bg-[#0F172A]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1E293B] border border-slate-700 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-white my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield size={20} className="text-[#2563EB]" />
            <h3 className="font-sans font-black text-white text-sm uppercase tracking-tight">Selo de Verificação Profissional</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {success || activeSubmission ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 bg-[#2563EB]/10 border border-[#2563EB]/40 rounded-full flex items-center justify-center text-blue-400 animate-pulse">
              <FileCheck size={32} />
            </div>
            <h4 className="font-sans font-black text-white text-base">Solicitação de Verificação Enviada</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Os seus documentos e comprovativos foram encaminhados com sucesso ao departamento administrativo do <strong>Nossos Negócios, Lda</strong>. A nossa equipa irá analisar e certificar a conta no prazo máximo de 12 horas.
            </p>
            
            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-850 text-xs text-left w-full space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Tipo de Selo:</span>
                <span className="font-bold text-white uppercase">{activeSubmission?.type || activeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Pendente:</span>
                <span className="font-bold text-amber-400 flex items-center">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 mr-1 animate-ping"></span>
                  Sob Auditoria
                </span>
              </div>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-855 mt-2">
                Qualquer novidade será notificada via SMS profissional ao seu contacto associado ({user.phone}).
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-2 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer uppercase tracking-tight"
            >
              Concluído
            </button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Standard vs Business Tabs Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveType('individual')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activeType === 'individual'
                    ? 'bg-[#2563EB] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield size={13} />
                <span>Utilizador Verificado</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveType('empresa')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activeType === 'empresa'
                    ? 'bg-[#2563EB] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building size={13} />
                <span>Empresa Verificada</span>
              </button>
            </div>

            {/* Ecosystem Trust Statement */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 text-left text-xs space-y-2">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-200">Plataforma Justa e Segura</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A verificação visa construir um ecossistema de confiança entre compradores, vendedores, candidatos e empresas. 
                    Oferece vantagens exclusivas para incentivar a autenticidade, mas <strong className="text-slate-300 font-semibold">sem tornar a plataforma injusta ou limitativa</strong> para quem opta por não verificar a conta.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Benefits Tabs */}
            <div className="space-y-3">
              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono text-left">Vantagens de Conta Verificada:</span>
              
              {/* Tabs list */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedBenefitTab('individual')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedBenefitTab === 'individual'
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  ⭐ Conta Individual
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBenefitTab('profissional')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedBenefitTab === 'profissional'
                      ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  💼 Conta Profissional
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBenefitTab('empresa')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedBenefitTab === 'empresa'
                      ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  🏢 Conta Empresa
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBenefitTab('comuns')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedBenefitTab === 'comuns'
                      ? 'bg-amber-600/15 text-amber-400 border border-amber-500/30 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  🛡️ Benefícios Comuns
                </button>
              </div>

              {/* Tab Contents */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-left">
                {selectedBenefitTab === 'individual' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-xs font-black text-blue-400 uppercase tracking-tight">Vantagens Conta Individual</span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 font-mono font-black px-2 py-0.5 rounded border border-blue-500/20">
                        Preço Único: {formatKwanza(1000)}
                      </span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 text-sm mt-0.5">✅</span>
                        <span>Selo <strong>"Conta Verificada"</strong> no perfil.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 text-sm mt-0.5">✅</span>
                        <span><strong>Maior confiança</strong> para compradores e vendedores.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 text-sm mt-0.5">✅</span>
                        <span><strong>Prioridade moderada</strong> nos resultados de pesquisa.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 text-sm mt-0.5">✅</span>
                        <span>Limite de anúncios ativos aumentado de <strong>15 para 40 anúncios ativos</strong> em simultâneo.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 text-sm mt-0.5">✅</span>
                        <span><strong>Menor probabilidade</strong> de os anúncios serem bloqueados por verificações automáticas.</span>
                      </li>
                    </ul>
                  </div>
                )}

                {selectedBenefitTab === 'profissional' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-xs font-black text-purple-400 uppercase tracking-tight">Vantagens Conta Profissional</span>
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 font-mono font-black px-2 py-0.5 rounded border border-purple-500/20">
                        Plano Profissional
                      </span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 text-sm mt-0.5">✅</span>
                        <span className="text-slate-400 italic font-medium">Todas as vantagens da conta individual.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 text-sm mt-0.5">✅</span>
                        <span><strong>Destaque dos anúncios</strong> nas pesquisas.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 text-sm mt-0.5">✅</span>
                        <span><strong>Perfil profissional</strong> com selo de verificação.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 text-sm mt-0.5">✅</span>
                        <span><strong>Estatísticas mais completas</strong> dos anúncios (visualizações, cliques e contactos).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 text-sm mt-0.5">✅</span>
                        <span>Possibilidade de responder <strong>mais rapidamente</strong> a clientes através de ferramentas adicionais.</span>
                      </li>
                    </ul>
                  </div>
                )}

                {selectedBenefitTab === 'empresa' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-tight">Vantagens Conta Empresa</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-black px-2 py-0.5 rounded border border-emerald-500/20">
                        Preço Único: {formatKwanza(5000)}
                      </span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 text-sm mt-0.5">✅</span>
                        <span className="text-slate-400 italic font-medium">Todas as vantagens anteriores (Individual e Profissional).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 text-sm mt-0.5">✅</span>
                        <span>Selo exclusivo de <strong>"Empresa Verificada"</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 text-sm mt-0.5">✅</span>
                        <span><strong>Página da empresa</strong> com maior credibilidade.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 text-sm mt-0.5">✅</span>
                        <span>Publicação de <strong>vagas de emprego com prioridade</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 text-sm mt-0.5">✅</span>
                        <span>Possibilidade de adicionar <strong>logótipo, website, horário e redes sociais</strong> da empresa.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 text-sm mt-0.5">✅</span>
                        <span><strong>Destaque da empresa</strong> nas pesquisas e categorias.</span>
                      </li>
                    </ul>
                  </div>
                )}

                {selectedBenefitTab === 'comuns' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-tight">Benefícios Comuns de Confiança</span>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">Geral</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-2.5">
                      <li className="flex items-start gap-2.5">
                        <span className="text-base shrink-0">🛡️</span>
                        <span><strong>Selo de verificação visível</strong> em todo o aplicativo.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-base shrink-0">🚀</span>
                        <span><strong>Maior visibilidade</strong> dos anúncios.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-base shrink-0">⭐</span>
                        <span><strong>Maior confiança</strong> dos outros utilizadores.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-base shrink-0">📞</span>
                        <span>Acesso <strong>mais rápido ao suporte</strong> ao cliente.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-base shrink-0">🔒</span>
                        <span><strong>Redução do risco de fraude</strong>, pois a identidade foi confirmada.</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields depends on Tab Selection */}
            {activeType === 'individual' ? (
              <div className="space-y-4">
                <div className="space-y-3 pt-1 text-left">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-[#2563EB] font-mono">Ficheiros Obrigatórios (Mínimo de Qualidade):</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* ID FRONT */}
                    <div className="relative border border-dashed border-slate-700 hover:border-[#2563EB] rounded-2xl p-3 text-center bg-slate-950/40 cursor-pointer flex flex-col justify-between h-40 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'front')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title="B.I. Frente"
                      />
                      <div className="space-y-1">
                        <Upload size={14} className="mx-auto text-blue-500" />
                        <span className="text-[9px] font-black block uppercase text-slate-300">1. B.I. Frente</span>
                        <span className="text-[7px] text-slate-500 block truncate">{frontFileName}</span>
                      </div>
                      <img src={idCardFront} className="h-14 w-full object-cover rounded-xl border border-slate-800 shrink-0" alt="Frente" />
                    </div>

                    {/* ID BACK */}
                    <div className="relative border border-dashed border-slate-700 hover:border-[#2563EB] rounded-2xl p-3 text-center bg-slate-950/40 cursor-pointer flex flex-col justify-between h-40 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'back')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title="B.I. Verso"
                      />
                      <div className="space-y-1">
                        <Upload size={14} className="mx-auto text-blue-500" />
                        <span className="text-[9px] font-black block uppercase text-slate-300">2. B.I. Verso</span>
                        <span className="text-[7px] text-slate-500 block truncate">{backFileName}</span>
                      </div>
                      <img src={idCardBack} className="h-14 w-full object-cover rounded-xl border border-slate-800 shrink-0" alt="Verso" />
                    </div>

                    {/* SELFIE */}
                    <div className="relative border border-dashed border-slate-700 hover:border-[#2563EB] rounded-2xl p-3 text-center bg-slate-950/40 cursor-pointer flex flex-col justify-between h-40 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'selfie')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title="Selfie de Confiança"
                      />
                      <div className="space-y-1">
                        <Camera size={14} className="mx-auto text-blue-500" />
                        <span className="text-[9px] font-black block uppercase text-slate-300">3. Selfie Real</span>
                        <span className="text-[7px] text-slate-500 block truncate">{selfieFileName}</span>
                      </div>
                      <img src={selfie} className="h-14 w-full object-cover rounded-xl border border-slate-800 shrink-0" alt="Selfie" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">Número de NIF</label>
                    <input
                      type="text"
                      placeholder="Ex: 5409827391"
                      value={nifValue}
                      onChange={(e) => setNifValue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">Comprovativo de Registro Comercial</label>
                    <span className="text-[9px] text-[#2563EB] block">Apenas fotos ou PDFs nítidos</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* COMMERCIAL CERTIFICATE */}
                  <div className="relative border border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-3 text-center bg-slate-950/40 cursor-pointer flex flex-col justify-between h-40 transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'cert')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      title="Anexar Certidão"
                    />
                    <div className="space-y-1">
                      <FileText size={16} className="mx-auto text-emerald-400" />
                      <span className="text-[9px] font-black block uppercase text-slate-300">1. Certidão Comercial</span>
                      <span className="text-[7px] text-slate-500 block truncate">{certFileName}</span>
                    </div>
                    <img src={certCom} className="h-14 w-full object-cover rounded-xl border border-slate-800 shrink-0" alt="Certidão" />
                  </div>

                  {/* OTHER OPTIONAL DOCS */}
                  <div className="relative border border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-3 text-center bg-slate-950/40 cursor-pointer flex flex-col justify-between h-40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'other')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      title="Anexar Outros Comprovatvos"
                    />
                    <div className="space-y-1">
                      <Upload size={14} className="mx-auto text-emerald-400" />
                      <span className="text-[9px] font-black block uppercase text-slate-300">2. Alvará / Outro (Opcional)</span>
                      <span className="text-[7px] text-slate-500 block truncate">{otherFileName}</span>
                    </div>
                    <img src={otherDoc} className="h-14 w-full object-cover rounded-xl border border-slate-800 shrink-0" alt="Outros" />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-2xl text-[10px] text-red-300 text-left font-sans">
              ⚠️ <strong>AVISO LEGAL:</strong> Todas as informações fornecidas passarão por verificação forense automática. Tentativas de falsificação de Bilhetes de Identidade (B.I.) ou NIFs fictícios resultarão no bloqueamento imediato permanente da conta.
            </div>

            <div className="border-t border-slate-800 pt-4 flex space-x-3 text-xs font-bold">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-1 ${activeType === 'individual' ? 'bg-[#2563EB] hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white py-2.5 rounded-xl text-center cursor-pointer transition-all uppercase tracking-tight`}
              >
                Solicitar Certificação
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
