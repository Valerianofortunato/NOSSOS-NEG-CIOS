import React, { useState } from 'react';
import { User, ChatNotification } from '../types';
import { 
  Compass, 
  Settings, 
  MessageSquare, 
  ShieldCheck, 
  UserCheck, 
  Bell, 
  Trash2, 
  CheckCircle, 
  Clock, 
  PhoneCall,
  Share2,
  Lock,
  Building,
  User as UserIcon,
  Crown,
  Heart,
  PlusCircle,
  LayoutGrid
} from 'lucide-react';

interface AppHeaderProps {
  currentUser: User | null;
  activeTab: 'market' | 'categories' | 'publish' | 'chats' | 'favorites' | 'profile' | 'admin' | 'advertising';
  setActiveTab: (tab: 'market' | 'categories' | 'publish' | 'chats' | 'favorites' | 'profile' | 'admin' | 'advertising') => void;
  onOpenVerification?: () => void;
  notifications: ChatNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onLogout?: () => void;
  users?: any;
  stats?: any;
  onOpenKYC?: () => void;
  logo?: string;
}

export default function AppHeader({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenVerification,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onLogout,
  onOpenKYC,
  logo
}: AppHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const myNotifs = currentUser && Array.isArray(notifications)
    ? notifications.filter(n => n && n.targetUserId === currentUser.id)
    : [];
  
  const unreadCount = myNotifs.filter(n => n && !n.isRead).length;
  const unreadChatsCount = myNotifs.filter(n => n && !n.isRead && (n.type === 'message' || n.type === 'interest')).length;
  
  const handleCopyReferral = () => {
    if (!currentUser) return;

    const isIndivOrProf = currentUser.accountType === 'particular' || currentUser.accountType === 'individual' || currentUser.accountType === 'profissional';
    const isInviteLocked = isIndivOrProf && (!currentUser.isVerified || currentUser.trustLevel === 'Bronze');

    if (isInviteLocked) {
      alert(`⚠️ Convite Bloqueado: Para contas Individuais e Profissionais, a partilha de convites requer que o seu perfil esteja Verificado e tenha classificação média de nível Prata (mínimo de 4.5★).\n\nMédia atual: ${currentUser.ratingsCount > 0 ? `${currentUser.rating}★` : 'Nenhuma'} (${currentUser.trustLevel || 'Bronze'})\nEstado da conta: ${currentUser.isVerified ? 'Verificada' : 'Pendente de Verificação'}`);
      return;
    }

    const shareUrl = `${window.location.origin}/?ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Link de convite do Nossos Negócios copiado!\nPartilha com outros negócios para expandir a tua rede profissional: ${shareUrl}`);
  };

  return (
    <header className="bg-[#0F172A] border-b border-slate-850 sticky top-0 z-40 shadow-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Row */}
        <div className="py-1 md:py-2.5 flex flex-col md:flex-row justify-between items-center gap-1 md:gap-4">
          
          {/* Top Row for Mobile (Logo + User info side-by-side) / Standard Logo for Desktop */}
          <div className="flex justify-between items-center w-full md:w-auto shrink-0">
            {/* Logo / Brand */}
            <div className="flex items-center space-x-1.5 md:space-x-3 cursor-pointer" onClick={() => setActiveTab('market')}>
              {logo ? (
                <img 
                  src={logo} 
                  alt="Nossos Negócios Logo" 
                  className="h-8 w-8 md:h-12 md:w-12 object-contain rounded-xl bg-white p-0.5 shadow-lg shadow-blue-500/10 shrink-0" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-8 w-8 md:h-12 md:w-12 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
                  <span className="text-white font-black text-xs md:text-xl tracking-tighter">NN</span>
                </div>
              )}
              <div>
                <div className="flex items-center space-x-1">
                  <h1 className="font-sans font-black text-xs md:text-lg text-white tracking-tight uppercase leading-none">
                    NOSSOS <span className="text-[#2563EB]">NEGÓCIOS</span>
                  </h1>
                  <span className="text-[7px] md:text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono font-bold px-1 py-0.2 rounded uppercase">
                    AO
                  </span>
                </div>
                <p className="text-[9px] text-gray-400 font-sans tracking-wide hidden sm:block mt-0.5">
                  Intermediação Comercial & Geração de Oportunidades • Angola
                </p>
              </div>
            </div>

            {/* Mobile-Only Compact User Account Info Banner */}
            {currentUser && (
              <div className="flex md:hidden items-center space-x-2 shrink-0">
                {/* Notification Center */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer transition-all flex items-center justify-center"
                  >
                    <Bell size={13} className={unreadCount > 0 ? "animate-pulse text-[#2563EB]" : "text-slate-400"} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#2563EB] text-white font-mono text-[7px] font-black h-3.5 w-3.5 rounded-full flex items-center justify-center border border-slate-900 shadow">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 bg-[#0F172A] border border-slate-800 rounded-xl shadow-2xl z-50 p-2 space-y-1.5">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                        <span className="font-bold text-[10px] text-white">Notificações</span>
                        {myNotifs.length > 0 && (
                          <button
                            onClick={() => {
                              onClearNotifications();
                              setShowNotifications(false);
                            }}
                            className="text-[9px] text-gray-400 hover:text-red-400 transition-all flex items-center space-x-0.5 cursor-pointer"
                          >
                            <Trash2 size={9} />
                            <span>Limpar</span>
                          </button>
                        )}
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {myNotifs.length === 0 ? (
                          <div className="text-center py-3">
                            <p className="text-[9px] text-gray-500 font-mono">Nenhuma notificação.</p>
                          </div>
                        ) : (
                          myNotifs.map(n => n && (
                            <div
                              key={n.id}
                              onClick={() => {
                                onMarkNotificationRead(n.id);
                                if (n.type === 'message') {
                                  setActiveTab('chats');
                                } else {
                                  setActiveTab('market');
                                }
                                setShowNotifications(false);
                              }}
                              className={`p-1.5 rounded-md border transition-all text-[10px] cursor-pointer text-left ${
                                n.isRead 
                                  ? 'bg-slate-900/30 border-slate-850/50 text-slate-400' 
                                  : 'bg-slate-900 border-[#2563EB]/25 text-white'
                              }`}
                            >
                              <p className="font-medium leading-tight font-sans text-[9px]">{n.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Avatar */}
                <div 
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg cursor-pointer hover:border-blue-500/55 transition-all select-none"
                >
                  <img src={currentUser.avatar} alt={currentUser.name} className="h-6 w-6 rounded object-cover border border-slate-700 shrink-0" />
                </div>

                {/* Sign Out link */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-[9px] text-red-400 hover:text-red-300 transition-colors cursor-pointer block font-bold"
                  >
                    Sair
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation Tabs (Elegantly Styled matching the Reorganization Specification) */}
          {currentUser && (
            <nav className="flex space-x-0.5 md:space-x-1 bg-slate-900/40 border border-slate-800/80 p-0.5 rounded-lg md:rounded-xl w-full md:w-auto overflow-x-auto scrollbar-none shrink-0 my-0.5 md:my-0">
              <button
                id="tab-market"
                onClick={() => setActiveTab('market')}
                className={`flex items-center space-x-1 md:space-x-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[9.5px] md:text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'market'
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Compass size={11} className="md:w-3.5 md:h-3.5" />
                <span>Início</span>
              </button>

              <button
                id="tab-categories"
                onClick={() => setActiveTab('categories')}
                className={`flex items-center space-x-1 md:space-x-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[9.5px] md:text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <LayoutGrid size={11} className="md:w-3.5 md:h-3.5" />
                <span>Categorias</span>
              </button>

              <button
                id="tab-publish"
                onClick={() => setActiveTab('publish')}
                className={`flex items-center space-x-1 md:space-x-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[9.5px] md:text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'publish'
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <PlusCircle size={11} className="md:w-3.5 md:h-3.5" />
                <span>Publicar Anúncio</span>
              </button>

              <button
                id="tab-chats"
                onClick={() => setActiveTab('chats')}
                className={`flex items-center space-x-1 md:space-x-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[9.5px] md:text-xs font-semibold tracking-wide transition-all cursor-pointer relative whitespace-nowrap ${
                  activeTab === 'chats'
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <MessageSquare size={11} className="md:w-3.5 md:h-3.5" />
                <span>Mensagens</span>
                {unreadChatsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-mono text-[8px] font-black h-3 w-3 rounded-full flex items-center justify-center">
                    {unreadChatsCount}
                  </span>
                )}
              </button>

              <button
                id="tab-favorites"
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center space-x-1 md:space-x-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[9.5px] md:text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'favorites'
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Heart size={11} className="md:w-3.5 md:h-3.5" />
                <span>Favoritos</span>
              </button>

              {currentUser && (
                <button
                  id="tab-profile"
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center space-x-1 md:space-x-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[9.5px] md:text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'profile'
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {currentUser.accountType === 'empresa' ? <Building size={11} className="md:w-3.5 md:h-3.5" /> : <UserIcon size={11} className="md:w-3.5 md:h-3.5" />}
                  <span>Perfil</span>
                </button>
              )}

              {currentUser && currentUser.isAdmin && (
                <button
                  id="tab-admin"
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center space-x-1 md:space-x-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[9.5px] md:text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'admin'
                      ? 'bg-[#2563EB] text-white border border-blue-400/20'
                      : 'text-amber-400 hover:bg-slate-850/50'
                  }`}
                >
                  <Lock size={10} className="md:w-3.5 md:h-3.5" />
                  <span>Admin</span>
                </button>
              )}
            </nav>
          )}

          {/* User Account Info banner */}
          {currentUser ? (
            <div className="hidden md:flex items-center space-x-3 shrink-0">
              
              {/* Notification Center */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer transition-all flex items-center justify-center"
                >
                  <Bell size={16} className={unreadCount > 0 ? "animate-pulse text-[#2563EB]" : "text-slate-400"} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#2563EB] text-white font-mono text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-slate-900 shadow">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2.5 w-80 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle size={13} className="text-blue-500" />
                        <span className="font-bold text-xs text-white">Notificações</span>
                        {unreadCount > 0 && (
                          <span className="text-[9px] bg-blue-500/10 text-blue-400 font-bold px-1.5 py-0.5 rounded-full font-mono">
                            {unreadCount} Novas
                          </span>
                        )}
                      </div>
                      {myNotifs.length > 0 && (
                        <button
                          onClick={() => {
                            onClearNotifications();
                            setShowNotifications(false);
                          }}
                          className="text-[10px] text-gray-400 hover:text-red-400 transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 size={11} />
                          <span>Limpar</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {myNotifs.length === 0 ? (
                        <div className="text-center py-5">
                          <p className="text-[10px] text-gray-500 font-mono">Nenhuma notificação nova pendente.</p>
                        </div>
                      ) : (
                        myNotifs.map(n => n && (
                          <div
                            key={n.id}
                            onClick={() => {
                              onMarkNotificationRead(n.id);
                              if (n.type === 'message') {
                                setActiveTab('chats');
                              } else {
                                setActiveTab('market');
                              }
                              setShowNotifications(false);
                            }}
                            className={`p-2 rounded-lg border transition-all text-[11px] cursor-pointer text-left ${
                              n.isRead 
                                ? 'bg-slate-900/30 border-slate-850/50 text-slate-400' 
                                : 'bg-slate-900 border-[#2563EB]/25 text-white'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-extrabold uppercase text-[9px] text-[#2563EB]">
                                • {n.type}
                              </span>
                              <span className="text-[8px] text-slate-500 font-mono flex items-center shrink-0">
                                <Clock size={8} className="mr-0.5" />
                                {n.createdAt}
                              </span>
                            </div>
                            <p className="mt-0.5 font-medium leading-relaxed font-sans">{n.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile Details Card */}
              <div 
                onClick={() => setActiveTab('profile')}
                className="flex items-center space-x-2.5 bg-slate-900 border border-slate-800 p-1.5 pr-3 rounded-xl cursor-pointer hover:border-blue-500/55 transition-all select-none"
              >
                <img src={currentUser.avatar} alt={currentUser.name} className="h-8 w-8 rounded-lg object-cover border border-slate-705 shrink-0" />
                <div className="text-left">
                  <div className="flex items-center space-x-1">
                    <span className="font-extrabold text-xs text-white leading-tight block truncate max-w-[110px]">
                      {currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1] || ''}
                    </span>
                    {currentUser.isVerified && (
                      <span className="text-blue-500 inline-block" title="Conta Verificada Oficialmente">
                        <ShieldCheck size={11.5} fill="currentColor" stroke="black" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 mt-0.5">
                    {/* User Badge types */}
                    {currentUser.accountType === 'empresa' ? (
                      <span className="text-[8px] bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 font-black px-1 rounded uppercase flex items-center">
                        Empresa
                      </span>
                    ) : currentUser.accountType === 'profissional' ? (
                      <span className="text-[8px] bg-blue-600/10 text-blue-400 border border-blue-500/20 font-black px-1 rounded uppercase flex items-center">
                        Profissional
                      </span>
                    ) : (
                      <span className="text-[8px] bg-slate-700/30 text-slate-350 border border-slate-600/20 font-bold px-1 rounded uppercase">
                        Particular
                      </span>
                    )}

                    {currentUser.highlightCredits > 0 && (
                      <span className="text-[8px] text-amber-400 font-mono flex items-center space-x-0.5 font-extrabold">
                        <Crown size={8} />
                        <span>{currentUser.highlightCredits}★</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-end space-y-1 font-sans">
                {!currentUser.isVerified && (
                  <button
                    onClick={onOpenVerification || onOpenKYC}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wide cursor-pointer transition-all flex items-center shadow-md shadow-blue-600/10"
                  >
                    <span>Selo Verificado VIP</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-[9px] text-slate-400 hover:text-red-400 transition-colors cursor-pointer block tracking-wider"
                  >
                    Sair da Conta
                  </button>
                )}
              </div>

            </div>
          ) : null}

        </div>

        {/* Informative Subbar */}
        <div className="border-t border-slate-850 py-1 md:py-1.5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-1 md:gap-1.5">
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
            <span className="flex items-center"><PhoneCall size={11} className="mr-1 text-blue-500" /> +244 941963554</span>
            <span className="flex items-center"><PhoneCall size={11} className="mr-1 text-blue-500" /> +244 957150407</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-[#2563EB] font-black uppercase tracking-wider text-[8px] sm:text-[9px] text-center">INTERMEDIAÇÃO COMERCIAL SEM INTERVENÇÃO DE SALDO ⚡ COMUNICAR E FECHAR!</span>
          </div>

          {currentUser && (() => {
            const isIndivOrProf = currentUser.accountType === 'particular' || currentUser.accountType === 'individual' || currentUser.accountType === 'profissional';
            const isInviteLocked = isIndivOrProf && (!currentUser.isVerified || currentUser.trustLevel === 'Bronze');

            return (
              <div className="flex items-center space-x-2 shrink-0">
                <span className="bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono text-[9px]">
                  Ref Código: {currentUser.referralCode}
                </span>
                <button 
                  onClick={handleCopyReferral}
                  className={`transition-all flex items-center space-x-0.5 bg-slate-900 border px-2 py-0.5 rounded-lg cursor-pointer text-[9px] font-bold ${
                    isInviteLocked 
                      ? 'text-red-400 border-red-950/40 hover:bg-red-950/20' 
                      : 'text-slate-300 border-slate-800 hover:text-[#2563EB]'
                  }`}
                >
                  {isInviteLocked ? <Lock size={9} /> : <Share2 size={9} />}
                  <span>{isInviteLocked ? 'Convite Bloqueado' : 'Partilhar Convite'}</span>
                </button>
              </div>
            );
          })()}
        </div>

      </div>
    </header>
  );
}
