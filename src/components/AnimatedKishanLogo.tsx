import React, { useState } from 'react';

export interface AnimatedKishanLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'splash';
  showText?: boolean;
  textPosition?: 'right' | 'bottom';
  interactive?: boolean;
  withSound?: boolean;
  className?: string;
  subtitle?: string;
  onClick?: () => void;
}

// Gentle Web Audio API sound synthesis for interactive logo chime
export const playOrganicLogoChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const freqs = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6 (Bright warm harmonic)

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12 / (idx + 1), now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
    });
  } catch {
    // AudioContext blocked or not supported - safe fallback
  }
};

export const AnimatedKishanLogo: React.FC<AnimatedKishanLogoProps> = ({
  size = 'md',
  showText = true,
  textPosition = 'right',
  interactive = true,
  withSound = false,
  className = '',
  subtitle,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [clickPulse, setClickPulse] = useState(false);

  // Size mapping
  const sizeConfig = {
    xs: { icon: 24, text: 'text-xs', sub: 'text-[9px]', gap: 'gap-1.5' },
    sm: { icon: 32, text: 'text-sm', sub: 'text-[10px]', gap: 'gap-2' },
    md: { icon: 44, text: 'text-base sm:text-lg', sub: 'text-xs', gap: 'gap-2.5' },
    lg: { icon: 56, text: 'text-xl sm:text-2xl', sub: 'text-xs sm:text-sm', gap: 'gap-3' },
    xl: { icon: 72, text: 'text-2xl sm:text-3xl', sub: 'text-sm sm:text-base', gap: 'gap-3.5' },
    hero: { icon: 104, text: 'text-3xl sm:text-4xl lg:text-5xl', sub: 'text-base sm:text-lg', gap: 'gap-4' },
    splash: { icon: 132, text: 'text-4xl sm:text-5xl lg:text-6xl', sub: 'text-lg', gap: 'gap-5' },
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    setClickPulse(true);
    setTimeout(() => setClickPulse(false), 800);
    if (withSound) {
      playOrganicLogoChime();
    }
    if (onClick) {
      onClick();
    }
  };

  const isVertical = textPosition === 'bottom';

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-flex ${isVertical ? 'flex-col items-center text-center' : 'items-center'} ${
        sizeConfig.gap
      } select-none ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      title={interactive ? 'Kishan Bhai — Small Farms. One Powerful Network.' : undefined}
    >
      {/* Animated SVG Emblem */}
      <div
        className={`relative shrink-0 flex items-center justify-center transition-transform duration-500 ${
          isHovered ? 'scale-105' : ''
        } ${clickPulse ? 'scale-95' : ''}`}
        style={{ width: sizeConfig.icon, height: sizeConfig.icon }}
      >
        {/* Ambient Glow Aura */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/30 via-lime-400/25 to-amber-400/35 blur-md transition-opacity duration-700 ${
            isHovered ? 'opacity-100 scale-125' : 'opacity-70 scale-100'
          }`}
        />

        {/* Core Vector Artwork */}
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full relative z-10 drop-shadow-[0_4px_12px_rgba(22,101,52,0.25)] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="kb-sun-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="kb-leaf-left" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="50%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#4ADE80" />
            </linearGradient>

            <linearGradient id="kb-leaf-right" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="50%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#86EFAC" />
            </linearGradient>

            <linearGradient id="kb-wheat-stalk" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>

            <linearGradient id="kb-tech-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.9" />
            </linearGradient>

            {/* Shimmer animation keyframes in SVG */}
            <style>
              {`
                @keyframes kb-pulse-sun {
                  0%, 100% { transform: scale(1); opacity: 0.95; }
                  50% { transform: scale(1.08); opacity: 1; }
                }
                @keyframes kb-spin-slow {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes kb-sway-left {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(-3.5deg); }
                }
                @keyframes kb-sway-right {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(3.5deg); }
                }
                @keyframes kb-node-ping {
                  0%, 100% { transform: scale(1); opacity: 0.8; }
                  50% { transform: scale(1.4); opacity: 1; }
                }
                @keyframes kb-shimmer-run {
                  0% { stroke-dashoffset: 200; }
                  100% { stroke-dashoffset: 0; }
                }
                .kb-anim-sun {
                  transform-origin: 60px 42px;
                  animation: kb-pulse-sun 4s ease-in-out infinite;
                }
                .kb-anim-rays {
                  transform-origin: 60px 42px;
                  animation: kb-spin-slow 24s linear infinite;
                }
                .kb-anim-leaf-left {
                  transform-origin: 60px 88px;
                  animation: kb-sway-left 3.5s ease-in-out infinite;
                }
                .kb-anim-leaf-right {
                  transform-origin: 60px 88px;
                  animation: kb-sway-right 3.2s ease-in-out infinite 0.4s;
                }
                .kb-anim-node {
                  transform-origin: center;
                  animation: kb-node-ping 2.5s ease-in-out infinite;
                }
              `}
            </style>
          </defs>

          {/* Background Outer Shield / Hexagonal Network Ring */}
          <polygon
            points="60,6 106,32 106,88 60,114 14,88 14,32"
            stroke="url(#kb-tech-ring)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            fill="#062814"
            fillOpacity="0.85"
            className="transition-all duration-500"
          />

          {/* Hexagon Corner Network Nodes (Bio-Mesh Cluster Points) */}
          <circle cx="60" cy="6" r="3.5" fill="#34D399" className="kb-anim-node" />
          <circle cx="106" cy="32" r="3" fill="#FBBF24" className="kb-anim-node" style={{ animationDelay: '0.4s' }} />
          <circle cx="106" cy="88" r="3" fill="#34D399" className="kb-anim-node" style={{ animationDelay: '0.8s' }} />
          <circle cx="60" cy="114" r="3.5" fill="#6EE7B7" className="kb-anim-node" style={{ animationDelay: '1.2s' }} />
          <circle cx="14" cy="88" r="3" fill="#FBBF24" className="kb-anim-node" style={{ animationDelay: '1.6s' }} />
          <circle cx="14" cy="32" r="3" fill="#34D399" className="kb-anim-node" style={{ animationDelay: '2.0s' }} />

          {/* Internal Geometric Mesh Lines */}
          <path
            d="M60 6 L60 42 M106 32 L60 42 M14 32 L60 42 M14 88 L60 88 M106 88 L60 88"
            stroke="#10B981"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />

          {/* Rising Golden Sun with Rays */}
          <g className="kb-anim-rays">
            <line x1="60" y1="18" x2="60" y2="24" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            <line x1="77" y1="25" x2="73" y2="29" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            <line x1="84" y1="42" x2="78" y2="42" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            <line x1="77" y1="59" x2="73" y2="55" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            <line x1="43" y1="25" x2="47" y2="29" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            <line x1="36" y1="42" x2="42" y2="42" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            <line x1="43" y1="59" x2="47" y2="55" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
          </g>

          <circle cx="60" cy="42" r="14" fill="url(#kb-sun-grad)" className="kb-anim-sun" />

          {/* Fertile Soil Contours */}
          <path
            d="M24 88 C36 82, 48 84, 60 88 C72 92, 84 90, 96 84 C96 95, 85 106, 60 108 C35 106, 24 95, 24 88 Z"
            fill="#14532D"
          />
          <path
            d="M32 94 C42 90, 52 92, 60 95 C68 98, 78 96, 88 92"
            stroke="#4ADE80"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />

          {/* Central Sprouting Stalk & Golden Wheat Head */}
          <path
            d="M60 92 L60 38"
            stroke="url(#kb-wheat-stalk)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Golden Wheat Grains (Kernels on Head) */}
          <g>
            <ellipse cx="55" cy="36" rx="4.5" ry="2.5" transform="rotate(-30 55 36)" fill="#FDE047" />
            <ellipse cx="65" cy="36" rx="4.5" ry="2.5" transform="rotate(30 65 36)" fill="#FBBF24" />
            <ellipse cx="56" cy="43" rx="4.5" ry="2.5" transform="rotate(-25 56 43)" fill="#FBBF24" />
            <ellipse cx="64" cy="43" rx="4.5" ry="2.5" transform="rotate(25 64 43)" fill="#FDE047" />
            <ellipse cx="57" cy="50" rx="4" ry="2.2" transform="rotate(-20 57 50)" fill="#F59E0B" />
            <ellipse cx="63" cy="50" rx="4" ry="2.2" transform="rotate(20 63 50)" fill="#FBBF24" />
            <circle cx="60" cy="30" r="3" fill="#FEF08A" />
          </g>

          {/* Left Emerald Leaf (Flourishing Sprout) */}
          <g className="kb-anim-leaf-left">
            <path
              d="M60 76 C46 72, 30 64, 28 46 C42 46, 56 58, 60 76 Z"
              fill="url(#kb-leaf-left)"
              stroke="#86EFAC"
              strokeWidth="1.2"
            />
            {/* Leaf Vein */}
            <path
              d="M60 76 C50 68, 38 60, 28 46"
              stroke="#DCFCE7"
              strokeWidth="1"
              strokeLinecap="round"
              strokeOpacity="0.8"
            />
          </g>

          {/* Right Emerald Leaf */}
          <g className="kb-anim-leaf-right">
            <path
              d="M60 72 C74 68, 90 60, 92 42 C78 42, 64 54, 60 72 Z"
              fill="url(#kb-leaf-right)"
              stroke="#BBF7D0"
              strokeWidth="1.2"
            />
            {/* Leaf Vein */}
            <path
              d="M60 72 C70 64, 82 56, 92 42"
              stroke="#DCFCE7"
              strokeWidth="1"
              strokeLinecap="round"
              strokeOpacity="0.8"
            />
          </g>

          {/* Glowing Center Core Pulse */}
          <circle cx="60" cy="62" r="3" fill="#FFFFFF" className="kb-anim-node" />
        </svg>
      </div>

      {/* Brand Typography with Animated Shimmer */}
      {showText && (
        <div className={`flex flex-col ${isVertical ? 'items-center' : 'items-start'}`}>
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black font-display tracking-tight text-stone-900 transition-colors duration-300 ${
                sizeConfig.text
              } ${isHovered ? 'text-emerald-800' : ''}`}
            >
              KISHAN
            </span>
            <span
              className={`font-black font-display tracking-tight bg-gradient-to-r from-emerald-600 via-green-700 to-amber-600 bg-clip-text text-transparent ${
                sizeConfig.text
              }`}
            >
              BHAI
            </span>
          </div>

          {/* Tagline / Subtitle */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`font-medium tracking-wide text-stone-500 font-sans ${sizeConfig.sub}`}
            >
              {subtitle || 'Small Farms. One Network.'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};
