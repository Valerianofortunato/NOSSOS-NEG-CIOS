import { 
  User, 
  Product, 
  Category, 
  SystemStats, 
  AdCampaign, 
  VerificationSubmission, 
  UserRating, 
  Report, 
  Conversation, 
  ChatMessage, 
  ChatNotification, 
  CommissionNegotiation, 
  Transaction, 
  ProductComment,
  JobCandidacy
} from '../types';
import { PaymentOrder } from './PaymentService';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_CAMPAIGNS, INITIAL_STATS } from '../mockData';
import { supabase } from '../lib/supabase';

// Local storage helper functions
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`nossosneg_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error loading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`nossosneg_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

// Convert camelCase <-> snake_case helpers
function camelToSnakeUser(user: any): any {
  if (!user) return user;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    account_type: user.accountType,
    referral_code: user.referralCode,
    referrals_count: user.referralsCount || 0,
    is_verified: user.isVerified || false,
    is_suspended: user.isSuspended || false,
    is_admin: user.isAdmin || false,
    avatar: user.avatar,
    rating: user.rating || 5,
    ratings_count: user.ratingsCount || 0,
    wallet_balance: user.walletBalance || 0,
    password: user.password,
    created_at: user.createdAt || new Date().toISOString()
  };
}

function snakeToCamelUser(user: any): User {
  if (!user) return user;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    accountType: user.account_type || 'cliente',
    referralCode: user.referral_code,
    referralsCount: user.referrals_count || 0,
    isVerified: !!user.is_verified,
    isSuspended: !!user.is_suspended,
    isAdmin: !!user.is_admin,
    avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    rating: Number(user.rating) || 5,
    ratingsCount: Number(user.ratings_count) || 0,
    walletBalance: Number(user.wallet_balance) || 0,
    createdAt: user.created_at || new Date().toISOString()
  };
}

function camelToSnakeProduct(p: any): any {
  if (!p) return p;
  return {
    id: p.id,
    seller_id: p.sellerId,
    seller_name: p.sellerName,
    seller_type: p.sellerType || 'cliente',
    title: p.title,
    description: p.description,
    price: p.price,
    category: p.category,
    images: p.images || [],
    likes: p.likes || 0,
    liked_by: p.likedBy || [],
    comments: p.comments || [],
    condition: p.condition || 'usado',
    is_promoted: p.isPromoted || false,
    views: p.views || 0,
    clicks: p.clicks || 0,
    messages_count: p.messagesCount || 0,
    commission_rate: p.commissionRate || 0,
    created_at: p.createdAt || new Date().toISOString()
  };
}

function snakeToCamelProduct(p: any): Product {
  if (!p) return p;
  return {
    id: p.id,
    sellerId: p.seller_id,
    sellerName: p.seller_name,
    sellerType: p.seller_type || 'cliente',
    title: p.title,
    description: p.description,
    price: Number(p.price) || 0,
    category: p.category,
    images: p.images || [],
    likes: Number(p.likes) || 0,
    likedBy: p.liked_by || [],
    comments: p.comments || [],
    condition: p.condition || 'usado',
    isPromoted: !!p.is_promoted,
    views: Number(p.views) || 0,
    clicks: Number(p.clicks) || 0,
    messagesCount: Number(p.messages_count) || 0,
    commissionRate: p.commission_rate ? Number(p.commission_rate) : undefined,
    createdAt: p.created_at || new Date().toISOString()
  };
}

