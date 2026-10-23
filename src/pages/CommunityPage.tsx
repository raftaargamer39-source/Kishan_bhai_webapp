import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Share2,
  Plus,
  Sparkles,
  Award,
  CheckCircle2,
  Tag,
  Send,
  X,
  Image as ImageIcon,
  Mic,
  Volume2,
  VolumeX,
  Bookmark,
  Radio,
  Sprout,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CommunityPostItem } from '../../shared/types';
import { CommunityAppBar } from '../components/community/CommunityAppBar';
import { CommunityNavTabs, CommunityTab } from '../components/community/CommunityNavTabs';
import { VoiceChaupalCard, VoiceNoteItem } from '../components/community/VoiceChaupalCard';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { ClusterBuyingChat } from '../components/community/ClusterBuyingChat';
import { ClusterSharedCart } from '../components/community/ClusterSharedCart';
import { speakText, stopSpeech } from '../services/webSpeechService';

// Sample curated Voice Chaupal notes for the standalone voice feed
const INITIAL_VOICE_NOTES: VoiceNoteItem[] = [
  {
    id: 'vn_1',
    authorName: 'Vikramsinh Jadeja',
    authorVillage: 'Anandpur, Rajkot',
    authorRole: 'Village Champion',
    authorBadge: 'Progressive Farmer',
    crop: 'Cotton (Kapas)',
    topic: 'गुलाबी सुंडी के लिए फेरोमोन ट्रैप लगाने का समय',
    durationSec: 38,
    recordedText:
      'राम राम किसान भाइयों! कपास में फूल आने से 15 दिन पहले ही खेत में प्रति एकड़ 5 से 8 फेरोमोन ट्रैप लगाएं। नर पतंगों की निगरानी रखें, अगर 3 दिन लगातार 8 पतंगे आएं तो तुरंत स्प्रे करें।',
    createdAt: '2 hrs ago',
    likesCount: 84,
  },
  {
    id: 'vn_2',
    authorName: 'Sukhwinder Singh Phul',
    authorVillage: 'Moga, Punjab',
    authorRole: 'Farmer',
    authorBadge: 'Organic Lead',
    crop: 'Mustard (Sarson)',
    topic: 'जीवामृत व नीम तेल का संयुक्त छिड़काव',
    durationSec: 42,
    recordedText:
      'किसान साथियों, 200 लीटर जीवामृत में 500 मिली 10,000 पीपीएम नीम तेल मिलाकर स्प्रे करने से माहू और तेला का 100% रोकथाम होता है और फसल हरी-भरी रहती है।',
    createdAt: '4 hrs ago',
    likesCount: 65,
  },
  {
    id: 'vn_3',
    authorName: 'Dr. R.K. Meena',
    authorVillage: 'KVK Agronomist, Anand',
    authorRole: 'KVK Scientist',
    authorBadge: 'ICAR Agronomist',
    crop: 'Wheat (Gehun)',
    topic: 'गेहूं में पीला रतुआ का आरंभिक उपचार',
    durationSec: 45,
    recordedText:
      'किसान भाइयों, सुबह के समय पत्तियों की निचली सतह पर पीला पाउडर दिखे तो तुरंत प्रोपिकोनाज़ोल 25% EC 1 मिली प्रति लीटर पानी की दर से स्प्रे करें। देर करने से पैदावार 30% घट सकती है।',
    createdAt: 'Yesterday',
    likesCount: 142,
  },
  {
    id: 'vn_4',
    authorName: 'Ramesh Patel',
    authorVillage: 'Gondal, Gujarat',
    authorRole: 'Farmer',
    crop: 'Groundnut (Mungfali)',
    topic: 'मूंगफली की खुदाई के बाद सुखाने की तकनीक',
    durationSec: 30,
    recordedText:
      'मूंगफली को खेत में 4 दिन उल्टी करके सुखाएं ताकि धूप में दाने का नमी स्तर 8% पर आ जाए। इससे मंडी में ग्रेड-1 का भाव मिलता है।',
    createdAt: '2 days ago',
    likesCount: 47,
  },
];

