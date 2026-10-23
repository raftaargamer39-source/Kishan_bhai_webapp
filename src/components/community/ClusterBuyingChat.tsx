import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useUserStore } from '../../store/userStore';
import {
  Users,
  Send,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Mic,
  MicOff,
  ChevronDown,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  Layers,
  Flame,
  UserCheck,
} from 'lucide-react';
import { ClusterChatMessage, ClusterBuyingNeed } from '../../../shared/types';
import { isSpeechRecognitionSupported, startSpeechRecognition } from '../../services/webSpeechService';

interface ClusterInfo {
  id: string;
  name: string;
  village: string;
  state: string;
  crops: string[];
  members: number;
}

const CLUSTERS: ClusterInfo[] = [
  {
    id: 'cluster_anandpur_01',
    name: 'Anandpur Sahakari Cotton & Groundnut Mesh',
    village: 'Anandpur, Rajkot',
    state: 'Gujarat',
    crops: ['Bt Cotton', 'Groundnut', 'Cumin'],
    members: 24,
  },
  {
    id: 'cluster_malwa_02',
    name: 'Malwa Organic Wheat Federation',
    village: 'Dharampuri, Dhar',
    state: 'Madhya Pradesh',
    crops: ['Sharbati Wheat', 'Soybean', 'Chickpea'],
    members: 18,
  },
  {
    id: 'cluster_vidarbha_03',
    name: 'Vidarbha High-Yield Pulse Mesh',
    village: 'Wardha Rural',
    state: 'Maharashtra',
    crops: ['Tur Dal', 'Bt Cotton', 'Soybean'],
    members: 36,
  },
];

const PRESET_BUYING_PROMPTS = [
  { labelHi: '🧪 25 बैग डीएपी खाद', text: 'मुझे आगामी बुवाई के लिए 25 बोरी डीएपी खाद चाहिए। क्या कोई और किसान भाई साथ में ऑर्डर करेगा?' },
  { labelHi: '⚡ 5HP सोलर पंप शेयरिंग', text: 'क्या क्लस्टर में कोई 5HP सोलर सबमर्सिबल पंप लेने की सोच रहा है? साथ में ऑर्डर से ₹45,000 की छूट मिलेगी।' },
  { labelHi: '🌾 प्रमाणित गेहूं बीज', text: 'शरबती गेहूं बीज (C-306) का संयुक्त ऑर्डर प्लान कर रहे हैं। किसको कितनी बोरी चाहिए?' },
  { labelHi: '🚜 रोटावेटर मशीनरी पूलिंग', text: 'अगले हफ्ते खेत की जुताई के लिए रोटावेटर साझा करने हेतु 3 किसान भाइयों की आवश्यकता है।' },
];

interface ClusterBuyingChatProps {
  onSwitchToCart?: () => void;
}

