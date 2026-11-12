export interface Drink {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  isPopular?: boolean;
  image?: string;
  temperature?: 'hot' | 'iced' | 'both';
  note?: string;
  noteAr?: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  sortOrder: number;
}

export interface MenuExtra {
  id: string;
  name: string;
  nameAr: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  drinkId: string;
  name: string;
  nameAr?: string;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  size: string;
  temperature?: string;
  milk?: string;
  selectedExtras?: MenuExtra[];
  notes?: string;
  isUpsell?: boolean;
  upsellType?: 'upsell' | 'cross-sell';
}

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'rejected';

export interface UpsellOffer {
  id: string;
  type: 'upsell' | 'cross-sell';
  drinkId?: string;
  title: string;
  titleAr: string;
  price: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface PickupOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: 'cash' | 'visa';
  preparationTiming?: 'immediate' | 'scheduled';
  scheduledMinutes?: number;
  scheduledTimeLabel?: string;
  rejectionReason?: string;
  upsellOffers?: UpsellOffer[];
  notes?: string;
  tableNumber?: string; // e.g. "Table 1" ... "Table 15" or undefined for takeaway
  orderType?: 'dine-in' | 'takeaway';
  createdAt: string;
  estimatedReadyTime: string;
}

export interface StoreSettings {
  storeName: string;
  storeNameAr: string;
  tagline: string;
  taglineAr: string;
  pickupCounterName: string;
  pickupCounterNameAr: string;
  address: string;
  addressAr: string;
  operatingHours: string;
  taxRate: number; // 0 for tax inclusive or standard
  currencySymbol: string;
  isOpen: boolean;
  defaultWaitTimeMinutes: number;
  adminPin: string;
  ownerUsername?: string;
  ownerPassword?: string;
  ownerName?: string;
  managerUsername?: string;
  managerPassword?: string;
  managerName?: string;
  staffUsername?: string;
  staffPin?: string;
  staffName?: string;
}

export interface GuestFeedback {
  id: string;
  guestName?: string;
  tableNumber?: string;
  appRating: number; // 1-5
  appReview?: string;
  drinkId?: string;
  drinkName?: string;
  drinkRating?: number; // 1-5
  drinkReview?: string;
  tasteSweetnessRating?: 'perfect' | 'too-sweet' | 'less-sweet' | 'neutral';
  serviceSpeedRating?: 'fast' | 'normal' | 'slow';
  createdAt: string;
}

export interface TableClosureRequest {
  id: string;
  tableNumber: string;
  guestName?: string;
  paymentMethod: 'cash' | 'visa';
  totalAmount: number;
  baristaFeedback: string;
  rating: number; // 1-5
  status: 'pending' | 'settled';
  requestedAt: string;
  settledAt?: string;
}

