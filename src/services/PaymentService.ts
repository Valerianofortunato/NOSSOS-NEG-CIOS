import { generateId } from '../utils';

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
  id: string; // e.g. "000001" (padded 6-digit number)
  code: string; // Unique internal cryptographic or hash code
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  
  // Item details
  itemType: 'subscription' | 'promotion' | 'ad_campaign';
  itemId: string; // e.g. 'plus', 'vip', 'premium', 'profissional-mensal', 'empresa-anual'
  itemName: string; // e.g. 'Destaque VIP', 'Plano Empresa Anual'
  targetId?: string; // Product ID or Campaign ID if applicable
  amount: number; // in AOA (Kwanza)
  
  // Payment confirmation details
  paymentMethod: string; // selected payment method
  paymentBank: string; // destination bank
  originBank?: string; // origin bank
  txId: string; // transaction identifier
  holderName: string; // account holder name who paid
  paymentDate: string; // user reported payment date
  paymentTime?: string; // user reported payment time
  proofImage?: string; // Base64 representation or file URL of receipt
  notes?: string;
  
  // Status and logs
  status: PaymentStatus;
  createdAt: string;
  confirmedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  invoiceStatus: InvoiceStatus;
  history: AuditLog[];
}

// Default payment methods (highly extensible)
export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'transfer_bancaria', name: 'Transferência Bancária', isActive: true, description: 'Transferência através do Multicaixa ou Homebanking' },
  { id: 'multicaixa_express', name: 'Multicaixa Express', isActive: true, description: 'Pagamento instantâneo via telemóvel' },
];

export class PaymentService {
  private static orders: PaymentOrder[] = [];
  private static paymentMethods: PaymentMethod[] = [...DEFAULT_PAYMENT_METHODS];

  /**
   * Retrieves all payment orders
   */
  public static getOrders(): PaymentOrder[] {
    return this.orders;
  }

  /**
   * Saves payment orders
   */
  private static saveOrders(orders: PaymentOrder[]): void {
    this.orders = orders;
  }

  /**
   * Retrieves active payment methods
   */
  public static getPaymentMethods(): PaymentMethod[] {
    return this.paymentMethods;
  }

  /**
   * Updates or adds a payment method
   */
  public static savePaymentMethods(methods: PaymentMethod[]): void {
    this.paymentMethods = methods;
  }

  /**
   * Creates a new manual payment order.
   * Generates a unique padded sequence number (e.g., 000001).
   */
  public static createOrder(
    orderInput: Omit<PaymentOrder, 'id' | 'code' | 'status' | 'createdAt' | 'invoiceStatus' | 'history'>
  ): PaymentOrder {
    const orders = this.getOrders();
    
    // Generate sequential order ID: "000001", "000002", etc.
    const nextNum = orders.length + 1;
    const orderId = String(nextNum).padStart(6, '0');
    
    // Generate unique internal tracking code
    const internalCode = 'NOSSOSNEG-' + generateId('TX').toUpperCase();

    const timestamp = new Date().toISOString();
    
    const newOrder: PaymentOrder = {
      ...orderInput,
      id: orderId,
      code: internalCode,
      status: 'pending',
      createdAt: timestamp,
      invoiceStatus: 'ready_for_billing',
      history: [
        {
          timestamp,
          action: 'Criação do Pedido',
          operator: orderInput.userName,
          details: `Pedido de pagamento criado manualmente para ${orderInput.itemName} no valor de ${orderInput.amount} Kz. Estado: Aguardando Validação.`
        }
      ]
    };

    orders.unshift(newOrder); // Add to beginning of list
    this.saveOrders(orders);
    
    return newOrder;
  }

  /**
   * Confirms a payment after checking the bank statement.
   * Activates the purchased item/feature and logs audit details.
   */
  public static confirmOrder(orderId: string, operator: string): PaymentOrder {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error(`Pedido com ID ${orderId} não encontrado.`);
    }

    const order = orders[orderIndex];
    if (order.status !== 'pending') {
      throw new Error(`Este pedido já se encontra no estado: ${order.status}`);
    }

    const timestamp = new Date().toISOString();
    
    const updatedOrder: PaymentOrder = {
      ...order,
      status: 'confirmed',
      confirmedAt: timestamp,
      invoiceStatus: 'ready_for_billing',
      history: [
        ...order.history,
        {
          timestamp,
          action: 'Confirmação de Pagamento',
          operator: operator,
          details: `Pagamento validado no extrato bancário. Estado alterado para Confirmado. Ativação automática do plano / destaque efetuada. Pronto para Faturação.`
        }
      ]
    };

    orders[orderIndex] = updatedOrder;
    this.saveOrders(orders);

    return updatedOrder;
  }

  /**
   * Rejects a payment with a mandatory reason.
   */
  public static rejectOrder(orderId: string, reason: string, operator: string): PaymentOrder {
    if (!reason.trim()) {
      throw new Error('O motivo de rejeição é estritamente obrigatório.');
    }

    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error(`Pedido com ID ${orderId} não encontrado.`);
    }

    const order = orders[orderIndex];
    if (order.status !== 'pending') {
      throw new Error(`Este pedido já se encontra no estado: ${order.status}`);
    }

    const timestamp = new Date().toISOString();

    const updatedOrder: PaymentOrder = {
      ...order,
      status: 'rejected',
      rejectedAt: timestamp,
      rejectionReason: reason,
      history: [
        ...order.history,
        {
          timestamp,
          action: 'Rejeição de Pagamento',
          operator: operator,
          details: `Pagamento rejeitado pelo administrador. Motivo: "${reason}".`
        }
      ]
    };

    orders[orderIndex] = updatedOrder;
    this.saveOrders(orders);

    return updatedOrder;
  }

  /**
   * Cancels an order (e.g., if user cancels or requests cancellation).
   */
  public static cancelOrder(orderId: string, operator: string): PaymentOrder {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error(`Pedido com ID ${orderId} não encontrado.`);
    }

    const order = orders[orderIndex];
    const timestamp = new Date().toISOString();

    const updatedOrder: PaymentOrder = {
      ...order,
      status: 'canceled',
      history: [
        ...order.history,
        {
          timestamp,
          action: 'Cancelamento do Pedido',
          operator: operator,
          details: 'O pedido de pagamento foi cancelado.'
        }
      ]
    };

    orders[orderIndex] = updatedOrder;
    this.saveOrders(orders);

    return updatedOrder;
  }

  /**
   * Helper to format a sequencial ID (e.g. 1 -> "Pedido Nº 000001")
   */
  public static formatOrderId(id: string): string {
    return `Pedido Nº ${id}`;
  }

  /**
   * Integration point for Future payment gateways (e.g., EasyPay, EMIS, Pagali)
   */
  public static async processAutomaticGatewayPayment(orderId: string): Promise<{ success: boolean; gatewayTxId?: string; error?: string }> {
    return { success: true, gatewayTxId: 'GATEWAY_EMIS_INTEGRATION_PENDING' };
  }

  /**
   * Integration point for Future invoicing softwares approved by AGT (e.g. Primavera, PHC, InvoiceXpress)
   */
  public static async issueAgtCertifiedInvoice(orderId: string): Promise<{ success: boolean; invoiceNumber?: string; hash?: string }> {
    return {
      success: true,
      invoiceNumber: `FT-PENDING`,
      hash: 'AGT_INTEGRATION_PENDING'
    };
  }
}
