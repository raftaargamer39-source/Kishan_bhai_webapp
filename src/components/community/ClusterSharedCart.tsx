import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useUserStore } from '../../store/userStore';
import {
  SharedClusterCart as SharedClusterCartType,
  SharedCartItem,
  SharedCartItemContributor,
} from '../../../shared/types';
import {
  ShoppingCart,
  Plus,
  Users,
  CheckCircle2,
  TrendingDown,
  Truck,
  Sparkles,
  ShieldCheck,
  Trash2,
  Lock,
  Unlock,
  CreditCard,
  Building2,
  Calendar,
  MapPin,
  Phone,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Package,
  Layers,
  Percent,
  Check,
  AlertCircle,
  QrCode,
  Share2,
} from 'lucide-react';

interface ClusterInfo {
  id: string;
  name: string;
  village: string;
  state: string;
  crops: string;
  activeCartTitle: string;
}

const CLUSTERS: ClusterInfo[] = [
  {
    id: 'cluster_anandpur_01',
    name: 'Anandpur Sahakari Cotton & Groundnut Mesh',
    village: 'Anandpur, Rajkot',
    state: 'Gujarat',
    crops: 'Cotton (Bt), Groundnut, Cumin',
    activeCartTitle: 'Rabi 2026 Cooperative Bulk Supplies Cart',
  },
  {
    id: 'cluster_malwa_02',
    name: 'Malwa Organic Wheat Federation',
    village: 'Dharampuri, Dhar',
    state: 'Madhya Pradesh',
    crops: 'Sharbati Wheat, Soybean, Mustard',
    activeCartTitle: 'Malwa Organic Inputs & Sharbati Seed Pooling',
  },
  {
    id: 'cluster_vidarbha_03',
    name: 'Vidarbha Pulse & Soybean Mesh',
    village: 'Ralegaon, Yavatmal',
    state: 'Maharashtra',
    crops: 'Soybean, Tur Dal, Cotton',
    activeCartTitle: 'Kharif Pre-Booking Fertilizer & Seeds Cart',
  },
];

interface CatalogPreset {
  title: string;
  category: string;
  unit: string;
  retailPrice: number;
  wholesalePrice: number;
  targetTierQty: number;
  supplierName: string;
  imageUrl: string;
  description: string;
}

const CATALOG_PRESETS: CatalogPreset[] = [
  {
    title: 'Coromandel Gromor 28-28-0 Complex Fertilizer',
    category: 'Fertilizer',
    unit: 'Bags (50kg)',
    retailPrice: 1850,
    wholesalePrice: 1480,
    targetTierQty: 50,
    supplierName: 'Coromandel International Cooperative Depot',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69103851?w=300&auto=format&fit=crop&q=80',
    description: 'High-nitrogen & phosphorus complex for rapid vegetative growth and root anchoring.',
  },
  {
    title: 'IFFCO Neem Coated Certified Urea (45kg)',
    category: 'Fertilizer',
    unit: 'Bags (45kg)',
    retailPrice: 266.5,
    wholesalePrice: 242.0,
    targetTierQty: 50,
    supplierName: 'IFFCO State Regional Distribution Hub',
    imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=300&auto=format&fit=crop&q=80',
    description: 'Slow-release neem coated granular urea for balanced top dressing.',
  },
  {
    title: 'Certified Sharbati Wheat Foundation Seeds (C-306)',
    category: 'Seeds',
    unit: 'Quintals',
    retailPrice: 4200,
    wholesalePrice: 3450,
    targetTierQty: 20,
    supplierName: 'State Beej Nigam Certified Depot',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&auto=format&fit=crop&q=80',
    description: 'Certified premium disease-resistant foundation seeds with >98% germination rate.',
  },
  {
    title: 'Jain Irrigation Drip Lateral Pipe (16mm, 400m bundle)',
    category: 'Solar & Irrigation',
    unit: 'Rolls',
    retailPrice: 3600,
    wholesalePrice: 2850,
    targetTierQty: 10,
    supplierName: 'Jain Irrigation Systems Ltd Authorized Hub',
    imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=300&auto=format&fit=crop&q=80',
    description: 'UV-resistant inline cylindrical dripper lateral pipe bundle with 2.4 LPH discharge.',
  },
  {
    title: 'Multiplex Bio-Pesticide & Neem Oil 10,000 PPM (5L)',
    category: 'Bio-Nutrients',
    unit: 'Bottles (5L)',
    retailPrice: 2400,
    wholesalePrice: 1850,
    targetTierQty: 15,
    supplierName: 'Multiplex Bio-Tech Agri Cooperative',
    imageUrl: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=300&auto=format&fit=crop&q=80',
    description: '100% natural cold-pressed neem formulation repellent against whitefly, bollworm, and aphids.',
  },
  {
    title: 'Amul Dan Balanced Cattle Feed (50kg Bag)',
    category: 'Cattle Feed',
    unit: 'Bags (50kg)',
    retailPrice: 1480,
    wholesalePrice: 1220,
    targetTierQty: 30,
    supplierName: 'Gujarat Cooperative Milk Marketing Federation',
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=300&auto=format&fit=crop&q=80',
    description: 'High protein and calcium enriched cattle pellet feed for dairy yield enhancement.',
  },
];

