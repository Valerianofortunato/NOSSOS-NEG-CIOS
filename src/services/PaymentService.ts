import { generateId } from '../utils';
import { supabase } from '../lib/supabase';

export type PaymentStatus = 'pending' | 'confirmed' | 'rejected' | 'canceled';
export type InvoiceStatus = 'ready_for_billing' | 'invoiced';

export interface AuditLog {
  timestamp: string;
  action: string;
  operator: string;
  details?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
  description?: string;
}

export interface PaymentOrder {
  id: string;
  code: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  itemType: 'subscription' | 'promotion' | 'ad_campaign';
  itemId: string;
  itemName: string;
  targetId?: string;
  amount: number;
  paymentMethod: string;
  paymentBank: string;
  originBank?: string;
  txId: string;
  holderName: string;
  paymentDate: string;
  paymentTime?: string;
  proofImage?: string;
  notes?: string;
  status: PaymentStatus;
  createdAt: string;
  confirmedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  invoiceStatus: InvoiceStatus;
  history: AuditLog[];
}

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'transfer_bancaria', name: 'Transferência Bancária', isActive: true, description: 'Transferência através do Multicaixa ou Homebanking' },
  { id: 'multicaixa_express', name: 'Multicaixa Express', isActive: true, description: 'Pagamento instantâneo via telemóvel' },
];

function toDb(order: PaymentOrder) {
  return {
    id: order.id,
    user_id: order.userId,
    user_name: order.userName,
    user_email: order.userEmail,
    amount: order.amount,
    payment_method: order.paymentMethod,
    item_type: order.itemType,
    item_title: order.itemName,
    target_id: order.targetId,
    proof_file_url: order.proofImage,
    proof_notes: order.notes,
    reference_code: order.txId,
    invoice_number: order.code,
    status: order.status,
    invoice_status: order.invoiceStatus,
    history: order.history,
    created_at: order.createdAt
  };
}

function fromDb(row: any): PaymentOrder {
  return {
    id: row.id,
    code: row.invoice_number || row.reference_code || row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email || '',
    userPhone: '',
    itemType: row.item_type,
    itemId: row.target_id || row.item_type,
    itemName: row.item_title,
    targetId: row.target_id || undefined,
    amount: Number(row.amount) || 0,
    paymentMethod: row.payment_method,
    paymentBank: '',
    txId: row.reference_code || '',
    holderName: '',
    paymentDate: row.created_at,
    proofImage: row.proof_file_url || undefined,
    notes: row.proof_notes || undefined,
    status: row.status,
    createdAt: row.created_at,
    invoiceStatus: row.invoice_status || 'ready_for_billing',
    history: Array.isArray(row.history) ? row.history : []
  };
}

export class PaymentService {
  private static paymentMethods: PaymentMethod[] = [...DEFAULT_PAYMENT_METHODS];

  public static async getOrders(): Promise<PaymentOrder[]> {
    const { data, error } = await supabase
      .from('payment_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Não foi possível carregar os pagamentos: ${error.message}`);
    return (data || []).map(fromDb);
  }

  public static getPaymentMethods(): PaymentMethod[] {
    return this.paymentMethods;
  }

  public static savePaymentMethods(methods: PaymentMethod[]): void {
    this.paymentMethods = methods;
  }

  public static async createOrder(
    orderInput: Omit<PaymentOrder, 'id' | 'code' | 'status' | 'createdAt' | 'invoiceStatus' | 'history'>
  ): Promise<PaymentOrder> {
    const timestamp = new Date().toISOString();
    const orderId = generateId('PAY');
    const internalCode = 'NOSSOSNEG-' + generateId('TX').toUpperCase();
    const newOrder: PaymentOrder = {
      ...orderInput,
      id: orderId,
      code: internalCode,
      status: 'pending',
      createdAt: timestamp,
      invoiceStatus: 'ready_for_billing',
      history: [{ timestamp, action: 'Criação do Pedido', operator: orderInput.userName, details: `Pedido criado para ${orderInput.itemName} no valor de ${orderInput.amount} Kz.` }]
    };

    const { error } = await supabase.from('payment_orders').insert(toDb(newOrder));
    if (error) throw new Error(`Não foi possível criar o pedido: ${error.message}`);
    return newOrder;
  }

  public static async confirmOrder(orderId: string, operator: string): Promise<PaymentOrder> {
    return this.updateOrderStatus(orderId, 'confirmed', operator, 'Confirmação de Pagamento', 'Pagamento validado no extrato bancário.');
  }

  public static async rejectOrder(orderId: string, reason: string, operator: string): Promise<PaymentOrder> {
    if (!reason.trim()) throw new Error('O motivo de rejeição é obrigatório.');
    const timestamp = new Date().toISOString();
    const order = await this.getOrder(orderId);
    if (order.status !== 'pending') throw new Error(`Este pedido já se encontra no estado: ${order.status}`);
    const updated = { ...order, status: 'rejected' as const, rejectedAt: timestamp, rejectionReason: reason, history: [...order.history, { timestamp, action: 'Rejeição de Pagamento', operator, details: reason }] };
    const { error } = await supabase.from('payment_orders').update({ status: updated.status, history: updated.history, proof_notes: reason }).eq('id', orderId);
    if (error) throw new Error(`Não foi possível rejeitar o pedido: ${error.message}`);
    return updated;
  }

  public static async cancelOrder(orderId: string, operator: string): Promise<PaymentOrder> {
    return this.updateOrderStatus(orderId, 'canceled', operator, 'Cancelamento do Pedido', 'O pedido de pagamento foi cancelado.');
  }

  private static async updateOrderStatus(orderId: string, status: PaymentStatus, operator: string, action: string, details: string): Promise<PaymentOrder> {
    const order = await this.getOrder(orderId);
    if (order.status !== 'pending') throw new Error(`Este pedido já se encontra no estado: ${order.status}`);
    const timestamp = new Date().toISOString();
    const updated: PaymentOrder = { ...order, status, history: [...order.history, { timestamp, action, operator, details }] };
    if (status === 'confirmed') updated.confirmedAt = timestamp;
    if (status === 'canceled') updated.rejectedAt = undefined;
    const { error } = await supabase.from('payment_orders').update({ status, history: updated.history }).eq('id', orderId);
    if (error) throw new Error(`Não foi possível atualizar o pagamento: ${error.message}`);
    return updated;
  }

  private static async getOrder(orderId: string): Promise<PaymentOrder> {
    const { data, error } = await supabase.from('payment_orders').select('*').eq('id', orderId).single();
    if (error || !data) throw new Error(`Pedido com ID ${orderId} não encontrado.`);
    return fromDb(data);
  }

  public static formatOrderId(id: string): string {
    return `Pedido Nº ${id}`;
  }

  public static async processAutomaticGatewayPayment(orderId: string): Promise<{ success: boolean; gatewayTxId?: string; error?: string }> {
    return { success: false, error: 'Gateway de pagamento ainda não configurado.' };
  }

  public static async issueAgtCertifiedInvoice(orderId: string): Promise<{ success: boolean; invoiceNumber?: string; hash?: string }> {
    return { success: false };
  }
}
