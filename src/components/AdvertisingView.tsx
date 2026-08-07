import React, { useState } from 'react';
import { User, AdCampaign, Category } from '../types';
import { formatKwanza } from '../utils';
import { 
  Megaphone, 
  Check, 
  DollarSign, 
  Flame, 
  Target, 
  Tv, 
  Award, 
  Sparkles, 
  Building, 
  Phone, 
  Mail, 
  Image as ImageIcon, 
  Calendar, 
  Globe, 
  ArrowLeft,
  ChevronRight,
  MapPin,
  Users,
  ShieldCheck,
  Tag,
  Upload,
  Trash2
} from 'lucide-react';

interface AdvertisingViewProps {
  currentUser: User | null;
  categories: Category[];
  onCreateCampaign: (campaign: Omit<AdCampaign, 'id' | 'status' | 'createdAt'>) => void;
  onBackToMarket: () => void;
  platformBankName?: string;
  platformBeneficiary?: string;
  platformIban?: string;
}

export default function AdvertisingView({
  currentUser,
  categories,
  onCreateCampaign,
  onBackToMarket,
  platformBankName = 'BFA (Banco de Fomento Angola)',
  platformBeneficiary = 'Nossos Negócios, Lda',
  platformIban = 'AO06 0006 0000 8877 6655 4411 0'
}: AdvertisingViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<'inicial' | 'categoria' | 'premium' | null>(null);
  
  // Form fields
  const [companyName, setCompanyName] = useState(currentUser?.companyName || currentUser?.name || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [targetCategory, setTargetCategory] = useState('all_tech');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [bankName, setBankName] = useState('BAI');
  const [txId, setTxId] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Prices list
  const prices = {
    inicial: 25000,
    categoria: 50000,
    premium: 75000
  };

  const handlePlanSelect = (plan: 'inicial' | 'categoria' | 'premium') => {
    setSelectedPlan(plan);
    setFormSuccess(false);
    // Autofill defaults if empty
    if (!companyName && currentUser) {
      setCompanyName(currentUser.companyName || currentUser.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    if (!companyName.trim() || !contactPhone.trim() || !email.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios (Nome, Contacto e Email).');
      return;
    }

    if (!txId.trim()) {
      alert('Por favor, introduza o ID de Transação para confirmar o seu pagamento.');
      return;
    }

    const price = prices[selectedPlan] * durationMonths;

    // Inform the user about the banks payment confirmation flow
    alert(
      `O seu pedido de publicidade no valor de ${formatKwanza(price)} para ${durationMonths} mês(es) foi registado.\n` +
      `A transacção com ID: ${txId} para o banco ${bankName} será validada e ativada manualmente pelo administrador após confirmar o crédito na conta bancária correspondente.`
    );

    setIsSubmitting(true);
    
    // Simulate slight lag for server compliance
    setTimeout(() => {
      onCreateCampaign({
        companyName,
        contactPhone,
        bannerType: selectedPlan,
        targetCategory: selectedPlan === 'categoria' ? targetCategory : undefined,
        imageUrl: bannerUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
        linkUrl: logoUrl.trim() || 'https://nossosnegocios.co.ao',
        price,
        durationMonths,
        bankName,
        txId: txId.trim(),
        proofImage: proofImage || undefined
      });

      setIsSubmitting(false);
      setFormSuccess(true);
      
      // Reset form selection after delay
      setTimeout(() => {
        onBackToMarket();
      }, 3500);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1 sm:px-0 animate-in fade-in duration-300">
      
      {/* HEADER ROW */}
      <div className="bg-[#121212] border border-neutral-805 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded-full font-mono font-black uppercase tracking-widest block w-max">
              CENTRAL DE PUBLICIDADE CORP Lda
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Megaphone className="text-amber-500 animate-pulse" size={24} />
              <span>Promover Negócio & Campanhas</span>
            </h2>
            <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
              Compre espaços publicitários oficiais dentro do NOSSOS NEGÓCIOS. Aumente o alcance, fidelize portfólios corporativos e direcione cliques para o seu produto em Angola.
            </p>
          </div>
          
          <button
            onClick={onBackToMarket}
            className="bg-neutral-900 border border-neutral-805 hover:bg-neutral-850 text-gray-300 hover:text-white font-extrabold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft size={14} />
            <span>Voltar ao Feed</span>
          </button>
        </div>
      </div>

      {/* WHY ADVERTISE SECTION */}
      <div className="bg-[#121212] border border-neutral-805 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 space-y-6 text-left">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="text-amber-500" size={16} />
            Como anunciar no NOSSOS NEGÓCIOS?
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Segurança operacional com máxima notoriedade institucional.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-neutral-950 p-4.5 rounded-2xl border border-neutral-850 space-y-2.5 hover:border-neutral-700 transition-all group">
            <div className="h-9 w-9 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center border border-amber-500/25 group-hover:scale-105 transition-transform">
              <Users size={16} />
            </div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-tight">Milhares de parceiros</h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">
              Ligação direta a investidores, fornecedores e clientes ativos que compram e fazem negócios comerciais diariamente.
            </p>
          </div>

          <div className="bg-neutral-950 p-4.5 rounded-2xl border border-neutral-850 space-y-2.5 hover:border-neutral-700 transition-all group">
            <div className="h-9 w-9 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/25 group-hover:scale-105 transition-transform">
              <Globe size={16} />
            </div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-tight">Visibilidade Nacional</h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">
              Alcance em todas as províncias do país, com destaque acentuado em capitais de elevado comércio e investimento de Angola.
            </p>
          </div>

          <div className="bg-neutral-950 p-4.5 rounded-2xl border border-neutral-850 space-y-2.5 hover:border-neutral-700 transition-all group">
            <div className="h-9 w-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/25 group-hover:scale-105 transition-transform">
              <ShieldCheck size={16} />
            </div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-tight">Anunciantes Verificados</h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">
              Um ecossistema livre de perfis fakes. Os seus banners serão integrados ao lado de negócios idóneos e auditados por KYC legal.
            </p>
          </div>

          <div className="bg-neutral-950 p-4.5 rounded-2xl border border-neutral-850 space-y-2.5 hover:border-neutral-700 transition-all group">
            <div className="h-9 w-9 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/25 group-hover:scale-105 transition-transform">
              <Tag size={16} />
            </div>
            <h4 className="font-extrabold text-white text-xs uppercase tracking-tight">Público Segmentado</h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">
              Direccione as campanhas exatamente para os interessados que filtram verticais comerciais específicas.
            </p>
          </div>
        </div>
      </div>

      {/* ADVERTISING PRICING PLANS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        
        {/* PLAN 1 */}
        <div className={`price-card bg-[#121212] border rounded-2xl md:rounded-3xl p-4 sm:p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
          selectedPlan === 'inicial' ? 'border-amber-500 ring-2 ring-amber-500/20 scale-102 bg-amber-950/5' : 'border-neutral-805 hover:border-neutral-700'
        }`}>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="bg-neutral-900 border border-neutral-800 text-slate-350 p-2.5 rounded-2xl shrink-0">
                <Tv size={16} />
              </div>
              <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider bg-slate-800 px-2 py-0.5 rounded font-mono">Básico</span>
            </div>
            <div>
              <h4 className="text-white font-extrabold text-base">Banner Inicial</h4>
              <p className="text-[10.5px] text-gray-400 mt-1 leading-relaxed">
                Excelente para obter visibilidade rotativa ao longo de todo o feed de Angola.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">Custo Mensal</span>
              <div className="text-lg font-black font-mono text-amber-500 mt-0.5">{formatKwanza(prices.inicial)} <span className="text-xs text-slate-400">/ mês</span></div>
            </div>
            
            <ul className="text-[10.5px] space-y-2 text-slate-350 font-sans pt-2">
              <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-500 shrink-0" /> Aparece na página inicial rotativamente</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-500 shrink-0" /> Visível para todos os utilizadores</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-500 shrink-0" /> Ideal para reconhecimento de marca</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => handlePlanSelect('inicial')}
            className={`w-full font-black text-xs py-2.5 px-4 rounded-xl mt-6 uppercase cursor-pointer tracking-wider transition-all ${
              selectedPlan === 'inicial' 
                ? 'bg-amber-500 text-neutral-950' 
                : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800'
            }`}
          >
            Comprar Banner
          </button>
        </div>

        {/* PLAN 2 */}
        <div className={`price-card bg-[#121212] border rounded-2xl md:rounded-3xl p-4 sm:p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
          selectedPlan === 'categoria' ? 'border-amber-500 ring-2 ring-amber-500/20 scale-102 bg-amber-950/5' : 'border-neutral-805 hover:border-neutral-700'
        }`}>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="bg-neutral-900 border border-neutral-800 text-[#D4AF37] p-2.5 rounded-2xl shrink-0">
                <Target size={16} />
              </div>
              <span className="text-[8.5px] font-black uppercase text-amber-500 tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">Focado</span>
            </div>
            <div>
              <h4 className="text-white font-extrabold text-base">Categoria Patrocinada</h4>
              <p className="text-[10.5px] text-gray-400 mt-1 leading-relaxed">
                Notoriedade segmentada de alta conversão. Ideal para direcionar investidores para verticais específicas.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">Custo Mensal</span>
              <div className="text-lg font-black font-mono text-amber-500 mt-0.5">{formatKwanza(prices.categoria)} <span className="text-xs text-slate-400">/ mês</span></div>
            </div>

            <ul className="text-[10.5px] space-y-2 text-slate-350 font-sans pt-2">
              <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-500 shrink-0" /> Empresa destacada numa categoria</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-500 shrink-0" /> Aparece acima de anúncios normais</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-500 shrink-0" /> Excelente para Tecnologia / Imóveis / Carros</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => handlePlanSelect('categoria')}
            className={`w-full font-black text-xs py-2.5 px-4 rounded-xl mt-6 uppercase cursor-pointer tracking-wider transition-all ${
              selectedPlan === 'categoria' 
                ? 'bg-amber-500 text-neutral-950' 
                : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800'
            }`}
          >
            Patrocinar Categoria
          </button>
        </div>

        {/* PLAN 3 */}
        <div className={`price-card bg-[#121212] border rounded-2xl md:rounded-3xl p-4 sm:p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
          selectedPlan === 'premium' ? 'border-amber-500 ring-2 ring-amber-500/20 scale-102 bg-amber-950/5' : 'border-neutral-805 hover:border-neutral-700'
        }`}>
          <div className="absolute top-0 right-0 w-[80px] h-[85px] bg-[#D4AF37]/20 rounded-full blur-[30px]" />
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="bg-amber-500/10 border border-amber-500/25 text-[#D4AF37] p-2.5 rounded-2xl shrink-0 animate-pulse">
                <Flame size={16} />
              </div>
              <span className="text-[8.5px] font-black uppercase text-amber-400 tracking-wider bg-amber-500/20 border border-amber-500/35 px-2.5 py-0.5 rounded font-mono">Destaque Máximo</span>
            </div>
            <div>
              <h4 className="text-white font-extrabold text-base">Banner Premium Principal</h4>
              <p className="text-[10.5px] text-gray-400 mt-1 leading-relaxed">
                Prioridade visual total. O seu negócio na cabeceira principal do marketplace, captando toda a audiência diária.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">Custo Mensal</span>
              <div className="text-lg font-black font-mono text-amber-500 mt-0.5">{formatKwanza(prices.premium)} <span className="text-xs text-slate-400">/ mês</span></div>
            </div>

            <ul className="text-[10.5px] space-y-2 text-slate-350 font-sans pt-2">
              <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-500 shrink-0" /> Destaque máximo na cabeceira principal</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-500 shrink-0" /> Visibilidade direta e imediata</li>
              <li className="flex items-center gap-1.5"><Check size={11} className="text-emerald-500 shrink-0" /> Prioridade total de visualizações</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => handlePlanSelect('premium')}
            className={`w-full font-black text-xs py-2.5 px-4 rounded-xl mt-6 uppercase cursor-pointer tracking-wider transition-all ${
              selectedPlan === 'premium' 
                ? 'bg-amber-500 text-neutral-950' 
                : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800'
            }`}
          >
            Comprar Destaque Premium
          </button>
        </div>

      </div>

      {/* SUBMISSION FORM OR SUCCESS FEEDBACK */}
      {selectedPlan && (
        <div className="bg-[#121212] border-t-2 border-amber-500 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 text-left space-y-6">
          {formSuccess ? (
            <div className="text-center py-12 space-y-3.5 animate-in zoom-in-95 duration-200">
              <div className="h-14 w-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/25">
                <ShieldCheck size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-white uppercase tracking-wider">Proposta de Campanha Submetida!</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  A sua solicitação foi registada com sucesso no sistema. A proposta será analisada e ativada pelo administrador após a validação do comprovativo bancário enviado.
                </p>
                <div className="inline-block bg-slate-900 border border-slate-800 text-slate-500 font-mono text-[9px] px-3 py-1 rounded mt-4">
                  A redirecionar de volta para o início...
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-neutral-850 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="font-extrabold text-[#D4AF37] text-xs uppercase tracking-wider">
                    Formulário de Publicidade • Plano selecionado:{' '}
                    <span className="text-white uppercase">
                      {selectedPlan === 'inicial' 
                        ? 'Banner Inicial' 
                        : selectedPlan === 'categoria' 
                        ? 'Categoria Patrocinada' 
                        : 'Banner Premium'
                      }
                    </span>
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Preencha as informações da campanha publicitária do seu negócio.</p>
                </div>
                
                <span className="text-xs font-black font-mono text-amber-500 bg-amber-500/5 px-3 py-1 rounded border border-amber-500/15">
                  Preço Total: {formatKwanza(prices[selectedPlan] * durationMonths)} (por {durationMonths} mês/es)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Nome da Empresa *</label>
                  <div className="relative">
                    <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Movicel Angola Limitada"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 pl-10 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Contacto do Negócio *</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Ex: +244 911000111"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 pl-10 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Email do Negócio *</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="marketing@empresa.ao"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 pl-10 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Logótipo / Link do Negócio (Website ou link directo)</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Ex: https://www.meunegocio.ao"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 pl-10 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Imagem / Banner de Anúncio *</label>
                  <div className="flex flex-col gap-2">
                    <input 
                      type="file"
                      accept="image/*"
                      id="ad-banner-upload-input"
                      required={!bannerUrl}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setBannerUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <label 
                        htmlFor="ad-banner-upload-input"
                        className={`flex-grow border border-dashed rounded-xl p-3 text-center text-xs font-bold font-sans cursor-pointer transition-all flex items-center justify-center gap-2 ${
                          bannerUrl 
                            ? 'border-emerald-500 bg-emerald-950/10 text-emerald-400' 
                            : 'border-neutral-800 hover:border-amber-500 text-zinc-400'
                        }`}
                      >
                        <Upload size={14} />
                        <span>{bannerUrl ? '✓ Imagem Carregada' : 'Clique para Carregar a Imagem do Anúncio'}</span>
                      </label>

                      {bannerUrl && (
                        <button
                          type="button"
                          onClick={() => setBannerUrl('')}
                          className="bg-red-600/20 hover:bg-red-650/30 text-red-400 border border-red-500/10 font-bold px-3 rounded-xl text-[10px] uppercase cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 size={12} />
                          Remover
                        </button>
                      )}
                    </div>
                    
                    {bannerUrl && (
                      <div className="flex flex-col items-center justify-center border border-neutral-800 p-2.5 rounded-xl bg-neutral-950/80">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 font-mono mb-1.5">Visualização Prévia do Banner:</span>
                        <div className="rounded-lg overflow-hidden border border-slate-800 max-h-40 w-full flex items-center justify-center bg-slate-950">
                          <img 
                            src={bannerUrl} 
                            alt="Visualização do Banner" 
                            className="object-contain max-h-36 w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedPlan === 'categoria' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Categoria Patrocinada Desejada</label>
                    <div className="relative">
                      <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <select
                        value={targetCategory}
                        onChange={(e) => setTargetCategory(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 pl-10 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-sans"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Duração da Campanha (Mêses)</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <select
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 pl-10 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-sans"
                    >
                      <option value={1}>1 Mês de Exposição</option>
                      <option value={2}>2 Mêses de Exposição</option>
                      <option value={3}>3 Mêses de Exposição</option>
                      <option value={6}>6 Mêses de Exposição</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* COORDENADAS BANCÁRIAS DA PLATAFORMA */}
              <div className="bg-[#1C1C1E]/50 border border-neutral-805/60 p-4 sm:p-5 rounded-2xl space-y-3 shadow-md text-left">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="h-5 w-5 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center text-xs">🏦</span>
                  <h5 className="font-extrabold text-white text-xs uppercase tracking-wider">Coordenadas Bancárias da Plataforma</h5>
                </div>
                <p className="text-[10px] text-gray-400">
                  Transfira o valor total de <span className="text-amber-500 font-bold">{formatKwanza(prices[selectedPlan] * durationMonths)}</span> correspondente à publicidade de <span className="text-white font-bold">{durationMonths} {durationMonths === 1 ? 'mês' : 'meses'}</span> para uma das nossas contas oficiais descritas abaixo:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed text-slate-355">
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 space-y-1 text-left">
                    <span className="text-[8.5px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-black font-mono">{platformBankName} (Principal)</span>
                    <p className="font-black text-white text-xs tracking-wider font-mono">{platformIban}</p>
                    <p className="text-[9.5px] text-slate-500">Beneficiário: {platformBeneficiary}</p>
                  </div>
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 space-y-1 text-left">
                    <span className="text-[8.5px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-black font-mono">BAI (Banco Angolano de Investimentos)</span>
                    <p className="font-black text-white text-xs tracking-wider font-mono">AO06 0040 0000 1122 3344 5511 2</p>
                    <p className="text-[9.5px] text-slate-500">Beneficiário: {platformBeneficiary}</p>
                  </div>
                </div>
              </div>

              {/* ID DE TRANSAÇÃO DO BANCO */}
              <div className="bg-slate-900/40 border border-slate-805 p-4 sm:p-5 rounded-2xl space-y-4 text-left">
                <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold block">CONFIRMAR PAGAMENTO</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Selecione o seu Banco de Origem *</label>
                    <div className="relative">
                      <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-3 pl-10 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-sans"
                      >
                        <option value="BAI">BAI (Banco Angolano de Investimentos)</option>
                        <option value="BFA">BFA (Banco de Fomento Angola)</option>
                        <option value="BIC">BIC (Banco BIC)</option>
                        <option value="SOL">Banco Sol</option>
                        <option value="Outro">Outro Banco</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Nº de Comprovativo / ID de Transação *</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        placeholder="Ex: TXN-381044-ANG"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-3 pl-10 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Comprovativo Físico Upload */}
                <div className="space-y-2 pt-1 border-t border-slate-800/50">
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#D4AF37] font-mono">Comprovativo de Pagamento (Opcional - Ajuda a acelerar)</label>
                  <div className="flex flex-col gap-2">
                    <input 
                      type="file"
                      accept="image/*"
                      id="ad-proof-upload-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProofImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <label 
                        htmlFor="ad-proof-upload-input"
                        className={`flex-grow border border-dashed rounded-xl p-3 text-center text-xs font-bold font-sans cursor-pointer transition-all flex items-center justify-center gap-2 ${
                          proofImage 
                            ? 'border-emerald-500 bg-emerald-950/10 text-emerald-400' 
                            : 'border-neutral-800 hover:border-[#D4AF37] text-zinc-400'
                        }`}
                      >
                        <Upload size={13} />
                        <span>{proofImage ? '✓ Comprovativo Carregado' : 'Carregar Imagem do Comprovativo / Talão de Transferência'}</span>
                      </label>

                      {proofImage && (
                        <button
                          type="button"
                          onClick={() => setProofImage('')}
                          className="bg-red-650 hover:bg-red-750 text-white font-extrabold px-3 rounded-xl text-[10px] uppercase cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 size={12} />
                          Remover
                        </button>
                      )}
                    </div>
                    
                    {proofImage && (
                      <div className="flex justify-center border border-neutral-800 p-2 rounded-xl bg-neutral-950 max-h-40 overflow-hidden">
                        <img 
                          src={proofImage} 
                          alt="Comprovativo de Publicidade" 
                          className="object-contain max-h-36 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-slate-350 hover:text-white font-extrabold text-[10.5px] px-4 py-2.5 rounded-xl uppercase tracking-wide cursor-pointer transition-all"
                >
                  Cancelar Seleção
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-600 font-extrabold text-[10.5px] px-6 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer text-[#0F172A] transition-all relative flex items-center justify-center min-w-[200px]"
                >
                  {isSubmitting ? 'A processar faturas...' : 'Confirmar e Comprar Espaço'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

    </div>
  );
}