interface ClusterSharedCartProps {
  onSwitchToChat?: () => void;
}

export const ClusterSharedCart: React.FC<ClusterSharedCartProps> = ({ onSwitchToChat }) => {
  const { language, addToast, setCurrentView } = useApp();
  const farmerProfile = useUserStore((state) => state.farmerProfile);
  const currentUser = useUserStore((state) => state.currentUser);

  const isHi = language === 'hi';
  const isGu = language === 'gu';

  const currentUserId = currentUser?.id || 'usr_farmer_ramesh';
  const currentUserName = farmerProfile.name || currentUser?.fullName || 'Ramesh Patel';
  const currentUserVillage = farmerProfile.village || 'Anandpur';

  const [selectedClusterId, setSelectedClusterId] = useState<string>('cluster_anandpur_01');
  const [cart, setCart] = useState<SharedClusterCartType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals & Panels
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState<boolean>(false);
  const [selectedItemForContribute, setSelectedItemForContribute] = useState<SharedCartItem | null>(null);

  // Form states for new item
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('Fertilizer');
  const [customUnit, setCustomUnit] = useState('Bags (50kg)');
  const [customRetailPrice, setCustomRetailPrice] = useState<number>(1500);
  const [customWholesalePrice, setCustomWholesalePrice] = useState<number>(1200);
  const [customTargetTier, setCustomTargetTier] = useState<number>(30);
  const [customQuantity, setCustomQuantity] = useState<number>(5);
  const [customNotes, setCustomNotes] = useState('');
  const [isCustomItemMode, setIsCustomItemMode] = useState<boolean>(false);

  // Form states for contribution to existing item
  const [contributeQty, setContributeQty] = useState<number>(5);
  const [contributeNotes, setContributeNotes] = useState('');

  // Checkout states
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'SPLIT_UPI' | 'COOPERATIVE_CREDIT' | 'CASH_ON_DELIVERY'>('SPLIT_UPI');
  const [checkoutDeliveryDate, setCheckoutDeliveryDate] = useState<string>(
    new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]
  );
  const [checkoutPickupLocation, setCheckoutPickupLocation] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [orderReceipt, setOrderReceipt] = useState<string | null>(null);

  const activeCluster = CLUSTERS.find((c) => c.id === selectedClusterId) || CLUSTERS[0];

  // Fetch cart data
  const fetchCart = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch(`/api/shared-cart/${selectedClusterId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.cart) {
          setCart(data.cart);
          setCheckoutPickupLocation(data.cart.deliveryAddress || `${activeCluster.village} Sahakari Mandi`);
        }
      }
    } catch (e) {
      console.error('Failed to load shared cart', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCart(true);
  }, [selectedClusterId]);

  // WebSocket Live Updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    let unmounted = false;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/cluster-chat`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        ws?.send(
          JSON.stringify({
            type: 'join',
            clusterId: selectedClusterId,
            userId: currentUserId,
            userName: currentUserName,
          })
        );
      };

      ws.onmessage = (event) => {
        if (unmounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'shared_cart_update' && data.cart) {
            setCart(data.cart);
            if (data.action === 'item_added') {
              addToast(
                isHi
                  ? `🛒 ${data.userName || 'किसान भाई'} ने कार्ट में "${data.itemTitle || 'सामान'}" जोड़ा!`
                  : `🛒 ${data.userName || 'Member'} added "${data.itemTitle || 'items'}" to group cart!`,
                'info'
              );
            } else if (data.action === 'checkout_completed') {
              addToast(
                isHi
                  ? '🎉 क्लस्टर सामूहिक ऑर्डर सफलतापूर्वक चेकआउट हो गया है!'
                  : '🎉 Group order has been successfully placed by cluster!',
                'success'
              );
            }
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // ignore
    }

    return () => {
      unmounted = true;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [selectedClusterId, currentUserId, currentUserName, isHi, addToast]);

  // Handle Add Item to Cart
  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let payloadItem: any;
    if (isCustomItemMode) {
      if (!customTitle.trim()) {
        addToast(isHi ? 'कृपया वस्तु का नाम दर्ज करें' : 'Please enter item title', 'error');
        return;
      }
      payloadItem = {
        title: customTitle.trim(),
        category: customCategory,
        unit: customUnit,
        retailPrice: customRetailPrice,
        wholesalePrice: customWholesalePrice,
        targetTierQty: customTargetTier,
        quantity: customQuantity,
        userId: currentUserId,
        userName: currentUserName,
        userVillage: currentUserVillage,
        notes: customNotes.trim() || undefined,
        supplierName: 'Local Sahakari / Mandi Dealer',
      };
    } else {
      const preset = CATALOG_PRESETS[selectedPresetIndex];
      payloadItem = {
        title: preset.title,
        category: preset.category,
        unit: preset.unit,
        retailPrice: preset.retailPrice,
        wholesalePrice: preset.wholesalePrice,
        targetTierQty: preset.targetTierQty,
        quantity: customQuantity,
        userId: currentUserId,
        userName: currentUserName,
        userVillage: currentUserVillage,
        notes: customNotes.trim() || undefined,
        supplierName: preset.supplierName,
        imageUrl: preset.imageUrl,
      };
    }

    try {
      const res = await fetch(`/api/shared-cart/${selectedClusterId}/item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadItem),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.cart) setCart(data.cart);
        setIsAddItemModalOpen(false);
        setCustomNotes('');
        setCustomQuantity(5);
        setIsCustomItemMode(false);
        addToast(
          isHi ? 'सामूहिक कार्ट में सामान जोड़ा गया!' : 'Item added to collective cart!',
          'success'
        );
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to add item', 'error');
      }
    } catch {
      addToast(isHi ? 'सर्वर से संपर्क नहीं हो पाया' : 'Server error', 'error');
    }
  };

  // Handle Contribute to Existing Item
  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForContribute) return;

    try {
      const res = await fetch(`/api/shared-cart/${selectedClusterId}/item/${selectedItemForContribute.id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          userName: currentUserName,
          userVillage: currentUserVillage,
          quantity: contributeQty,
          notes: contributeNotes.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.cart) setCart(data.cart);
        setIsContributeModalOpen(false);
        setSelectedItemForContribute(null);
        setContributeNotes('');
        addToast(
          isHi ? 'आपकी मात्रा कार्ट में दर्ज कर ली गई है!' : 'Your pledge was added to the item!',
          'success'
        );
      }
    } catch {
      addToast(isHi ? 'सर्वर से संपर्क नहीं हो पाया' : 'Server error', 'error');
    }
  };

  // Remove user pledge or item
  const handleRemovePledge = async (itemId: string, onlyUserShare: boolean) => {
    if (!confirm(isHi ? 'क्या आप इस वस्तु/मात्रा को कार्ट से हटाना चाहते हैं?' : 'Remove from group cart?')) {
      return;
    }

    try {
      const url = `/api/shared-cart/${selectedClusterId}/item/${itemId}${
        onlyUserShare ? `?userId=${encodeURIComponent(currentUserId)}` : ''
      }`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.cart) setCart(data.cart);
        addToast(isHi ? 'कार्ट से हटा दिया गया' : 'Removed from cart', 'info');
      }
    } catch {
      addToast('Failed to remove item', 'error');
    }
  };

  // Toggle Lock Status
  const handleToggleLock = async () => {
    if (!cart) return;
    const newStatus = cart.status === 'OPEN' ? 'LOCKED' : 'OPEN';
    try {
      const res = await fetch(`/api/shared-cart/${selectedClusterId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cart) setCart(data.cart);
        addToast(
          newStatus === 'LOCKED'
            ? isHi ? 'कार्ट लॉक कर दिया गया है। अब केवल समीक्षा संभव है।' : 'Cart locked for review.'
            : isHi ? 'कार्ट पुनः खोल दिया गया है।' : 'Cart unlocked.',
          'info'
        );
      }
    } catch {
      addToast('Status update failed', 'error');
    }
  };

  // Group Checkout Submit
  const handleCheckoutSubmit = async () => {
    if (!cart || cart.items.length === 0) return;
    setIsPlacingOrder(true);

    try {
      const res = await fetch(`/api/shared-cart/${selectedClusterId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: checkoutPaymentMethod,
          deliveryDate: checkoutDeliveryDate,
          pickupLocation: checkoutPickupLocation || cart.deliveryAddress,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.cart) setCart(data.cart);
        setOrderReceipt(data.receiptNumber);
        addToast(
          isHi
            ? `🎉 बधाई! सामूहिक ऑर्डर सबमिट हो गया (रसीद #${data.receiptNumber})`
            : `🎉 Order placed successfully! (Receipt #${data.receiptNumber})`,
          'success'
        );
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to place order', 'error');
      }
    } catch {
      addToast('Checkout failed', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Calculations for current user
  const userItems = cart?.items.filter((item) =>
    item.contributors.some((c) => c.userId === currentUserId)
  ) || [];

  const userTotalWholesale = userItems.reduce((acc, item) => {
    const userContrib = item.contributors.find((c) => c.userId === currentUserId);
    return acc + (userContrib ? userContrib.quantity * item.wholesalePrice : 0);
  }, 0);

  const userTotalRetail = userItems.reduce((acc, item) => {
    const userContrib = item.contributors.find((c) => c.userId === currentUserId);
    return acc + (userContrib ? userContrib.quantity * item.retailPrice : 0);
  }, 0);

  const userSavings = Math.max(0, userTotalRetail - userTotalWholesale);

  // Group split details
  const allContributorsMap = new Map<string, { userId: string; userName: string; userVillage: string; totalItems: number; totalAmount: number }>();
  if (cart) {
    for (const item of cart.items) {
      for (const c of item.contributors) {
        const existing = allContributorsMap.get(c.userId) || {
          userId: c.userId,
          userName: c.userName,
          userVillage: c.userVillage || cart.village,
          totalItems: 0,
          totalAmount: 0,
        };
        existing.totalItems += c.quantity;
        existing.totalAmount += c.quantity * item.wholesalePrice;
        allContributorsMap.set(c.userId, existing);
      }
    }
  }
  const allContributors = Array.from(allContributorsMap.values());

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Cluster Switcher */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <ShoppingCart className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-900/60 border border-emerald-400/40 rounded-full text-xs font-semibold text-emerald-200 flex items-center gap-1.5 shadow-sm">
                <Users className="w-3.5 h-3.5 text-emerald-300" />
                {isHi ? 'सामूहिक सहकारी खरीद' : isGu ? 'સહકારી ખરીદી' : 'Cooperative Group Cart'}
              </span>

              {cart?.status === 'OPEN' && (
                <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-full text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {isHi ? 'खुला है (सामान जोड़ें)' : 'Open (Adding Items)'}
                </span>
              )}
              {cart?.status === 'LOCKED' && (
                <span className="px-2.5 py-0.5 bg-amber-500/30 border border-amber-400 text-amber-200 rounded-full text-xs font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-300" />
                  {isHi ? 'लॉक है (समीक्षा जारी)' : 'Locked (Under Review)'}
                </span>
              )}
              {cart?.status === 'ORDER_PLACED' && (
                <span className="px-2.5 py-0.5 bg-blue-500/30 border border-blue-300 text-blue-200 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-300" />
                  {isHi ? 'ऑर्डर सबमिट हो चुका है' : 'Order Placed'}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <ShoppingCart className="w-7 h-7 text-emerald-300" />
              {isHi ? 'साझा क्लस्टर शॉपिंग कार्ट' : isGu ? 'શેર્ડ ક્લસ્ટર શોપિંગ કાર્ટ' : 'Shared Cluster Shopping Cart'}
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
              {isHi
                ? 'क्लस्टर के सभी किसान भाई मिलकर थोक में खाद, बीज व कृषि उपकरण जोड़ें। जितनी ज्यादा मात्रा होगी, उतनी अधिक थोक छूट व मुफ्त परिवहन मिलेगा!'
                : 'Cluster farmers combine bulk orders for seeds, fertilizers & machinery to unlock tiered cooperative discounts and free freight.'}
            </p>
          </div>

          {/* Cluster Switcher dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start lg:self-center">
            <select
              aria-label="Select Farm Cluster"
              value={selectedClusterId}
              onChange={(e) => setSelectedClusterId(e.target.value)}
              className="bg-emerald-950/80 border border-emerald-500/50 text-white rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
            >
              {CLUSTERS.map((c) => (
                <option key={c.id} value={c.id} className="bg-emerald-900 text-white">
                  📍 {c.village} ({c.name.split(' ')[0]})
                </option>
              ))}
            </select>

            <button
              onClick={() => fetchCart(false)}
              disabled={isRefreshing}
              title="Refresh Cart"
              className="p-2 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 rounded-xl transition flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {onSwitchToChat && (
              <button
                onClick={onSwitchToChat}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>💬 {isHi ? 'क्लस्टर चैट' : 'Cluster Chat'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Coordinator & Pickup strip */}
        {cart && (
          <div className="mt-4 pt-3 border-t border-emerald-600/40 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-100">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span className="font-medium">{cart.deliveryAddress}</span>
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-300" />
                <span>समन्वयक: <strong>{cart.coordinatorName}</strong> ({cart.coordinatorPhone})</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleLock}
                disabled={cart.status === 'ORDER_PLACED'}
                className="px-2.5 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 text-xs font-medium flex items-center gap-1 transition"
              >
                {cart.status === 'OPEN' ? (
                  <>
                    <Lock className="w-3 h-3 text-amber-300" />
                    <span>{isHi ? 'ऑर्डर लॉक करें' : 'Lock Cart'}</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3 text-emerald-300" />
                    <span>{isHi ? 'कार्ट अनलॉक करें' : 'Unlock Cart'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Key Financial KPIs & Tier Milestone Progress */}
      {cart && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Wholesale Bill */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {isHi ? 'कुल थोक समूह मूल्य' : 'Total Wholesale Value'}
              </span>
              <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <ShoppingCart className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                ₹{cart.totalWholesaleAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-xs line-through text-gray-400">
                ₹{cart.totalRetailAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span>{cart.items.length} {isHi ? 'उत्पाद श्रेणियां' : 'product lines'}</span>
              <span>•</span>
              <span>{allContributors.length} {isHi ? 'किसान जुड़े' : 'farmers participating'}</span>
            </div>
          </div>

          {/* Net Cluster Savings */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {isHi ? 'कुल क्लस्टर सामूहिक बचत' : 'Net Cluster Savings'}
              </span>
              <span className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
                <TrendingDown className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                ₹{cart.totalSavings.toLocaleString('en-IN')}
              </span>
              {cart.totalRetailAmount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 rounded-full">
                  {Math.round((cart.totalSavings / cart.totalRetailAmount) * 100)}% {isHi ? 'छूट' : 'OFF'}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {isHi ? 'सीधे कारखाने व प्राथमिक डीलर थोक दर' : 'Factory wholesale direct rate'}
            </p>
          </div>

          {/* Your Share in Order */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {isHi ? 'आपका हिस्सा (देय राशि)' : 'Your Share in Cart'}
              </span>
              <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-700 dark:text-blue-400">
                ₹{userTotalWholesale.toLocaleString('en-IN')}
              </span>
              {userSavings > 0 && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  (बचत ₹{userSavings.toLocaleString('en-IN')})
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {userItems.length > 0
                ? isHi ? `आपके ${userItems.length} उत्पाद शामिल हैं` : `${userItems.length} items pledged by you`
                : isHi ? 'आपने अभी तक सामान नहीं जोड़ा है' : 'You have not added items yet'}
            </p>
          </div>

          {/* Next Tier Discount Target */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {isHi ? 'थोक छूट माइलस्टोन' : 'Tier Discount Target'}
                </span>
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-md">
                  मुफ्त भाड़ा
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 font-medium">
                {isHi
                  ? '50 बोरी का लक्ष्य पूरा होने पर ₹1,500 की अतिरिक्त छूट और पंचायत गोदाम तक 100% फ्री डिलीवरी!'
                  : 'Reach 50 bags for extra ₹1,500 discount & free APMC godown transport!'}
              </p>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                <span>{isHi ? 'प्रगति' : 'Progress'}</span>
                <span>86 / 100 Units (86%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2 rounded-full w-[86%] transition-all"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Action Bar (Add Item + Group Checkout) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {isHi ? 'सामूहिक आर्डर सूची' : 'Group Order Items'}
          </span>
          <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold">
            {cart?.items.length || 0}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {cart?.status === 'OPEN' && (
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isHi ? '+ सामान जोड़ें' : '+ Add Item to Cart'}</span>
            </button>
          )}

          {cart && cart.items.length > 0 && cart.status !== 'ORDER_PLACED' && (
            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-600/20 transition flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isHi ? 'सामूहिक चेकआउट एवं बिल विभाजन' : 'Group Checkout & Split Bill'}</span>
            </button>
          )}

          {cart?.status === 'ORDER_PLACED' && (
            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isHi ? 'रसीद व विवरण देखें' : 'View Group Receipt'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Items List */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">
            {isHi ? 'क्लस्टर साझा कार्ट लोड हो रहा है...' : 'Loading cluster cart...'}
          </p>
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
          <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {isHi ? 'यह सामूहिक कार्ट अभी खाली है' : 'This shared cart is empty'}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mt-1">
            {isHi
              ? 'क्लस्टर के पहले किसान भाई बनकर खाद, बीज या कीटनाशक जोड़ें और अन्य किसानों को आमंत्रित करें!'
              : 'Be the first farmer in your cluster to add farm supplies and invite neighbors to pool!'}
          </p>
          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isHi ? '+ पहला सामान जोड़ें' : '+ Add First Item'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item) => {
            const userContribution = item.contributors.find((c) => c.userId === currentUserId);
            const tierProgressPct = Math.min(100, Math.round((item.totalQuantity / item.targetTierQty) * 100));
            const remainingToTier = Math.max(0, item.targetTierQty - item.totalQuantity);
            const itemSavings = (item.retailPrice - item.wholesalePrice) * item.totalQuantity;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-600/50 transition"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Item Image & Title */}
                    <div className="flex items-start gap-4">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                          <Package className="w-8 h-8" />
                        </div>
                      )}

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-md">
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            इकाई: <strong>{item.unit}</strong>
                          </span>
                          {item.supplierName && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                              • आपूर्तिकर्ता: {item.supplierName}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                          {item.title}
                        </h3>

                        {/* Pricing */}
                        <div className="flex flex-wrap items-baseline gap-3 mt-2">
                          <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                            ₹{item.wholesalePrice.toLocaleString('en-IN')}{' '}
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                              / {item.unit.split(' ')[0]} (थोक)
                            </span>
                          </span>
                          <span className="text-sm line-through text-gray-400">
                            ₹{item.retailPrice.toLocaleString('en-IN')} (खुदरा)
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                            ₹{(item.retailPrice - item.wholesalePrice).toLocaleString('en-IN')} प्रति इकाई बचत!
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right summary pill */}
                    <div className="bg-gray-50 dark:bg-gray-900/60 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 min-w-[200px] flex flex-col justify-between">
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{isHi ? 'कार्ट में कुल मात्रा' : 'Cart Total Qty'}</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {item.totalQuantity} {item.unit.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                        <span>{isHi ? 'कुल थोक मूल्य' : 'Total Bulk Value'}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{(item.totalQuantity * item.wholesalePrice).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                        <span>{isHi ? 'समूह बचत' : 'Group Savings'}</span>
                        <span>₹{itemSavings.toLocaleString('en-IN')}</span>
                      </div>

                      {/* Add share button */}
                      {cart.status === 'OPEN' && (
                        <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedItemForContribute(item);
                              setContributeQty(5);
                              setIsContributeModalOpen(true);
                            }}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isHi ? '+ अपनी मात्रा जोड़ें' : '+ Add My Share'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tier Target Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {remainingToTier > 0 ? (
                          isHi ? (
                            <>
                              टियर-2 थोक डिस्काउंट लक्ष्य: <strong>{item.targetTierQty} {item.unit.split(' ')[0]}</strong> (केवल <strong>{remainingToTier}</strong> और चाहिए)
                            </>
                          ) : (
                            <>
                              Tier Target: <strong>{item.targetTierQty} {item.unit.split(' ')[0]}</strong> ({remainingToTier} to go)
                            </>
                          )
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isHi ? '🎉 अधिकतम थोक छूट टियर अनलॉक हो चुका है!' : '🎉 Max Wholesale Tier Unlocked!'}
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {item.totalQuantity} / {item.targetTierQty} ({tierProgressPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          tierProgressPct >= 100
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                        }`}
                        style={{ width: `${tierProgressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Contributors Breakdown */}
                  <div className="mt-4 bg-gray-50/70 dark:bg-gray-900/40 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        {isHi ? 'शामिल किसान व उनकी मात्रा' : 'Farmer Contributors'} ({item.contributors.length})
                      </span>
                      {userContribution && (
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          {isHi ? `आपका हिस्सा: ${userContribution.quantity} ${item.unit.split(' ')[0]}` : `Your pledge: ${userContribution.quantity}`}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {item.contributors.map((contrib, idx) => {
                        const isMe = contrib.userId === currentUserId;
                        return (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                              isMe
                                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 font-semibold'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="truncate mr-2">
                              <span className="text-gray-900 dark:text-white font-medium">
                                {contrib.userName} {isMe && '(आप)'}
                              </span>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                {contrib.userVillage} {contrib.notes ? `• "${contrib.notes}"` : ''}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded font-bold">
                                {contrib.quantity} {item.unit.split(' ')[0]}
                              </span>
                              {isMe && cart.status === 'OPEN' && (
                                <button
                                  onClick={() => handleRemovePledge(item.id, true)}
                                  title="Remove my share"
                                  className="p-1 hover:text-red-600 text-gray-400 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. ADD ITEM MODAL */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <ShoppingCart className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isHi ? 'सामूहिक कार्ट में उत्पाद जोड़ें' : 'Add Item to Cluster Cart'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeCluster.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Toggle Preset vs Custom */}
            <div className="flex bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl my-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsCustomItemMode(false)}
                className={`flex-1 py-2 rounded-lg transition ${
                  !isCustomItemMode
                    ? 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                🌾 {isHi ? 'प्रमाणित कृषि उत्पाद कैटलॉग' : 'Standard Catalog Presets'}
              </button>
              <button
                type="button"
                onClick={() => setIsCustomItemMode(true)}
                className={`flex-1 py-2 rounded-lg transition ${
                  isCustomItemMode
                    ? 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                ✏️ {isHi ? '+ कस्टम उत्पाद लिखें' : '+ Custom Farm Supply'}
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              {!isCustomItemMode ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {isHi ? 'लोकप्रिय सहकारी उत्पाद चुनें:' : 'Select Supply from Catalog:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {CATALOG_PRESETS.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPresetIndex(idx)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                          selectedPresetIndex === idx
                            ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-white dark:bg-gray-700/40 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img src={preset.imageUrl} alt={preset.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 dark:text-white truncate">
                            {preset.title}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            थोक: <strong>₹{preset.wholesalePrice}</strong> (बचत ₹{preset.retailPrice - preset.wholesalePrice})
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            लक्ष्य: {preset.targetTierQty} {preset.unit.split(' ')[0]}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isHi ? 'वस्तु का नाम *' : 'Item Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahyco Bt Cotton Hybrid Seed, Coromandel 19:19:19"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isHi ? 'श्रेणी' : 'Category'}
                    </label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-medium"
                    >
                      <option value="Fertilizer">Fertilizer (खाद)</option>
                      <option value="Seeds">Seeds (बीज)</option>
                      <option value="Bio-Nutrients">Bio-Nutrients & Pesticides</option>
                      <option value="Solar & Irrigation">Solar & Drip Irrigation</option>
                      <option value="Cattle Feed">Cattle Feed (पशु आहार)</option>
                      <option value="Machinery & Tools">Machinery & Hardware</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isHi ? 'माप इकाई' : 'Unit'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bags (50kg), Quintals, Rolls"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isHi ? 'खुदरा मूल्य (₹ MRP)' : 'Retail Price (₹ MRP)'}
                    </label>
                    <input
                      type="number"
                      value={customRetailPrice}
                      onChange={(e) => setCustomRetailPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isHi ? 'प्रस्तावित थोक मूल्य (₹)' : 'Target Wholesale Price (₹)'}
                    </label>
                    <input
                      type="number"
                      value={customWholesalePrice}
                      onChange={(e) => setCustomWholesalePrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Quantity required by this farmer */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    {isHi ? 'आपकी आवश्यक मात्रा (Your Required Share) *' : 'Your Required Quantity *'}
                  </label>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {customQuantity} {isCustomItemMode ? customUnit : CATALOG_PRESETS[selectedPresetIndex].unit}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomQuantity(Math.max(1, customQuantity - 1))}
                    className="w-9 h-9 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(Math.max(1, Number(e.target.value)))}
                    className="flex-1 text-center py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-extrabold text-sm text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomQuantity(customQuantity + 1)}
                    className="w-9 h-9 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isHi ? 'टिप्पणी या विशेष डिलीवरी निर्देश (वैकल्पिक)' : 'Notes or Delivery Instructions (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. खेत के बोरवेल पॉइंट पर पहुंचाएं, या 10 तारीख से पहले चाहिए"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isHi ? 'सामूहिक कार्ट में जोड़ें' : 'Add to Group Cart'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CONTRIBUTE TO EXISTING ITEM MODAL */}
      {isContributeModalOpen && selectedItemForContribute && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                {isHi ? 'अपनी मात्रा शामिल करें' : 'Pledge Quantity'}
              </h3>
              <button
                onClick={() => {
                  setIsContributeModalOpen(false);
                  setSelectedItemForContribute(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="my-3 p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="font-bold text-gray-900 dark:text-white text-sm">
                {selectedItemForContribute.title}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mt-1">
                थोक मूल्य: ₹{selectedItemForContribute.wholesalePrice} / {selectedItemForContribute.unit} (बचत ₹{selectedItemForContribute.retailPrice - selectedItemForContribute.wholesalePrice})
              </div>
            </div>

            <form onSubmit={handleContributeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isHi ? `आवश्यक मात्रा (${selectedItemForContribute.unit}) *` : 'Required Quantity *'}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setContributeQty(Math.max(1, contributeQty - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold text-gray-800 dark:text-gray-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={contributeQty}
                    onChange={(e) => setContributeQty(Math.max(1, Number(e.target.value)))}
                    className="flex-1 text-center py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-black text-base text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setContributeQty(contributeQty + 1)}
                    className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold text-gray-800 dark:text-gray-200"
                  >
                    +
                  </button>
                </div>
                <div className="mt-2 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  कुल अनुमानित लागत: ₹{(contributeQty * selectedItemForContribute.wholesalePrice).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isHi ? 'टिप्पणी (वैकल्पिक)' : 'Notes (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 बोरी खेत नंबर 2 के लिए"
                  value={contributeNotes}
                  onChange={(e) => setContributeNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsContributeModalOpen(false);
                    setSelectedItemForContribute(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-semibold"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  {isHi ? 'पुष्टि करें' : 'Confirm Pledge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. GROUP CHECKOUT & SPLIT BILL MODAL */}
      {isCheckoutModalOpen && cart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 dark:border-gray-700 relative animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-md">
                  <CreditCard className="w-6 h-6" />
                </span>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    {cart.status === 'ORDER_PLACED'
                      ? isHi ? 'सामूहिक ऑर्डर रसीद एवं भुगतान विभाजन' : 'Group Order Receipt & Split Details'
                      : isHi ? 'सामूहिक चेकआउट एवं किसान बिल विभाजन' : 'Group Checkout & Split Bill'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {cart.title} • {activeCluster.village}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Receipt banner if already placed */}
            {cart.status === 'ORDER_PLACED' && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-700 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ऑर्डर सफलतापूर्वक सबमिट हो चुका है
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold rounded-lg">
                    रसीद: {cart.checkoutDetails?.receiptNumber || orderReceipt || 'KB-GRP-2026'}
                  </span>
                </div>
                <div className="mt-2 text-emerald-700 dark:text-emerald-300 flex flex-wrap gap-4">
                  <span>📅 डिलीवरी तिथि: <strong>{cart.checkoutDetails?.deliveryDate}</strong></span>
                  <span>📍 पिकअप: <strong>{cart.checkoutDetails?.pickupLocation}</strong></span>
                  <span>💳 माध्यम: <strong>{cart.checkoutDetails?.paymentMethod}</strong></span>
                </div>
              </div>
            )}

            {/* Individual Split Table */}
            <div className="mt-5">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                {isHi ? 'प्रत्येक किसान का देय हिस्सा (Split Breakdown)' : 'Per-Farmer Split Breakdown'}
              </h3>

              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="py-2.5 px-3.5">{isHi ? 'किसान का नाम' : 'Farmer Name'}</th>
                        <th className="py-2.5 px-3.5">{isHi ? 'गांव' : 'Village'}</th>
                        <th className="py-2.5 px-3.5">{isHi ? 'मात्रा (यूनिट)' : 'Total Units'}</th>
                        <th className="py-2.5 px-3.5 text-right">{isHi ? 'देय थोक राशि' : 'Amount Due'}</th>
                        <th className="py-2.5 px-3.5 text-center">{isHi ? 'स्थिति' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                      {allContributors.map((c, i) => {
                        const isMe = c.userId === currentUserId;
                        return (
                          <tr
                            key={i}
                            className={isMe ? 'bg-emerald-50/70 dark:bg-emerald-950/30 font-semibold' : 'bg-white dark:bg-gray-800'}
                          >
                            <td className="py-2.5 px-3.5 text-gray-900 dark:text-white">
                              {c.userName} {isMe && <span className="text-emerald-600 dark:text-emerald-400 font-bold">(आप)</span>}
                            </td>
                            <td className="py-2.5 px-3.5 text-gray-500 dark:text-gray-400">
                              {c.userVillage}
                            </td>
                            <td className="py-2.5 px-3.5 font-bold text-gray-800 dark:text-gray-200">
                              {c.totalItems} इकाई
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-black text-emerald-700 dark:text-emerald-400">
                              ₹{c.totalAmount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3.5 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                                देय (Pending)
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700/60 font-black text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700">
                      <tr>
                        <td colSpan={2} className="py-2.5 px-3.5">
                          {isHi ? 'कुल सामूहिक योग' : 'Grand Total'}
                        </td>
                        <td className="py-2.5 px-3.5">
                          {cart.items.reduce((acc, i) => acc + i.totalQuantity, 0)} इकाई
                        </td>
                        <td className="py-2.5 px-3.5 text-right text-emerald-700 dark:text-emerald-300 text-sm">
                          ₹{cart.totalWholesaleAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3.5 text-center text-xs text-emerald-600 font-bold">
                          बचत ₹{cart.totalSavings.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Checkout configuration (If not placed yet) */}
            {cart.status !== 'ORDER_PLACED' && (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isHi ? 'भुगतान निपटान माध्यम *' : 'Payment Settlement Mode *'}
                    </label>
                    <select
                      value={checkoutPaymentMethod}
                      onChange={(e: any) => setCheckoutPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                    >
                      <option value="SPLIT_UPI">📱 UPI स्प्लिट (किसान व्यक्तिगत UPI से भुगतान करेंगे)</option>
                      <option value="COOPERATIVE_CREDIT">🏛️ प्राथमिक कृषि साख समिति (PACS Cooperative Account)</option>
                      <option value="CASH_ON_DELIVERY">💵 मंडी गोदाम डिलीवरी पर नकद (Cash on Godown Delivery)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isHi ? 'अनुमानित डिलीवरी तिथि *' : 'Expected Delivery Date *'}
                    </label>
                    <input
                      type="date"
                      value={checkoutDeliveryDate}
                      onChange={(e) => setCheckoutDeliveryDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isHi ? 'कलेक्टिव डिलीवरी/पिकअप स्थान *' : 'Collective Delivery & Pickup Point *'}
                    </label>
                    <input
                      type="text"
                      value={checkoutPickupLocation}
                      onChange={(e) => setCheckoutPickupLocation(e.target.value)}
                      placeholder="e.g. आनंदपुर प्राथमिक सहकारी गोदाम, राजकोट हाईवे"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    {isHi
                      ? 'ऑर्डर सबमिट करने पर क्लस्टर चैट में सभी किसानों को ऑटोमेटिक अधिसूचना भेजी जाएगी और थोक सप्लायर को पर्चेज आर्डर भेजा जाएगा।'
                      : 'Submitting will broadcast order confirmation to all cluster farmers and generate cooperative PO.'}
                  </span>
                </div>
              </div>
            )}

            {/* Footer Action */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {isHi ? 'कुल किसान:' : 'Total Farmers:'} <strong>{allContributors.length}</strong> • {isHi ? 'कुल बचत:' : 'Total Savings:'}{' '}
                <strong className="text-emerald-600">₹{cart.totalSavings.toLocaleString('en-IN')}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50"
                >
                  {isHi ? 'बंद करें' : 'Close'}
                </button>

                {cart.status !== 'ORDER_PLACED' && (
                  <button
                    type="button"
                    onClick={handleCheckoutSubmit}
                    disabled={isPlacingOrder}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                  >
                    {isPlacingOrder ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{isHi ? 'सामूहिक आर्डर की पुष्टि करें' : 'Confirm Group Order'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
