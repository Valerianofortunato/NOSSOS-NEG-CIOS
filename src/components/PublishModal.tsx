import React, { useState, useEffect, useRef } from 'react';
import { User, Category, ProductCondition, Product } from '../types';
import { INITIAL_CATEGORIES } from '../mockData';
import { X, Image as ImageIcon, UploadCloud, Trash2, Camera, Sparkles } from 'lucide-react';

const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

interface PublishModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (productData: Partial<Product>) => void;
  onNegotiateCommissionSms?: any;
}

export default function PublishModal({ 
  user, 
  isOpen, 
  onClose, 
  onPublish,
  onNegotiateCommissionSms
}: PublishModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('15000');
  const [category, setCategory] = useState('telefones');
  const [condition, setCondition] = useState<ProductCondition>('novo');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [errorInput, setErrorInput] = useState<string | null>(null);

  // Job Specific States (Category: 'empregos')
  const [jobType, setJobType] = useState('Tempo integral');
  const [workMode, setWorkMode] = useState('Presencial');
  const [jobLocation, setJobLocation] = useState('Luanda');
  const [vacanciesCount, setVacanciesCount] = useState('1');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [desirableRequirements, setDesirableRequirements] = useState('');
  const [minEducation, setMinEducation] = useState('Ensino Médio');
  const [minExperience, setMinExperience] = useState('1');
  const [benefits, setBenefits] = useState('');
  const [recruiterContact, setRecruiterContact] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');

  // Simplified job category states per user request
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [recruiterEmail, setRecruiterEmail] = useState(user.email || '');
  const [recruiterPhone, setRecruiterPhone] = useState(user.phone || '');
  const [workSchedule, setWorkSchedule] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEmpresa = user.accountType === 'empresa';
  const isProfissional = user.accountType === 'profissional';
  
  // Limites de fotos
  const maxImages = isEmpresa ? 8 : (isProfissional ? 6 : 4);

  useEffect(() => {
    // Começa sempre sem imagens para permitir carregamento real
    setSelectedImages([]);
    setErrorInput(null);
  }, [category, user]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setErrorInput(null);

    const fileList = Array.from(files) as File[];
    const tempImages: string[] = [];
    let processed = 0;

    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          compressImage(reader.result).then(compressed => {
            tempImages.push(compressed);
            processed++;
            if (processed === fileList.length) {
              const combined = [...selectedImages, ...tempImages];
              if (combined.length > maxImages) {
                setErrorInput(`Limite máximo de ${maxImages} imagens atingido para a conta ${user.accountType.toUpperCase()}.`);
                setSelectedImages(combined.slice(0, maxImages));
              } else {
                setSelectedImages(combined);
              }
            }
          }).catch(err => {
            console.error('Error compressing image:', err);
            tempImages.push(reader.result as string);
            processed++;
            if (processed === fileList.length) {
              const combined = [...selectedImages, ...tempImages];
              if (combined.length > maxImages) {
                setErrorInput(`Limite máximo de ${maxImages} imagens atingido para a conta ${user.accountType.toUpperCase()}.`);
                setSelectedImages(combined.slice(0, maxImages));
              } else {
                setSelectedImages(combined);
              }
            }
          });
        } else {
          processed++;
          if (processed === fileList.length) {
            const combined = [...selectedImages, ...tempImages];
            if (combined.length > maxImages) {
              setErrorInput(`Limite máximo de ${maxImages} imagens atingido para a conta ${user.accountType.toUpperCase()}.`);
              setSelectedImages(combined.slice(0, maxImages));
            } else {
              setSelectedImages(combined);
            }
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages(selectedImages.filter((_, idx) => idx !== indexToRemove));
    setErrorInput(null);
  };

  const handleLoadMockSample = () => {
    // Carrega um par de imagens modelo baseadas na categoria selecionada
    const presets: Record<string, string[]> = {
      telefones: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400'
      ],
      veiculos: [
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=400',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=400'
      ],
      tecnologia: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=400',
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=400'
      ]
    };

    const urls = presets[category] || [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400'
    ];

    setSelectedImages(prev => {
      const combined = [...prev, ...urls];
      return combined.slice(0, maxImages);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput(null);

    const numericPrice = parseFloat(price || '0');
    
    let finalTitle = title;
    let finalDescription = description;

    if (category === 'empregos') {
      if (!jobType.trim()) return setErrorInput('O campo Tipo de vaga é obrigatório.');
      if (!companyName.trim()) return setErrorInput('O campo Nome da empresa é obrigatório.');
      if (!recruiterEmail.trim()) return setErrorInput('O campo E-mail é obrigatório.');
      if (!recruiterPhone.trim()) return setErrorInput('O campo Número de telefone é obrigatório.');
      if (!jobLocation.trim()) return setErrorInput('O campo Localização é obrigatório.');
      if (!workSchedule.trim()) return setErrorInput('O campo Horário ou tempo de trabalho é obrigatório.');
      if (!description.trim()) return setErrorInput('O campo Descrição da vaga é obrigatório.');
      
      finalTitle = jobType; // O Tipo de vaga é o próprio cargo/função (Título do post)
      finalDescription = description;
    } else {
      if (!title.trim()) return setErrorInput('O título é obrigatório.');
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return setErrorInput('Por favor, indique um preço legítimo em Kwanzas.');
      }
      if (selectedImages.length === 0) {
        return setErrorInput(`Indispensável carregar pelo menos 1 foto do produto.`);
      }
    }

    const jobImages = selectedImages.length > 0 ? selectedImages : [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600' // corporate placeholder
    ];

    onPublish({
      title: finalTitle,
      description: finalDescription,
      price: category === 'empregos' ? 0 : numericPrice,
      category,
      condition: category === 'empregos' ? 'novo' : condition,
      images: category === 'empregos' ? jobImages : selectedImages,
      likes: 0,
      likedBy: [],
      comments: [],
      views: 0,
      clicks: 0,
      messagesCount: 0,
      ...(category === 'empregos' && {
        jobType,
        companyName,
        recruiterEmail,
        recruiterPhone,
        location: jobLocation,
        workSchedule,
        jobStatus: 'Aberta'
      })
    });

    setTitle('');
    setDescription('');
    setPrice('15000');
    setCategory('telefones');
    setCondition('novo');
    setSelectedImages([]);
    
    // Reset jobs state
    setJobType('Tempo integral');
    setWorkMode('Presencial');
    setJobLocation('Luanda');
    setVacanciesCount('1');
    setResponsibilities('');
    setRequirements('');
    setDesirableRequirements('');
    setMinEducation('Ensino Médio');
    setMinExperience('1');
    setBenefits('');
    setRecruiterContact('');
    setApplicationDeadline('');
    setCompanyName(user.companyName || '');
    setRecruiterEmail(user.email || '');
    setRecruiterPhone(user.phone || '');
    setWorkSchedule('');

    onClose();

    alert(category === 'empregos' 
      ? `Sucesso! A vaga de emprego "${finalTitle}" foi publicada com sucesso no sistema de recrutamento.` 
      : `Sucesso! O anúncio "${title}" foi publicado com sucesso no marketplace.`
    );
  };

  return (
    <div id="publish-modal" className="fixed inset-0 bg-[#0F172A]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1E293B] rounded-3xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl border border-slate-705 animate-in fade-in zoom-in-95 duration-200 text-white">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-sans font-black text-white text-sm uppercase tracking-tight">Criar Novo Anúncio Profissional</h3>
              <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/25 px-1.5 py-0.2 rounded font-mono font-bold uppercase shrink-0">
                {user.accountType}
              </span>
            </div>
            <p className="text-[10px] text-slate-450 mt-0.5">Anuncie produtos ou serviços em Angola diretamente para compradores interessados</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorInput && (
            <p className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs border border-red-500/20 font-semibold text-left">{errorInput}</p>
          )}

          {category === 'empregos' ? (
            /* ================= EMPREGOS CATEGORY FORM ================= */
            <div className="space-y-4 text-left animate-in fade-in duration-300 font-sans">
              <div className="bg-blue-600/10 border border-blue-500/25 p-3.5 rounded-2xl text-[11px] text-blue-400 font-bold mb-1 flex items-center gap-2">
                <span className="p-1 bg-blue-500/15 rounded text-[10px] uppercase font-mono tracking-wider font-extrabold text-blue-300">Empregos</span>
                <span>Preencha os campos abaixo para publicar a sua vaga de emprego no recrutamento profissional.</span>
              </div>

              {/* Categoria Geral */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Categoria do Anúncio</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-blue-400 focus:outline-none focus:border-blue-500 font-bold"
                >
                  {INITIAL_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Nome da Empresa */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Nome da Empresa</label>
                <input
                  type="text"
                  placeholder="Ex: WebTech Angola, Lda"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                  required
                />
              </div>

              {/* Tipo de Vaga */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Tipo de Vaga (Cargo ou Função)</label>
                <input
                  type="text"
                  placeholder="Ex: Recepcionista, Motorista, Técnico de Contabilidade, Programador React"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* E-mail */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">E-mail</label>
                  <input
                    type="email"
                    placeholder="Ex: recrutamento@empresa.ao"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                    required
                  />
                </div>

                {/* Número de Telefone */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Número de Telefone</label>
                  <input
                    type="tel"
                    placeholder="Ex: 924567890"
                    value={recruiterPhone}
                    onChange={(e) => setRecruiterPhone(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                    required
                  />
                </div>
              </div>

              {/* Localização */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Localização</label>
                <input
                  type="text"
                  placeholder="Ex: Luanda, Talatona (Condomínio Dolce Vita)"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                  required
                />
              </div>

              {/* Horário ou Tempo de Trabalho */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Horário ou Tempo de Trabalho</label>
                <input
                  type="text"
                  placeholder="Ex: Segunda a Sexta, das 8h às 17h (40 horas/semana)"
                  value={workSchedule}
                  onChange={(e) => setWorkSchedule(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                  required
                />
              </div>

              {/* Descrição da vaga */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Descrição da Vaga</label>
                <textarea
                  placeholder="Descreva de forma pormenorizada os requisitos da função, qualificações necessárias e principais tarefas associadas à vaga de emprego..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Title / Cargo */}
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Título do Artigo ou Serviço</label>
                <input
                  type="text"
                  placeholder="Ex: iPhone 15 Pro Max 256GB Selado com Garantia"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={70}
                  className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Descrição do Anúncio</label>
                <textarea
                  placeholder="Descreva as especificações do artigo, condições estéticas, formas de pagamento aceites e possíveis locais de encontro público..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
                  required
                />
              </div>

              {/* Grid for Price, Category, State/Job Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Preço de Venda (Kz)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Categoria Geral</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-blue-400 focus:outline-none focus:border-blue-500 font-bold"
                  >
                    {INITIAL_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Estado Físico</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ProductCondition)}
                    className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="novo">Novo (Selado)</option>
                    <option value="como_novo">Como Novo</option>
                    <option value="usado">Usado</option>
                  </select>
                </div>
              </div>

              {/* Photo upload zone */}
              <div className="space-y-3.5 text-left border-t border-slate-800 pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                  <label className="block text-[10.5px] font-sans font-black uppercase tracking-wide text-slate-300">
                    📁 Fotos Reais do Artigo
                  </label>
                  
                  <div className="text-[9px] bg-slate-900 border border-slate-800 text-slate-350 px-2 py-0.5 rounded-md font-mono">
                    Limite para o vosso plano: <strong className="text-white">{maxImages} fotos max</strong> (Selecionado: {selectedImages.length})
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Upload zone */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#0F172A] hover:bg-slate-900 border-2 border-dashed border-slate-700 hover:border-blue-500/60 p-5 rounded-2xl text-center space-y-2 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px]"
                  >
                    <UploadCloud size={24} className="text-blue-500" />
                    <div>
                      <p className="text-[11px] font-bold text-white font-sans">
                        Carregar fotos locais
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                        Ficheiros PNG, JPG (Max {maxImages})
                      </p>
                    </div>
                    <input 
                      type="file"
                      multiple
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden" 
                    />
                  </div>

                  {/* Simulated Generator fallback option */}
                  <div 
                    onClick={handleLoadMockSample}
                    className="bg-[#0F172A] hover:bg-slate-900 border-2 border-dashed border-slate-700 hover:border-amber-500/60 p-5 rounded-2xl text-center space-y-2 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px]"
                  >
                    <Camera size={24} className="text-amber-500" />
                    <div>
                      <p className="text-[11px] font-bold text-white font-sans">
                        Carregar fotos demonstrativas
                      </p>
                      <p className="text-[9px] text-slate-500 font-sans mt-0.5">
                        Auto-preencher fotos ilustrativas da categoria
                      </p>
                    </div>
                  </div>
                </div>

                {/* Displaying selected list */}
                {selectedImages.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-slate-850">
                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Galeria de Ficheiros ({selectedImages.length})</span>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-850">
                      {selectedImages.map((img, idx) => (
                        <div key={idx} className="aspect-square bg-slate-900 border border-slate-850 rounded-xl overflow-hidden relative group">
                          <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute -top-1 -right-1 bg-red-650 p-1 rounded-full text-white cursor-pointer hover:bg-red-700 transition-all shadow"
                          >
                            <Trash2 size={9} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Pay Advisory box */}
              <div className="bg-blue-600/10 border border-blue-500/20 p-3 rounded-2xl text-[10px] text-slate-350 text-left leading-relaxed">
                💡 <strong>Dica de Publicidade Profissional:</strong> Depois de submetido o anúncio, poderá impulsionar as suas visualizações no feed ativando os pacotes de realce <strong>Básico, Plus, Premium ou VIP</strong> no painel inicial.
              </div>
            </div>
          )}

          <div className="border-t border-slate-800 pt-4 flex space-x-3 text-xs font-bold">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-755 py-2.5 rounded-xl transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-center cursor-pointer transition-all uppercase tracking-tight"
            >
              {category === 'empregos' ? 'Publicar Vaga 💼' : 'Publicar Anúncio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
