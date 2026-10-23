/**
 * Kishan Community — Farmers Together
 * A rich community section mounted inside the Virtual Farm Clusters page.
 * Links to the full CommunityPage and provides group + post creation entry points.
 */
import React, { useState } from 'react';
import {
  Users, Plus, Edit3, MessageCircle, ArrowRight, Share2,
  HelpCircle, Lightbulb, Megaphone, Globe, Lock, Shield,
  Sprout, CheckCircle2, BarChart2, Bell, TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useUserStore } from '../../store/userStore';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LocalGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  cropInterest: string;
  imageUrl?: string;
  isPrivate: boolean;
  memberCount: number;
  createdAt: string;
}

// ── Sample community groups (localStorage-backed) ─────────────────────────────

const SEED_GROUPS: LocalGroup[] = [
  {
    id: 'grp_cotton_vidarbha',
    name: 'Cotton Farming Group',
    description: 'Practical cotton field knowledge — pink bollworm traps, drip scheduling, and collective mandi selling.',
    category: 'Cotton Farming',
    location: 'Vidarbha & Saurashtra',
    cropInterest: 'Cotton',
    imageUrl: 'https://images.unsplash.com/photo-1594488556855-6b83f4b46c6a?w=400&auto=format&fit=crop&q=80',
    isPrivate: false,
    memberCount: 142,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'grp_organic_anandpur',
    name: 'Anandpur Organic Krishi Sangh',
    description: 'Zero-budget natural farming, Jeevamrut, bio-pesticides, and organic certification guidance.',
    category: 'Organic Farming',
    location: 'Anandpur, Gujarat',
    cropInterest: 'Groundnut, Pulses',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
    isPrivate: false,
    memberCount: 88,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'grp_wheat_innovators',
    name: 'Malwa Wheat Innovators',
    description: 'Wheat varieties, laser land leveling, and terminal heat management across the central plains.',
    category: 'Wheat Farming',
    location: 'Malwa & Central Plains',
    cropInterest: 'Wheat, Gram',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=80',
    isPrivate: false,
    memberCount: 215,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'grp_nashik_polyhouse',
    name: 'Nashik Polyhouse & Vegetable Circle',
    description: 'High-density capsicum, tomatoes, and climate control in naturally ventilated polyhouses.',
    category: 'Vegetable Farming',
    location: 'Nashik, Maharashtra',
    cropInterest: 'Tomatoes, Capsicum',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251e?w=400&auto=format&fit=crop&q=80',
    isPrivate: true,
    memberCount: 46,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'grp_water_tech',
    name: 'Solar Drip & Micro-Irrigation Network',
    description: 'Solar pump subsidies (PM-KUSUM), drip venturi filters, and borewell recharge techniques.',
    category: 'Irrigation & Water Management',
    location: 'All India Community',
    cropInterest: 'All Irrigated Crops',
    imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&auto=format&fit=crop&q=80',
    isPrivate: false,
    memberCount: 167,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const CATEGORIES = [
  'Rice Farming', 'Wheat Farming', 'Cotton Farming', 'Vegetable Farming',
  'Organic Farming', 'Dairy Farming', 'Modern Farming Technology',
  'Agricultural Business', 'Irrigation & Water Management',
  'Pest & Disease Management', 'General Farmer Discussion',
];

function getGroups(): LocalGroup[] {
  try {
    const raw = localStorage.getItem('kb_farmer_groups');
    if (raw) return JSON.parse(raw);
  } catch { /**/ }
  localStorage.setItem('kb_farmer_groups', JSON.stringify(SEED_GROUPS));
  return SEED_GROUPS;
}

function saveGroups(groups: LocalGroup[]) {
  try { localStorage.setItem('kb_farmer_groups', JSON.stringify(groups)); } catch { /**/ }
}

// ── Sub-components ────────────────────────────────────────────────────────────

const CategoryBadge: React.FC<{ cat: string; isPrivate?: boolean }> = ({ cat, isPrivate }) => (
  <div className="flex items-center gap-1.5 flex-wrap">
    <span className="text-[10px] bg-[#E8F6E9] text-[#087443] px-2 py-0.5 rounded-full font-medium border border-green-200">{cat}</span>
    {isPrivate
      ? <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" />Private</span>
      : <span className="text-[9px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200 flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" />Public</span>
    }
  </div>
);

// ── Create Group Modal ────────────────────────────────────────────────────────

const CreateGroupModal: React.FC<{
  onClose: () => void;
  onCreated: (g: LocalGroup) => void;
  currentUser: { id: string; fullName: string; village?: string } | null;
}> = ({ onClose, onCreated, currentUser }) => {
  const { addToast } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[10]);
  const [location, setLocation] = useState(currentUser?.village || '');
  const [cropInterest, setCropInterest] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [rules, setRules] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Group name is required';
    if (name.length > 60) e.name = 'Max 60 characters';
    if (!description.trim()) e.description = 'Please describe your group';
    if (!cropInterest.trim()) e.cropInterest = 'Enter main crop or farming interest';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const newGroup: LocalGroup = {
      id: `grp_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      location: location.trim() || 'India',
      cropInterest: cropInterest.trim(),
      imageUrl: imageUrl.trim() || undefined,
      isPrivate,
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };
    const all = getGroups();
    saveGroups([newGroup, ...all]);
    onCreated(newGroup);
    addToast('Group Created! 🎉', `"${newGroup.name}" is now live!`, 'success');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-lg text-stone-900">Create Farmer Group</h3>
            <p className="text-xs text-stone-500">Build your farming community</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Group Name *</label>
            <input type="text" maxLength={60} value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vidarbha Cotton Farmers Network"
              className={`w-full p-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-[#087443] focus:outline-none ${errors.name ? 'border-red-400' : 'border-stone-300'}`} />
            <div className="flex justify-between mt-0.5">
              {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
              <p className="text-[10px] text-stone-400 ml-auto">{name.length}/60</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Description *</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this group is about and who should join…"
              className={`w-full p-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-[#087443] focus:outline-none resize-none ${errors.description ? 'border-red-400' : 'border-stone-300'}`} />
            {errors.description && <p className="text-[10px] text-red-500 mt-0.5">{errors.description}</p>}
          </div>

          {/* Category + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#087443] focus:outline-none">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Location / Area</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="Village, District, or State"
                className="w-full p-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#087443] focus:outline-none" />
            </div>
          </div>

          {/* Crop Interest */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Main Crop or Farming Interest *</label>
            <input type="text" value={cropInterest} onChange={(e) => setCropInterest(e.target.value)}
              placeholder="Cotton, Organic Groundnut, Dairy, etc."
              className={`w-full p-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-[#087443] focus:outline-none ${errors.cropInterest ? 'border-red-400' : 'border-stone-300'}`} />
            {errors.cropInterest && <p className="text-[10px] text-red-500 mt-0.5">{errors.cropInterest}</p>}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Group Cover Image URL (Optional)</label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#087443] focus:outline-none" />
            {imageUrl && <img src={imageUrl} alt="preview" className="mt-2 rounded-xl w-full h-28 object-cover border border-stone-200"
              onError={(e) => (e.currentTarget.style.display = 'none')} />}
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <p className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                {isPrivate ? <Lock className="w-4 h-4 text-amber-500" /> : <Globe className="w-4 h-4 text-[#087443]" />}
                {isPrivate ? 'Private Group' : 'Public Group'}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {isPrivate ? 'Only approved members can see discussions.' : 'Any farmer can discover and join without approval.'}
              </p>
            </div>
            <button type="button" onClick={() => setIsPrivate(!isPrivate)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPrivate ? 'bg-amber-400' : 'bg-[#087443]'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Rules */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Group Rules (optional — one per line)</label>
            <textarea rows={3} value={rules} onChange={(e) => setRules(e.target.value)}
              placeholder={"Be respectful to all farmers\nShare real field experiences only\nNo spam or promotions"}
              className="w-full p-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#087443] focus:outline-none resize-none font-mono" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm text-stone-600 border border-stone-300 hover:bg-stone-50 rounded-xl font-medium transition-all">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 text-sm bg-[#004D36] hover:bg-[#003326] text-white font-semibold rounded-xl shadow transition-all disabled:opacity-70 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</>
                : <><Plus className="w-4 h-4" />Create Group</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Share Thoughts Modal ───────────────────────────────────────────────────────

const ShareThoughtsModal: React.FC<{
  onClose: () => void;
  groups: LocalGroup[];
  currentUser: { id: string; fullName: string; village?: string; role?: string } | null;
}> = ({ onClose, groups, currentUser }) => {
  const { addToast, setCurrentView } = useApp();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'DISCUSSION' | 'QUESTION' | 'TIP' | 'ANNOUNCEMENT'>('DISCUSSION');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [category, setCategory] = useState(CATEGORIES[10]);
  const [loading, setLoading] = useState(false);

  const postTypes = [
    { value: 'DISCUSSION' as const, label: 'Discussion', emoji: '💬', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'QUESTION' as const, label: 'Question', emoji: '❓', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { value: 'TIP' as const, label: 'Farming Tip', emoji: '💡', color: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'ANNOUNCEMENT' as const, label: 'Announcement', emoji: '📢', color: 'bg-red-50 text-red-700 border-red-200' },
  ];

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    addToast('Post Published! 🌾', 'Your post is now live in the Kishan Community.', 'success');
    setLoading(false);
    onClose();
    // Navigate to community page to see the post
    setTimeout(() => setCurrentView('community'), 300);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-lg text-stone-900">What's on your mind, Farmer?</h3>
            <p className="text-xs text-stone-500">Share with the Kishan Community</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors">✕</button>
        </div>

        <form onSubmit={handlePublish} className="p-6 space-y-4">
          {/* Post Type */}
          <div className="flex gap-2 flex-wrap">
            {postTypes.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setPostType(opt.value)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${postType === opt.value ? opt.color + ' ring-2 ring-offset-1 font-semibold' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'}`}>
                <span>{opt.emoji}</span>{opt.label}
              </button>
            ))}
          </div>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#004D36] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {(currentUser?.fullName || 'F').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">{currentUser?.fullName || 'Ramesh Patel'}</p>
              {currentUser?.village && <p className="text-[10px] text-stone-400">{currentUser.village}</p>}
            </div>
          </div>

          {/* Content */}
          <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'QUESTION' ? 'Ask your farming question… (e.g. Why are my crop leaves turning yellow?)'
              : postType === 'TIP' ? 'Share a practical farming tip that helped you…'
              : postType === 'ANNOUNCEMENT' ? 'Share an important announcement with the community…'
              : 'Share your farming thoughts, experiences, ideas, or questions…'
            }
            className="w-full p-3 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#087443] focus:outline-none resize-none" />

          {/* Q&A disclaimer */}
          {postType === 'QUESTION' && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 leading-relaxed">
                Community answers are based on farmers' field experience. For pesticide or chemical advice, please consult your local KVK or a certified agronomist.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:ring-1 focus:ring-[#087443] focus:outline-none">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Publish to</label>
              <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:ring-1 focus:ring-[#087443] focus:outline-none">
                <option value="">General Community</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm text-stone-600 border border-stone-300 hover:bg-stone-50 rounded-xl font-medium transition-all">Cancel</button>
            <button type="submit" disabled={loading || !content.trim()}
              className="flex-1 py-3 text-sm bg-[#087443] hover:bg-[#004D36] text-white font-semibold rounded-xl shadow transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Publishing…</>
                : <>✍️ Publish Post</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Group Card ─────────────────────────────────────────────────────────────────

const GroupCard: React.FC<{
  group: LocalGroup;
  currentUserId: string;
  onJoin: (g: LocalGroup) => void;
}> = ({ group, currentUserId, onJoin }) => {
  const { setCurrentView } = useApp();
  const joinedKey = `kb_joined_${group.id}_${currentUserId}`;
  const [joined, setJoined] = useState(() => !!localStorage.getItem(joinedKey));

  const handleJoin = () => {
    if (!joined) {
      localStorage.setItem(joinedKey, '1');
      setJoined(true);
      onJoin(group);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
      <div className="relative h-28 overflow-hidden flex-shrink-0">
        {group.imageUrl
          ? <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full bg-gradient-to-br from-[#004D36] to-[#087443] flex items-center justify-center"><span className="text-4xl">🌾</span></div>
        }
        <div className="absolute top-2 right-2">
          {group.isPrivate
            ? <span className="text-[9px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1"><Lock className="w-2.5 h-2.5" />Private</span>
            : <span className="text-[9px] font-bold bg-[#087443]/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1"><Globe className="w-2.5 h-2.5" />Public</span>
          }
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <CategoryBadge cat={group.category} />
        <h4 className="font-bold text-sm text-stone-900 mt-2 mb-1 line-clamp-1">{group.name}</h4>
        <p className="text-[11px] text-stone-500 mb-2 line-clamp-2 leading-relaxed flex-1">{group.description}</p>
        {group.location && <p className="text-[10px] text-stone-400 mb-3">📍 {group.location} · 🌱 {group.cropInterest}</p>}

        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] text-stone-500 flex items-center gap-1">
            <Users className="w-3 h-3 text-[#087443]" />
            <strong className="text-stone-700">{group.memberCount + (joined ? 1 : 0)}</strong> members
          </span>
          <div className="flex gap-1.5">
            <button onClick={() => setCurrentView('community')}
              className="text-[10px] px-2.5 py-1.5 border border-stone-200 text-stone-500 hover:bg-stone-50 rounded-lg font-medium transition-all">
              View
            </button>
            {joined
              ? <span className="text-[10px] px-2.5 py-1.5 bg-[#E8F6E9] text-[#087443] rounded-lg font-bold border border-green-200">✓ Member</span>
              : <button onClick={handleJoin}
                  className="text-[10px] px-2.5 py-1.5 bg-[#087443] hover:bg-[#004D36] text-white rounded-lg font-medium transition-all">
                  {group.isPrivate ? 'Request' : 'Join'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Stats Bar ─────────────────────────────────────────────────────────────────

const StatPill: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 backdrop-blur-sm text-center">
    <span className="block text-lg font-bold text-white">{value}</span>
    <span className="block text-[10px] text-emerald-200">{label}</span>
  </div>
);

// ── MAIN EXPORTED COMPONENT ───────────────────────────────────────────────────

export const KishanCommunitySection: React.FC = () => {
  const { addToast, setCurrentView } = useApp();
  const { currentUser } = useUserStore();

  const userId = currentUser?.id || 'usr_farmer_1';

  const [groups, setGroups] = useState<LocalGroup[]>(getGroups);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAllGroups, setShowAllGroups] = useState(false);

  const handleGroupCreated = (g: LocalGroup) => {
    setGroups((prev) => [g, ...prev]);
  };

  const handleJoin = (g: LocalGroup) => {
    addToast(g.isPrivate ? 'Request Sent' : 'Joined! 🌾',
      g.isPrivate ? `Your request to join "${g.name}" was sent.` : `Welcome to "${g.name}"!`,
      'success');
  };

  const displayedGroups = showAllGroups ? groups : groups.slice(0, 6);

  return (
    <section id="kishan-community" className="space-y-6">
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#004D36] via-[#065F46] to-[#087443] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-white/10 overflow-hidden relative">
        {/* BG decorative emojis */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {['🌾','🌱','🚜','🌿','🌻'].map((em, i) => (
            <span key={i} className="absolute text-5xl opacity-[0.07]"
              style={{ top: `${[10,40,70,15,60][i]}%`, left: `${[5,18,33,72,87][i]}%`, transform: 'rotate(-12deg)' }}>
              {em}
            </span>
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#FFD84D] text-[#004D36] text-[10px] font-bold px-3 py-1 rounded-full">KISHAN COMMUNITY 🌾</span>
                <span className="text-emerald-300 text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full border border-white/20">NEW</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">Farmers Together</h2>
              <p className="text-emerald-100 text-sm font-medium italic">"Your community, your ideas, your farming future."</p>
              <p className="text-emerald-200 text-xs max-w-xl leading-relaxed">
                Connect with farmers, create your own groups, share experiences, ask questions, and grow together.
              </p>
            </div>

            <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
              <button onClick={() => setShowCreateGroupModal(true)}
                className="flex items-center gap-1.5 bg-[#FFD84D] hover:bg-yellow-300 text-[#004D36] text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-[0.98]">
                <Plus className="w-4 h-4" /> Create Group
              </button>
              <button onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-4 py-2.5 rounded-xl border border-white/25 transition-all active:scale-[0.98]">
                <Edit3 className="w-4 h-4" /> Share Thoughts
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-3">
            <StatPill value={groups.length} label="Active Groups" />
            <StatPill value="14,850+" label="Farmers Online" />
            <StatPill value="52+" label="Questions Answered" />
            <StatPill value="28+" label="Farming Tips Shared" />
          </div>
        </div>
      </div>

      {/* ── Quick Action Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <MessageCircle className="w-5 h-5" />, label: 'Open Discussions', color: 'bg-blue-50 text-blue-600 border-blue-200', action: () => setCurrentView('community') },
          { icon: <HelpCircle className="w-5 h-5" />, label: 'Ask a Question', color: 'bg-amber-50 text-amber-600 border-amber-200', action: () => setShowShareModal(true) },
          { icon: <Lightbulb className="w-5 h-5" />, label: 'Share a Tip', color: 'bg-green-50 text-green-600 border-green-200', action: () => setShowShareModal(true) },
          { icon: <BarChart2 className="w-5 h-5" />, label: 'Community Poll', color: 'bg-purple-50 text-purple-600 border-purple-200', action: () => setShowShareModal(true) },
        ].map(({ icon, label, color, action }) => (
          <button key={label} onClick={action}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${color} hover:shadow-md transition-all active:scale-[0.98] bg-white`}>
            {icon}
            <span className="text-xs font-semibold text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Community Groups Grid ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-lg">Farmer Groups</h3>
            <p className="text-xs text-stone-500">{groups.length} active groups — join and grow with fellow farmers</p>
          </div>
          <button onClick={() => setShowCreateGroupModal(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#087443] hover:text-[#004D36] transition-colors">
            <Plus className="w-4 h-4" /> New Group
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedGroups.map((g) => (
            <GroupCard key={g.id} group={g} currentUserId={userId} onJoin={handleJoin} />
          ))}
        </div>

        {groups.length > 6 && (
          <div className="text-center">
            <button onClick={() => setShowAllGroups(!showAllGroups)}
              className="inline-flex items-center gap-1.5 text-sm text-[#087443] font-semibold hover:text-[#004D36] transition-colors px-4 py-2 bg-[#E8F6E9] rounded-xl border border-green-200">
              {showAllGroups ? '↑ Show fewer groups' : `↓ See all ${groups.length} groups`}
            </button>
          </div>
        )}
      </div>

      {/* ── Full Community Hub CTA ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 p-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#004D36] to-[#20A464] flex items-center justify-center flex-shrink-0 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-stone-900 text-base">Kisan Chaupal — Full Community Hub</h3>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              Access 14,850+ farmers, voice notes, live cluster chat, Q&A feeds, crop clubs, expert consultations, and real-time mandi discussions in one place.
            </p>
          </div>
          <button onClick={() => setCurrentView('community')}
            className="flex items-center gap-2 bg-[#004D36] hover:bg-[#003326] text-white text-sm font-bold px-5 py-3 rounded-xl shadow transition-all flex-shrink-0 active:scale-[0.98]">
            Open Community <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="border-t border-stone-100 px-6 py-4 bg-stone-50 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Sprout className="w-4 h-4 text-[#087443]" />, text: 'Crop Club Feeds' },
            { icon: <Bell className="w-4 h-4 text-amber-500" />, text: 'Expert Advisories' },
            { icon: <TrendingUp className="w-4 h-4 text-blue-500" />, text: 'Live Mandi Chatter' },
            { icon: <CheckCircle2 className="w-4 h-4 text-green-600" />, text: 'Q&A with KVK Scientists' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-[11px] text-stone-600 font-medium">
              {icon} {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Safety Notice ─────────────────────────────────────────────────────── */}
      <div className="bg-[#E8F6E9] rounded-2xl border border-green-200 p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#087443] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[#004D36] text-xs mb-0.5">Community Safety & Moderation</p>
          <p className="text-[10px] text-[#087443] leading-relaxed">
            All community discussions are monitored by moderators. Report spam, misinformation, or abusive content using the flag icon on any post. Chemical and pesticide advice from community members should always be verified with a KVK or certified agronomist.
          </p>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {showCreateGroupModal && (
        <CreateGroupModal
          onClose={() => setShowCreateGroupModal(false)}
          onCreated={handleGroupCreated}
          currentUser={currentUser}
        />
      )}

      {showShareModal && (
        <ShareThoughtsModal
          onClose={() => setShowShareModal(false)}
          groups={groups}
          currentUser={currentUser}
        />
      )}
    </section>
  );
};

export default KishanCommunitySection;