export const CommunityPage: React.FC = () => {
  const farmerProfile = useUserStore((state) => state.farmerProfile);
  const {
    communityPosts,
    addCommunityPost,
    likeCommunityPost,
    addCommunityComment,
    language,
    setCurrentView,
    addToast,
  } = useApp();

  const isHi = language === 'hi';
  const isGu = language === 'gu';

  // Navigation & Search State
  const [activeTab, setActiveTab] = useState<CommunityTab>('cluster-chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedCropClub, setSelectedCropClub] = useState<string>('All');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<'text' | 'voice' | 'photo'>('text');

  // Interactive comments state
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Bookmarked posts state (local persistence)
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('kb_chaupal_bookmarks');
      return saved ? JSON.parse(saved) : { post_01: true };
    } catch {
      return { post_01: true };
    }
  });

  // Speaking state for TTS
  const [speakingPostId, setSpeakingPostId] = useState<string | null>(null);

  // Voice Notes State
  const [voiceNotes, setVoiceNotes] = useState<VoiceNoteItem[]>(INITIAL_VOICE_NOTES);
  const [likedVoiceIds, setLikedVoiceIds] = useState<Record<string, boolean>>({});

  // Tag list
  const availableTags = [
    'All',
    'Crop Protection',
    'Soil Regeneration',
    'Organic Farming',
    'Drip Irrigation',
    'Market Intelligence',
    'Machinery Sharing',
  ];

  // Crop Clubs
  const cropClubs = [
    { id: 'All', name: isHi ? 'सभी फसलें' : 'All Crops', icon: '🌱' },
    { id: 'Cotton', name: isHi ? 'कपास (बीटी)' : 'Cotton Club', icon: '☁️', members: '4,200+' },
    { id: 'Wheat', name: isHi ? 'गेहूं (शरबती)' : 'Wheat Club', icon: '🌾', members: '5,100+' },
    { id: 'Mustard', name: isHi ? 'सरसों / राई' : 'Mustard Club', icon: '🟡', members: '2,800+' },
    { id: 'Groundnut', name: isHi ? 'मूंगफली (GG-20)' : 'Groundnut Club', icon: '🥜', members: '3,400+' },
    { id: 'Spices', name: isHi ? 'जीरा व धनिया' : 'Spices Club', icon: '🌿', members: '1,900+' },
  ];

  // Toggle Bookmark
  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem('kb_chaupal_bookmarks', JSON.stringify(updated));
      addToast(
        updated[id]
          ? isHi
            ? 'पोस्ट सेव की गई'
            : 'Post Saved to My List'
          : isHi
          ? 'पोस्ट सेव से हटाई गई'
          : 'Post Removed from Saved',
        isHi
          ? 'आप इसे "मेरी पोस्ट व सेव" टैब में कभी भी देख सकते हैं।'
          : 'Access saved posts anytime in Saved & Mine tab.',
        'info'
      );
      return updated;
    });
  };

  // Toggle Voice Note Like
  const handleLikeVoiceNote = (id: string) => {
    setLikedVoiceIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Speak Post aloud (Web Speech API)
  const handleSpeakPost = (post: CommunityPostItem) => {
    if (speakingPostId === post.id) {
      stopSpeech();
      setSpeakingPostId(null);
    } else {
      stopSpeech();
      setSpeakingPostId(post.id);
      const textToSpeak = `${post.authorName} कहते हैं: ${post.title}. ${post.content}`;
      const langCode = isHi ? 'hi-IN' : 'en-IN';

      speakText(textToSpeak, {
        lang: langCode,
        onEnd: () => setSpeakingPostId(null),
        onError: () => setSpeakingPostId(null),
      });
    }
  };

  // WhatsApp share
  const handleWhatsAppShare = (post: CommunityPostItem) => {
    const text = `🌾 *किसान चौपाल चर्चा*:\n\n"${post.title}"\n\nलेखक: ${post.authorName} (${post.authorVillage || post.authorDistrict})\n\n"${post.content}"\n\n👉 किसान चौपाल ऐप पर जुड़ें और खेती के सही जवाब पाएं!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Submit Comment
  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    addCommunityComment(postId, text.trim());
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    addToast(
      isHi ? 'उत्तर भेजा गया' : 'Reply Shared',
      isHi ? 'आपका उत्तर चौपाल में प्रकाशित हो गया है।' : 'Your answer is now visible to regional farmers.',
      'success'
    );
  };

  // Handle Publish new post from Modal
  const handlePublishPost = (postData: {
    title: string;
    content: string;
    category: string;
    cropTag: string;
    imageUrl?: string;
    tags: string[];
    isVoicePost?: boolean;
  }) => {
    addCommunityPost({
      title: postData.title,
      authorName: farmerProfile.name || 'Ramesh Patel',
      authorVillage: farmerProfile.village || 'Rajkot',
      authorDistrict: farmerProfile.district || 'Rajkot',
      authorState: farmerProfile.state || 'Gujarat',
      authorRole: 'Farmer',
      authorBadge: 'Progressive Farmer',
      category: postData.category,
      cropTag: postData.cropTag,
      content: postData.content,
      imageUrl: postData.imageUrl,
      tags: postData.tags,
    });

    if (postData.isVoicePost) {
      const newVoice: VoiceNoteItem = {
        id: `vn_${Date.now()}`,
        authorName: farmerProfile.name || 'Ramesh Patel',
        authorVillage: `${farmerProfile.village}, ${farmerProfile.district}`,
        authorRole: 'Farmer',
        authorBadge: 'Progressive Farmer',
        crop: postData.cropTag,
        topic: postData.title,
        durationSec: 25,
        recordedText: postData.content,
        createdAt: 'Just now',
        likesCount: 1,
      };
      setVoiceNotes((prev) => [newVoice, ...prev]);
    }

    addToast(
      isHi ? 'पोस्ट चौपाल में प्रकाशित!' : 'Published to Kisan Chaupal!',
      isHi ? 'अन्य किसान भाई व वैज्ञानिक जल्द ही राय देंगे।' : 'Regional farmers & scientists will answer shortly.',
      'success'
    );
  };

  // Filtered Posts Logic
  const filteredPosts = useMemo(() => {
    return communityPosts.filter((post) => {
      // Tab based filtering
      if (activeTab === 'doctor') {
        const isDoc =
          post.category === 'Crop Advice' ||
          post.category === 'Pest Outbreak' ||
          post.tags?.includes('Crop Protection');
        if (!isDoc) return false;
      }

      if (activeTab === 'saved') {
        const isSaved = bookmarkedIds[post.id];
        const isMine = post.authorName.toLowerCase() === (farmerProfile.name || '').toLowerCase();
        if (!isSaved && !isMine) return false;
      }

      if (activeTab === 'clubs' && selectedCropClub !== 'All') {
        const cropMatch =
          post.cropTag?.toLowerCase().includes(selectedCropClub.toLowerCase()) ||
          post.title.toLowerCase().includes(selectedCropClub.toLowerCase()) ||
          post.content.toLowerCase().includes(selectedCropClub.toLowerCase());
        if (!cropMatch) return false;
      }

      // Tag filter
      if (selectedTag !== 'All') {
        const matchTag =
          post.tags?.includes(selectedTag) ||
          post.category === selectedTag ||
          post.cropTag === selectedTag;
        if (!matchTag) return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQ =
          post.title.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q) ||
          post.authorName.toLowerCase().includes(q) ||
          post.authorDistrict?.toLowerCase().includes(q) ||
          post.cropTag?.toLowerCase().includes(q);
        if (!matchQ) return false;
      }

      return true;
    });
  }, [
    communityPosts,
    activeTab,
    selectedTag,
    selectedCropClub,
    searchQuery,
    bookmarkedIds,
    farmerProfile.name,
  ]);

  const savedCount = Object.values(bookmarkedIds).filter(Boolean).length;

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 space-y-5 pb-24 md:pb-12 text-stone-900 dark:text-stone-100">
      {/* 1. STANDALONE APP HEADER BAR */}
      <CommunityAppBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={(mode = 'text') => {
          setCreateModalMode(mode);
          setIsCreateModalOpen(true);
        }}
        totalPostsCount={communityPosts.length}
      />

      {/* 2. APP TAB NAVIGATION */}
      <CommunityNavTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        voiceCount={voiceNotes.length}
        savedCount={savedCount}
      />

      {/* 3. QUICK COMPOSER BAR ("WHAT'S ON YOUR MIND?") */}
      {activeTab !== 'cluster-cart' && activeTab !== 'cluster-chat' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white font-black flex items-center justify-center text-sm shrink-0">
              {farmerProfile.name?.charAt(0) || 'R'}
            </div>
            <button
              onClick={() => {
                setCreateModalMode('text');
                setIsCreateModalOpen(true);
              }}
              className="flex-1 sm:w-80 text-left bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 text-stone-500 dark:text-stone-400 text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer truncate border border-stone-200/60 dark:border-stone-700/60"
            >
              {isHi
                ? `राम राम ${farmerProfile.name.split(' ')[0]} भाई! आज खेत में क्या नया है?`
                : `Hello ${farmerProfile.name.split(' ')[0]}! Ask or share crop updates...`}
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto sm:ml-auto">
            <button
              onClick={() => {
                setCreateModalMode('voice');
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-950 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 text-amber-600" />
              <span>{isHi ? 'ऑडियो बोलें' : 'Voice'}</span>
            </button>

            <button
              onClick={() => {
                setCreateModalMode('photo');
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-950 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>{isHi ? 'फोटो' : 'Photo'}</span>
            </button>

            <button
              onClick={() => {
                setCreateModalMode('text');
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isHi ? 'पूछें' : 'Ask'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. SUB-FILTERS / TOPIC CHIPS */}
      {activeTab === 'clubs' ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {cropClubs.map((club) => (
            <button
              key={club.id}
              onClick={() => setSelectedCropClub(club.id)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                selectedCropClub === club.id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
              }`}
            >
              <span>{club.icon}</span>
              <span>{club.name}</span>
              {club.members && (
                <span className="text-[10px] font-medium opacity-75">({club.members})</span>
              )}
            </button>
          ))}
        </div>
      ) : activeTab !== 'voice' && activeTab !== 'champions' && activeTab !== 'cluster-chat' && activeTab !== 'cluster-cart' ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedTag === tag
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      {/* 5. MAIN CONTENT LAYOUT: Feed + App Sidebar Widgets */}
      {activeTab === 'cluster-cart' ? (
        <div className="w-full space-y-4">
          <ClusterSharedCart onSwitchToChat={() => setActiveTab('cluster-chat')} />
        </div>
      ) : activeTab === 'cluster-chat' ? (
        <div className="w-full space-y-4">
          <ClusterBuyingChat onSwitchToCart={() => setActiveTab('cluster-cart')} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: ACTIVE VIEW FEED */}
          <div className="lg:col-span-8 space-y-5">
          {/* TAB 1: VOICE CHAUPAL VIEW */}
          {activeTab === 'voice' ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100">
                      {isHi ? 'रेडियो चौपाल • किसानों की आवाज' : 'Voice Chaupal • Spoken Field Advisory'}
                    </h3>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400">
                      {isHi
                        ? 'बिना लिखे सिर्फ बोलकर सुनें और अपनी भाषा में खेती के अनुभव साझा करें।'
                        : 'Listen to verified voice notes recorded directly by farmers and agronomists.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCreateModalMode('voice');
                    setIsCreateModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
                >
                  {isHi ? 'ऑडियो रिकॉर्ड करें 🎙️' : 'Record Voice 🎙️'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {voiceNotes.map((note) => (
                  <VoiceChaupalCard
                    key={note.id}
                    note={note}
                    onLike={handleLikeVoiceNote}
                    isLiked={!!likedVoiceIds[note.id]}
                  />
                ))}
              </div>
            </div>
          ) : activeTab === 'champions' ? (
            /* TAB 2: CHAMPIONS & SCIENTISTS DIRECTORY */
            <div className="space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>{isHi ? 'प्रगतिशील किसान व वैज्ञानिक डायरेक्टरी' : 'Top Field Champions & Agronomists'}</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {isHi
                      ? 'अपने जिले और राज्य के शीर्ष कृषि वैज्ञानिकों व सफल किसानों से सीधे संपर्क करें।'
                      : 'Verified progressive farmers and ICAR Krishi Vigyan Kendra scientists with proven solves.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      name: 'Dr. R.K. Meena',
                      role: 'Senior Agronomist, ICAR Anand',
                      badge: 'Soil & IPM Expert',
                      village: 'Anand KVK, Gujarat',
                      solves: '512 Solves',
                      phone: '1800-180-1551',
                    },
                    {
                      name: 'Vikram Patel',
                      role: 'Saurashtra Cluster Champion',
                      badge: 'Drip & Bulk Pioneer',
                      village: 'Anandpur, Rajkot',
                      solves: '380 Helpful',
                      phone: '+91 98250 XXXXX',
                    },
                    {
                      name: 'Sukhwinder Singh',
                      role: 'Zero Budget Natural Farming Lead',
                      badge: 'Jeevamrit Pioneer',
                      village: 'Moga, Punjab',
                      solves: '295 Helpful',
                      phone: '+91 94170 XXXXX',
                    },
                    {
                      name: 'Smt. Kamlaben Rathod',
                      role: 'Horticulture & Greenhouse Mentor',
                      badge: 'Protected Farming',
                      village: 'Sanand, Gujarat',
                      solves: '210 Solves',
                      phone: '+91 97240 XXXXX',
                    },
                  ].map((champ, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-700/80 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                            {champ.name}
                          </h4>
                          <p className="text-xs text-stone-600 dark:text-stone-400">{champ.role}</p>
                          <p className="text-[11px] text-stone-500">{champ.village}</p>
                        </div>
                        <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full">
                          {champ.solves}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                        <button
                          onClick={() => setCurrentView('talk-to-expert')}
                          className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>{isHi ? 'सलाह लें' : 'Consult'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setSearchQuery(champ.name);
                            setActiveTab('feed');
                          }}
                          className="px-3 py-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          {isHi ? 'पोस्ट देखें' : 'Posts'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 3: ALL FEEDS & CROP CLUBS & DOCTOR Q&A & SAVED */
            <div className="space-y-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const isPostLiked = post.isLiked;
                  const isPostSaved = !!bookmarkedIds[post.id];
                  const isSpeaking = speakingPostId === post.id;
                  const isCommentsOpen = !!expandedComments[post.id];
                  const commentsList = post.comments || [];

                  return (
                    <article
                      key={post.id}
                      className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-all p-4 sm:p-6 space-y-4"
                    >
                      {/* Post Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              post.authorAvatar ||
                              'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=120&auto=format&fit=crop&q=80'
                            }
                            alt={post.authorName}
                            className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-600/30 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                                {post.authorName}
                              </h3>
                              {post.authorBadge && (
                                <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-2 py-0.2 rounded-md flex items-center gap-1">
                                  <Award className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>{post.authorBadge}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                              {post.authorDistrict || `${post.authorVillage}, ${post.authorState}`} •{' '}
                              {post.createdAt?.includes('T')
                                ? new Date(post.createdAt).toLocaleDateString()
                                : post.createdAt}
                            </p>
                          </div>
                        </div>

                        {/* Top Tags & Bookmark */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {post.cropTag && (
                            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                              🌾 {post.cropTag}
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleBookmark(post.id)}
                            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                              isPostSaved
                                ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 text-amber-700 dark:text-amber-300'
                                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400 hover:text-stone-700'
                            }`}
                            title={isPostSaved ? 'Saved' : 'Save post'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isPostSaved ? 'fill-amber-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Post Title & Content */}
                      <div className="space-y-2">
                        {post.title && (
                          <h4 className="text-base font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
                            {post.title}
                          </h4>
                        )}
                        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                          {post.content}
                        </p>
                      </div>

                      {/* Post Attached Image */}
                      {post.imageUrl && (
                        <div className="rounded-2xl overflow-hidden max-h-80 w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                          <img
                            src={post.imageUrl}
                            alt="Post media"
                            className="w-full h-full object-cover hover:scale-101 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Agronomist Verified Callout Box if Doctor Tab or Pest Category */}
                      {(activeTab === 'doctor' || post.category === 'Crop Advice') && (
                        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold text-emerald-950 dark:text-emerald-200">
                              {isHi ? 'प्रमाणित कृषि वैज्ञानिक समाधान' : 'Agronomist Verified Solution'}
                            </span>
                            <p className="text-emerald-900/90 dark:text-emerald-300/90 text-[11px] leading-relaxed">
                              {isHi
                                ? 'आईसीएआर और कृषि विज्ञान केंद्र (KVK) द्वारा अनुशंसित खुराक। मौसम अनुसार छिड़काव करें।'
                                : 'ICAR certified spray dosage & agronomic safety protocol. Ensure protective gear during application.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Interaction Footbar */}
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3 sm:gap-4">
                          {/* Helpful Upvote Button */}
                          <button
                            onClick={() => likeCommunityPost(post.id)}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-all px-2.5 py-1.5 rounded-xl cursor-pointer ${
                              isPostLiked
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'text-stone-600 dark:text-stone-400 hover:text-emerald-700 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                          >
                            <ThumbsUp
                              className={`w-4 h-4 ${isPostLiked ? 'fill-emerald-700 text-emerald-700' : ''}`}
                            />
                            <span>{post.likesCount} {isHi ? 'मददगार' : 'Helpful'}</span>
                          </button>

                          {/* Toggle Comments Button */}
                          <button
                            onClick={() =>
                              setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                            }
                            className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>
                              {commentsList.length || post.commentsCount || 0}{' '}
                              {isHi ? 'उत्तर' : 'Responses'}
                            </span>
                          </button>

                          {/* Listen to post audio */}
                          <button
                            onClick={() => handleSpeakPost(post)}
                            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                              isSpeaking
                                ? 'bg-amber-400 text-stone-950 animate-pulse'
                                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                            }`}
                            title="Listen to post audio"
                          >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">
                              {isSpeaking
                                ? isHi
                                  ? 'रोकें'
                                  : 'Stop'
                                : isHi
                                ? 'ऑडियो सुनें'
                                : 'Listen'}
                            </span>
                          </button>
                        </div>

                        {/* WhatsApp Share Button */}
                        <button
                          onClick={() => handleWhatsAppShare(post)}
                          className="flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/60 border border-green-200/60 dark:border-green-800/60 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-all cursor-pointer"
                          title="Forward on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{isHi ? 'व्हाट्सएप पर भेजें' : 'WhatsApp'}</span>
                        </button>
                      </div>

                      {/* Expandable Comments Section */}
                      {isCommentsOpen && (
                        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-3">
                          {commentsList.length > 0 ? (
                            <div className="space-y-2.5">
                              {commentsList.map((c, cIdx) => (
                                <div
                                  key={c.id || cIdx}
                                  className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-3 border border-stone-100 dark:border-stone-800 space-y-1 text-xs"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
                                      <span>{c.authorName}</span>
                                      {c.authorRole && (
                                        <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.2 rounded-md">
                                          {c.authorRole}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-stone-400">
                                      {c.createdAt?.includes('T')
                                        ? new Date(c.createdAt).toLocaleDateString()
                                        : c.createdAt}
                                    </span>
                                  </div>
                                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                                    {c.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-stone-500 italic">
                              {isHi
                                ? 'अभी कोई उत्तर नहीं है। सबसे पहले अपनी सलाह लिखें!'
                                : 'No responses yet. Be the first to share advice!'}
                            </p>
                          )}

                          {/* Quick Reply Form */}
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder={
                                isHi
                                  ? 'अपनी राय या समाधान लिखें...'
                                  : 'Write an agronomic reply or question...'
                              }
                              value={commentInputs[post.id] || ''}
                              onChange={(e) =>
                                setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommentSubmit(post.id);
                              }}
                              className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                            />
                            <button
                              onClick={() => handleCommentSubmit(post.id)}
                              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{isHi ? 'भेजें' : 'Send'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 mx-auto flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                    {isHi ? 'कोई चर्चा नहीं मिली' : 'No discussions found'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {isHi
                      ? 'अपनी नई चर्चा शुरू करें या अन्य फ़िल्टर चुनें।'
                      : 'Try choosing another tag or be the first to publish a discussion.'}
                  </p>
                  <button
                    onClick={() => {
                      setCreateModalMode('text');
                      setIsCreateModalOpen(true);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isHi ? 'नई पोस्ट लिखें' : 'Create First Post'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: APP COMPANION WIDGETS */}
        <div className="lg:col-span-4 space-y-4">
          {/* 0. QUICK CLUSTER BUYING CHAT SHORTCUT */}
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-5 shadow-md space-y-3 relative overflow-hidden border border-emerald-600/60">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isHi ? 'लाइव क्लस्टर चौपाल' : 'Live Cluster Chat'}</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-200">
                {isHi ? '🟢 कनेक्टेड' : '🟢 Active'}
              </span>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-black leading-tight text-white">
                {isHi ? 'खाद, बीज व सोलर की सामूहिक खरीद' : 'Cluster Co-Buying Chat'}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                {isHi
                  ? 'अपने क्लस्टर के साथी किसानों से सीधे चैट करें और 35% थोक छूट के लिए ऑर्डर पूल करें।'
                  : 'Chat in real-time with cluster farmers to pool buying needs and unlock 35% bulk savings.'}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('cluster-chat')}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{isHi ? 'क्लस्टर खरीद चैट खोलें 💬' : 'Open Cluster Buying Chat 💬'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. LIVE AUDIO CHAUPAL ROOM BANNER */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 rounded-3xl p-5 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="bg-stone-950 text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                <span>{isHi ? 'लाइव चौपाल रूम' : 'Live Audio Session'}</span>
              </span>
              <span className="text-xs font-mono font-bold">7:00 PM</span>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-black leading-tight">
                {isHi
                  ? 'आज शाम: कपास में गुलाबी सुंडी का संपूर्ण जैविक व प्रमाणित नियंत्रण'
                  : 'Today 7 PM: Pink Bollworm Integrated Pest Management'}
              </h3>
              <p className="text-xs text-stone-900/80 mt-1">
                {isHi
                  ? 'विशेषज्ञ: डॉ. आर.के. मीणा (केवीके) व प्रगतिशील किसान'
                  : 'Key Speaker: Dr. R.K. Meena (KVK Scientist)'}
              </p>
            </div>

            <button
              onClick={() => {
                addToast(
                  isHi ? 'चौपाल रिमाइंडर सेट हुआ!' : 'Chaupal Reminder Set!',
                  isHi
                    ? 'शाम 7:00 बजे आपको ऑडियो चौपाल का नोटिफिकेशन मिल जाएगा।'
                    : 'You will receive a voice notification at 7:00 PM.',
                  'success'
                );
              }}
              className="w-full py-2.5 bg-stone-950 hover:bg-stone-900 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? 'रिमाइंडर सेट करें 🔔' : 'Set Audio Reminder 🔔'}</span>
            </button>
          </div>

          {/* 2. VILLAGE CLUSTER CHAMPIONS CARD */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{isHi ? 'शीर्ष चौपाल सलाहकार' : 'Top Agronomists of the Week'}</span>
              </h3>
              <button
                onClick={() => setActiveTab('champions')}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {isHi ? 'सभी' : 'View All'}
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: 'Dr. R.K. Meena',
                  role: 'KVK Soil Scientist',
                  score: '482 Solves',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                },
                {
                  name: 'Sardar Gurdeep Singh',
                  role: 'Organic Wheat Pioneer',
                  score: '320 Helpful',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                },
                {
                  name: 'Vikram Patel',
                  role: 'Solar Drip Cluster Lead',
                  score: '245 Helpful',
                  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                },
              ].map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800/70 rounded-2xl border border-stone-100 dark:border-stone-800"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-9 h-9 rounded-full object-cover border border-emerald-600/30"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400">{c.role}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    {c.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. TRENDING AGRICULTURAL TOPICS IN DISTRICT */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{isHi ? 'आपके क्षेत्र में चर्चित विषय' : 'Trending in Your District'}</span>
            </h3>

            <div className="space-y-2">
              {[
                {
                  tag: 'कपास का मंडी भाव ₹7,800 पार',
                  count: '142 चर्चाएं',
                  action: () => setCurrentView('market-prices'),
                },
                {
                  tag: 'ड्रिप पर 70% सरकारी सब्सिडी',
                  count: '98 चर्चाएं',
                  action: () => setCurrentView('government-schemes'),
                },
                {
                  tag: 'देसी जीवामृत बनाने की तकनीक',
                  count: '86 चर्चाएं',
                  action: () => {
                    setSearchQuery('जीवामृत');
                    setActiveTab('feed');
                  },
                },
                {
                  tag: 'गेहूं में पीला रतुआ से बचाव',
                  count: '74 चर्चाएं',
                  action: () => {
                    setSearchQuery('रतुआ');
                    setActiveTab('doctor');
                  },
                },
              ].map((trend, idx) => (
                <button
                  key={idx}
                  onClick={trend.action}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-stone-100 dark:border-stone-800 flex items-center justify-between group cursor-pointer transition-all"
                >
                  <div>
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                      #{trend.tag}
                    </div>
                    <div className="text-[10px] text-stone-400">{trend.count}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* 4. CODE OF CONDUCT */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 rounded-3xl p-5 space-y-2 text-xs">
            <div className="text-emerald-950 dark:text-emerald-200 font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{isHi ? 'चौपाल का किसान धर्म (नियम)' : 'Community Code of Honor'}</span>
            </div>
            <p className="text-emerald-900/90 dark:text-emerald-300/80 leading-relaxed text-[11px]">
              {isHi
                ? 'सिर्फ वास्तविक कृषि अनुभव साझा करें। हर रासायनिक दवा की खुराक वैज्ञानिक प्रमाणीकरण के बाद ही प्रयोग करें।'
                : 'Share genuine farm data and field photos. Every chemical prescription is cross-verified against ICAR safety guidelines.'}
            </p>
          </div>
        </div>
      </div>
    )}

      {/* 6. CREATE POST / VOICE MODAL */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialMode={createModalMode}
        onPublish={handlePublishPost}
      />
    </div>
  );
};
