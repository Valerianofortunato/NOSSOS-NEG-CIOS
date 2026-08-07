import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Upload, 
  AlertCircle, 
  Building2, 
  Clock, 
  Calendar, 
  Phone, 
  User, 
  CheckCircle2, 
  Info,
  CreditCard,
  FileText,
  Smartphone
} from 'lucide-react';
import { PaymentService, PaymentOrder } from '../services/PaymentService';
import { formatKwanza } from '../utils';

interface ManualPaymentViewProps {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  
  // What is being purchased
  itemType: 'subscription' | 'promotion' | 'ad_campaign';
  itemId: string; // e.g. 'plus', 'vip', 'premium', 'profissional-mensal' etc.
  itemName: string; // Human name
  amount: number;
  targetId?: string; // product/ad ID being boosted
  
  onClose: () => void;
  onPaymentSubmitted: (newOrder: PaymentOrder) => void;
  platformIban?: string;
}

export const ManualPaymentView: React.FC<ManualPaymentViewProps> = ({
  userId,
  userName,
  userEmail,
  userPhone,
  itemType,
  itemId,
  itemName,
  amount,
  targetId,
  onClose,
  onPaymentSubmitted,
  platformIban = 'AO06.0006.0049.2019.4810.1897.6'
}) => {
  const companyName = 'Nossos Negócios, Lda';
  const companyBank = 'BAI (Banco Angolano de Investimentos)';
  const accountHolder = 'Nossos Negócios, Lda';
  const accountNumber = '492019481 / 10 / 001';
  
  // State variables
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('transfer_bancaria');
  const [showConfirmForm, setShowConfirmForm] = useState<boolean>(false);
  
  // Form state
  const [holderName, setHolderName] = useState<string>(userName);
  const [phoneNumber, setPhoneNumber] = useState<string>(userPhone);
  const [originBank, setOriginBank] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentTime, setPaymentTime] = useState<string>('');
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofFileType, setProofFileType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Available payment methods
  const paymentMethods = PaymentService.getPaymentMethods();

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: 10MB max
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('Erro: O tamanho máximo do comprovativo é de 10 MB.');
      return;
    }

    // Validation: Allowed formats
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Erro: Apenas são permitidos comprovativos nos formatos PDF, JPG, JPEG ou PNG.');
      return;
    }

    setProofFileName(file.name);
    setProofFileType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProofFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    if (!holderName.trim()) {
      validationErrors.push('O Nome do titular da conta de origem é obrigatório.');
    }
    if (!phoneNumber.trim()) {
      validationErrors.push('O Número de telefone de contacto é obrigatório.');
    }
    if (!txId.trim()) {
      validationErrors.push('O ID da Transação do comprovativo é obrigatório.');
    }
    if (!paymentDate) {
      validationErrors.push('A Data do pagamento é obrigatória.');
    }
    if (!proofFile) {
      validationErrors.push('É obrigatório anexar o ficheiro ou imagem do Comprovativo bancário.');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsSubmitting(true);

    try {
      // Get human readable payment method name
      const methodObj = paymentMethods.find(m => m.id === selectedMethod);
      const methodName = methodObj ? methodObj.name : 'Transferência Bancária';

      // Create Order
      const newOrder = PaymentService.createOrder({
        userId,
        userName,
        userEmail,
        userPhone,
        itemType,
        itemId,
        itemName,
        targetId,
        amount,
        paymentMethod: methodName,
        paymentBank: companyBank,
        originBank: originBank || undefined,
        txId: txId.trim().toUpperCase(),
        holderName: holderName.trim(),
        paymentDate,
        paymentTime: paymentTime || undefined,
        proofImage: proofFile,
        notes: notes.trim() || undefined
      });

      // Callback
      onPaymentSubmitted(newOrder);
    } catch (err: any) {
      setErrors([err.message || 'Ocorreu um erro ao submeter o comprovativo de pagamento.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Human reference code suggestion
  const referenceDesc = `${itemType.toUpperCase().substring(0, 4)}-${userId.substring(0, 5).toUpperCase()}-${itemId.toUpperCase().substring(0, 4)}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-[#0c0c0e] border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-250">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-neutral-850 p-5 sticky top-0 bg-[#0c0c0e]/95 backdrop-blur-sm z-10">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 bg-gradient-to-br from-amber-400 to-[#D4AF37] rounded-xl flex items-center justify-center font-black text-black text-sm tracking-tight shadow-md">
              NN
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Sessão Segura de Pagamento</h3>
              <p className="text-[10px] text-zinc-500 font-mono">Central Geral de Intermediação de Negócios</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-[10px] font-bold uppercase tracking-wide cursor-pointer px-2.5 py-1"
          >
            Fechar
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Plan Info Card */}
          <div className="bg-gradient-to-r from-neutral-950 to-neutral-900 border border-neutral-800 rounded-xl p-4.5 flex justify-between items-center shadow-inner">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#D4AF37] font-mono block">Item / Plano Selecionado</span>
              <span className="text-sm font-black text-white">{itemName}</span>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 font-mono block">Valor Exato</span>
              <span className="text-base font-black font-mono text-[#D4AF37]">{formatKwanza(amount)}</span>
            </div>
          </div>

          {!showConfirmForm ? (
            /* STEP 1: Bank Coordinates & Instructions */
            <div className="space-y-6">
              
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">1. Selecionar Método de Pagamento</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedMethod === method.id 
                          ? 'bg-amber-500/5 border-[#D4AF37] text-white' 
                          : 'bg-neutral-950 border-neutral-850 hover:border-neutral-700 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${selectedMethod === method.id ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-neutral-900 text-zinc-500'}`}>
                          {method.id === 'transfer_bancaria' ? <Building2 size={15} /> : <Smartphone size={15} />}
                        </div>
                        <div>
                          <span className="text-xs font-bold block">{method.name}</span>
                          <span className="text-[8.5px] text-zinc-500 block">{method.description}</span>
                        </div>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        selectedMethod === method.id 
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-black' 
                          : 'border-neutral-800'
                      }`}>
                        {selectedMethod === method.id && <CheckCircle2 size={12} className="text-black fill-current" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Coordinates Card */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">2. Efetuar Pagamento Manual</h4>
                <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-850 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 bg-amber-500/10 rounded flex items-center justify-center text-[#D4AF37]">
                        <Building2 size={13} />
                      </div>
                      <span className="text-xs font-extrabold text-white uppercase">{companyBank}</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">Conta Principal da Empresa</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <div className="bg-[#0c0c0e] p-2.5 rounded-lg border border-neutral-850">
                      <span className="text-[8px] text-zinc-500 block uppercase font-mono tracking-wider">Beneficiário / Titular</span>
                      <span className="text-white text-[10.5px] font-bold block mt-0.5">{accountHolder}</span>
                    </div>

                    <div className="bg-[#0c0c0e] p-2.5 rounded-lg border border-neutral-850 relative group">
                      <span className="text-[8px] text-zinc-500 block uppercase font-mono tracking-wider">Número de Conta</span>
                      <div className="flex justify-between items-center mt-0.5">
                        <span className="text-white text-[10.5px] font-mono font-bold">{accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(accountNumber, 'acc')}
                          className="text-zinc-500 hover:text-[#D4AF37] p-1 transition-colors cursor-pointer"
                          title="Copiar Número de Conta"
                        >
                          {copiedField === 'acc' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0c0c0e] p-3 rounded-lg border border-neutral-850 sm:col-span-2 relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] text-zinc-500 uppercase font-mono tracking-wider block">Coordenada IBAN Principal</span>
                        <span className="text-[7.5px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded uppercase font-bold">Obrigatório p/ Copiar</span>
                      </div>
                      <div className="flex justify-between items-center bg-black p-2 rounded border border-neutral-900">
                        <span className="text-white text-[11px] font-mono tracking-widest font-bold select-all">{platformIban}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(platformIban, 'iban')}
                          className="bg-neutral-900 hover:bg-neutral-850 text-[#D4AF37] hover:text-white p-1.5 rounded border border-neutral-800 transition-colors flex items-center space-x-1 cursor-pointer text-[9px] font-bold uppercase tracking-wider pl-2 pr-2"
                        >
                          {copiedField === 'iban' ? (
                            <>
                              <Check size={11} className="text-emerald-400" />
                              <span className="text-emerald-400 text-[8.5px]">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copiar IBAN</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0c0c0e] p-2.5 rounded-lg border border-neutral-850 sm:col-span-2">
                      <span className="text-[8px] text-[#D4AF37] block uppercase font-mono tracking-wider">Descrição / Referência Obrigatória do Depósito</span>
                      <div className="flex justify-between items-center bg-[#D4AF37]/5 border border-amber-500/10 p-2 rounded mt-1">
                        <span className="text-white text-[10.5px] font-mono font-black">{referenceDesc}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(referenceDesc, 'ref')}
                          className="text-zinc-500 hover:text-[#D4AF37] p-1 transition-colors cursor-pointer"
                          title="Copiar Referência"
                        >
                          {copiedField === 'ref' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <span className="text-[8px] text-zinc-500 block mt-1 font-sans italic">
                        ⚠️ ATENÇÃO: Digite exatamente a referência acima no campo descritivo da sua transferência para acelerar a nossa conciliação bancária.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Warning */}
              <div className="bg-amber-950/10 border border-amber-500/20 rounded-xl p-4 flex items-start space-x-3 text-left">
                <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block">Instrução Importante de Validação</span>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Efetue a transferência no valor exato de <strong className="text-white font-mono font-black">{formatKwanza(amount)}</strong>. Após concluir, descarregue o comprovativo PDF ou tire captura de ecrã límpida do talão e clique no botão abaixo para preencher o formulário de confirmação obrigatório.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => handleCopy(String(amount), 'amount_copy')}
                  className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-zinc-300 font-bold py-2.5 px-4 rounded-xl text-xs uppercase cursor-pointer transition-colors flex items-center justify-center space-x-1.5"
                >
                  {copiedField === 'amount_copy' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedField === 'amount_copy' ? 'Valor Copiado' : 'Copiar Valor'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirmForm(true)}
                  className="flex-grow bg-[#D4AF37] hover:bg-amber-500 text-black font-extrabold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer text-center"
                >
                  Já Efetuei o Pagamento 🚀
                </button>
              </div>

            </div>
          ) : (
            /* STEP 2: Confirmation Form */
            <form onSubmit={handleFormSubmit} className="space-y-5 text-left animate-in fade-in slide-in-from-bottom-5 duration-300">
              
              <div className="flex justify-between items-center border-b border-neutral-850 pb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#D4AF37] block">Formulário de Confirmação</span>
                <button
                  type="button"
                  onClick={() => setShowConfirmForm(false)}
                  className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 hover:text-white transition-colors"
                >
                  ← Ver Coordenadas
                </button>
              </div>

              {errors.length > 0 && (
                <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-[10.5px] space-y-1">
                  <span className="font-extrabold uppercase tracking-wider block">⚠️ Erros de Validação:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {errors.map((err, idx) => <li key={idx}>{err}</li>)}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Holder Account */}
                <div className="space-y-1">
                  <label className="block text-[8.5px] font-bold uppercase tracking-wider text-zinc-400 pl-1 font-mono">
                    Nome do Titular da Conta <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={13} className="absolute left-3.5 top-3.5 text-zinc-500" />
                    <input 
                      type="text"
                      required
                      placeholder="Nome de quem enviou o valor"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 pl-9.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-semibold"
                    />
                  </div>
                </div>

                {/* Telephone Contact */}
                <div className="space-y-1">
                  <label className="block text-[8.5px] font-bold uppercase tracking-wider text-zinc-400 pl-1 font-mono">
                    Telemóvel de Contacto <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3.5 top-3.5 text-zinc-500" />
                    <input 
                      type="tel"
                      required
                      placeholder="9XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 pl-9.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono font-semibold"
                    />
                  </div>
                </div>

                {/* Read only details to ensure safety */}
                <div className="space-y-1">
                  <label className="block text-[8.5px] font-bold uppercase tracking-wider text-zinc-500 pl-1 font-mono">Plano Adquirido</label>
                  <input 
                    type="text"
                    disabled
                    value={itemName}
                    className="w-full bg-neutral-950/50 border border-neutral-850 rounded-xl p-3 text-xs text-zinc-500 font-bold cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[8.5px] font-bold uppercase tracking-wider text-zinc-500 pl-1 font-mono">Valor Pago (Kz)</label>
                  <input 
                    type="text"
                    disabled
                    value={formatKwanza(amount)}
                    className="w-full bg-neutral-950/50 border border-neutral-850 rounded-xl p-3 text-xs text-[#D4AF37] font-bold font-mono cursor-not-allowed"
                  />
                </div>

                {/* Transaction ID */}
                <div className="space-y-1">
                  <label className="block text-[8.5px] font-bold uppercase tracking-wider text-zinc-400 pl-1 font-mono">
                    ID da Transação <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard size={13} className="absolute left-3.5 top-3.5 text-zinc-500" />
                    <input 
                      type="text"
                      required
                      placeholder="Identificador ou nº do comprovativo"
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 pl-9.5 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-[#D4AF37] uppercase font-bold"
                    />
                  </div>
                </div>

                {/* Origin Bank (optional) */}
                <div className="space-y-1">
                  <label className="block text-[8.5px] font-bold uppercase tracking-wider text-zinc-400 pl-1 font-mono">
                    Banco de Origem <span className="text-zinc-500">(Opcional)</span>
                  </label>
                  <select 
                    value={originBank}
                    onChange={(e) => setOriginBank(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-semibold cursor-pointer outline-none"
                  >
                    <option value="">Selecione o seu banco...</option>
                    <option value="BAI">BAI (Banco Angolano de Investimentos)</option>
                    <option value="BFA">BFA (Banco de Fomento Angola)</option>
                    <option value="BIC">BIC (Banco BIC)</option>
                    <option value="SOL">Banco SOL</option>
                    <option value="BCI">BCI (Banco de Comércio e Indústria)</option>
                    <option value="BMA">BMA (Banco Millennium Angola)</option>
                    <option value="BIR">BIR (Banco de Investimento Rural)</option>
                    <option value="KEVE">Banco Keve</option>
                  </select>
                </div>

                {/* Date of Payment */}
                <div className="space-y-1">
                  <label className="block text-[8.5px] font-bold uppercase tracking-wider text-zinc-400 pl-1 font-mono">
                    Data do Pagamento <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={13} className="absolute left-3.5 top-3.5 text-zinc-500" />
                    <input 
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 pl-9.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                    />
                  </div>
                </div>

                {/* Time of Payment (optional) */}
                <div className="space-y-1">
                  <label className="block text-[8.5px] font-bold uppercase tracking-wider text-zinc-400 pl-1 font-mono">
                    Hora do Pagamento <span className="text-zinc-500">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <Clock size={13} className="absolute left-3.5 top-3.5 text-zinc-500" />
                    <input 
                      type="time"
                      value={paymentTime}
                      onChange={(e) => setPaymentTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 pl-9.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                    />
                  </div>
                </div>

                {/* Proof Attachment */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-[8.5px] font-bold uppercase tracking-wider text-zinc-400 pl-1 font-mono">
                    Anexar Comprovativo Digital <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-2.5">
                    <input 
                      type="file"
                      id="payment-proof-file"
                      accept=".pdf,image/png,image/jpeg,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    <div className="flex gap-2">
                      <label 
                        htmlFor="payment-proof-file"
                        className={`flex-grow border border-dashed rounded-xl p-4.5 text-center text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                          proofFile 
                            ? 'border-emerald-500 bg-emerald-950/10 text-emerald-400' 
                            : 'border-neutral-800 hover:border-[#D4AF37] text-zinc-400 bg-neutral-950'
                        }`}
                      >
                        <Upload size={14} className="shrink-0 text-[#D4AF37]" />
                        <div className="text-left">
                          <span className="block">{proofFile ? '✓ Comprovativo Carregado' : 'Selecionar Comprovativo (PDF, PNG, JPG)'}</span>
                          <span className="text-[8.5px] text-zinc-500 font-normal block mt-0.5">Tamanho máximo: 10 MB</span>
                        </div>
                      </label>

                      {proofFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setProofFile(null);
                            setProofFileName('');
                            setProofFileType('');
                          }}
                          className="bg-neutral-900 border border-neutral-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-500/20 text-zinc-400 font-extrabold px-4 rounded-xl text-[10px] uppercase cursor-pointer transition-colors"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    {proofFile && (
                      <div className="border border-neutral-850 p-2.5 rounded-xl bg-neutral-950 flex flex-col items-center justify-center gap-1.5">
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-400 font-bold bg-black/40 px-3 py-1.5 rounded-lg border border-neutral-900 w-full justify-between">
                          <div className="flex items-center space-x-1.5 truncate">
                            <FileText size={12} className="text-[#D4AF37]" />
                            <span className="truncate max-w-[200px]">{proofFileName}</span>
                          </div>
                          <span className="text-[8.5px] uppercase text-zinc-500">{proofFileType.split('/')[1] || 'Ficheiro'}</span>
                        </div>
                        {proofFileType.startsWith('image/') && (
                          <img 
                            src={proofFile} 
                            alt="Miniatura do comprovativo" 
                            className="max-h-28 rounded-lg object-contain border border-neutral-800"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Observations */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[8.5px] font-bold uppercase tracking-wider text-zinc-400 pl-1 font-mono">
                    Observações / Notas Adicionais <span className="text-zinc-500">(Opcional)</span>
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Exemplo: Transferido por José Silva de conta BAI para conta BAI."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-medium resize-none"
                  />
                </div>
              </div>

              {/* Notice */}
              <p className="text-[9px] text-zinc-500 leading-relaxed italic pl-1">
                Ao clicar em "Submeter Confirmação de Pagamento", o utilizador atesta a veracidade da transferência bancária sob as penas de suspensão imediata de conta comercial e sanções de intermediação em caso de fraude.
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-neutral-850 justify-end">
                <button
                  type="button"
                  onClick={() => setShowConfirmForm(false)}
                  className="bg-neutral-900 hover:bg-neutral-800 text-zinc-400 font-bold px-4 py-3 rounded-xl text-xs uppercase cursor-pointer transition-colors"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#D4AF37] hover:bg-amber-500 disabled:opacity-50 text-black font-extrabold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {isSubmitting ? 'A Processar...' : 'Submeter Confirmação 🚀'}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
