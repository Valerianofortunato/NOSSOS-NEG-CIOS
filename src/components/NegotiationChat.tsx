import React, { useState, useRef } from 'react';
import { Conversation, ChatMessage, User } from '../types';
import { formatKwanza } from '../utils';
import { Send, Image, Star, CheckCheck, Landmark, MessageSquare, ArrowLeft, Shield } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

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

interface NegotiationChatProps {
  conversation?: Conversation;
  currentUser?: User | null;
  onSendMessage: (convId: string, text: string, imageUrl?: string) => void;
  onRateUser?: (targetId: string, rating: number, comment: string) => void;
  transaction?: any;
  onDeliverAssist?: any;
  onExtendHold?: any;
  onRateTransaction?: any;
  onCancelPurchase?: any;
  onBackToList?: () => void;
}

export default function NegotiationChat({
  conversation,
  currentUser,
  onSendMessage,
  onRateUser,
  transaction,
  onDeliverAssist,
  onExtendHold,
  onRateTransaction,
  onCancelPurchase,
  onBackToList
}: NegotiationChatProps) {
  const [inputText, setInputText] = useState('');
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [selectedChatImage, setSelectedChatImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setSelectedFileName(file.name);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        compressImage(reader.result)
          .then(compressed => {
            setSelectedChatImage(compressed);
            setIsUploading(false);
          })
          .catch(err => {
            console.error('Error compressing chat image:', err);
            setSelectedChatImage(reader.result as string);
            setIsUploading(false);
          });
      } else {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Fallback to transform potentially passed transactions into a standard conversation layout
  const actualConversation: Conversation = conversation || {
    id: transaction?.id || 'temp',
    productId: transaction?.productId || 'p_temp',
    productTitle: transaction?.productTitle || 'Artigo de Angola',
    productPrice: transaction?.productPrice || transaction?.price || 0,
    productImage: transaction?.productImage || '',
    buyerId: transaction?.buyerId || '',
    buyerName: transaction?.buyerName || '',
    buyerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    sellerId: transaction?.sellerId || '',
    sellerName: transaction?.sellerName || '',
    sellerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    messages: transaction?.messages || [],
    createdAt: transaction?.createdAt || new Date().toLocaleDateString('pt-AO'),
    isReadByBuyer: false,
    isReadBySeller: false
  };

  const isSeller = currentUser ? (actualConversation.sellerId === currentUser.id) : false;
  const isBuyer = currentUser ? (actualConversation.buyerId === currentUser.id) : false;
  
  const recipientId = isSeller ? actualConversation.buyerId : actualConversation.sellerId;
  const recipientName = isSeller ? actualConversation.buyerName : actualConversation.sellerName;
  const recipientAvatar = isSeller ? actualConversation.buyerAvatar : actualConversation.sellerAvatar;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedChatImage) return;
    
    onSendMessage(
      actualConversation.id, 
      inputText, 
      selectedChatImage || undefined
    );
    
    setInputText('');
    setSelectedChatImage(null);
    setSelectedFileName('');
    setShowImageUploader(false);
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingComment.trim()) {
      alert('Por favor, escreva um breve comentário sobre o utilizador.');
      return;
    }
    if (onRateUser) {
      onRateUser(recipientId, ratingVal, ratingComment);
    }
    if (onRateTransaction && transaction) {
      const role = isSeller ? 'seller' : 'buyer';
      onRateTransaction(transaction.id, ratingVal, role);
    }
    setHasRated(true);
    setShowRatingForm(false);
    alert(`Obrigado! A tua avaliação de ${ratingVal}★ sobre ${recipientName} foi publicada no perfil dele.`);
  };

  return (
    <div className="bg-[#1e1e1e] flex flex-col h-full overflow-hidden text-white relative">
      
      {/* Target Product / Counterpart Banner */}
      <div className="bg-[#121212] border-b border-neutral-800 p-3 sm:p-4 shrink-0 flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          {/* Back button on mobile screens */}
          {onBackToList && (
            <button 
              onClick={onBackToList}
              className="p-1 sm:p-1.5 hover:bg-neutral-800 rounded-full text-slate-400 hover:text-white transition-colors shrink-0"
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="relative shrink-0">
            {recipientAvatar ? (
              <img 
                src={recipientAvatar} 
                alt={recipientName} 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-neutral-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                }}
              />
            ) : (
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-300">
                {recipientName ? recipientName.substring(0, 2).toUpperCase() : 'CG'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121212] rounded-full"></span>
          </div>

          <div className="text-left min-w-0">
            <h4 className="font-sans font-bold text-xs sm:text-sm text-white leading-tight truncate">
              {recipientName}
            </h4>
            <div className="flex items-center space-x-1.5 text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
              <span className="font-mono bg-neutral-800 text-slate-300 px-1 py-0.2 rounded text-[8px] uppercase tracking-wide">
                {isSeller ? 'Teu Comprador' : 'Teu Vendedor'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="truncate max-w-[120px] sm:max-w-[200px]" title={actualConversation.productTitle}>
                Artigo: {actualConversation.productTitle}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowRatingForm(!showRatingForm)}
            disabled={hasRated}
            className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider py-1.5 px-2.5 rounded-xl border cursor-pointer transition-all ${
              hasRated 
                ? 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400'
                : 'bg-[#D4AF37]/10 border-[#D4AF37]/25 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'
            }`}
          >
            {hasRated ? '✓ Avaliado' : '⭐ Avaliar'}
          </button>
        </div>
      </div>

      {/* Target Product Badge floating alert */}
      <div className="bg-[#121111] px-4 py-2 border-b border-neutral-800/80 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center space-x-2 min-w-0">
          {actualConversation.productImage && (
            <img 
              src={actualConversation.productImage} 
              alt={actualConversation.productTitle} 
              className="h-6 w-6 rounded object-cover border border-neutral-800 shrink-0"
              referrerPolicy="no-referrer"
            />
          )}
          <span className="truncate text-[11px] font-medium text-slate-400">
            Preço do Artigo: <strong className="text-[#D4AF37] font-mono">{formatKwanza(actualConversation.productPrice)}</strong>
          </span>
        </div>
        <div className="text-[10px] bg-blue-500/10 text-blue-400 py-0.5 px-2 rounded-full border border-blue-500/15 flex items-center gap-1 font-bold shrink-0">
          <Shield size={10} />
          <span>Contacto Direto</span>
        </div>
      </div>

      {/* Rating Form Panel Overlay */}
      {showRatingForm && (
        <form onSubmit={handleSubmitRating} className="bg-[#121212] border-b border-neutral-800 p-4 space-y-3 transition-all text-left absolute top-[calc(56px)] sm:top-[calc(65px)] left-0 right-0 z-20 shadow-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase text-[#D4AF37] font-mono">Formulário de Avaliação</span>
            <span className="text-xs text-slate-400">A avaliar: <strong className="text-white">{recipientName}</strong></span>
          </div>
          
          <div className="flex items-center space-x-3 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-xs text-slate-450 font-medium font-sans">Classificação:</span>
            <div className="flex space-x-1.5">
              {[1, 2, 3, 4, 5].map((stars) => (
                <button
                  type="button"
                  key={stars}
                  onClick={() => setRatingVal(stars)}
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <Star size={16} fill={ratingVal >= stars ? '#F59E0B' : 'none'} className={ratingVal >= stars ? 'text-amber-500 animate-pulse' : 'text-slate-400'} />
                </button>
              ))}
            </div>
            <span className="text-xs text-amber-500 font-bold">({ratingVal} ★)</span>
          </div>

          <div className="space-y-1 relative flex items-center">
            <input
              type="text"
              placeholder="Escreva um comentário honesto... (ex: Excelente vendedor, atencioso!)"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-neutral-800 rounded-xl p-2.5 pr-12 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              required
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <EmojiPicker onEmojiSelect={(emoji) => setRatingComment(prev => prev + emoji)} placement="top" />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-[#D4AF37] hover:bg-yellow-600 text-black font-black text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              Publicar Avaliação
            </button>
            <button
              type="button"
              onClick={() => setShowRatingForm(false)}
              className="bg-neutral-800 text-slate-300 text-xs py-2 px-3 rounded-xl hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-[#121212] flex flex-col">
        <div className="max-w-md mx-auto text-center border border-neutral-800/80 bg-neutral-950/80 p-2.5 rounded-2xl text-[9px] text-slate-450 uppercase font-bold tracking-wider font-mono">
          🔒 Conversa Privada Iniciada • Conectado(a) com {recipientName}
        </div>

        {actualConversation.messages.length === 0 ? (
          <div className="my-auto text-center space-y-1 py-8">
            <div className="h-12 w-12 rounded-full bg-neutral-900/60 flex items-center justify-center mx-auto text-slate-500 border border-neutral-800/50">
              <MessageSquare size={20} />
            </div>
            <p className="text-xs text-slate-500 font-sans mt-2">Nenhuma mensagem enviada.</p>
            <p className="text-[10px] text-slate-605 font-sans">Diga Olá para dar início à sua negociação!</p>
          </div>
        ) : (
          actualConversation.messages.map((msg) => {
            const isMe = currentUser ? msg.senderId === currentUser.id : false;
            return (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  isMe ? 'self-end flex-row-reverse' : 'self-start flex-row'
                }`}
              >
                {/* Avatar next to message for other users (Facebook style) */}
                {!isMe ? (
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-neutral-800 shrink-0 self-end mb-4 border border-neutral-700">
                    <img 
                      src={recipientAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                      alt={msg.senderName} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-1.5 shrink-0" />
                )}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name if not me */}
                  {!isMe && (
                    <span className="text-[10px] text-slate-400 font-semibold mb-1 ml-1 bg-slate-900/30 px-1.5 py-0.5 rounded">
                      {msg.senderName}
                    </span>
                  )}

                  {/* Bubble layout */}
                  <div
                    className={`p-3 text-sm leading-relaxed text-left rounded-2xl relative shadow-md ${
                      isMe
                        ? 'bg-[#0084FF] text-white rounded-tr-md rounded-br-2xl rounded-bl-2xl rounded-tl-2xl'
                        : 'bg-[#242526] text-slate-100 rounded-tl-md rounded-bl-2xl rounded-br-2xl rounded-tr-2xl border border-neutral-800/60'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    
                    {msg.imageUrl && (
                      <div className="max-w-xs overflow-hidden rounded-xl border border-black/30 mt-2 shadow-md">
                        <img 
                          src={msg.imageUrl} 
                          alt="Anexo enviado" 
                          className="max-h-60 w-full object-cover transition-transform hover:scale-102" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Timestamp & Status info underneath */}
                  <span className="text-[9px] text-slate-500 font-medium font-mono mt-1 flex items-center px-1.5 select-none">
                    {msg.timestamp || 'Agora'}
                    {isMe && (
                      <span className="ml-1 flex items-center text-[#0084FF]">
                        <CheckCheck size={11} className="shrink-0" />
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Image Uploader Bar */}
      {showImageUploader && (
        <div className="bg-[#121212] border-t border-neutral-800 p-3 text-left space-y-3.5 relative z-10 shadow-lg animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">Anexar Imagem da Galeria:</span>
            <button
              type="button"
              onClick={() => {
                setShowImageUploader(false);
                setSelectedChatImage(null);
                setSelectedFileName('');
              }}
              className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
            >
              Fechar ✕
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-neutral-900/50 p-2.5 rounded-xl border border-neutral-800">
            {/* Gallery Upload Option */}
            <div className="flex-grow">
              <input
                type="file"
                accept="image/*"
                ref={chatFileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="chat-gallery-input"
              />
              <button
                type="button"
                onClick={() => chatFileInputRef.current?.click()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Image size={15} />
                <span>Escolher Foto da Galeria 📸</span>
              </button>
            </div>

            {/* Preview of the uploaded image if any */}
            {selectedChatImage && (
              <div className="flex items-center space-x-2 bg-neutral-950 p-1.5 pr-3 rounded-xl border border-neutral-800 shrink-0">
                <img
                  src={selectedChatImage}
                  alt="Anexo"
                  className="w-10 h-10 object-cover rounded-lg border border-neutral-800"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-300 font-mono truncate max-w-[120px]">{selectedFileName || 'imagem.jpg'}</p>
                  <p className="text-[9px] text-emerald-400">Pronta para enviar</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedChatImage(null);
                    setSelectedFileName('');
                    if (chatFileInputRef.current) chatFileInputRef.current.value = '';
                  }}
                  className="text-red-400 hover:text-red-300 text-[10px] font-bold p-1 hover:bg-red-950/30 rounded-lg ml-2 cursor-pointer"
                >
                  Remover
                </button>
              </div>
            )}

            {isUploading && (
              <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 animate-pulse shrink-0">
                <span>Processando imagem...</span>
              </div>
            )}
          </div>

          {selectedChatImage && (
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={handleSend}
                disabled={isUploading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors flex items-center space-x-1 shadow-md active:scale-95"
              >
                <span>Enviar Foto Agora 🚀</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input Form Bar */}
      <form onSubmit={handleSend} className="p-2 sm:p-3 border-t border-neutral-800 flex items-center space-x-2 bg-[#121212] shrink-0 z-10">
        <button
          type="button"
          onClick={() => setShowImageUploader(!showImageUploader)}
          className={`rounded-xl p-2.5 flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
            showImageUploader || selectedChatImage ? 'bg-[#2563EB] text-white' : 'bg-neutral-905 hover:bg-neutral-800 text-slate-400 hover:text-white'
          }`}
          title="Anexar Imagem"
        >
          <Image size={17} />
        </button>

        <div className="relative flex-grow flex-1 flex items-center">
          <input
            type="text"
            placeholder="Digite uma mensagem para fechar negócio..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-neutral-800 rounded-xl p-2.5 pr-12 text-xs sm:text-[13px] text-white focus:outline-none focus:border-[#2563EB] placeholder-slate-500"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <EmojiPicker onEmojiSelect={(emoji) => setInputText(prev => prev + emoji)} placement="top" />
          </div>
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() && !selectedChatImage}
          className="bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl p-2.5 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 shrink-0"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
