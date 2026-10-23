import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  ShoppingBag,
  TrendingDown,
  Users,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Calculator,
  MessageSquare,
  Send,
  Sparkles,
  Zap,
  MapPin,
  Clock,
  Tag,
  Check,
  Search,
  Filter,
  Package,
  Sun,
  Truck,
  Building,
  HelpCircle,
  Share2,
  X,
  ChevronRight,
  BadgePercent,
  Coins,
} from 'lucide-react';
import { BulkOrderRequirement, GroupBuyMessage, GroupBuyPledge } from '../../shared/types';

export const BulkBuyingPage: React.FC = () => {
  const { currentUser } = useUserStore();
  const { addToast, language } = useApp();

  const [requirements, setRequirements] = useState<BulkOrderRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<BulkOrderRequirement | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'pledge' | 'chat' | 'members'>('pledge');

  // Pledge form states
  const [pledgeQty, setPledgeQty] = useState('10');
  const [pledgeNotes, setPledgeNotes] = useState('');
  const [submittingPledge, setSubmittingPledge] = useState(false);

  // Group chat states
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');

  // "Buy Anything" / Create Group Buy Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newCategory, setNewCategory] = useState('Fertilizer');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newTargetQty, setNewTargetQty] = useState('50');
  const [newUnit, setNewUnit] = useState('Bags (50kg)');
  const [newRetailPrice, setNewRetailPrice] = useState('1200');
  const [newBulkPrice, setNewBulkPrice] = useState('920');
  const [newLocation, setNewLocation] = useState('Anandpur Village Depot');
  const [creatingGroupBuy, setCreatingGroupBuy] = useState(false);

  const fetchRequirements = () => {
    setLoading(true);
    fetch('/api/bulk-buying')
      .then((res) => res.json())
      .then((data) => {
        if (data.requirements) setRequirements(data.requirements);
      })
      .catch((err) => {
        console.error('Failed to fetch bulk buying pools:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  // Sync selectedReq if updated in list
  useEffect(() => {
    if (selectedReq) {
      const updated = requirements.find((r) => r.id === selectedReq.id);
      if (updated) setSelectedReq(updated);
    }
  }, [requirements]);

  // Categories list
  const categories = [
    'All',
    'Fertilizer',
    'Seeds',
    'Solar & Irrigation',
    'Machinery & Tools',
    'Cattle Feed',
    'General Hardware',
  ];

  // Distinct groups
  const availableGroups = useMemo(() => {
    const set = new Set<string>();
    requirements.forEach((r) => {
      if (r.groupName) set.add(r.groupName);
      else if (r.clusterName) set.add(r.clusterName);
    });
    return ['All', ...Array.from(set)];
  }, [requirements]);

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      const matchSearch =
        searchQuery === '' ||
        req.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.groupName && req.groupName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        req.clusterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = selectedCategory === 'All' || req.category === selectedCategory;
      const matchGroup =
        selectedGroup === 'All' ||
        req.groupName === selectedGroup ||
        req.clusterName === selectedGroup;

      return matchSearch && matchCat && matchGroup;
    });
  }, [requirements, searchQuery, selectedCategory, selectedGroup]);

  // Overall statistics
  const totalSavingsInr = useMemo(() => {
    return requirements.reduce((acc, r) => {
      const diff = Math.max(0, r.standardRetailPrice - r.negotiatedBulkPrice);
      return acc + diff * r.currentQuantity;
    }, 0);
  }, [requirements]);

  const totalConnectedMembers = useMemo(() => {
    return requirements.reduce((acc, r) => acc + (r.connectedMembersCount || r.farmerPledges.length || 5), 0);
  }, [requirements]);

  // Handle Join & Connect to Group
  const handleJoinGroup = async (req: BulkOrderRequirement) => {
    try {
      const res = await fetch('/api/bulk-buying/join-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementId: req.id,
          farmerName: currentUser?.fullName || 'Farmer Member',
          village: currentUser?.village || 'Anandpur',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRequirements((prev) => prev.map((r) => (r.id === data.requirement.id ? data.requirement : r)));
        addToast(
          language === 'hi' ? 'ग्रुप से जुड़े' : 'Connected to Group',
          language === 'hi'
            ? `आप सफलतापूर्वक "${req.groupName || req.itemName}" ग्रुप में जुड़ गए हैं!`
            : `You are now connected to "${req.groupName || req.itemName}"!`,
          'success'
        );
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    }
  };

  // Handle Pledge
  const handlePledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    const qty = parseInt(pledgeQty) || 1;
    if (qty <= 0) return;

    setSubmittingPledge(true);
    try {
      const res = await fetch('/api/bulk-buying/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementId: selectedReq.id,
          farmerId: currentUser?.id || `usr_farmer_${Date.now()}`,
          farmerName: currentUser?.fullName || 'Ramesh Patel',
          village: currentUser?.village || 'Anandpur',
          quantity: qty,
          notes: pledgeNotes || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRequirements((prev) => prev.map((r) => (r.id === data.requirement.id ? data.requirement : r)));
        setSelectedReq(data.requirement);
        setPledgeNotes('');
        addToast(
          language === 'hi' ? 'ऑर्डर प्लेज दर्ज हुआ' : 'Pledge Recorded!',
          language === 'hi'
            ? `आपने ${qty} ${selectedReq.unit} का प्लेज सफलतापूर्वक दर्ज किया।`
            : `Successfully pledged ${qty} ${selectedReq.unit} of ${selectedReq.itemName}.`,
          'success'
        );
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    } finally {
      setSubmittingPledge(false);
    }
  };

  // Handle Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !chatInput.trim()) return;

    setSendingMsg(true);
    const msgText = chatInput.trim();
    setChatInput('');

    try {
      const res = await fetch('/api/bulk-buying/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementId: selectedReq.id,
          senderId: currentUser?.id || 'usr_farmer',
          senderName: currentUser?.fullName || 'Farmer Member',
          senderRole: currentUser?.role === 'CHAMPION' ? 'Village Champion' : 'Farmer',
          text: msgText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRequirements((prev) => prev.map((r) => (r.id === data.requirement.id ? data.requirement : r)));
        setSelectedReq(data.requirement);
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  // Handle Create New Custom / General Group Buy
  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setCreatingGroupBuy(true);
    try {
      const retail = parseFloat(newRetailPrice) || 1000;
      const bulk = parseFloat(newBulkPrice) || Math.round(retail * 0.75);

      const res = await fetch('/api/bulk-buying/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: newGroupName.trim() || `${newItemName} Buying Collective`,
          category: newCategory,
          itemName: newItemName.trim(),
          itemDescription: newItemDesc.trim() || `Group buy for ${newItemName} with collective wholesale delivery.`,
          targetQuantity: parseInt(newTargetQty) || 50,
          unit: newUnit,
          standardRetailPrice: retail,
          negotiatedBulkPrice: bulk,
          location: newLocation.trim() || 'Central Village Warehouse',
          creatorName: currentUser?.fullName || 'Farmer Member',
          creatorId: currentUser?.id || 'usr_farmer',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRequirements((prev) => [data.requirement, ...prev]);
        setShowCreateModal(false);
        setNewItemName('');
        setNewGroupName('');
        setNewItemDesc('');
        addToast(
          language === 'hi' ? 'सामूहिक खरीद शुरू हुई' : 'Group Buy Pool Created!',
          language === 'hi'
            ? `"${data.requirement.itemName}" के लिए सामूहिक खरीद शुरू हो गई है।`
            : `Group buy for "${data.requirement.itemName}" is now open for all members!`,
          'success'
        );
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    } finally {
      setCreatingGroupBuy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5">
      {/* HERO BANNER: Collective Purchasing Power & Group Connection */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-stone-900 to-teal-950 text-white p-6 sm:p-8 border border-emerald-800/40 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'hi' ? 'सामूहिक खरीद क्लब' : 'COOPERATIVE GROUP PROCUREMENT'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display text-white">
              {language === 'hi' ? 'ग्रुप में जुड़ें और कुछ भी थोक भाव में खरीदें' : 'Connect in Groups & Buy Anything Together'}
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {language === 'hi'
                ? 'अपने गांव के किसानों और पड़ोसियों के साथ समूह बनाएं। खाद, प्रमाणित बीज, सोलर पंप, ड्रिप सिस्टम, कीटनाशक, औजार, पशु आहार या कोई भी सामान मिलकर सीधे निर्माताओं से 20% से 35% थोक छूट पर मंगाएं!'
                : 'Form groups with fellow farmers & neighbors to pool buying power. Procure fertilizer, certified seeds, 5HP solar pumps, drip lateral kits, sprayers, machinery, cattle feed, or request ANY custom item at 20%–35% wholesale discounts.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? '+ कुछ भी खरीदने के लिए नया ग्रुप बनाएं' : '+ Start Group Buy (Buy Anything)'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="mt-6 pt-5 border-t border-emerald-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-white">
          <div className="p-3 bg-white/5 backdrop-blur-xs rounded-xl border border-white/10">
            <div className="text-[11px] text-stone-400 font-medium">
              {language === 'hi' ? 'कुल सामूहिक बचत' : 'Collective Savings'}
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
              ₹{totalSavingsInr.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-3 bg-white/5 backdrop-blur-xs rounded-xl border border-white/10">
            <div className="text-[11px] text-stone-400 font-medium">
              {language === 'hi' ? 'सक्रिय ग्रुप्स' : 'Active Buying Pools'}
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
              {requirements.length} {language === 'hi' ? 'समूह' : 'Pools'}
            </div>
          </div>

          <div className="p-3 bg-white/5 backdrop-blur-xs rounded-xl border border-white/10">
            <div className="text-[11px] text-stone-400 font-medium">
              {language === 'hi' ? 'जुड़े हुए सदस्य' : 'Connected Members'}
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-amber-300 font-mono mt-0.5">
              {totalConnectedMembers}+ {language === 'hi' ? 'किसान' : 'Farmers'}
            </div>
          </div>

          <div className="p-3 bg-white/5 backdrop-blur-xs rounded-xl border border-white/10">
            <div className="text-[11px] text-stone-400 font-medium">
              {language === 'hi' ? 'औसत थोक छूट' : 'Avg Bulk Discount'}
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-teal-300 font-mono mt-0.5">
              24% - 35% OFF
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'सामान, खाद, बीज, सोलर पंप, गांव या ग्रुप खोजें...'
                  : 'Search item, fertilizer, seeds, solar pump, group, village...'
              }
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 shrink-0 font-medium">
              {language === 'hi' ? 'ग्रुप चुनें:' : 'Group Circle:'}
            </span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              {availableGroups.map((g) => (
                <option key={g} value={g}>
                  {g === 'All' ? (language === 'hi' ? 'सभी ग्रुप्स' : 'All Buying Groups') : g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat === 'All' ? (language === 'hi' ? 'सभी श्रेणियां' : 'All Items') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* GROUP BUYING CARDS GRID */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500">
            {language === 'hi' ? 'सामूहिक खरीद ग्रुप्स लोड हो रहे हैं...' : 'Loading group buying pools...'}
          </p>
        </div>
      ) : filteredRequirements.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-10 border border-stone-200 dark:border-stone-800 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">
              {language === 'hi' ? 'कोई मेल खाने वाला ग्रुप नहीं मिला' : 'No Matching Buying Group Found'}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {language === 'hi'
                ? 'आप अपनी पसंद की किसी भी वस्तु (खाद, बीज, सोलर पंप, औजार, घरेलू सामान) के लिए नया सामूहिक खरीद समूह तुरंत शुरू कर सकते हैं!'
                : 'You can start a new cooperative group buy right now for any product, equipment, seed, or supplies!'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'नया ग्रुप बाय शुरू करें' : 'Start a New Group Buy'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequirements.map((item) => {
            const percent = Math.min(100, Math.round((item.currentQuantity / item.targetQuantity) * 100));
            const hasPledged = item.farmerPledges.some((p) => p.farmerId === currentUser?.id);
            const remainingToTarget = Math.max(0, item.targetQuantity - item.currentQuantity);
            const unitSavings = Math.max(0, item.standardRetailPrice - item.negotiatedBulkPrice);
            const collectiveSavings = unitSavings * item.currentQuantity;
            const messagesCount = item.chatMessages?.length || 0;
            const membersCount = item.connectedMembersCount || (item.farmerPledges.length + 4);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Top: Group Badge & Category */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 truncate">
                      <Users className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.groupName || item.clusterName}</span>
                    </span>

                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 shrink-0">
                      {item.savingsPercentage}% OFF
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">
                      {item.itemName}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                      {item.itemDescription || 'Bulk cooperative buying pool for registered smallholder farmers.'}
                    </p>
                  </div>
                </div>

                {/* Price Matrix */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/70 dark:border-stone-700/60 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">
                      {language === 'hi' ? 'बाज़ार का खुदरा भाव' : 'Standard Market Rate'}
                    </span>
                    <span className="line-through text-stone-400 font-bold text-xs sm:text-sm">
                      ₹{item.standardRetailPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-400"> / {item.unit}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">
                      {language === 'hi' ? 'ग्रुप थोक भाव' : 'Unlocked Group Price'}
                    </span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm sm:text-base font-mono">
                      ₹{item.negotiatedBulkPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400"> / {item.unit}</span>
                  </div>
                </div>

                {/* Progress toward group bulk target */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-600 dark:text-stone-300 text-[11px]">
                      {language === 'hi' ? 'ग्रुप प्लेज:' : 'Pledged:'}{' '}
                      <strong className="text-stone-900 dark:text-white font-mono">{item.currentQuantity}</strong> /{' '}
                      {item.targetQuantity} {item.unit}
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        percent >= 100
                          ? 'bg-emerald-600'
                          : percent >= 50
                          ? 'bg-teal-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-stone-500 pt-0.5">
                    <span>
                      {remainingToTarget > 0
                        ? `${remainingToTarget} ${item.unit} left to unlock full quota`
                        : '🎉 Wholesale Quota 100% Achieved!'}
                    </span>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      ₹{collectiveSavings.toLocaleString()} saved
                    </span>
                  </div>
                </div>

                {/* Group Connection & Chat Strip */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{membersCount} {language === 'hi' ? 'जुड़े हैं' : 'connected'}</span>
                    </span>

                    <button
                      onClick={() => {
                        setSelectedReq(item);
                        setActiveModalTab('chat');
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3 text-stone-400" />
                      <span>{messagesCount}</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{item.location || 'Local Hub'}</span>
                  </span>
                </div>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedReq(item);
                      setActiveModalTab('chat');
                    }}
                    className="w-full py-2 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                    <span>{language === 'hi' ? 'ग्रुप चर्चा' : 'Group Chat'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedReq(item);
                      setActiveModalTab('pledge');
                    }}
                    className="w-full py-2 px-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{hasPledged ? (language === 'hi' ? '+ और जोड़ें' : '+ Add More') : (language === 'hi' ? 'ग्रुप से खरीदें' : 'Buy in Group')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PLEDGE & GROUP DISCUSSION MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex justify-between items-start bg-stone-50/70 dark:bg-stone-800/40">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                    {selectedReq.category}
                  </span>
                  <span className="text-xs text-stone-500 truncate">
                    {selectedReq.groupName || selectedReq.clusterName}
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                  {selectedReq.itemName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="w-8 h-8 rounded-full bg-stone-200/60 dark:bg-stone-700/60 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-800/60 px-4 pt-2 gap-2">
              <button
                onClick={() => setActiveModalTab('pledge')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === 'pledge'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'प्लेज / ऑर्डर करें' : 'Buy / Pledge'}</span>
              </button>

              <button
                onClick={() => setActiveModalTab('chat')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === 'chat'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ग्रुप चर्चा' : 'Group Chat'}</span>
                <span className="text-[10px] bg-stone-200 dark:bg-stone-700 px-1.5 py-0.2 rounded-full">
                  {selectedReq.chatMessages?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveModalTab('members')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === 'members'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ग्रुप सदस्य' : 'Group Members'}</span>
                <span className="text-[10px] bg-stone-200 dark:bg-stone-700 px-1.5 py-0.2 rounded-full">
                  {selectedReq.farmerPledges.length}
                </span>
              </button>
            </div>

            {/* TAB 1: PLEDGE QUANTITY & COST CALCULATOR */}
            {activeModalTab === 'pledge' && (
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
                {/* Volume Discount Roadmap */}
                {selectedReq.tierDiscounts && selectedReq.tierDiscounts.length > 0 && (
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>{language === 'hi' ? 'थोक छूट स्लैब (टियर)' : 'Volume Discount Tiers'}</span>
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                        {language === 'hi' ? 'जितना बड़ा समूह, उतना सस्ता' : 'Bigger group = Bigger discount'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {selectedReq.tierDiscounts.map((tier, idx) => {
                        const isReached = selectedReq.currentQuantity >= tier.minQty;
                        return (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border text-[11px] transition-all ${
                              isReached
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                            }`}
                          >
                            <div className="font-bold">{tier.label}</div>
                            <div className="text-xs font-mono font-extrabold mt-0.5">
                              ₹{tier.priceInr} <span className="text-[10px]">({tier.discountPct}% OFF)</span>
                            </div>
                            {isReached && <div className="text-[9px] mt-0.5">✓ Achieved!</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="grid grid-cols-3 gap-2.5 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px] block">Retail Price</span>
                    <span className="line-through text-stone-400 font-bold text-xs">₹{selectedReq.standardRetailPrice}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 dark:text-emerald-400 text-[10px] block font-semibold">Group Bulk Price</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm font-mono">₹{selectedReq.negotiatedBulkPrice}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 dark:text-emerald-400 text-[10px] block font-semibold">You Save / Unit</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm font-mono">
                      ₹{selectedReq.standardRetailPrice - selectedReq.negotiatedBulkPrice}
                    </span>
                  </div>
                </div>

                <form onSubmit={handlePledge} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-stone-800 dark:text-stone-200 block mb-1.5">
                      {language === 'hi'
                        ? `आपको कितने ${selectedReq.unit} चाहिए?`
                        : `How many ${selectedReq.unit} do you want to pledge?`}
                    </label>

                    {/* Quick quantity presets */}
                    <div className="flex gap-2 mb-2">
                      {[1, 5, 10, 20, 50].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPledgeQty(preset.toString())}
                          className={`px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                            pledgeQty === preset.toString()
                              ? 'bg-emerald-800 text-white border-emerald-800'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                          }`}
                        >
                          +{preset}
                        </button>
                      ))}
                    </div>

                    <input
                      type="number"
                      required
                      min="1"
                      value={pledgeQty}
                      onChange={(e) => setPledgeQty(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-stone-600 dark:text-stone-400 block mb-1">
                      {language === 'hi' ? 'डिलीवरी या खेत का विवरण (वैकल्पिक):' : 'Delivery / Plot Notes (Optional):'}
                    </label>
                    <input
                      type="text"
                      value={pledgeNotes}
                      onChange={(e) => setPledgeNotes(e.target.value)}
                      placeholder={language === 'hi' ? 'उदा: पंचायत गोदाम पर लेना है, या उत्तर खेत बोरवेल...' : 'e.g. Drop at village depot, or near north borewell...'}
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Dynamic Cost & Savings Calculation */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-stone-600 dark:text-stone-300">
                      <span>Standard Retail Value:</span>
                      <span className="line-through font-mono">
                        ₹{((parseInt(pledgeQty) || 0) * selectedReq.standardRetailPrice).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm font-extrabold text-stone-900 dark:text-white pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
                      <span>{language === 'hi' ? 'आपका समूह थोक मूल्य:' : 'Your Group Wholesale Cost:'}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 text-base font-mono">
                        ₹{((parseInt(pledgeQty) || 0) * selectedReq.negotiatedBulkPrice).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <span>{language === 'hi' ? 'आपकी कुल सीधी बचत:' : 'Your Total Pocket Savings:'}</span>
                      <span className="font-mono">
                        ₹{(
                          (parseInt(pledgeQty) || 0) *
                          (selectedReq.standardRetailPrice - selectedReq.negotiatedBulkPrice)
                        ).toLocaleString('en-IN')} ({selectedReq.savingsPercentage}% Saved)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReq(null)}
                      className="w-1/3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>

                    <button
                      type="submit"
                      disabled={submittingPledge}
                      className="w-2/3 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-400 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {submittingPledge
                          ? (language === 'hi' ? 'प्लेज दर्ज हो रहा है...' : 'Recording Pledge...')
                          : (language === 'hi' ? 'ग्रुप में ऑर्डर प्लेज पक्का करें' : 'Confirm Group Order Pledge')}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: LIVE GROUP CHAT & CONNECTION */}
            {activeModalTab === 'chat' && (
              <div className="flex-1 flex flex-col p-4 overflow-hidden min-h-[380px]">
                <div className="text-[11px] text-stone-500 mb-2 flex items-center justify-between">
                  <span>
                    {language === 'hi'
                      ? 'इस समूह में जुड़े सभी किसान सीधे यहां चर्चा कर सकते हैं:'
                      : 'All farmers connected in this group can discuss delivery and brand authenticity:'}
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {selectedReq.connectedMembersCount || 10} Online
                  </span>
                </div>

                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 max-h-[260px]">
                  {(!selectedReq.chatMessages || selectedReq.chatMessages.length === 0) ? (
                    <div className="py-12 text-center text-xs text-stone-400">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
                      <p>{language === 'hi' ? 'अभी तक कोई संदेश नहीं है। पहला प्रश्न या संदेश भेजें!' : 'No messages yet. Send the first question or note!'}</p>
                    </div>
                  ) : (
                    selectedReq.chatMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.id;
                      const isCoordinator = msg.senderRole === 'Village Champion' || msg.senderRole === 'Coordinator' || msg.senderRole === 'Organizer';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col text-xs max-w-[85%] ${
                            isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-stone-400">
                            <span className="font-bold text-stone-700 dark:text-stone-300">
                              {msg.senderName}
                            </span>
                            {msg.senderRole && (
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                                  isCoordinator
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                                }`}
                              >
                                {msg.senderRole}
                              </span>
                            )}
                          </div>

                          <div
                            className={`p-2.5 rounded-2xl ${
                              isMe
                                ? 'bg-emerald-800 text-white rounded-br-xs'
                                : isCoordinator
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-stone-900 dark:text-stone-100 border border-amber-200 dark:border-amber-800 rounded-bl-xs'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-bl-xs'
                            }`}
                          >
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick questions pills */}
                <div className="flex gap-1.5 overflow-x-auto py-2 scrollbar-none border-t border-stone-100 dark:border-stone-800 mt-2">
                  {[
                    language === 'hi' ? 'डिलीवरी कब तक आएगी?' : 'When will delivery arrive?',
                    language === 'hi' ? 'क्या गोदाम पर गाड़ी खाली होगी?' : 'Is unloading free at village depot?',
                    language === 'hi' ? 'पक्का बिल मिलेगा?' : 'Will we get GST invoice & warranty?',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setChatInput(preset)}
                      className="px-2.5 py-1 rounded-full text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 whitespace-nowrap cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'समूह में संदेश लिखें...'
                        : 'Message fellow group members...'
                    }
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || !chatInput.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'भेजें' : 'Send'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: GROUP MEMBERS & PLEDGERS */}
            {activeModalTab === 'members' && (
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[380px]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {language === 'hi' ? 'समूह में जुड़े किसान:' : 'Connected Farmers in this Pool:'}
                  </span>
                  <button
                    onClick={() => handleJoinGroup(selectedReq)}
                    className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-200 transition-colors cursor-pointer"
                  >
                    + {language === 'hi' ? 'ग्रुप में शामिल हों' : 'Connect / Join Group'}
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedReq.farmerPledges.length === 0 ? (
                    <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 dark:bg-stone-800 rounded-2xl">
                      {language === 'hi' ? 'अभी तक किसी किसान ने प्लेज नहीं किया है। पहले आप करें!' : 'No pledges recorded yet. Be the first to pledge!'}
                    </div>
                  ) : (
                    selectedReq.farmerPledges.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center font-mono">
                            {p.farmerName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 dark:text-stone-100">{p.farmerName}</div>
                            <div className="text-[10px] text-stone-500">
                              {p.village || 'Anandpur'} • {new Date(p.pledgedAt).toLocaleDateString()}
                            </div>
                            {p.notes && <div className="text-[10px] text-stone-400 italic">"{p.notes}"</div>}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-extrabold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                            {p.quantity} {selectedReq.unit}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            ₹{(p.quantity * selectedReq.negotiatedBulkPrice).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW CUSTOM GROUP BUY MODAL ("THEY CAN BUY ANYTHING") */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-800/40">
              <div>
                <h3 className="font-bold font-display text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'hi' ? 'कुछ भी खरीदने के लिए समूह बनाएं' : 'Request / Pool Anything to Group Buy'}</span>
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'hi'
                    ? 'खाद, प्रमाणित बीज, सोलर पंप, औजार, दवाइयां, पशु आहार या घरेलू थोक सामान'
                    : 'Pool orders for any machinery, solar gear, seeds, fertilizers, or bulk supplies with neighbors.'}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-stone-200/60 dark:bg-stone-700/60 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Product / Item Name */}
              <div>
                <label className="font-bold text-stone-800 dark:text-stone-200 block mb-1">
                  {language === 'hi' ? 'सामान का नाम (आप क्या खरीदना चाहते हैं?): *' : 'Item Name (What do you want to buy?): *'}
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'उदा: 5HP सोलर सबमर्सिबल पंप, महिंद्रा रोटावेटर, डीएपी खाद, ड्रिप किट, सरसों हाइब्रिड बीज...'
                      : 'e.g. 5HP Solar Submersible Pump, Mahyco Mustard Seeds, 16mm Drip Laterals, Battery Sprayer...'
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Group Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    {language === 'hi' ? 'ग्रुप / समूह का नाम:' : 'Buying Group / Circle Name:'}
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder={language === 'hi' ? 'उदा: आनंदपुर सोलर व औजार समूह' : 'e.g. Anandpur Solar & Agri Tools Pool'}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    {language === 'hi' ? 'श्रेणी (Category):' : 'Category:'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Fertilizer">Fertilizer & Nutrition (खाद व पोषण)</option>
                    <option value="Seeds">Certified Seeds (प्रमाणित बीज)</option>
                    <option value="Solar & Irrigation">Solar & Irrigation (सोलर व सिंचाई)</option>
                    <option value="Machinery & Tools">Machinery & Tools (यंत्र व औजार)</option>
                    <option value="Cattle Feed">Cattle Feed (पशु आहार)</option>
                    <option value="General Hardware">General Hardware & Custom (सामान्य उपकरण / घरेलू)</option>
                  </select>
                </div>
              </div>

              {/* Target Quantity & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    {language === 'hi' ? 'लक्ष्य कुल मात्रा (Target Pool):' : 'Target Pool Quantity:'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newTargetQty}
                    onChange={(e) => setNewTargetQty(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    {language === 'hi' ? 'इकाई (Unit):' : 'Unit:'}
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  >
                    <option value="Bags (50kg)">Bags (50kg) / बोरी</option>
                    <option value="Sets">Sets / सेट (पंप, ड्रिप किट)</option>
                    <option value="Units">Units / नग (मशीनरी, औजार)</option>
                    <option value="Packets">Packets / पैकेट</option>
                    <option value="Rolls">Rolls / बंडल</option>
                    <option value="Quintals">Quintals / क्विंटल</option>
                    <option value="Litres">Litres / लीटर</option>
                  </select>
                </div>
              </div>

              {/* Retail vs Bulk Price (auto calculates savings) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    {language === 'hi' ? 'सामान्य बाज़ार खुदरा भाव (₹):' : 'Standard Market Retail (₹):'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newRetailPrice}
                    onChange={(e) => setNewRetailPrice(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                    {language === 'hi' ? 'प्रस्तावित समूह थोक भाव (₹):' : 'Target Group Bulk Price (₹):'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newBulkPrice}
                    onChange={(e) => setNewBulkPrice(e.target.value)}
                    className="w-full p-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Location & Hub */}
              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  {language === 'hi' ? 'सामान वितरण केंद्र / गांव गोदाम:' : 'Delivery Hub / Village Depot:'}
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Anandpur Panchayat Warehouse / APMC Hub"
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  {language === 'hi' ? 'विवरण या पड़ोसियों के लिए संदेश:' : 'Description & Message to Neighbors:'}
                </label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'उदा: हम 15 किसान मिलकर खरीद रहे हैं, सीधे OEM फैक्ट्री से फ्री होम डिलीवरी मिलेगी...'
                      : 'e.g. Direct OEM order with GST invoice and 5-year warranty. Delivery at village warehouse.'
                  }
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                />
              </div>

              {/* Calculated Savings Preview */}
              {parseFloat(newRetailPrice) > parseFloat(newBulkPrice) && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex justify-between items-center font-bold">
                  <span>
                    {language === 'hi' ? 'प्रस्तावित समूह छूट:' : 'Projected Collective Savings:'}
                  </span>
                  <span className="font-mono text-sm">
                    {Math.round(((parseFloat(newRetailPrice) - parseFloat(newBulkPrice)) / parseFloat(newRetailPrice)) * 100)}% OFF (₹{parseFloat(newRetailPrice) - parseFloat(newBulkPrice)} saved / {newUnit})
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={creatingGroupBuy}
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all cursor-pointer"
                >
                  {creatingGroupBuy
                    ? (language === 'hi' ? 'ग्रुप शुरू हो रहा है...' : 'Creating...')
                    : (language === 'hi' ? 'सामूहिक खरीद शुरू करें' : 'Launch Group Buy')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
