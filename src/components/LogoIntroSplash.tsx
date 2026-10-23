import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import { AnimatedKishanLogo, playOrganicLogoChime } from './AnimatedKishanLogo';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  LogIn,
  CheckCircle2,
  Cpu,
  Layers,
  Sprout,
  Users,
} from 'lucide-react';
import { UserRole } from '../../shared/types';

interface LogoIntroSplashProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoIntroSplash: React.FC<LogoIntroSplashProps> = ({ isOpen, onClose }) => {
  const { setCurrentUser, setUserRole } = useUserStore();
  const { setCurrentView, addToast, language } = useApp();

  const [animStage, setAnimStage] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(6);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Progressive animation sequence trigger
  useEffect(() => {
    if (isOpen) {
      setAnimStage(0);
      setCountdown(6);
      setIsPaused(false);

      if (!isMuted) {
        // Play gentle introductory chime
        setTimeout(() => playOrganicLogoChime(), 400);
      }

      const t1 = setTimeout(() => setAnimStage(1), 300); // Ring + Nodes
      const t2 = setTimeout(() => setAnimStage(2), 900); // Sun + Wheat
      const t3 = setTimeout(() => setAnimStage(3), 1600); // Leaves + Sprout
      const t4 = setTimeout(() => setAnimStage(4), 2300); // Brand Typography & Tagline
      const t5 = setTimeout(() => setAnimStage(5), 2900); // Interactive Action buttons

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
      };
    }
  }, [isOpen]);

  // Countdown timer for automatic transition
  useEffect(() => {
    if (!isOpen || isPaused) return;

    if (countdown <= 0) {
      onClose();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, isPaused, countdown, onClose]);

  const handleReplay = () => {
    setAnimStage(0);
    setCountdown(6);
    if (!isMuted) playOrganicLogoChime();
    setTimeout(() => setAnimStage(1), 300);
    setTimeout(() => setAnimStage(2), 800);
    setTimeout(() => setAnimStage(3), 1500);
    setTimeout(() => setAnimStage(4), 2200);
    setTimeout(() => setAnimStage(5), 2800);
  };

  const handleQuickLogin = (role: UserRole, defaultName: string) => {
    const demoUser = {
      id: `usr_${role.toLowerCase()}_${Date.now()}`,
      fullName: defaultName,
      email: `${role.toLowerCase()}@kishanbhai.in`,
      phone: '+91 98765 43210',
      role,
      village: 'Anandpur',
      state: 'Gujarat',
      verified: true,
      farmSizeAcres: role === 'FARMER' ? 4.5 : undefined,
      crops: role === 'FARMER' ? ['Cotton (Bt)', 'Wheat', 'Groundnut'] : undefined,
      preferredLanguage: (language === 'hi' ? 'hi' : 'en') as 'en' | 'hi',
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(demoUser);
    setUserRole(role);
    addToast('Welcome to Kishan Bhai', `Signed in as ${defaultName} (${role})`, 'success');
    onClose();

    if (role === 'FARMER') setCurrentView('farmer-dashboard');
    else if (role === 'CHAMPION') setCurrentView('champion-dashboard');
    else if (role === 'BUYER') setCurrentView('buyer-dashboard');
    else if (role === 'ADMIN') setCurrentView('admin-dashboard');
  };

  if (!isOpen) return null;

  return (
    <div
      id="logo-intro-splash"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/95 backdrop-blur-2xl animate-in fade-in duration-300 select-none overflow-y-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Animated Atmosphere (Sunburst & Grid Network) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-b from-emerald-600/20 via-amber-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-emerald-950/60 rounded-full blur-2xl" />

        {/* Subtle Agricultural Geometric Mesh Grid */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #34D399 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main Card Modal Container */}
      <div className="relative w-full max-w-2xl bg-stone-900/90 border border-emerald-500/30 rounded-[36px] p-6 sm:p-10 text-white shadow-[0_0_80px_rgba(16,185,129,0.15)] flex flex-col items-center text-center z-10 space-y-6">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
              Animatic Brand Reveal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (isMuted) playOrganicLogoChime();
              }}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={handleReplay}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Replay Animatic Intro"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Close & Skip to App"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Centerpiece: Large Animated Vector Logo */}
        <div className="relative py-2 sm:py-4 flex flex-col items-center">
          <div
            className={`transition-all duration-1000 transform ${
              animStage >= 1 ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-4'
            }`}
          >
            <AnimatedKishanLogo
              size="hero"
              showText={false}
              interactive={true}
              withSound={!isMuted}
              onClick={handleReplay}
            />
          </div>

          {/* Typography Reveal with Shimmer Beam */}
          <div
            className={`mt-4 space-y-1.5 transition-all duration-700 transform ${
              animStage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
                KISHAN <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-amber-300 bg-clip-text text-transparent">BHAI</span>
              </h1>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-sm sm:text-base font-semibold text-emerald-400 font-display">
                किसान भाई
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-xs sm:text-sm text-stone-300 font-medium">
                {language === 'hi'
                  ? 'छोटे किसान। एक शक्तिशाली नेटवर्क।'
                  : 'Small Farms. One Powerful Network.'}
              </span>
            </div>
          </div>

          {/* Core Agricultural Badges Strip */}
          <div
            className={`mt-4 flex flex-wrap justify-center gap-2 max-w-lg transition-all duration-700 ${
              animStage >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] text-emerald-200">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>Decentralized Cluster Pooling</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-stone-800/80 border border-stone-700 px-3 py-1 rounded-full text-[11px] text-stone-300">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Agronomic Advisory</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-stone-800/80 border border-stone-700 px-3 py-1 rounded-full text-[11px] text-stone-300">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Algorand Verified Escrows</span>
            </div>
          </div>
        </div>

        {/* Quick Instant Role Selector & Direct Actions */}
        <div
          className={`w-full space-y-3 pt-2 transition-all duration-700 ${
            animStage >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="text-[11px] font-mono text-stone-400 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Select Stakeholder Access or Enter Directly:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleQuickLogin('FARMER', 'Ramesh Patel')}
              className="p-3 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-left transition-all cursor-pointer group shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-emerald-200">
                  Ramesh Patel
                </span>
                <span className="text-[10px] text-emerald-300">Farmer • Anandpur</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleQuickLogin('CHAMPION', 'Anita Devi')}
              className="p-3 rounded-2xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-left transition-all cursor-pointer group shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-amber-200">
                  Anita Devi
                </span>
                <span className="text-[10px] text-stone-400">Village Champion</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleQuickLogin('BUYER', 'Vikram Mehta')}
              className="p-3 rounded-2xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-left transition-all cursor-pointer group shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-cyan-200">
                  Vikram Mehta
                </span>
                <span className="text-[10px] text-stone-400">Institutional Buyer</span>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  setCurrentView('login');
                }}
                className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In Page</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs px-5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <span>Enter Platform</span>
              <span className="text-[10px] font-mono opacity-75">({countdown}s)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
