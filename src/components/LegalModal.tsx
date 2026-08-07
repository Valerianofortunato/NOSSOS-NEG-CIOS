import React, { useState } from 'react';
import { X, Shield, FileText, Scale, Landmark, Lock, HelpCircle } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms'
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-250">
      <div 
        id="legal-modal-container"
        className="bg-[#121212] border border-neutral-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-850 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-amber-500/10 text-[#D4AF37] rounded-xl flex items-center justify-center">
              <Scale size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Regulamentos Legais e Segurança
              </h2>
              <p className="text-[10px] text-gray-500 font-mono">
                República de Angola • NOSSOS NEGÓCIOS, Lda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-neutral-900 rounded-xl transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-850 bg-neutral-950/20 px-4">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'terms'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>Termos de Uso</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'privacy'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Shield size={14} />
            <span>Política de Privacidade</span>
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-300 leading-relaxed font-sans max-h-[60vh] custom-scrollbar">
          {activeTab === 'terms' ? (
            <div className="space-y-5">
              {/* Introduction */}
              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[#D4AF37] font-bold uppercase tracking-wider text-[11px]">
                  <Landmark size={14} />
                  <span>Enquadramento Legal em Angola</span>
                </div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Os presentes Termos de Uso regulam o acesso e utilização da plataforma <strong>NOSSOS NEGÓCIOS</strong>, propriedade da <strong>NOSSOS NEGÓCIOS, Lda</strong>, em conformidade com o ordenamento jurídico angolano, incluindo a Lei n.º 22/11 (Proteção de Dados Pessoais) e a regulamentação sobre Comércio Eletrónico e Serviços da Sociedade da Informação.
                </p>
              </div>

              {/* Terms Articles */}
              <div className="space-y-4">
                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">Artigo 1.º (Objeto e Âmbito)</h4>
                  <p>
                    O <strong>NOSSOS NEGÓCIOS</strong> é uma plataforma digital que funciona estritamente como um mercado de anúncios classificados, intermediação de ativos, sociedades comerciais, marcas, e oportunidades comerciais de parceiros e promotores em território de Angola.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">Artigo 2.º (Ausência de Intervenção de Saldo)</h4>
                  <p className="text-[#D4AF37] font-semibold bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                    ⚡ <strong>Princípio da Não Custódia:</strong> A nossa plataforma <strong>não detém, não guarda e não gere saldos monetários, carteiras virtuais (wallets) ou fundos dos utilizadores</strong> destinados à aquisição de negócios anunciados. Todas as negociações contratuais, transferências financeiras de compra e venda de empresas ou investimentos ocorrem diretamente por vias extra-plataforma e de forma autónoma entre o comprador e o vendedor.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">Artigo 3.º (Registo, Tipos de Conta e Planos)</h4>
                  <p>
                    O utilizador pode registar-se sob três categorias de conta distintas, sujeitas às respetivas regras de ativação:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    <li><strong>Conta Individual / Particular:</strong> Destinada a investidores casuais. Sem taxas de manutenção recorrentes.</li>
                    <li><strong>Conta Profissional (Corretor):</strong> Destinada a corretores ou intermediários de negócios independentes. Requer subscrição periódica paga e verificação KYC ativa para a partilha de convites e captação de leads.</li>
                    <li><strong>Conta Empresa:</strong> Destinada a sociedades comerciais, fundos e corporações de investimento. Requer aprovação administrativa, envio de NIF comercial válido e subscrição empresarial.</li>
                  </ul>
                </section>

                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">Artigo 4.º (Regras do Sistema de Destaques e Promoções)</h4>
                  <p>
                    Os anúncios criados podem beneficiar de destaque através da contratação de planos de promoção (Plus, Premium e VIP), cuja ordem de posicionamento no feed obedece estritamente ao seguinte critério tecnológico:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-gray-400">
                    <li><strong className="text-amber-400">👑 Destaque VIP:</strong> Prioridade absoluta de visualização, topo da página inicial e prioridade máxima de resultados.</li>
                    <li><strong className="text-purple-400">🟣 Destaque Premium:</strong> Exibição acima do plano Plus e feeds gratuitos, prioridade alta.</li>
                    <li><strong className="text-emerald-400">🟢 Destaque Plus:</strong> Exibição acima dos feeds gratuitos, destaque com etiqueta de visibilidade.</li>
                    <li><strong>Anúncios Gratuitos Verificados:</strong> Ordenados cronologicamente após os planos promovidos.</li>
                    <li><strong>Anúncios Gratuitos Não Verificados:</strong> Base do feed geral.</li>
                  </ol>
                  <p className="text-[11px] text-gray-400 mt-1">
                    * Após o término da vigência da promoção contratada (definida no ato da transação), o anúncio reverte de forma totalmente automatizada para a sua categoria base gratuita sem encargos adicionais.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">Artigo 5.º (Verificação de Perfis e KYC)</h4>
                  <p>
                    Em conformidade com as diretivas angolanas de combate ao branqueamento de capitais e criminalidade cibernética, a equipa administrativa do <strong>NOSSOS NEGÓCIOS</strong> reserva-se o direito de exigir documentação oficial (Bilhete de Identidade, Passaporte, Alvará Comercial ou Certidão de Registo de Contribuinte) antes da aprovação final de anúncios de elevado valor de transação.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">Artigo 6.º (Exclusão de Responsabilidade)</h4>
                  <p>
                    O <strong>NOSSOS NEGÓCIOS</strong> não é parte contratante nos acordos firmados entre os utilizadores e corretores do sistema. Não prestamos assessoria de consultoria financeira regulada pela CMC (Comissão do Mercado de Valores Mobiliários de Angola). Os investidores e compradores declaram realizar as suas próprias diligências de auditoria legal (due diligence) de forma prévia antes de qualquer transferência de capital.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">Artigo 7.º (Foro Competente)</h4>
                  <p>
                    Para a resolução de qualquer litígio emergente da utilização ou interpretação dos presentes termos, que não possa ser sanado por acordo amigável de mediação interna, é eleito o foro da Comarca de Luanda, com expressa renúncia a qualquer outro.
                  </p>
                </section>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Privacy Intro */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  <Lock size={14} />
                  <span>Proteção de Dados Pessoais • APD Angola</span>
                </div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  A nossa Política de Privacidade visa assegurar aos utilizadores da plataforma total transparência no tratamento dos seus dados de cariz pessoal, em cumprimento integral com a <strong>Lei n.º 22/11, de 17 de Junho - Lei da Proteção de Dados Pessoais (LPDP)</strong> da República de Angola.
                </p>
              </div>

              {/* Privacy Articles */}
              <div className="space-y-4">
                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">1. Informação Recolhida</h4>
                  <p>
                    Para garantir a operacionalidade técnica do nosso mercado de negócios e manter a segurança de toda a rede de investidores, recolhemos os seguintes dados pessoais:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    <li><strong>Dados Identificativos:</strong> Nome completo, endereço de correio eletrónico (e-mail) de registo e número de telemóvel angolano operacional.</li>
                    <li><strong>Dados de Autenticação:</strong> Palavra-passe encriptada unilateralmente no sistema.</li>
                    <li><strong>Dados de Segurança (KYC):</strong> Fotografias ou cópias digitalizadas de documentos de identificação civil ou corporativa para verificação oficial.</li>
                    <li><strong>Registos Financeiros:</strong> Referências de transferências de subscrições de planos ou promoções ativas submetidos de forma manual para efeitos de contabilidade e validação administrativa.</li>
                  </ul>
                </section>

                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">2. Finalidade do Tratamento</h4>
                  <p>
                    Os dados recolhidos destinam-se única e exclusivamente às seguintes finalidades legítimas:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    <li>Criação de perfil de utilizador e atribuição automática do código de convite de rede de afiliados.</li>
                    <li>Permitir o contacto via chat privado de negociação e reencaminhamento telefónico seguro em anúncios de interesse.</li>
                    <li>Processo administrativo automático de alteração de credenciais com envio de código de segurança por e-mail para autorização.</li>
                    <li>Prevenção contra falsidade ideológica, esquemas de burla ou uso ilícito do mercado por entidades não autorizadas.</li>
                  </ul>
                </section>

                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">3. Partilha de Dados a Terceiros</h4>
                  <p>
                    O <strong>NOSSOS NEGÓCIOS</strong> não comercializa nem transfere de forma alguma bases de dados pessoais de utilizadores para empresas de fins publicitários ou agregadores externos. Os dados de contacto telefónico e de chat apenas são expostos aos proponentes legítimos quando o utilizador decide voluntariamente anunciar ou iniciar uma proposta formal de negociação num determinado ativo listado.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">4. Direitos do Titular dos Dados (ARCO)</h4>
                  <p>
                    Os utilizadores angolanos gozam, a qualquer momento, de amplos direitos sobre os seus dados, os quais podem exercer através das definições na sua aba de Perfil ou entrando em contacto direto com os administradores através do e-mail de suporte oficial: <a href="mailto:nossosnegocios.ao@gmail.com" className="text-[#D4AF37] hover:underline font-bold">nossosnegocios.ao@gmail.com</a>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    <li><strong>Acesso e Retificação:</strong> Alteração de e-mail de acesso, palavra-passe (com código automático de confirmação) e número telefónico.</li>
                    <li><strong>Eliminação (Direito ao Esquecimento):</strong> Eliminação definitiva da conta e de todos os anúncios e propostas associados, eliminando quaisquer registos das bases de dados em conformidade com a legislação angolana.</li>
                    <li><strong>Oposição:</strong> Recusa em receber correspondência automática ou alertas de anúncios recomendados da plataforma.</li>
                  </ul>
                </section>

                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">5. Segurança do Armazenamento</h4>
                  <p>
                    Implementamos metodologias de proteção tecnológica líderes de mercado para prevenir acessos ilegítimos. As comunicações de dados e sessões de utilizadores são encriptadas de ponta a ponta e o nosso processo de alteração de credenciais exige validação através de duplo fator local obrigatório de controlo para proteção integral do utilizador.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">6. Alterações à Presente Política</h4>
                  <p>
                    O <strong>NOSSOS NEGÓCIOS</strong> reserva-se o direito de atualizar esta Política de Privacidade consoante novas imposições regulamentares decretadas pela Agência de Proteção de Dados (APD) de Angola. Os utilizadores serão formalmente informados sobre modificações estruturais através dos nossos alertas de plataforma.
                  </p>
                </section>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-850 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center space-x-2 text-[10px] text-gray-500 font-mono">
            <Shield size={12} className="text-emerald-500" />
            <span>Conexão Encriptada Segura • Luanda, AO</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-neutral-900 border border-neutral-800 hover:border-gray-700 text-white text-xs font-bold uppercase py-2 px-4 rounded-xl transition-all cursor-pointer"
          >
            Fechar Regulamentos
          </button>
        </div>
      </div>
    </div>
  );
};
