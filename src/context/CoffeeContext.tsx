import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Category,
  Drink,
  CartItem,
  PickupOrder,
  StoreSettings,
  OrderStatus,
  MenuExtra,
  GuestFeedback,
  TableClosureRequest,
  UpsellOffer,
} from '../types';
import { INITIAL_CATEGORIES, INITIAL_DRINKS, INITIAL_SETTINGS, MENU_EXTRAS } from '../data/initialData';

interface CoffeeContextType {
  categories: Category[];
  drinks: Drink[];
  cart: CartItem[];
  orders: PickupOrder[];
  settings: StoreSettings;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  availableExtras: MenuExtra[];
  syncStatus: 'live' | 'syncing' | 'local';
  // Cart Actions
  addToCart: (
    drink: Drink,
    options?: {
      size?: string;
      temperature?: string;
      milk?: string;
      selectedExtras?: MenuExtra[];
      notes?: string;
      quantity?: number;
    }
  ) => void;
  updateCartItemQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  cartItemsCount: number;
  activeTable: string | null;
  setActiveTable: (table: string | null) => void;
  tables: string[];
  // Order Actions
  placePickupOrder: (data: {
    customerName: string;
    customerPhone: string;
    pickupTime: string;
    notes?: string;
    tableNumber?: string;
    orderType?: 'dine-in' | 'takeaway';
    paymentMethod?: 'cash' | 'visa';
    preparationTiming?: 'immediate' | 'scheduled';
    scheduledMinutes?: number;
    scheduledTimeLabel?: string;
  }) => PickupOrder;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrder: (updatedOrder: PickupOrder) => void;
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  sendUpsellOffer: (
    orderId: string,
    offer: Omit<UpsellOffer, 'id' | 'status' | 'createdAt'>,
    autoAccept?: boolean
  ) => void;
  respondToUpsellOffer: (orderId: string, offerId: string, accept: boolean) => void;
  // Admin Management Actions
  addDrink: (drinkData: Omit<Drink, 'id'>) => Drink;
  updateDrink: (drink: Drink) => void;
  deleteDrink: (id: string) => void;
  toggleDrinkAvailability: (id: string) => void;
  addCategory: (categoryData: Omit<Category, 'id'>) => Category;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetToDefaults: () => void;
  exportCatalogJSON: () => string;
  importCatalogJSON: (jsonStr: string) => boolean;
  // Guest Feedback Actions
  feedbacks: GuestFeedback[];
  addFeedback: (fb: Omit<GuestFeedback, 'id' | 'createdAt'>) => GuestFeedback;
  deleteFeedback: (id: string) => void;
  // Table Closure & Settle Actions
  tableClosureRequests: TableClosureRequest[];
  requestTableClosure: (data: Omit<TableClosureRequest, 'id' | 'requestedAt' | 'status'>) => TableClosureRequest;
  settleTableClosure: (id: string) => void;
}

const CoffeeContext = createContext<CoffeeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CATEGORIES: 'mixmart_official_categories_v2',
  DRINKS: 'mixmart_official_drinks_v2',
  CART: 'mixmart_official_cart_v2',
  ORDERS: 'mixmart_official_orders_v2',
  SETTINGS: 'mixmart_official_settings_v2',
  LANG: 'mixmart_language_v2',
  TABLE: 'mixmart_active_table_v2',
  FEEDBACKS: 'mixmart_guest_feedbacks_v2',
  CLOSURES: 'mixmart_table_closures_v2',
};

export const MIX_MART_TABLES = Array.from({ length: 15 }, (_, i) => `Table ${i + 1}`);