export const ClusterBuyingChat: React.FC<ClusterBuyingChatProps> = ({ onSwitchToCart }) => {
  const { language, addToast, setCurrentView } = useApp();
  const farmerProfile = useUserStore((state) => state.farmerProfile);
  const currentUser = useUserStore((state) => state.currentUser);

  const isHi = language === 'hi';
  const isGu = language === 'gu';

  const currentUserId = currentUser?.id || 'usr_farmer_ramesh';
  const currentUserName = farmerProfile.name || currentUser?.fullName || 'Ramesh Patel';

  // Cluster Selection
  const [selectedClusterId, setSelectedClusterId] = useState<string>('cluster_anandpur_01');
  const activeCluster = CLUSTERS.find((c) => c.id === selectedClusterId) || CLUSTERS[0];

  // Chat & Real-Time WebSocket State
  const [messages, setMessages] = useState<ClusterChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(6);
  const [isSyncing, setIsSyncing] = useState(false);

  // Active Category Filter
  const [activeFilter, setActiveFilter] = useState<'all' | 'needs' | 'fertilizer' | 'seeds' | 'solar'>('all');

  // New Buying Need Modal State
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [needItem, setNeedItem] = useState('');
  const [needCategory, setNeedCategory] = useState('Fertilizer');
  const [needQuantity, setNeedQuantity] = useState('');
  const [needUnit, setNeedUnit] = useState('Bags (50kg)');
  const [needTargetPrice, setNeedTargetPrice] = useState('');
  const [needNotes, setNeedNotes] = useState('');

  // Voice Dictation
  const [isListening, setIsListening] = useState(false);

  // Pledge quick modal
  const [pledgingMsgId, setPledgingMsgId] = useState<string | null>(null);
  const [pledgeQty, setPledgeQty] = useState('5');

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // Scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch fallback HTTP messages
  const fetchMessagesHttp = async (clusterId: string) => {
    try {
      setIsSyncing(true);
      const res = await fetch(`/api/cluster-chat/${clusterId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
          if (data.onlineCount) setOnlineCount(data.onlineCount);
        }
      }
    } catch (err) {
      console.warn('HTTP fallback fetch error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Establish WebSocket Connection
  useEffect(() => {
    let unmounted = false;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/cluster-chat`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (unmounted) return;
          setIsConnected(true);
          // Send join message
          ws.send(
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
            if (data.type === 'init') {
              if (data.messages) {
                setMessages(data.messages);
                setTimeout(() => scrollToBottom('auto'), 80);
              }
              if (data.onlineCount) {
                setOnlineCount(data.onlineCount);
              }
            } else if (data.type === 'message') {
              setMessages((prev) => {
                // Guard against duplicates
                if (prev.some((m) => m.id === data.message.id)) return prev;
                return [...prev, data.message];
              });
              setTimeout(() => scrollToBottom('smooth'), 100);
            } else if (data.type === 'presence') {
              if (data.onlineCount) {
                setOnlineCount(data.onlineCount);
              }
            }
          } catch (e) {
            console.error('Error handling WS message:', e);
          }
        };

        ws.onerror = (err) => {
          console.warn('WS error, falling back to HTTP:', err);
          setIsConnected(false);
        };

        ws.onclose = () => {
          if (unmounted) return;
          setIsConnected(false);
          // Attempt reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!unmounted) connectWebSocket();
          }, 3000);
        };
      } catch (err) {
        console.warn('WS connection init error:', err);
        setIsConnected(false);
      }
    };

    // Initial load via HTTP as well
    fetchMessagesHttp(selectedClusterId);
    connectWebSocket();

    // Regular polling fallback every 6 seconds if WS is disconnected
    const pollingInterval = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        fetchMessagesHttp(selectedClusterId);
      }
    }, 6000);

    return () => {
      unmounted = true;
      clearInterval(pollingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedClusterId]);

  // Send Message handler
  const handleSendMessage = async (textToSend?: string, buyingNeedData?: ClusterBuyingNeed) => {
    const finalContent = textToSend ?? inputText.trim();
    if (!finalContent && !buyingNeedData) return;

    const payload = {
      clusterId: selectedClusterId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderVillage: farmerProfile.village || activeCluster.village,
      senderRole: 'FARMER' as const,
      text: finalContent,
      buyingNeed: buyingNeedData,
    };

    // Optimistic message
    const tempId = `cmsg_${Date.now()}`;
    const optimisticMsg: ClusterChatMessage = {
      id: tempId,
      clusterId: selectedClusterId,
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderVillage: payload.senderVillage,
      senderRole: 'FARMER',
      text: finalContent,
      buyingNeed: buyingNeedData,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setTimeout(() => scrollToBottom('smooth'), 50);

    // Send over WebSocket if open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'message',
          ...payload,
        })
      );
    } else {
      // Fallback to HTTP POST
      try {
        const res = await fetch(`/api/cluster-chat/${selectedClusterId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error('Failed to send via HTTP fallback');
        }
      } catch (err) {
        console.error('Send message error:', err);
        addToast(
          isHi ? 'संदेश भेजने में समस्या' : 'Failed to send',
          isHi ? 'कृपया अपना इंटरनेट कनेक्शन जांचें' : 'Please check connection',
          'error'
        );
      }
    }
  };

  // Submit Buying Need from Modal
  const handleCreateBuyingNeed = () => {
    if (!needItem.trim() || !needQuantity.trim()) {
      addToast(isHi ? 'आवश्यक जानकारी भरें' : 'Incomplete form', isHi ? 'कृपया वस्तु का नाम और मात्रा लिखें' : 'Please enter item name and quantity', 'error');
      return;
    }

    const need: ClusterBuyingNeed = {
      item: needItem.trim(),
      category: needCategory,
      quantityNeeded: Number(needQuantity) || 10,
      unit: needUnit,
      targetPriceInr: Number(needTargetPrice) || undefined,
      pledgedCount: 1,
      status: 'OPEN',
    };

    const noteText = needNotes.trim()
      ? `📢 नई सामूहिक खरीद मांग: ${need.quantityNeeded} ${need.unit} ${need.item}।\nनोट: ${needNotes.trim()}`
      : `📢 नई सामूहिक खरीद मांग: ${need.quantityNeeded} ${need.unit} ${need.item}। क्लस्टर के साथी साथ जुड़ें।`;

    handleSendMessage(noteText, need);
    setIsNeedModalOpen(false);
    setNeedItem('');
    setNeedQuantity('');
    setNeedTargetPrice('');
    setNeedNotes('');

    addToast(
      isHi ? 'खरीद मांग साझा की गई' : 'Buying need posted',
      isHi ? 'क्लस्टर के सभी किसान भाइयों को सूचना मिल गई है।' : 'Broadcasted to cluster members.',
      'success'
    );
  };

  // Handle Co-Buying / Pledge
  const handlePledgeToNeed = (msg: ClusterChatMessage) => {
    if (!msg.buyingNeed) return;
    const qty = Number(pledgeQty) || 5;

    const replyText = `🤝 @${msg.senderName}, मैं भी ${qty} ${msg.buyingNeed.unit} ${msg.buyingNeed.item} में शामिल होता हूँ!`;
    handleSendMessage(replyText);
    setPledgingMsgId(null);
    setPledgeQty('5');

    addToast(
      isHi ? 'सामूहिक मांग में जुड़े' : 'Joined co-buying pledge',
      isHi ? `आपने ${qty} ${msg.buyingNeed.unit} का प्लेज जोड़ा है।` : `You pledged ${qty} ${msg.buyingNeed.unit}.`,
      'success'
    );
  };

  // Handle Voice Dictation
  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      addToast(
        isHi ? 'वॉइस टाइपिंग अनुपलब्ध' : 'Voice not supported',
        isHi ? 'आपके ब्राउज़र में वॉइस सपोर्ट नहीं है।' : 'Speech recognition not supported in this browser.',
        'info'
      );
      return;
    }

    setIsListening(true);
    startSpeechRecognition(
      (transcript, isFinal) => {
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        if (isFinal) {
          setIsListening(false);
        }
      },
      (error) => {
        console.warn('Speech error:', error);
        setIsListening(false);
      },
      language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN'
    );
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'needs') return Boolean(m.buyingNeed);
    if (activeFilter === 'fertilizer') {
      return (
        m.buyingNeed?.category.toLowerCase().includes('fertilizer') ||
        m.text.toLowerCase().includes('खाद') ||
        m.text.toLowerCase().includes('यूरिया') ||
        m.text.toLowerCase().includes('dap')
      );
    }
    if (activeFilter === 'seeds') {
      return (
        m.buyingNeed?.category.toLowerCase().includes('seed') ||
        m.text.toLowerCase().includes('बीज') ||
        m.text.toLowerCase().includes('seed')
      );
    }
    if (activeFilter === 'solar') {
      return (
        m.buyingNeed?.category.toLowerCase().includes('solar') ||
        m.text.toLowerCase().includes('सोलर') ||
        m.text.toLowerCase().includes('पंप') ||
        m.text.toLowerCase().includes('सिंचाई')
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[750px] bg-white dark:bg-stone-900 rounded-3xl border-2 border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
      {/* 1. TOP HEADER & CLUSTER SWITCHER */}
      <div className="bg-stone-50 dark:bg-stone-950 p-3.5 sm:p-4 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                {isHi ? 'क्लस्टर खरीद चौपाल' : 'Cluster Buying Chat'}
              </h2>
              {/* Live WebSocket Indicator */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                  isConnected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {isConnected
                  ? isHi
                    ? `लाइव (${onlineCount} किसान ऑनलाइन)`
                    : `Live (${onlineCount} online)`
                  : isHi
                  ? 'पुनः कनेक्ट हो रहा...'
                  : 'Reconnecting...'}
              </span>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {isHi
                ? 'एक ही क्लस्टर के किसान भाई खाद, बीज, सोलर व मशीनरी की सामूहिक खरीद पर चर्चा करें'
                : 'Farmers in the same cluster discussing co-purchasing needs in real-time'}
            </p>
          </div>
        </div>

        {/* Cluster Selector & Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <select
              value={selectedClusterId}
              onChange={(e) => setSelectedClusterId(e.target.value)}
              className="appearance-none bg-white dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-bold py-2 pl-3 pr-8 rounded-xl shadow-xs focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {CLUSTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  📍 {c.name} ({c.village})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setIsNeedModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{isHi ? '+ खरीद मांग डालें' : '+ Post Buying Need'}</span>
          </button>

          {onSwitchToCart && (
            <button
              onClick={onSwitchToCart}
              title={isHi ? 'साझा शॉपिंग कार्ट खोलें' : 'Open Shared Cart'}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isHi ? '🛒 साझा कार्ट' : '🛒 Shared Cart'}</span>
            </button>
          )}

          <button
            onClick={() => setCurrentView('group-buying')}
            title={isHi ? 'सामूहिक खरीद हब खोलें' : 'Open Group Buying Hub'}
            className="p-2 border-2 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. CLUSTER METRICS & TOPIC FILTER TABS */}
      <div className="bg-stone-100/80 dark:bg-stone-950/60 px-3.5 py-2 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: isHi ? '💬 सभी चर्चाएं' : 'All Chat' },
            { id: 'needs', label: isHi ? '📢 केवल खरीद मांगें' : 'Buying Needs Only' },
            { id: 'fertilizer', label: isHi ? '🧪 खाद / उर्वरक' : 'Fertilizers' },
            { id: 'seeds', label: isHi ? '🌱 प्रमाणित बीज' : 'Certified Seeds' },
            { id: 'solar', label: isHi ? '⚡ सोलर व सिंचाई' : 'Solar & Drip' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-stone-500 whitespace-nowrap">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            {activeCluster.village}
          </span>
          <span>•</span>
          <span>{activeCluster.crops.join(', ')}</span>
        </div>
      </div>

      {/* 3. SCROLLABLE MESSAGES FEED */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/50 dark:bg-stone-900/40">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-stone-500">
            <ShoppingBag className="w-12 h-12 text-stone-300 dark:text-stone-700 mb-2 animate-bounce" />
            <p className="text-sm font-black text-stone-700 dark:text-stone-300">
              {isHi ? 'इस श्रेणी में कोई संदेश नहीं है' : 'No messages in this filter'}
            </p>
            <p className="text-xs text-stone-400 max-w-xs mt-1">
              {isHi
                ? 'नीचे दिए गए बटन या इनपुट से पहली खरीद मांग शेयर करें।'
                : 'Start the conversation or post a buying need below.'}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.senderName === (farmerProfile.name || 'Ramesh Patel');
            const hasNeed = Boolean(msg.buyingNeed);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
              >
                {/* Author Info Header */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="font-black text-stone-800 dark:text-stone-200">
                    {msg.senderName} {isMe && (isHi ? '(आप)' : '(You)')}
                  </span>
                  {msg.senderVillage && (
                    <span className="text-[10px] bg-stone-200 dark:bg-stone-800 px-1.5 py-0.2 rounded text-stone-600 dark:text-stone-400">
                      {msg.senderVillage}
                    </span>
                  )}
                  {msg.senderRole === 'CHAMPION' && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded font-black flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      {isHi ? 'ग्राम चैंपियन' : 'Champion'}
                    </span>
                  )}
                  <span>•</span>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Body */}
                <div
                  className={`rounded-2xl p-3.5 max-w-2xl shadow-xs transition-all ${
                    hasNeed
                      ? 'w-full bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950/40 dark:via-stone-900 dark:to-amber-950/30 border-2 border-emerald-400 dark:border-emerald-700'
                      : isMe
                      ? 'bg-emerald-700 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-tl-xs'
                  }`}
                >
                  {/* BUYING NEED CARD HIGHLIGHT */}
                  {hasNeed && msg.buyingNeed && (
                    <div className="mb-2 pb-2.5 border-b border-emerald-200 dark:border-emerald-800/80">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          <ShoppingBag className="w-3 h-3" />
                          {isHi ? 'सामूहिक खरीद मांग' : 'Co-Buying Need'}
                        </span>
                        <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {isHi ? 'थोक बचत अवसर' : 'Bulk Savings'}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100">
                        {msg.buyingNeed.item}
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 bg-white/80 dark:bg-stone-900/80 p-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block font-bold">
                            {isHi ? 'मात्रा चाहिए' : 'Required Qty'}
                          </span>
                          <span className="font-black text-stone-900 dark:text-stone-100">
                            {msg.buyingNeed.quantityNeeded} {msg.buyingNeed.unit}
                          </span>
                        </div>

                        {msg.buyingNeed.targetPriceInr && (
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase block font-bold">
                              {isHi ? 'लक्षित थोक दर' : 'Target Price'}
                            </span>
                            <span className="font-black text-emerald-700 dark:text-emerald-400">
                              ₹{msg.buyingNeed.targetPriceInr} / {msg.buyingNeed.unit}
                            </span>
                          </div>
                        )}

                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block font-bold">
                            {isHi ? 'श्रेणी' : 'Category'}
                          </span>
                          <span className="font-bold text-stone-700 dark:text-stone-300">
                            {msg.buyingNeed.category}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons for buying need */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <button
                          onClick={() => setPledgingMsgId(msg.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer transition-all active:scale-95"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{isHi ? '🤝 मैं भी साथ जुडूंगा (Pledge)' : 'Join Co-Buying'}</span>
                        </button>

                        <button
                          onClick={() => setCurrentView('group-buying')}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-bold cursor-pointer transition-all"
                        >
                          <span>{isHi ? 'थोक पूल देखें' : 'View Pools'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Quick inline pledge quantity dialog */}
                      {pledgingMsgId === msg.id && (
                        <div className="mt-2.5 p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-xl flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                            {isHi ? 'आपकी मात्रा दर्ज करें:' : 'Your Pledge Qty:'}
                          </span>
                          <input
                            type="number"
                            min="1"
                            value={pledgeQty}
                            onChange={(e) => setPledgeQty(e.target.value)}
                            className="w-20 px-2 py-1 bg-white dark:bg-stone-900 border rounded text-xs font-bold"
                          />
                          <button
                            onClick={() => handlePledgeToNeed(msg)}
                            className="px-3 py-1 bg-emerald-700 text-white text-xs font-black rounded-lg cursor-pointer hover:bg-emerald-800"
                          >
                            {isHi ? 'स्वीकार करें' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setPledgingMsgId(null)}
                            className="px-2 py-1 text-stone-500 text-xs font-bold cursor-pointer"
                          >
                            {isHi ? 'रद्द' : 'Cancel'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Standard Text Content */}
                  <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. PRESET QUICK CHIPS */}
      <div className="bg-stone-100 dark:bg-stone-950 px-3.5 py-1.5 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] uppercase font-black text-stone-400 shrink-0">
          {isHi ? 'त्वरित मांग:' : 'Quick Need:'}
        </span>
        {PRESET_BUYING_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt.text)}
            className="px-2.5 py-1 bg-white dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg text-[11px] font-bold text-stone-700 dark:text-stone-300 transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            {prompt.labelHi}
          </button>
        ))}
      </div>

      {/* 5. INPUT COMPOSER WITH VOICE */}
      <div className="p-3 sm:p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:text-emerald-700'
            }`}
            title={isListening ? (isHi ? 'सुन रहा हूँ...' : 'Listening...') : (isHi ? 'बोलकर लिखें' : 'Voice Input')}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? isHi
                  ? 'बोलिए, आवाज़ पहचानी जा रही है...'
                  : 'Speak now, listening...'
                : isHi
                ? 'क्लस्टर में खरीद मांग या सवाल लिखें...'
                : 'Share buying needs or discuss with cluster farmers...'
            }
            className="flex-1 bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-black rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>{isHi ? 'भेजें' : 'Send'}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ========================================================= */}
      {/* 6. CREATE BUYING NEED MODAL                               */}
      {/* ========================================================= */}
      {isNeedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                    {isHi ? '📢 नई सामूहिक खरीद मांग दर्ज करें' : 'Post Collective Buying Need'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {activeCluster.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNeedModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1">
                  {isHi ? 'वस्तु / उपकरण का नाम *' : 'Item / Supply Name *'}
                </label>
                <input
                  type="text"
                  value={needItem}
                  onChange={(e) => setNeedItem(e.target.value)}
                  placeholder={isHi ? 'जैसे: इफको नीम यूरिया, 5HP सोलर पंप, बीटी कपास बीज' : 'e.g. IFFCO Neem Urea, 5HP Solar Pump'}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1">
                    {isHi ? 'श्रेणी (Category)' : 'Category'}
                  </label>
                  <select
                    value={needCategory}
                    onChange={(e) => setNeedCategory(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-sm font-bold"
                  >
                    <option value="Fertilizer">🧪 खाद / उर्वरक (Fertilizer)</option>
                    <option value="Seeds">🌱 बीज (Certified Seeds)</option>
                    <option value="Solar & Irrigation">⚡ सोलर व ड्रिप (Solar & Irrigation)</option>
                    <option value="Machinery">🚜 मशीनरी व उपकरण (Machinery)</option>
                    <option value="Pesticides">🛡️ कीट सुरक्षा (Pesticides)</option>
                    <option value="Cattle Feed">🐄 पशु आहार (Cattle Feed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1">
                    {isHi ? 'इकाई (Unit)' : 'Unit'}
                  </label>
                  <select
                    value={needUnit}
                    onChange={(e) => setNeedUnit(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-sm font-bold"
                  >
                    <option value="Bags (50kg)">Bags (50kg)</option>
                    <option value="Quintals">Quintals (क्विंटल)</option>
                    <option value="Packets">Packets (पैकेट)</option>
                    <option value="Sets">Sets (उपकरण सेट)</option>
                    <option value="Liters">Liters (लीटर)</option>
                    <option value="Meters">Meters (मीटर)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1">
                    {isHi ? 'मात्रा (Quantity) *' : 'Quantity Needed *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={needQuantity}
                    onChange={(e) => setNeedQuantity(e.target.value)}
                    placeholder="25"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1">
                    {isHi ? 'अपेक्षित थोक भाव (₹)' : 'Target Bulk Price (₹)'}
                  </label>
                  <input
                    type="number"
                    value={needTargetPrice}
                    onChange={(e) => setNeedTargetPrice(e.target.value)}
                    placeholder="265"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 dark:text-stone-300 mb-1">
                  {isHi ? 'क्लस्टर साथियों के लिए नोट / विवरण' : 'Note for Cluster Members'}
                </label>
                <textarea
                  rows={2}
                  value={needNotes}
                  onChange={(e) => setNeedNotes(e.target.value)}
                  placeholder={isHi ? 'जैसे: 3 और किसान भाई जुड़ें तो डिलीवरी राजकोट वेयरहाउस से फ्री होगी।' : 'e.g. Need 3 more farmers to unlock free delivery.'}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setIsNeedModalOpen(false)}
                className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleCreateBuyingNeed}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {isHi ? 'मांग प्रकाशित करें 🚀' : 'Broadcast to Cluster 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
