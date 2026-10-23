import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  Users,
  Store,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Layers,
  MapPin,
  Bell,
  Activity,
  ShoppingBag,
  Truck,
  Box,
  TrendingUp,
  ClipboardList,
  MessageSquare,
  Award,
  Globe
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useApp } from '../context/AppContext';
import { UserRole } from '../../shared/types';

interface RoleFeature {
  icon: React.ReactNode;
  label: string;
}

interface RoleData {
  role: UserRole;
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  bgGradient: string;
  badgeColor: string;
  borderColor: string;
  route: string;
  features: RoleFeature[];
}

export const RoleSelectionSection: React.FC = () => {
  const setUserRole = useUserStore((state) => state.setUserRole);
  const { setCurrentView } = useApp();
  const [expandedCard, setExpandedCard] = useState<UserRole | null>(null);
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const handleSearch = (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : searchQuery).trim().toLowerCase();
    if (!q) return;

    if (q.includes('pm-kisan') || q.includes('scheme') || q.includes('yojana') || q.includes('subsidy')) {
      setCurrentView('government-schemes');
    } else if (q.includes('msp') || q.includes('price') || q.includes('mandi') || q.includes('wheat') || q.includes('rate')) {
      setCurrentView('market-prices');
    } else if (q.includes('fertilizer') || q.includes('bulk') || q.includes('seed') || q.includes('buy')) {
      setCurrentView('bulk-buying');
    } else if (q.includes('weather') || q.includes('rain') || q.includes('monsoon') || q.includes('forecast') || q.includes('alert')) {
      setCurrentView('weather');
    } else if (q.includes('disease') || q.includes('pest') || q.includes('crop health')) {
      setCurrentView('disease-scanner');
    } else if (q.includes('irrigation') || q.includes('pump') || q.includes('water')) {
      setCurrentView('smart-irrigation');
    } else if (q.includes('soil') || q.includes('fertility') || q.includes('npk')) {
      setCurrentView('soil-health');
    } else if (q.includes('champion') || q.includes('cluster') || q.includes('village')) {
      setCurrentView('champion-dashboard');
    } else if (q.includes('buyer') || q.includes('market') || q.includes('produce')) {
      setCurrentView('buyer-dashboard');
    } else {
      setSearchFeedback(`Looking up "${q}" — explore matching tools in the role cards below.`);
      setTimeout(() => setSearchFeedback(null), 4000);
    }
  };

  const rolesData: RoleData[] = [
    {
      role: 'FARMER',
      title: 'Farmer',
      tagline: 'Grow Better. Earn Better. Sell Smarter.',
      description:
        'Kishan Bhai helps farmers manage their farming activities, connect with nearby farmers, access better market opportunities, purchase inputs in bulk, book machinery, and sell their harvest through trusted channels.',
      icon: (
        <svg className="w-9 h-9 text-emerald-700 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          <path d="M2 12h20" />
          <path d="M19 19l2 2-4 4" />
        </svg>
      ),
      accentColor: 'from-emerald-600 to-green-700',
      bgGradient: 'bg-emerald-50/60 dark:bg-emerald-950/20',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      borderColor: 'border-emerald-200/80 hover:border-emerald-500 dark:border-emerald-900',
      route: 'farmer-dashboard',
      features: [
        { icon: <Sprout className="w-4 h-4 text-emerald-600" />, label: 'Virtual Farm Profile' },
        { icon: <ShoppingBag className="w-4 h-4 text-emerald-600" />, label: 'Bulk Buying' },
        { icon: <Truck className="w-4 h-4 text-emerald-600" />, label: 'Machinery Booking' },
        { icon: <Box className="w-4 h-4 text-emerald-600" />, label: 'Harvest Pooling' },
        { icon: <Store className="w-4 h-4 text-emerald-600" />, label: 'Buyer Marketplace' },
        { icon: <TrendingUp className="w-4 h-4 text-emerald-600" />, label: 'Market Price Information' },
        { icon: <Activity className="w-4 h-4 text-emerald-600" />, label: 'Weather & Crop Insights' },
        { icon: <Sparkles className="w-4 h-4 text-emerald-600" />, label: 'AI Farming Assistance' },
        { icon: <Layers className="w-4 h-4 text-emerald-600" />, label: 'Farm Activity Dashboard' },
        { icon: <Bell className="w-4 h-4 text-emerald-600" />, label: 'Important Farming Alerts' },
        { icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, label: 'Digital Farmer Identity' },
        { icon: <MapPin className="w-4 h-4 text-emerald-600" />, label: 'Nearby Farmer & Service Discovery' },
      ],
    },
    {
      role: 'CHAMPION',
      title: 'Village Champion',
      tagline: 'Connect Farmers. Build Stronger Villages.',
      description:
        'Village Champions act as trusted local coordinators who help farmers discover Kishan Bhai services, coordinate group activities, support bulk purchasing and harvest pooling, and connect farmers with buyers and service providers.',
      icon: (
        <svg className="w-9 h-9 text-amber-700 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      accentColor: 'from-amber-600 to-yellow-700',
      bgGradient: 'bg-amber-50/60 dark:bg-amber-950/20',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      borderColor: 'border-amber-200/80 hover:border-amber-500 dark:border-amber-900',
      route: 'champion-dashboard',
      features: [
        { icon: <Users className="w-4 h-4 text-amber-600" />, label: 'Farmer Community Management' },
        { icon: <ClipboardList className="w-4 h-4 text-amber-600" />, label: 'Farmer Registration & Verification' },
        { icon: <Layers className="w-4 h-4 text-amber-600" />, label: 'Farm Cluster Management' },
        { icon: <ShoppingBag className="w-4 h-4 text-amber-600" />, label: 'Coordinate Bulk Buying' },
        { icon: <Box className="w-4 h-4 text-amber-600" />, label: 'Harvest Pool Coordination' },
        { icon: <Truck className="w-4 h-4 text-amber-600" />, label: 'Machinery Coordination' },
        { icon: <Bell className="w-4 h-4 text-amber-600" />, label: 'Village Announcements' },
        { icon: <MessageSquare className="w-4 h-4 text-amber-600" />, label: 'Farmer–Buyer Connections' },
        { icon: <Activity className="w-4 h-4 text-amber-600" />, label: 'Village Activity Dashboard' },
        { icon: <MapPin className="w-4 h-4 text-amber-600" />, label: 'Village-Level Insights' },
        { icon: <Bell className="w-4 h-4 text-amber-600" />, label: 'Farmer Notifications' },
        { icon: <Award className="w-4 h-4 text-amber-600" />, label: 'Champion Performance & Activity' },
      ],
    },
    {
      role: 'BUYER',
      title: 'Buyer',
      tagline: 'Find Quality Produce Directly From Farmers.',
      description:
        'Buyers can discover available agricultural produce, connect with farmer groups, view harvest details, submit requirements, negotiate purchases, and build direct relationships with farming communities.',
      icon: (
        <svg className="w-9 h-9 text-blue-700 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      accentColor: 'from-blue-600 to-indigo-700',
      bgGradient: 'bg-blue-50/60 dark:bg-blue-950/20',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      borderColor: 'border-blue-200/80 hover:border-blue-500 dark:border-blue-900',
      route: 'buyer-dashboard',
      features: [
        { icon: <Store className="w-4 h-4 text-blue-600" />, label: 'Browse Available Produce' },
        { icon: <Sprout className="w-4 h-4 text-blue-600" />, label: 'Crop & Harvest Listings' },
        { icon: <TrendingUp className="w-4 h-4 text-blue-600" />, label: 'Quantity & Availability' },
        { icon: <MapPin className="w-4 h-4 text-blue-600" />, label: 'Location-Based Discovery' },
        { icon: <Users className="w-4 h-4 text-blue-600" />, label: 'Farmer & Farm Profiles' },
        { icon: <ShoppingBag className="w-4 h-4 text-blue-600" />, label: 'Bulk Purchase Requests' },
        { icon: <MessageSquare className="w-4 h-4 text-blue-600" />, label: 'Buyer–Farmer Communication' },
        { icon: <Globe className="w-4 h-4 text-blue-600" />, label: 'Farmer Group Connections' },
        { icon: <ClipboardList className="w-4 h-4 text-blue-600" />, label: 'Purchase Management' },
        { icon: <Bell className="w-4 h-4 text-blue-600" />, label: 'New Harvest Notifications' },
        { icon: <Award className="w-4 h-4 text-blue-600" />, label: 'Supplier/Transaction Feedback' },
        { icon: <Activity className="w-4 h-4 text-blue-600" />, label: 'Buyer Dashboard' },
      ],
    },
  ];

  const handleSelectRole = (role: UserRole, route: string) => {
    setIsNavigating(role);
    setUserRole(role);
    setTimeout(() => {
      setCurrentView(route);
    }, 400);
  };

  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-stone-50 via-white to-stone-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 transition-colors">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Role Selection Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wider uppercase shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>KISHAN BHAI • AGRICULTURAL COMMUNITY PLATFORM</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-stone-900 dark:text-stone-100 tracking-tight"
          >
            One Platform. Three Powerful Roles.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-stone-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed"
          >
            Choose your role and unlock the tools designed for you. Whether you grow crops, support your village, or buy agricultural produce, Kishan Bhai connects you with the people, services, and opportunities you need.
          </motion.p>
        </div>

        {/* Floating Quick Search Bar */}
        <div className="max-w-2xl mx-auto relative z-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="bg-white dark:bg-stone-900 p-2 sm:p-2.5 rounded-2xl shadow-xl border border-emerald-500/30 dark:border-emerald-900/50 flex items-center gap-2"
          >
            <div className="pl-3 text-emerald-600 dark:text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farming topics, government schemes, market prices..."
              aria-label="Search farming topics, government schemes, or market prices"
              className="w-full bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm sm:text-base px-2 py-1.5 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs px-1 cursor-pointer"
                aria-label="Clear search input"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0 shadow-sm cursor-pointer"
            >
              Search
            </button>
          </form>

          {searchFeedback && (
            <div className="mt-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl text-center font-medium animate-fadeIn">
              {searchFeedback}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold">Popular:</span>
            <button
              type="button"
              onClick={() => handleSearch('PM-KISAN')}
              className="hover:text-emerald-600 underline cursor-pointer"
            >
              PM-KISAN
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleSearch('Wheat MSP')}
              className="hover:text-emerald-600 underline cursor-pointer"
            >
              Wheat MSP
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleSearch('Bulk Fertilizer')}
              className="hover:text-emerald-600 underline cursor-pointer"
            >
              Bulk Fertilizer
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleSearch('Weather Alert')}
              className="hover:text-emerald-600 underline cursor-pointer"
            >
              Weather Alert
            </button>
          </div>
        </div>

        {/* Visually Engaging Animated SVG Ecosystem Flow Diagram */}
        <div className="relative py-6 px-4 max-w-4xl mx-auto bg-gradient-to-r from-emerald-50/50 via-amber-50/30 to-blue-50/50 dark:from-emerald-950/20 dark:via-amber-950/10 dark:to-blue-950/20 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="text-center">
              <span className="text-[11px] font-bold tracking-widest text-emerald-800 dark:text-emerald-400 uppercase bg-emerald-100/80 dark:bg-emerald-900/40 px-3 py-1 rounded-full">
                Connected Agricultural Ecosystem
              </span>
            </div>

            {/* SVG Connecting Flow Diagram */}
            <div className="w-full flex items-center justify-between px-2 sm:px-12 relative">
              {/* Animated SVG Path connecting the 3 nodes */}
              <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 hidden sm:block pointer-events-none">
                <svg className="w-full h-16 overflow-visible" viewBox="0 0 600 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Base Track Line */}
                  <path
                    d="M 60 30 Q 180 5 300 30 T 540 30"
                    stroke="currentColor"
                    className="text-emerald-200 dark:text-stone-800"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                  />
                  {/* Animated Flowing Pulse Path */}
                  <path
                    d="M 60 30 Q 180 5 300 30 T 540 30"
                    stroke="url(#gradient-flow)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="animate-pulse"
                    strokeDasharray="40 160"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="200;0"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <defs>
                    <linearGradient id="gradient-flow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Node 1: Farmer */}
              <div className="flex flex-col items-center relative z-20 group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 border-2 border-emerald-500 shadow-md flex items-center justify-center text-emerald-700 dark:text-emerald-300 transform group-hover:scale-110 transition-transform">
                  <Sprout className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-2">Farmer</span>
                <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">1. Grow</span>
              </div>

              {/* Node 2: Village Champion */}
              <div className="flex flex-col items-center relative z-20 group">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/60 border-2 border-amber-500 shadow-md flex items-center justify-center text-amber-700 dark:text-amber-300 transform group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-2">Village Champion</span>
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">2. Connect</span>
              </div>

              {/* Node 3: Buyer */}
              <div className="flex flex-col items-center relative z-20 group">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/60 border-2 border-blue-500 shadow-md flex items-center justify-center text-blue-700 dark:text-blue-300 transform group-hover:scale-110 transition-transform">
                  <Store className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-2">Buyer</span>
                <span className="text-[10px] font-medium text-blue-700 dark:text-blue-400">3. Trade</span>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 tracking-wider uppercase pt-1">
              Seamless end-to-end agricultural supply chain
            </div>
          </div>
        </div>

        {/* 3 Large Interactive Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {rolesData.map((item, index) => {
            const isExpanded = expandedCard === item.role;
            const isTargetNavigating = isNavigating === item.role;
            const visibleFeatures = isExpanded ? item.features : item.features.slice(0, 5);

            return (
              <motion.div
                key={item.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`bg-white dark:bg-stone-900 rounded-3xl border ${item.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden`}
              >
                {isTargetNavigating && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs z-30 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-stone-800 dark:text-stone-200">
                        Entering as {item.title}...
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Card Header & Icon */}
                  <div className="flex items-start justify-between">
                    <div className={`w-16 h-16 rounded-2xl ${item.bgGradient} flex items-center justify-center border border-stone-200/50 dark:border-stone-800 shadow-sm`}>
                      {item.icon}
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${item.badgeColor} uppercase tracking-wider`}>
                      Role {index + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold font-display text-stone-900 dark:text-stone-100 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 mb-3">
                      {item.tagline}
                    </p>
                    <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                      Key Features & Tools
                    </div>
                    <div className="space-y-2">
                      {visibleFeatures.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2.5 text-xs font-medium text-stone-700 dark:text-stone-300">
                          <div className="shrink-0">{feat.icon}</div>
                          <span>{feat.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Expand / Collapse Features Toggle */}
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : item.role)}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} all ${item.features.length} features for ${item.title}`}
                      className="w-full mt-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center justify-center gap-1 cursor-pointer bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <span>{isExpanded ? 'Show Less Features' : `View All (${item.features.length}) Features`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                {/* Card CTAs */}
                <div className="space-y-3 pt-6 mt-6 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => handleSelectRole(item.role, item.route)}
                    aria-label={`Enter Kishan Bhai platform as ${item.title}`}
                    className={`w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r ${item.accentColor} text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600`}
                  >
                    <span>Enter as {item.title}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <button
                    onClick={() => handleSelectRole(item.role, item.route)}
                    aria-label={`Learn more and explore tools for ${item.title}`}
                    className="w-full py-2.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg"
                  >
                    Learn More & Explore Tools
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Community CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-emerald-900 via-[#1B3B11] to-stone-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-800 relative overflow-hidden text-center space-y-6"
        >
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
              Ready to join the Kishan Bhai community?
            </h2>
            <p className="text-emerald-100/80 text-sm sm:text-base">
              Choose your role and start connecting with the agricultural ecosystem today.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2 relative z-10">
            <button
              onClick={() => handleSelectRole('FARMER', 'farmer-dashboard')}
              aria-label="Join Kishan Bhai platform as a Farmer"
              className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold rounded-2xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400"
            >
              <Sprout className="w-4 h-4" aria-hidden="true" />
              <span>Join as Farmer</span>
            </button>

            <button
              onClick={() => handleSelectRole('CHAMPION', 'champion-dashboard')}
              aria-label="Join Kishan Bhai platform as a Village Champion"
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-2xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400"
            >
              <Users className="w-4 h-4" aria-hidden="true" />
              <span>Become a Village Champion</span>
            </button>

            <button
              onClick={() => handleSelectRole('BUYER', 'buyer-dashboard')}
              aria-label="Join Kishan Bhai platform as an Institutional Buyer"
              className="px-6 py-3.5 bg-white hover:bg-stone-100 text-stone-950 font-bold rounded-2xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
            >
              <Store className="w-4 h-4 text-blue-700" aria-hidden="true" />
              <span>Join as Buyer</span>
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