export const CoffeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'ar'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG);
      return saved === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: 'en' | 'ar') => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  };

  // 1. Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!saved) return INITIAL_CATEGORIES;
      const parsed: Category[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((c) => c.id));
      const missing = INITIAL_CATEGORIES.filter((c) => !existingIds.has(c.id));
      const merged = [...parsed, ...missing];
      if (missing.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(merged));
      }
      return merged;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // 2. Drinks
  const [drinks, setDrinks] = useState<Drink[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRINKS);
      if (!saved) return INITIAL_DRINKS;
      const parsed: Drink[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((d) => d.id));
      const missing = INITIAL_DRINKS.filter((d) => !existingIds.has(d.id));
      const merged = [...parsed, ...missing];
      if (missing.length > 0) {
        localStorage.setItem(STORAGE_KEYS.DRINKS, JSON.stringify(merged));
      }
      return merged;
    } catch {
      return INITIAL_DRINKS;
    }
  });

  // 3. Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. Pickup Orders (seeded with initial realistic sample if empty so Barista/Manager/Owner queues work out of the box)
  const [orders, setOrders] = useState<PickupOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
      const now = Date.now();
      return [
        {
          id: 'ord-demo-101',
          orderNumber: 'MM-408',
          customerName: 'عمر طارق',
          customerPhone: '01098443210',
          pickupTime: 'تحضير فوري (~10 دقائق)',
          preparationTiming: 'immediate',
          paymentMethod: 'visa',
          tableNumber: 'Table 3',
          orderType: 'dine-in',
          status: 'received',
          notes: 'سكر خفيف وعلبة كانز',
          createdAt: new Date(now - 60000 * 4).toISOString(),
          estimatedReadyTime: new Date(now + 60000 * 10).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          items: [
            {
              cartItemId: 'demo-item-1',
              drinkId: 'iced-spanish-latte-can',
              name: 'Spanish Latte (CAN)',
              nameAr: 'سبانش لاتيه (كانز)',
              unitPrice: 125,
              totalPrice: 125,
              quantity: 1,
              size: 'Standard',
              temperature: 'Iced',
              selectedExtras: [MENU_EXTRAS[4]],
              notes: 'Light ice',
            },
          ],
          subtotal: 125,
          tax: 0,
          total: 125,
        },
        {
          id: 'ord-demo-102',
          orderNumber: 'MM-407',
          customerName: 'ليلى حسن',
          customerPhone: '01122334455',
          pickupTime: 'تحضير بعد 25 دقيقة',
          preparationTiming: 'scheduled',
          scheduledMinutes: 25,
          scheduledTimeLabel: 'خلال 25 دقيقة',
          paymentMethod: 'cash',
          orderType: 'takeaway',
          status: 'preparing',
          createdAt: new Date(now - 60000 * 18).toISOString(),
          estimatedReadyTime: new Date(now + 60000 * 15).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          items: [
            {
              cartItemId: 'demo-item-2',
              drinkId: 'espresso-double',
              name: 'Cappuccino',
              nameAr: 'كابتشينو كلاسيك',
              unitPrice: 90,
              totalPrice: 180,
              quantity: 2,
              size: 'Standard',
              temperature: 'Hot',
            },
          ],
          subtotal: 180,
          tax: 0,
          total: 180,
        },
      ];
    } catch {
      return [];
    }
  });

  // 5. Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // 6. Guest Feedbacks
  const [feedbacks, setFeedbacks] = useState<GuestFeedback[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'fb-01',
          guestName: 'سارة م.',
          tableNumber: 'Table 3',
          appRating: 5,
          appReview: 'التطبيق سريع وسلس جداً في الطلب، والمنيو رائع ومريح!',
          drinkName: 'Spanish Latte (Iced)',
          drinkRating: 5,
          drinkReview: 'طعم القهوة والكراميل متوازن جداً ودرجة البرودة ممتازة.',
          tasteSweetnessRating: 'perfect',
          serviceSpeedRating: 'fast',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
        {
          id: 'fb-02',
          guestName: 'أحمد كمال',
          tableNumber: 'Table 7',
          appRating: 5,
          appReview: 'فكرة كود الـ QR للطاولة وتثبيت التطبيق على الأيفون ممتازة وسريعة.',
          drinkName: 'Chilled Cola Can',
          drinkRating: 5,
          drinkReview: 'الكولا مثلجة وجاءت مع كاس ثلج كريستال رائع.',
          tasteSweetnessRating: 'perfect',
          serviceSpeedRating: 'fast',
          createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
        },
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
    } catch {
      // ignore storage error
    }
  }, [feedbacks]);

  const addFeedback = (fbData: Omit<GuestFeedback, 'id' | 'createdAt'>): GuestFeedback => {
    const newFeedback: GuestFeedback = {
      ...fbData,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFeedbacks((prev) => [newFeedback, ...prev]);
    return newFeedback;
  };

  const deleteFeedback = (id: string) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  };

  // 7. Table Closure Requests (Cash / Visa + Barista Feedback)
  const [tableClosureRequests, setTableClosureRequests] = useState<TableClosureRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLOSURES);
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'tcr-01',
          tableNumber: 'Table 4',
          guestName: 'كريم نبيل',
          paymentMethod: 'visa',
          totalAmount: 195,
          baristaFeedback: 'الفرابتشينو كان عالمي وسرعة التقديم ممتازة، شكراً للباريستا!',
          rating: 5,
          status: 'pending',
          requestedAt: new Date(Date.now() - 60000 * 15).toISOString(),
        },
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLOSURES, JSON.stringify(tableClosureRequests));
    } catch {
      // ignore
    }
  }, [tableClosureRequests]);

  const requestTableClosure = (
    data: Omit<TableClosureRequest, 'id' | 'requestedAt' | 'status'>
  ): TableClosureRequest => {
    const newReq: TableClosureRequest = {
      ...data,
      id: `tcr-${Date.now()}`,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    setTableClosureRequests((prev) => [newReq, ...prev]);

    // Also mirror into guest feedbacks
    const paymentLabel = data.paymentMethod === 'cash' ? 'كاش 💵' : 'فيزا 💳';
    addFeedback({
      guestName: data.guestName || `ضيف ${data.tableNumber}`,
      tableNumber: data.tableNumber,
      appRating: data.rating,
      appReview: `[طلب إغلاق طاولة ${data.tableNumber} - دفع ${paymentLabel}] ${data.baristaFeedback}`,
      serviceSpeedRating: 'fast',
    });

    return newReq;
  };

  const settleTableClosure = (id: string) => {
    setTableClosureRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'settled' as const, settledAt: new Date().toISOString() } : r
      )
    );
  };

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 6. Active Table (15 Tables System)
  const [activeTable, setActiveTableState] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTable = urlParams.get('table');
        if (urlTable) {
          const formatted = urlTable.toLowerCase().startsWith('table') ? urlTable : `Table ${urlTable}`;
          return formatted;
        }
      }
      return localStorage.getItem(STORAGE_KEYS.TABLE) || null;
    } catch {
      return null;
    }
  });

  const setActiveTable = (table: string | null) => {
    setActiveTableState(table);
    if (table) {
      localStorage.setItem(STORAGE_KEYS.TABLE, table);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TABLE);
    }
  };

  // Live Cross-App / Cross-Device Sync via SSE + BroadcastChannel + localStorage
  const [syncStatus, setSyncStatus] = useState<'live' | 'syncing' | 'local'>('local');
  const isRemoteSyncRef = useRef(false);
  const hasHydratedFromServerRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const clientIdRef = useRef<string>(
    `cli-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
  );

  const applyRemoteBranchState = (remote: {
    categories?: Category[];
    drinks?: Drink[];
    orders?: PickupOrder[];
    settings?: StoreSettings;
    feedbacks?: GuestFeedback[];
    tableClosureRequests?: TableClosureRequest[];
  }) => {
    isRemoteSyncRef.current = true;
    if (Array.isArray(remote.categories) && remote.categories.length > 0) {
      setCategories(remote.categories);
    }
    if (Array.isArray(remote.drinks) && remote.drinks.length > 0) {
      setDrinks(remote.drinks);
    }
    if (Array.isArray(remote.orders)) {
      setOrders(remote.orders);
    }
    if (remote.settings && typeof remote.settings === 'object') {
      setSettings((prev) => ({ ...prev, ...remote.settings }));
    }
    if (Array.isArray(remote.feedbacks)) {
      setFeedbacks(remote.feedbacks);
    }
    if (Array.isArray(remote.tableClosureRequests)) {
      setTableClosureRequests(remote.tableClosureRequests);
    }
    setTimeout(() => {
      isRemoteSyncRef.current = false;
    }, 80);
  };

  const pushPatchToServer = async (patch: Record<string, unknown>) => {
    if (isRemoteSyncRef.current) return;
    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/branch/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clientIdRef.current, patch }),
      });
      if (res.ok) {
        setSyncStatus('live');
      } else {
        setSyncStatus('local');
      }
    } catch {
      setSyncStatus('local');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Hydrate from branch server & open SSE stream for live cross-device updates
    let eventSource: EventSource | null = null;
    let closed = false;

    const connectServerSync = async () => {
      try {
        const res = await fetch('/api/branch/state');
        if (res.ok && !closed) {
          const serverData = await res.json();
          if (serverData && typeof serverData.version === 'number' && serverData.version > 0) {
            applyRemoteBranchState(serverData);
          } else {
            // Seed server once on fresh boot
            await pushPatchToServer({
              categories,
              drinks,
              orders,
              settings,
              feedbacks,
              tableClosureRequests,
            });
          }
          hasHydratedFromServerRef.current = true;
          setSyncStatus('live');
        }
      } catch {
        setSyncStatus('local');
      }

      if (!closed && 'EventSource' in window) {
        eventSource = new EventSource('/api/branch/events');
        eventSource.onopen = () => {
          if (!closed) setSyncStatus('live');
        };
        eventSource.onmessage = (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            if (payload.type === 'sync' && payload.clientId !== clientIdRef.current && payload.state) {
              applyRemoteBranchState(payload.state);
            } else if (
              payload.type === 'connected' &&
              payload.state &&
              typeof payload.state.version === 'number' &&
              payload.state.version > 0 &&
              !hasHydratedFromServerRef.current
            ) {
              hasHydratedFromServerRef.current = true;
              applyRemoteBranchState(payload.state);
            }
          } catch {
            // ignore SSE parse error
          }
        };
        eventSource.onerror = () => {
          if (!closed) setSyncStatus('local');
        };
      }
    };

    connectServerSync();

    // 2. BroadcastChannel + localStorage listener for instant same-browser tab sync
    if ('BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel('mixmart_live_sync_v2');
      channelRef.current.onmessage = (ev) => {
        const msg = ev.data;
        if (!msg || !msg.key) return;
        isRemoteSyncRef.current = true;
        if (msg.key === STORAGE_KEYS.CATEGORIES) setCategories(msg.value);
        if (msg.key === STORAGE_KEYS.DRINKS) setDrinks(msg.value);
        if (msg.key === STORAGE_KEYS.ORDERS) setOrders(msg.value);
        if (msg.key === STORAGE_KEYS.SETTINGS) setSettings(msg.value);
        if (msg.key === STORAGE_KEYS.FEEDBACKS) setFeedbacks(msg.value);
        if (msg.key === STORAGE_KEYS.CLOSURES) setTableClosureRequests(msg.value);
        setTimeout(() => {
          isRemoteSyncRef.current = false;
        }, 50);
      };
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        isRemoteSyncRef.current = true;
        if (e.key === STORAGE_KEYS.CATEGORIES) setCategories(parsed);
        if (e.key === STORAGE_KEYS.DRINKS) setDrinks(parsed);
        if (e.key === STORAGE_KEYS.ORDERS) setOrders(parsed);
        if (e.key === STORAGE_KEYS.SETTINGS) setSettings(parsed);
        if (e.key === STORAGE_KEYS.FEEDBACKS) setFeedbacks(parsed);
        if (e.key === STORAGE_KEYS.CLOSURES) setTableClosureRequests(parsed);
        setTimeout(() => {
          isRemoteSyncRef.current = false;
        }, 50);
      } catch {
        // ignore parse errors
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      closed = true;
      eventSource?.close();
      window.removeEventListener('storage', handleStorageChange);
      channelRef.current?.close();
    };
  }, []);

  const broadcastState = (key: string, value: unknown, serverField?: string) => {
    if (isRemoteSyncRef.current) return;
    try {
      channelRef.current?.postMessage({ key, value });
    } catch {
      // ignore
    }
    if (serverField && hasHydratedFromServerRef.current) {
      void pushPatchToServer({ [serverField]: value });
    }
  };

  // Persist states & push live updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    broadcastState(STORAGE_KEYS.CATEGORIES, categories, 'categories');
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRINKS, JSON.stringify(drinks));
    broadcastState(STORAGE_KEYS.DRINKS, drinks, 'drinks');
  }, [drinks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    broadcastState(STORAGE_KEYS.ORDERS, orders, 'orders');
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    broadcastState(STORAGE_KEYS.SETTINGS, settings, 'settings');
  }, [settings]);

  useEffect(() => {
    broadcastState(STORAGE_KEYS.FEEDBACKS, feedbacks, 'feedbacks');
  }, [feedbacks]);

  useEffect(() => {
    broadcastState(STORAGE_KEYS.CLOSURES, tableClosureRequests, 'tableClosureRequests');
  }, [tableClosureRequests]);

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartTax = Number((cartSubtotal * settings.taxRate).toFixed(2));
  const cartTotal = Number((cartSubtotal + cartTax).toFixed(2));
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Cart Methods
  const addToCart = (
    drink: Drink,
    options?: {
      size?: string;
      temperature?: string;
      milk?: string;
      selectedExtras?: MenuExtra[];
      notes?: string;
      quantity?: number;
    }
  ) => {
    const qty = options?.quantity && options.quantity > 0 ? options.quantity : 1;
    const size = options?.size || 'Standard';
    const temperature = options?.temperature || (drink.temperature === 'iced' ? 'Iced' : 'Hot');
    const milk = options?.milk || 'Standard Milk';
    const notes = options?.notes || '';
    const selectedExtras = options?.selectedExtras || [];

    // Calculate base price + extras from official menu
    let unitPrice = drink.price;
    selectedExtras.forEach((extra) => {
      unitPrice += extra.price;
    });

    const extrasKey = selectedExtras.map((e) => e.id).sort().join('_');
    const cartKey = `${drink.id}-${size}-${temperature}-${milk}-${extrasKey}-${notes}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartItemId === cartKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + qty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: Number((unitPrice * newQty).toFixed(2)),
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId: cartKey,
          drinkId: drink.id,
          name: drink.name,
          nameAr: drink.nameAr,
          unitPrice: Number(unitPrice.toFixed(2)),
          totalPrice: Number((unitPrice * qty).toFixed(2)),
          quantity: qty,
          size,
          temperature,
          milk,
          selectedExtras,
          notes,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateCartItemQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: Number((item.unitPrice * newQty).toFixed(2)),
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order Placement
  const placePickupOrder = (data: {
    customerName: string;
    customerPhone: string;
    pickupTime: string;
    notes?: string;
    tableNumber?: string;
    orderType?: 'dine-in' | 'takeaway';
    paymentMethod?: 'cash' | 'visa';
    preparationTiming?: 'immediate' | 'scheduled';
    scheduledMinutes?: number;
    scheduledTimeLabel?: string;
  }): PickupOrder => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderNum = `MM-${randomSuffix}`;
    const now = new Date();

    const waitMinutes =
      data.preparationTiming === 'scheduled' && data.scheduledMinutes
        ? data.scheduledMinutes
        : settings.defaultWaitTimeMinutes;
    const readyEstimate = new Date(now.getTime() + waitMinutes * 60000);
    const formattedReady = readyEstimate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Resolved table number and order type
    const resolvedTable = data.tableNumber !== undefined ? (data.tableNumber || undefined) : (activeTable || undefined);
    const resolvedType = data.orderType || (resolvedTable ? 'dine-in' : 'takeaway');

    const newOrder: PickupOrder = {
      id: `ord-${Date.now()}-${randomSuffix}`,
      orderNumber: orderNum,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      pickupTime: data.pickupTime || `In ${waitMinutes} mins (~${formattedReady})`,
      items: [...cart],
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      status: 'received',
      paymentMethod: data.paymentMethod || 'cash',
      preparationTiming: data.preparationTiming || 'immediate',
      scheduledMinutes: data.scheduledMinutes,
      scheduledTimeLabel: data.scheduledTimeLabel,
      notes: data.notes?.trim(),
      tableNumber: resolvedTable,
      orderType: resolvedType,
      createdAt: now.toISOString(),
      estimatedReadyTime: formattedReady,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  const updateOrder = (updatedOrder: PickupOrder) => {
    const recalcSubtotal = updatedOrder.items.reduce(
      (sum, it) => sum + Number(it.totalPrice || it.unitPrice * it.quantity),
      0
    );
    const recalcTax = Number((recalcSubtotal * settings.taxRate).toFixed(2));
    const recalcTotal = Number((recalcSubtotal + recalcTax).toFixed(2));
    const finalized: PickupOrder = {
      ...updatedOrder,
      subtotal: recalcSubtotal,
      tax: recalcTax,
      total: recalcTotal,
    };
    setOrders((prev) => prev.map((o) => (o.id === finalized.id ? finalized : o)));
  };

  const acceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: 'preparing', rejectionReason: undefined }
          : order
      )
    );
  };

  const rejectOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'rejected',
              rejectionReason: reason.trim() || 'Item currently unavailable',
            }
          : order
      )
    );
  };

  const sendUpsellOffer = (
    orderId: string,
    offerData: Omit<UpsellOffer, 'id' | 'status' | 'createdAt'>,
    autoAccept = false
  ) => {
    const newOffer: UpsellOffer = {
      ...offerData,
      id: `up-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: autoAccept ? 'accepted' : 'pending',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const nextOffers = [...(order.upsellOffers || []), newOffer];

        if (!autoAccept) {
          return { ...order, upsellOffers: nextOffers };
        }

        // Immediately add item to order if Barista confirmed with guest directly
        const upsellItem: CartItem = {
          cartItemId: `upsell-item-${newOffer.id}`,
          drinkId: newOffer.drinkId || `upsell-${newOffer.type}`,
          name: newOffer.title,
          nameAr: newOffer.titleAr,
          unitPrice: newOffer.price,
          totalPrice: newOffer.price,
          quantity: 1,
          size: 'Standard',
          isUpsell: true,
          upsellType: newOffer.type,
        };
        const updatedItems = [...order.items, upsellItem];
        const newSubtotal = updatedItems.reduce((sum, it) => sum + it.totalPrice, 0);
        const newTax = Number((newSubtotal * settings.taxRate).toFixed(2));
        const newTotal = Number((newSubtotal + newTax).toFixed(2));

        return {
          ...order,
          items: updatedItems,
          subtotal: newSubtotal,
          tax: newTax,
          total: newTotal,
          upsellOffers: nextOffers,
        };
      })
    );
  };

  const respondToUpsellOffer = (orderId: string, offerId: string, accept: boolean) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const targetOffer = (order.upsellOffers || []).find((of) => of.id === offerId);
        if (!targetOffer || targetOffer.status !== 'pending') return order;

        const nextOffers = (order.upsellOffers || []).map((of) =>
          of.id === offerId ? { ...of, status: accept ? ('accepted' as const) : ('declined' as const) } : of
        );

        if (!accept) {
          return { ...order, upsellOffers: nextOffers };
        }

        const upsellItem: CartItem = {
          cartItemId: `upsell-item-${targetOffer.id}`,
          drinkId: targetOffer.drinkId || `upsell-${targetOffer.type}`,
          name: targetOffer.title,
          nameAr: targetOffer.titleAr,
          unitPrice: targetOffer.price,
          totalPrice: targetOffer.price,
          quantity: 1,
          size: 'Standard',
          isUpsell: true,
          upsellType: targetOffer.type,
        };
        const updatedItems = [...order.items, upsellItem];
        const newSubtotal = updatedItems.reduce((sum, it) => sum + it.totalPrice, 0);
        const newTax = Number((newSubtotal * settings.taxRate).toFixed(2));
        const newTotal = Number((newSubtotal + newTax).toFixed(2));

        return {
          ...order,
          items: updatedItems,
          subtotal: newSubtotal,
          tax: newTax,
          total: newTotal,
          upsellOffers: nextOffers,
        };
      })
    );
  };

  // Admin Management Actions
  const addDrink = (drinkData: Omit<Drink, 'id'>): Drink => {
    const newDrink: Drink = {
      ...drinkData,
      id: `dr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      price: Number(Number(drinkData.price).toFixed(2)),
    };
    setDrinks((prev) => [newDrink, ...prev]);
    return newDrink;
  };

  const updateDrink = (updatedDrink: Drink) => {
    setDrinks((prev) =>
      prev.map((item) =>
        item.id === updatedDrink.id
          ? { ...updatedDrink, price: Number(Number(updatedDrink.price).toFixed(2)) }
          : item
      )
    );
  };

  const deleteDrink = (id: string) => {
    setDrinks((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleDrinkAvailability = (id: string) => {
    setDrinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
    const slug = categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat: Category = {
      ...categoryData,
      id: `cat-${slug || Date.now()}`,
      sortOrder: categories.length + 1,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (updatedCat: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCat.id ? updatedCat : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setCategories(INITIAL_CATEGORIES);
    setDrinks(INITIAL_DRINKS);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.DRINKS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  const exportCatalogJSON = (): string => {
    return JSON.stringify({ categories, drinks, settings }, null, 2);
  };

  const importCatalogJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.categories) && Array.isArray(data.drinks)) {
        setCategories(data.categories);
        setDrinks(data.drinks);
        if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  };

  return (
    <CoffeeContext.Provider
      value={{
        categories,
        drinks,
        cart,
        orders,
        settings,
        language,
        setLanguage,
        selectedCategoryId,
        setSelectedCategoryId,
        searchQuery,
        setSearchQuery,
        availableExtras: MENU_EXTRAS,
        syncStatus,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartTax,
        cartTotal,
        cartItemsCount,
        activeTable,
        setActiveTable,
        tables: MIX_MART_TABLES,
        placePickupOrder,
        updateOrderStatus,
        updateOrder,
        acceptOrder,
        rejectOrder,
        sendUpsellOffer,
        respondToUpsellOffer,
        addDrink,
        updateDrink,
        deleteDrink,
        toggleDrinkAvailability,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        resetToDefaults,
        exportCatalogJSON,
        importCatalogJSON,
        feedbacks,
        addFeedback,
        deleteFeedback,
        tableClosureRequests,
        requestTableClosure,
        settleTableClosure,
      }}
    >
      {children}
    </CoffeeContext.Provider>
  );
};

export const useCoffee = () => {
  const context = useContext(CoffeeContext);
  if (!context) {
    throw new Error('useCoffee must be used within a CoffeeProvider');
  }
  return context;
};