export class DataService {
  // =========================================================================
  // FILE UPLOAD (SUPABASE STORAGE WITH BASE64 FALLBACK)
  // =========================================================================
  public static async uploadFile(
    bucket: 'avatars' | 'products' | 'companies' | 'documents' | 'banners',
    fileName: string,
    fileData: string | Blob
  ): Promise<string> {
    try {
      if (typeof fileData === 'string' && fileData.startsWith('http')) {
        return fileData;
      }

      let blobToUpload: Blob;
      if (typeof fileData === 'string') {
        if (fileData.startsWith('data:')) {
          const arr = fileData.split(',');
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/png';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          blobToUpload = new Blob([u8arr], { type: mime });
        } else {
          return fileData;
        }
      } else {
        blobToUpload = fileData;
      }

      const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(cleanFileName, blobToUpload, { upsert: true });

      if (error) {
        console.warn(`Supabase Storage upload fallback:`, error.message);
        if (typeof fileData === 'string') return fileData;
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blobToUpload);
        });
      }

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return publicData.publicUrl;
    } catch (err: any) {
      if (typeof fileData === 'string') return fileData;
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(fileData as Blob);
      });
    }
  }

  // =========================================================================
  // AUTHENTICATION & PROFILES
  // =========================================================================
  public static async signUp(
    name: string,
    email: string,
    phone: string,
    password: string,
    accountType: string,
    extraMeta: any = {}
  ): Promise<User> {
    const cleanEmail = email.toLowerCase().trim();

    const profiles = getItem<User[]>('profiles', INITIAL_USERS);
    const existing = profiles.find(p => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('Já existe um utilizador registado com este e-mail.');
    }

    const userId = 'user_' + Math.random().toString(36).substring(2, 9);
    const referralCode = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser: User & { password?: string } = {
      id: userId,
      name,
      email: cleanEmail,
      phone,
      accountType: accountType as any,
      referralCode,
      referralsCount: 0,
      isVerified: false,
      isSuspended: false,
      avatar: extraMeta.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      rating: 5,
      ratingsCount: 0,
      walletBalance: 0,
      password,
      createdAt: new Date().toISOString(),
      ...extraMeta
    };

    try {
      const dbUser = camelToSnakeUser(newUser);
      await supabase.from('profiles').insert([dbUser]);
    } catch (e) {
      // Stored locally
    }

    profiles.unshift(newUser);
    setItem('profiles', profiles);
    setItem('session_user_id', userId);

    const { password: _, ...cleanUser } = newUser;
    return cleanUser as User;
  }

  public static async signIn(email: string, password: string): Promise<User> {
    const cleanEmail = email.toLowerCase().trim();

    if ((cleanEmail === 'nossosnegocios.ao@gmail.com' || cleanEmail === 'admin') && (password === 'Valerio123#' || password === 'admin')) {
      const profiles = getItem<(User & { password?: string })[]>('profiles', INITIAL_USERS);
      let adminUser = profiles.find(p => p.id === 'user_admin' || p.email.toLowerCase() === 'nossosnegocios.ao@gmail.com');
      if (!adminUser) {
        adminUser = {
          id: 'user_admin',
          name: 'Administrador',
          email: 'nossosnegocios.ao@gmail.com',
          phone: '+244 923 000 000',
          accountType: 'empresa',
          referralCode: 'ADMIN001',
          referralsCount: 0,
          isVerified: true,
          isSuspended: false,
          isAdmin: true,
          avatar: '/admin_avatar.png',
          rating: 5,
          ratingsCount: 0,
          walletBalance: 0,
          password: 'Valerio123#',
          createdAt: new Date().toISOString()
        };
        profiles.unshift(adminUser);
        setItem('profiles', profiles);
      }
      setItem('session_user_id', adminUser.id);
      const { password: _, ...cleanUser } = adminUser;
      return cleanUser as User;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.eq.${cleanEmail},phone.eq.${cleanEmail}`)
        .single();

      if (data && !error) {
        if (data.password && data.password !== password) {
          throw new Error('E-mail ou palavra-passe incorretos.');
        }
        if (data.is_suspended) {
          throw new Error('A sua conta encontra-se suspensa.');
        }
        const user = snakeToCamelUser(data);
        setItem('session_user_id', user.id);
        return user;
      }
    } catch (err: any) {
      if (err.message?.includes('incorretos') || err.message?.includes('suspensa')) {
        throw err;
      }
    }

    const profiles = getItem<(User & { password?: string })[]>('profiles', INITIAL_USERS);
    const user = profiles.find(p => p.email.toLowerCase().trim() === cleanEmail || p.phone?.trim() === cleanEmail);

    if (!user) {
      throw new Error('E-mail ou palavra-passe incorretos.');
    }

    if (user.password && user.password !== password) {
      throw new Error('E-mail ou palavra-passe incorretos.');
    }

    if (user.isSuspended) {
      throw new Error('A sua conta encontra-se suspensa.');
    }

    setItem('session_user_id', user.id);
    const { password: _, ...cleanUser } = user;
    return cleanUser as User;
  }

  public static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem('nossosneg_session_user_id');
  }

  public static async resetPassword(email: string): Promise<void> {
    const cleanEmail = email.toLowerCase().trim();
    try {
      await supabase.auth.resetPasswordForEmail(cleanEmail);
    } catch (e) {}
    const profiles = getItem<User[]>('profiles', INITIAL_USERS);
    const user = profiles.find(p => p.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('Utilizador não encontrado.');
    }
  }

  public static async updatePassword(password: string): Promise<void> {
    const currentId = getItem<string | null>('session_user_id', null);
    if (!currentId) throw new Error('Sessão expirada.');
    
    try {
      await supabase.from('profiles').update({ password }).eq('id', currentId);
    } catch (e) {}

    const profiles = getItem<(User & { password?: string })[]>('profiles', INITIAL_USERS);
    const index = profiles.findIndex(p => p.id === currentId);
    if (index !== -1) {
      profiles[index].password = password;
      setItem('profiles', profiles);
    }
  }

  public static async updateEmail(email: string): Promise<void> {
    const currentId = getItem<string | null>('session_user_id', null);
    if (!currentId) throw new Error('Sessão expirada.');

    try {
      await supabase.from('profiles').update({ email }).eq('id', currentId);
    } catch (e) {}

    const profiles = getItem<User[]>('profiles', INITIAL_USERS);
    const index = profiles.findIndex(p => p.id === currentId);
    if (index !== -1) {
      profiles[index].email = email;
      setItem('profiles', profiles);
    }
  }

  public static async getCurrentSessionUser(): Promise<User | null> {
    const currentId = getItem<string | null>('session_user_id', null);
    if (!currentId) return null;
    try {
      return await this.getProfile(currentId);
    } catch {
      return null;
    }
  }

  public static async getProfile(userId: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        return snakeToCamelUser(data);
      }
    } catch (e) {}

    const profiles = getItem<User[]>('profiles', INITIAL_USERS);
    const profile = profiles.find(p => p.id === userId);
    if (!profile) {
      throw new Error(`Perfil não encontrado: ${userId}`);
    }
    return profile;
  }

  public static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.isVerified !== undefined) dbUpdates.is_verified = updates.isVerified;
    if (updates.isSuspended !== undefined) dbUpdates.is_suspended = updates.isSuspended;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.ratingsCount !== undefined) dbUpdates.ratings_count = updates.ratingsCount;
    if (updates.walletBalance !== undefined) dbUpdates.wallet_balance = updates.walletBalance;

    try {
      await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    } catch (e) {}

    const profiles = getItem<User[]>('profiles', INITIAL_USERS);
    const index = profiles.findIndex(p => p.id === userId);
    if (index === -1) throw new Error('Perfil não encontrado.');

    const updated = {
      ...profiles[index],
      ...updates
    };
    profiles[index] = updated;
    setItem('profiles', profiles);
    return updated;
  }

  public static async listProfiles(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (data && data.length > 0 && !error) {
        const camelProfiles = data.map(snakeToCamelUser);
        setItem('profiles', camelProfiles);
        return camelProfiles;
      }
    } catch (e) {}
    return getItem<User[]>('profiles', INITIAL_USERS);
  }

  // =========================================================================
  // PRODUCTS
  // =========================================================================
  public static async createProduct(product: Omit<Product, 'likes' | 'comments' | 'views' | 'clicks' | 'messagesCount'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      likes: 0,
      likedBy: [],
      comments: [],
      views: 0,
      clicks: 0,
      messagesCount: 0,
      createdAt: product.createdAt || new Date().toISOString()
    };

    try {
      const dbProduct = camelToSnakeProduct(newProduct);
      await supabase.from('products').insert([dbProduct]);
    } catch (e) {}

    const products = getItem<Product[]>('products', INITIAL_PRODUCTS);
    products.unshift(newProduct);
    setItem('products', products);
    return newProduct;
  }

  public static async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.isPromoted !== undefined) dbUpdates.is_promoted = updates.isPromoted;
    if (updates.likes !== undefined) dbUpdates.likes = updates.likes;
    if (updates.likedBy !== undefined) dbUpdates.liked_by = updates.likedBy;
    if (updates.comments !== undefined) dbUpdates.comments = updates.comments;
    if (updates.views !== undefined) dbUpdates.views = updates.views;
    if (updates.clicks !== undefined) dbUpdates.clicks = updates.clicks;
    if (updates.messagesCount !== undefined) dbUpdates.messages_count = updates.messagesCount;
    if (updates.commissionRate !== undefined) dbUpdates.commission_rate = updates.commissionRate;

    try {
      await supabase.from('products').update(dbUpdates).eq('id', productId);
    } catch (e) {}

    const products = getItem<Product[]>('products', INITIAL_PRODUCTS);
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) throw new Error('Anúncio não encontrado.');

    const updated = {
      ...products[index],
      ...updates
    };
    products[index] = updated;
    setItem('products', products);
    return updated;
  }

  public static async deleteProduct(productId: string): Promise<void> {
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (e) {}

    let products = getItem<Product[]>('products', INITIAL_PRODUCTS);
    products = products.filter(p => p.id !== productId);
    setItem('products', products);
  }

  public static async listProducts(category: string = 'all', showOnlySellerId?: string): Promise<Product[]> {
    try {
      let query = supabase.from('products').select('*');
      if (category !== 'all') {
        query = query.eq('category', category);
      }
      if (showOnlySellerId) {
        query = query.eq('seller_id', showOnlySellerId);
      }
      const { data, error } = await query;
      if (data && data.length > 0 && !error) {
        return data.map(snakeToCamelProduct);
      }
    } catch (e) {}

    let products = getItem<Product[]>('products', INITIAL_PRODUCTS);
    if (category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    if (showOnlySellerId) {
      products = products.filter(p => p.sellerId === showOnlySellerId);
    }
    return products;
  }

  public static async toggleLikeProduct(productId: string, userId: string): Promise<Product> {
    const products = getItem<Product[]>('products', INITIAL_PRODUCTS);
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) throw new Error('Produto não encontrado.');

    const p = products[index];
    const likedBy = p.likedBy || [];
    const userIndex = likedBy.indexOf(userId);
    let updatedLikes = p.likes || 0;

    if (userIndex === -1) {
      likedBy.push(userId);
      updatedLikes += 1;
    } else {
      likedBy.splice(userIndex, 1);
      updatedLikes = Math.max(0, updatedLikes - 1);
    }

    p.likedBy = likedBy;
    p.likes = updatedLikes;
    products[index] = p;
    setItem('products', products);

    try {
      await supabase.from('products').update({
        likes: updatedLikes,
        liked_by: likedBy
      }).eq('id', productId);
    } catch (e) {}

    return p;
  }

  public static async addComment(
    productId: string,
    commentId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    text: string
  ): Promise<void> {
    const products = getItem<Product[]>('products', INITIAL_PRODUCTS);
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      const p = products[index];
      const comments = p.comments || [];
      const newComment = {
        id: commentId || 'comment_' + Math.random().toString(36).substring(2, 9),
        userName,
        userAvatar: userAvatar || '/admin_avatar.png',
        text,
        createdAt: new Date().toISOString()
      };
      comments.push(newComment);
      p.comments = comments;
      products[index] = p;
      setItem('products', products);

      try {
        await supabase.from('products').update({ comments }).eq('id', productId);
      } catch (e) {}
    }
  }

  public static async deleteComment(commentId: string): Promise<void> {
    const products = getItem<Product[]>('products', INITIAL_PRODUCTS);
    for (let i = 0; i < products.length; i++) {
      if (products[i].comments) {
        products[i].comments = products[i].comments!.filter(c => c.id !== commentId);
        try {
          await supabase.from('products').update({ comments: products[i].comments }).eq('id', products[i].id);
        } catch (e) {}
      }
    }
    setItem('products', products);
  }

  public static async addFavorite(userId: string, productId: string): Promise<void> {
    try {
      await supabase.from('favorites').insert([{ user_id: userId, product_id: productId }]);
    } catch (e) {}

    const favorites = getItem<{ userId: string; productId: string }[]>('favorites', []);
    if (!favorites.some(f => f.userId === userId && f.productId === productId)) {
      favorites.push({ userId, productId });
      setItem('favorites', favorites);
    }
  }

  public static async removeFavorite(userId: string, productId: string): Promise<void> {
    try {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('product_id', productId);
    } catch (e) {}

    let favorites = getItem<{ userId: string; productId: string }[]>('favorites', []);
    favorites = favorites.filter(f => !(f.userId === userId && f.productId === productId));
    setItem('favorites', favorites);
  }

  public static async listFavorites(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.from('favorites').select('product_id').eq('user_id', userId);
      if (data && !error) {
        return data.map(f => f.product_id);
      }
    } catch (e) {}

    const favorites = getItem<{ userId: string; productId: string }[]>('favorites', []);
    return favorites.filter(f => f.userId === userId).map(f => f.productId);
  }

  // =========================================================================
  // CHAT & MESSAGES
  // =========================================================================
  public static async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (data && !error) {
        const convs: Conversation[] = [];
        for (const c of data) {
          const { data: msgs } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', c.id)
            .order('created_at', { ascending: true });

          convs.push({
            id: c.id,
            productId: c.product_id,
            productTitle: c.product_title,
            productPrice: c.product_price ? Number(c.product_price) : 0,
            productImage: c.product_image,
            buyerId: c.buyer_id,
            buyerName: c.buyer_name,
            buyerAvatar: c.buyer_avatar,
            sellerId: c.seller_id,
            sellerName: c.seller_name,
            sellerAvatar: c.seller_avatar,
            isReadByBuyer: !!c.is_read_by_buyer,
            isReadBySeller: !!c.is_read_by_seller,
            createdAt: c.created_at,
            messages: (msgs || []).map((m: any) => ({
              id: m.id,
              senderId: m.sender_id,
              senderName: m.sender_name,
              text: m.text,
              imageUrl: m.image_url,
              timestamp: m.created_at
            }))
          });
        }
        return convs;
      }
    } catch (e) {}

    const conversations = getItem<Conversation[]>('conversations', []);
    return conversations.filter(c => c.buyerId === userId || c.sellerId === userId);
  }

  public static async createConversation(conversation: Omit<Conversation, 'messages'>): Promise<Conversation> {
    const newConv: Conversation = {
      ...conversation,
      messages: [],
      createdAt: conversation.createdAt || new Date().toISOString()
    };

    try {
      await supabase.from('conversations').insert([{
        id: newConv.id,
        product_id: newConv.productId,
        product_title: newConv.productTitle,
        product_price: newConv.productPrice,
        product_image: newConv.productImage,
        buyer_id: newConv.buyerId,
        buyer_name: newConv.buyerName,
        buyer_avatar: newConv.buyerAvatar,
        seller_id: newConv.sellerId,
        seller_name: newConv.sellerName,
        seller_avatar: newConv.sellerAvatar,
        is_read_by_buyer: newConv.isReadByBuyer,
        is_read_by_seller: newConv.isReadBySeller,
        created_at: newConv.createdAt
      }]);
    } catch (e) {}

    const conversations = getItem<Conversation[]>('conversations', []);
    conversations.unshift(newConv);
    setItem('conversations', conversations);
    return newConv;
  }

  public static async addChatMessage(
    conversationId: string,
    messageId: string,
    senderId: string,
    senderName: string,
    text: string,
    imageUrl?: string
  ): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      id: messageId || 'msg_' + Math.random().toString(36).substring(2, 9),
      senderId,
      senderName,
      text,
      imageUrl,
      timestamp: new Date().toISOString()
    };

    try {
      await supabase.from('chat_messages').insert([{
        id: newMsg.id,
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: senderName,
        text,
        image_url: imageUrl,
        created_at: newMsg.timestamp
      }]);

      await supabase.from('conversations').update({
        last_message: text || '[Imagem]',
        last_message_time: newMsg.timestamp
      }).eq('id', conversationId);
    } catch (e) {}

    const conversations = getItem<Conversation[]>('conversations', []);
    const convIndex = conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      conversations[convIndex].messages.push(newMsg);
      setItem('conversations', conversations);
    }
    return newMsg;
  }

  public static async updateConversationReadStatus(
    conversationId: string,
    userId: string,
    isRead: boolean
  ): Promise<void> {
    const conversations = getItem<Conversation[]>('conversations', []);
    const convIndex = conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      const updates: any = {};
      if (conversations[convIndex].buyerId === userId) {
        conversations[convIndex].isReadByBuyer = isRead;
        updates.is_read_by_buyer = isRead;
      } else if (conversations[convIndex].sellerId === userId) {
        conversations[convIndex].isReadBySeller = isRead;
        updates.is_read_by_seller = isRead;
      }
      setItem('conversations', conversations);

      try {
        await supabase.from('conversations').update(updates).eq('id', conversationId);
      } catch (e) {}
    }
  }

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================
  public static async getNotifications(userId: string): Promise<ChatNotification[]> {
    try {
      const { data, error } = await supabase.from('notifications').select('*').eq('target_user_id', userId).order('created_at', { ascending: false });
      if (data && !error) {
        return data.map((n: any) => ({
          id: n.id,
          targetUserId: n.target_user_id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: !!n.is_read,
          createdAt: n.created_at
        }));
      }
    } catch (e) {}

    const notifs = getItem<ChatNotification[]>('notifications', []);
    return notifs.filter(n => n.targetUserId === userId);
  }

  public static async createNotification(notif: ChatNotification): Promise<ChatNotification> {
    const newNotif: ChatNotification = {
      ...notif,
      id: notif.id || 'notif_' + Math.random().toString(36).substring(2, 9),
      isRead: notif.isRead ?? false,
      createdAt: notif.createdAt || new Date().toISOString()
    };

    try {
      await supabase.from('notifications').insert([{
        id: newNotif.id,
        target_user_id: newNotif.targetUserId,
        title: newNotif.title,
        message: newNotif.message,
        type: newNotif.type,
        is_read: newNotif.isRead,
        created_at: newNotif.createdAt
      }]);
    } catch (e) {}

    const notifs = getItem<ChatNotification[]>('notifications', []);
    notifs.unshift(newNotif);
    setItem('notifications', notifs);
    return newNotif;
  }

  public static async markNotificationAsRead(notifId: string): Promise<void> {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    } catch (e) {}

    const notifs = getItem<ChatNotification[]>('notifications', []);
    const index = notifs.findIndex(n => n.id === notifId);
    if (index !== -1) {
      notifs[index].isRead = true;
      setItem('notifications', notifs);
    }
  }

  // =========================================================================
  // USER RATINGS
  // =========================================================================
  public static async addReview(review: UserRating): Promise<void> {
    const newReview: UserRating = {
      ...review,
      id: review.id || 'review_' + Math.random().toString(36).substring(2, 9),
      createdAt: review.createdAt || new Date().toISOString()
    };

    try {
      await supabase.from('user_ratings').insert([{
        id: newReview.id,
        target_id: newReview.targetId,
        author_id: newReview.reviewerId,
        author_name: newReview.reviewerName,
        author_avatar: newReview.reviewerAvatar,
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: newReview.createdAt
      }]);
    } catch (e) {}

    const reviews = getItem<UserRating[]>('reviews', []);
    reviews.unshift(newReview);
    setItem('reviews', reviews);

    const userReviews = reviews.filter(r => r.targetId === review.targetId);
    if (userReviews.length > 0) {
      const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
      await this.updateProfile(review.targetId, {
        rating: parseFloat(avg.toFixed(1)),
        ratingsCount: userReviews.length
      });
    }
  }

  public static async getReviews(targetUserId: string): Promise<UserRating[]> {
    try {
      const { data, error } = await supabase.from('user_ratings').select('*').eq('target_id', targetUserId);
      if (data && !error) {
        return data.map((r: any) => ({
          id: r.id,
          targetId: r.target_id,
          reviewerId: r.author_id,
          reviewerName: r.author_name,
          reviewerAvatar: r.author_avatar,
          rating: Number(r.rating),
          comment: r.comment,
          createdAt: r.created_at
        }));
      }
    } catch (e) {}

    const reviews = getItem<UserRating[]>('reviews', []);
    return reviews.filter(r => r.targetId === targetUserId);
  }

  // =========================================================================
  // NEGOTIATIONS
  // =========================================================================
  public static async createCommissionNegotiation(neg: CommissionNegotiation): Promise<CommissionNegotiation> {
    const newNeg: CommissionNegotiation = {
      ...neg,
      id: neg.id || 'neg_' + Math.random().toString(36).substring(2, 9),
      status: neg.status || 'pending',
      submittedAt: neg.submittedAt || new Date().toISOString(),
      createdAt: neg.createdAt || new Date().toISOString()
    };

    try {
      await supabase.from('commission_negotiations').insert([{
        id: newNeg.id,
        product_id: newNeg.productId,
        product_title: newNeg.productTitle,
        seller_id: newNeg.sellerId || newNeg.userId,
        seller_name: newNeg.sellerName || newNeg.userName,
        requested_percentage: newNeg.requestedRate,
        status: newNeg.status,
        submitted_at: newNeg.submittedAt,
        created_at: newNeg.createdAt
      }]);
    } catch (e) {}

    const negotiations = getItem<CommissionNegotiation[]>('negotiations', []);
    negotiations.unshift(newNeg);
    setItem('negotiations', negotiations);
    return newNeg;
  }

  public static async getCommissionNegotiations(): Promise<CommissionNegotiation[]> {
    try {
      const { data, error } = await supabase.from('commission_negotiations').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        return data.map((n: any) => ({
          id: n.id,
          productId: n.product_id,
          productTitle: n.product_title,
          sellerId: n.seller_id,
          sellerName: n.seller_name,
          requestedRate: Number(n.requested_percentage || n.requested_rate || 0),
          status: n.status,
          submittedAt: n.submitted_at,
          createdAt: n.created_at
        }));
      }
    } catch (e) {}

    return getItem<CommissionNegotiation[]>('negotiations', []);
  }

  public static async updateCommissionNegotiationStatus(negId: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
      await supabase.from('commission_negotiations').update({ status }).eq('id', negId);
    } catch (e) {}

    const negotiations = getItem<CommissionNegotiation[]>('negotiations', []);
    const index = negotiations.findIndex(n => n.id === negId);
    if (index !== -1) {
      negotiations[index].status = status;
      setItem('negotiations', negotiations);
    }
  }

  // =========================================================================
  // TRANSACTIONS
  // =========================================================================
  public static async createTransaction(tx: Transaction): Promise<Transaction> {
    const newTx: Transaction = {
      ...tx,
      id: tx.id || 'tx_' + Math.random().toString(36).substring(2, 9),
      status: tx.status || 'pending',
      messages: [],
      createdAt: tx.createdAt || new Date().toISOString()
    };

    try {
      await supabase.from('transactions').insert([{
        id: newTx.id,
        product_id: newTx.productId,
        product_title: newTx.productTitle,
        buyer_id: newTx.buyerId,
        buyer_name: newTx.buyerName,
        seller_id: newTx.sellerId,
        seller_name: newTx.sellerName,
        commission_percentage: newTx.commissionRate || 0,
        commission_amount: newTx.commissionAmount || 0,
        seller_payout: newTx.finalPayout || 0,
        status: newTx.status,
        messages: newTx.messages,
        created_at: newTx.createdAt
      }]);
    } catch (e) {}

    const transactions = getItem<Transaction[]>('transactions', []);
    transactions.unshift(newTx);
    setItem('transactions', transactions);
    return newTx;
  }

  public static async getTransactions(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        return data.map((t: any) => ({
          id: t.id,
          productId: t.product_id,
          productTitle: t.product_title,
          buyerId: t.buyer_id,
          buyerName: t.buyer_name,
          sellerId: t.seller_id,
          sellerName: t.seller_name,
          commissionRate: Number(t.commission_percentage || 0),
          commissionAmount: Number(t.commission_amount || 0),
          finalPayout: Number(t.seller_payout || 0),
          status: t.status,
          messages: t.messages || [],
          createdAt: t.created_at
        }));
      }
    } catch (e) {}

    return getItem<Transaction[]>('transactions', []);
  }

  public static async updateTransactionStatus(txId: string, status: string): Promise<void> {
    try {
      await supabase.from('transactions').update({ status }).eq('id', txId);
    } catch (e) {}

    const transactions = getItem<Transaction[]>('transactions', []);
    const index = transactions.findIndex(t => t.id === txId);
    if (index !== -1) {
      transactions[index].status = status as any;
      setItem('transactions', transactions);
    }
  }

  // =========================================================================
  // PAYMENT ORDERS
  // =========================================================================
  public static async createPaymentOrder(order: PaymentOrder): Promise<PaymentOrder> {
    const newOrder: PaymentOrder = {
      ...order,
      status: order.status || 'pending',
      invoiceStatus: order.invoiceStatus || 'ready_for_billing',
      history: order.history || []
    };

    try {
      await supabase.from('payment_orders').insert([{
        id: newOrder.id,
        code: newOrder.code,
        user_id: newOrder.userId,
        user_name: newOrder.userName,
        user_email: newOrder.userEmail,
        user_phone: newOrder.userPhone,
        amount: newOrder.amount,
        payment_method: newOrder.paymentMethod,
        payment_bank: newOrder.paymentBank,
        item_type: newOrder.itemType,
        item_id: newOrder.itemId,
        item_name: newOrder.itemName,
        target_id: newOrder.targetId,
        tx_id: newOrder.txId,
        holder_name: newOrder.holderName,
        payment_date: newOrder.paymentDate,
        proof_image: newOrder.proofImage,
        status: newOrder.status,
        invoice_status: newOrder.invoiceStatus,
        history: newOrder.history,
        created_at: newOrder.createdAt
      }]);
    } catch (e) {}

    const orders = getItem<PaymentOrder[]>('payment_orders', []);
    orders.unshift(newOrder);
    setItem('payment_orders', orders);
    return newOrder;
  }

  public static async getPaymentOrders(): Promise<PaymentOrder[]> {
    try {
      const { data, error } = await supabase.from('payment_orders').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        return data.map((o: any) => ({
          id: o.id,
          code: o.code || o.id,
          userId: o.user_id,
          userName: o.user_name,
          userEmail: o.user_email || '',
          userPhone: o.user_phone || '',
          itemType: o.item_type || 'subscription',
          itemId: o.item_id || 'plan',
          itemName: o.item_name || o.item_title || 'Plano',
          targetId: o.target_id,
          amount: Number(o.amount) || 0,
          paymentMethod: o.payment_method || 'transfer_bancaria',
          paymentBank: o.payment_bank || 'BAI',
          originBank: o.origin_bank,
          txId: o.tx_id || '',
          holderName: o.holder_name || '',
          paymentDate: o.payment_date || new Date().toISOString(),
          paymentTime: o.payment_time,
          proofImage: o.proof_image || o.proof_file_url,
          notes: o.notes || o.proof_notes,
          status: o.status,
          invoiceStatus: o.invoice_status || 'ready_for_billing',
          history: o.history || [],
          createdAt: o.created_at
        }));
      }
    } catch (e) {}

    return getItem<PaymentOrder[]>('payment_orders', []);
  }

  public static async updatePaymentOrderStatus(
    orderId: string,
    status: any,
    updates: Partial<PaymentOrder>
  ): Promise<void> {
    const dbUpdates: any = { status };
    if (updates.invoiceStatus) dbUpdates.invoice_status = updates.invoiceStatus;
    if (updates.history) dbUpdates.history = updates.history;

    try {
      await supabase.from('payment_orders').update(dbUpdates).eq('id', orderId);
    } catch (e) {}

    const orders = getItem<PaymentOrder[]>('payment_orders', []);
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = {
        ...orders[index],
        status,
        ...updates
      };
      setItem('payment_orders', orders);
    }
  }

  // =========================================================================
  // AD CAMPAIGNS
  // =========================================================================
  public static async createAdCampaign(campaign: AdCampaign): Promise<AdCampaign> {
    const newCampaign: AdCampaign = {
      ...campaign,
      status: campaign.status || 'pending',
      durationMonths: campaign.durationMonths || 1,
      createdAt: campaign.createdAt || new Date().toISOString()
    };

    try {
      await supabase.from('ad_campaigns').insert([{
        id: newCampaign.id,
        company_name: newCampaign.companyName,
        contact_phone: newCampaign.contactPhone,
        banner_type: newCampaign.bannerType,
        target_category: newCampaign.targetCategory,
        image_url: newCampaign.imageUrl,
        link_url: newCampaign.linkUrl,
        price: newCampaign.price,
        status: newCampaign.status,
        duration_months: newCampaign.durationMonths,
        proof_image: newCampaign.proofImage,
        created_at: newCampaign.createdAt
      }]);
    } catch (e) {}

    const campaigns = getItem<AdCampaign[]>('ad_campaigns', INITIAL_CAMPAIGNS);
    campaigns.unshift(newCampaign);
    setItem('ad_campaigns', campaigns);
    return newCampaign;
  }

  public static async getAdCampaigns(): Promise<AdCampaign[]> {
    try {
      const { data, error } = await supabase.from('ad_campaigns').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        return data.map((c: any) => ({
          id: c.id,
          companyName: c.company_name || c.title || 'Empresa',
          contactPhone: c.contact_phone || '',
          bannerType: c.banner_type || 'inicial',
          targetCategory: c.target_category,
          imageUrl: c.image_url,
          linkUrl: c.link_url || c.target_url || '',
          price: Number(c.price) || 0,
          status: c.status,
          durationMonths: Number(c.duration_months) || 1,
          startDate: c.start_date,
          endDate: c.end_date,
          proofImage: c.proof_image,
          createdAt: c.created_at
        }));
      }
    } catch (e) {}

    return getItem<AdCampaign[]>('ad_campaigns', INITIAL_CAMPAIGNS);
  }

  public static async updateAdCampaignStatus(campaignId: string, status: string, updates: Partial<AdCampaign> = {}): Promise<void> {
    const dbUpdates: any = { status };
    if (updates.startDate) dbUpdates.start_date = updates.startDate;
    if (updates.endDate) dbUpdates.end_date = updates.endDate;

    try {
      await supabase.from('ad_campaigns').update(dbUpdates).eq('id', campaignId);
    } catch (e) {}

    const campaigns = getItem<AdCampaign[]>('ad_campaigns', INITIAL_CAMPAIGNS);
    const index = campaigns.findIndex(c => c.id === campaignId);
    if (index !== -1) {
      campaigns[index] = {
        ...campaigns[index],
        status: status as any,
        ...updates
      };
      setItem('ad_campaigns', campaigns);
    }
  }

  // =========================================================================
  // KYC SUBMISSIONS
  // =========================================================================
  public static async createKYCSubmission(sub: VerificationSubmission): Promise<VerificationSubmission> {
    const newSub: VerificationSubmission = {
      ...sub,
      status: sub.status || 'pending',
      submittedAt: sub.submittedAt || new Date().toISOString()
    };

    try {
      await supabase.from('kyc_submissions').insert([{
        id: newSub.id,
        user_id: newSub.userId,
        user_name: newSub.userName,
        status: newSub.status,
        rejection_reason: newSub.rejectionReason,
        submitted_at: newSub.submittedAt
      }]);
    } catch (e) {}

    const submissions = getItem<VerificationSubmission[]>('kyc_submissions', []);
    submissions.unshift(newSub);
    setItem('kyc_submissions', submissions);
    return newSub;
  }

  public static async getKYCSubmissions(): Promise<VerificationSubmission[]> {
    try {
      const { data, error } = await supabase.from('kyc_submissions').select('*').order('submitted_at', { ascending: false });
      if (data && !error) {
        return data.map((s: any) => ({
          id: s.id,
          userId: s.user_id,
          userName: s.user_name,
          status: s.status,
          rejectionReason: s.rejection_reason,
          submittedAt: s.submitted_at
        }));
      }
    } catch (e) {}

    return getItem<VerificationSubmission[]>('kyc_submissions', []);
  }

  public static async updateKYCStatus(subId: string, status: string, rejectionReason?: string): Promise<void> {
    try {
      await supabase.from('kyc_submissions').update({
        status,
        rejection_reason: rejectionReason || null
      }).eq('id', subId);
    } catch (e) {}

    const submissions = getItem<VerificationSubmission[]>('kyc_submissions', []);
    const index = submissions.findIndex(s => s.id === subId);
    if (index !== -1) {
      submissions[index].status = status as any;
      submissions[index].rejectionReason = rejectionReason || null as any;
      setItem('kyc_submissions', submissions);
    }
  }

  // =========================================================================
  // REPORTS
  // =========================================================================
  public static async createReport(report: Report): Promise<Report> {
    const newReport: Report = {
      ...report,
      status: report.status || 'pending',
      createdAt: report.createdAt || new Date().toISOString()
    };

    try {
      await supabase.from('reports').insert([{
        id: newReport.id,
        reporter_id: newReport.reporterId,
        reporter_name: newReport.reporterName,
        target_id: newReport.targetId,
        target_title: newReport.targetTitle,
        reason: newReport.reason,
        details: newReport.details,
        status: newReport.status,
        created_at: newReport.createdAt
      }]);
    } catch (e) {}

    const reports = getItem<Report[]>('reports', []);
    reports.unshift(newReport);
    setItem('reports', reports);
    return newReport;
  }

  public static async getReports(): Promise<Report[]> {
    try {
      const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        return data.map((r: any) => ({
          id: r.id,
          reporterId: r.reporter_id,
          reporterName: r.reporter_name,
          targetId: r.target_id,
          targetTitle: r.target_title,
          reason: r.reason,
          details: r.details || '',
          status: r.status,
          createdAt: r.created_at
        }));
      }
    } catch (e) {}

    return getItem<Report[]>('reports', []);
  }

  public static async updateReportStatus(reportId: string, status: string): Promise<void> {
    try {
      await supabase.from('reports').update({ status }).eq('id', reportId);
    } catch (e) {}

    const reports = getItem<Report[]>('reports', []);
    const index = reports.findIndex(r => r.id === reportId);
    if (index !== -1) {
      reports[index].status = status as any;
      setItem('reports', reports);
    }
  }

  // =========================================================================
  // JOB CANDIDACIES
  // =========================================================================
  public static async createJobCandidacy(cand: JobCandidacy): Promise<JobCandidacy> {
    const newCand: JobCandidacy = {
      ...cand,
      appliedAt: cand.appliedAt || new Date().toISOString(),
      status: cand.status || 'Pendente'
    };

    try {
      await supabase.from('job_candidacies').insert([{
        id: newCand.id,
        job_id: newCand.jobId,
        job_title: newCand.jobTitle,
        employer_id: newCand.employerId,
        candidate_id: newCand.candidateId,
        name: newCand.name,
        email: newCand.email,
        phone: newCand.phone,
        city: newCand.city,
        education: newCand.education,
        field_of_study: newCand.fieldOfStudy,
        experience_years: newCand.experienceYears,
        cover_letter: newCand.coverLetter,
        skills: newCand.skills,
        availability: newCand.availability,
        resume_file_url: newCand.resumeFileUrl,
        status: newCand.status,
        applied_at: newCand.appliedAt
      }]);
    } catch (e) {}

    const candidacies = getItem<JobCandidacy[]>('job_candidacies', []);
    candidacies.unshift(newCand);
    setItem('job_candidacies', candidacies);
    return newCand;
  }

  public static async getJobCandidacies(): Promise<JobCandidacy[]> {
    try {
      const { data, error } = await supabase.from('job_candidacies').select('*').order('applied_at', { ascending: false });
      if (data && !error) {
        return data.map((c: any) => ({
          id: c.id,
          jobId: c.job_id,
          jobTitle: c.job_title || 'Emprego',
          employerId: c.employer_id,
          candidateId: c.candidate_id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          city: c.city || 'Luanda',
          education: c.education || '',
          fieldOfStudy: c.field_of_study || '',
          experienceYears: Number(c.experience_years) || 0,
          coverLetter: c.cover_letter || '',
          skills: c.skills || '',
          availability: c.availability || 'Imediata',
          resumeFileUrl: c.resume_file_url,
          status: c.status || 'Pendente',
          appliedAt: c.applied_at
        }));
      }
    } catch (e) {}

    return getItem<JobCandidacy[]>('job_candidacies', []);
  }

  public static async updateJobCandidacyStatus(candId: string, status: string): Promise<void> {
    try {
      await supabase.from('job_candidacies').update({ status }).eq('id', candId);
    } catch (e) {}

    const candidacies = getItem<JobCandidacy[]>('job_candidacies', []);
    const index = candidacies.findIndex(c => c.id === candId);
    if (index !== -1) {
      candidacies[index].status = status as any;
      setItem('job_candidacies', candidacies);
    }
  }

  // =========================================================================
  // SYSTEM METRICS & AGGREGATIONS
  // =========================================================================
  public static async getSystemStats(): Promise<SystemStats> {
    try {
      const profiles = await this.listProfiles();
      const products = await this.listProducts();
      const orders = await this.getPaymentOrders();
      const campaigns = await this.getAdCampaigns();

      const totalUsers = profiles.length;
      const totalProfessionals = profiles.filter(p => p.accountType === 'profissional').length;
      const totalCompanies = profiles.filter(p => p.accountType === 'empresa').length;
      const verifiedCompanies = profiles.filter(p => p.accountType === 'empresa' && p.isVerified).length;
      const verifiedUsers = profiles.filter(p => p.isVerified).length;

      const totalAds = products.length;
      const totalPromotedAds = products.filter(p => p.isPromoted).length;

      const confirmedOrders = orders.filter(o => o.status === 'confirmed');
      const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'completed');

      const revenuePlans = confirmedOrders
        .filter(o => o.itemType === 'subscription')
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);

      const revenuePromotions = confirmedOrders
        .filter(o => o.itemType === 'promotion')
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);

      const revenuePublicidade = activeCampaigns.reduce((sum, c) => sum + Number(c.price || 0), 0);

      const totalMonthlyRevenue = revenuePlans + revenuePromotions + revenuePublicidade;
      const totalYearlyRevenue = totalMonthlyRevenue * 12;

      return {
        revenuePlans,
        revenuePromotions,
        revenuePublicidade,
        totalMonthlyRevenue,
        totalYearlyRevenue,
        totalUsers,
        totalProfessionals,
        totalCompanies,
        totalAds,
        totalPromotedAds,
        verifiedCompanies,
        verifiedUsers,
        adminFunds: 0,
        totalCommissionCollected: 0,
        totalVolume: 0
      };
    } catch (e) {
      console.error("System Stats Calculation Error:", e);
      return INITIAL_STATS;
    }
  }
}
