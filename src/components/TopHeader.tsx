import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Menu,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Globe,
  Sprout,
  ShieldCheck,
  Settings,
  CreditCard,
  Sun,
  Moon,
  Sparkles,
  Layers,
} from 'lucide-react';
import { HomeSearchBar } from './HomeSearchBar';
import { NotificationCenter } from './NotificationCenter';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PWAInstallButton } from './PWAInstallButton';
import { UserRole } from '../../shared/types';
import { signOutFirebaseUser } from '../services/firebaseAuthService';

interface TopHeaderProps {
  onOpenSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenSidebar }) => {
  const { currentUser, setCurrentUser, userRole, setUserRole } = useUserStore();
  const { currentView, setCurrentView, alerts, addToast } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts ? alerts.filter((a) => !a.isRead).length : 0;

  // Actual authenticated user info with friendly fallback
  const farmerName = currentUser?.fullName || 'Ramesh Patel';
  const roleLabel =
    userRole === 'FARMER'
      ? 'Farmer'
      : userRole === 'CHAMPION'
      ? 'Village Champion'
      : userRole === 'BUYER'
      ? 'APMC Buyer'
      : 'Admin';

  const avatarInitial = farmerName.charAt(0).toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = (targetRole: UserRole) => {
    setUserRole(targetRole);
    setIsProfileOpen(false);
    if (targetRole === 'FARMER') setCurrentView('farmer-dashboard');
    else if (targetRole === 'CHAMPION') setCurrentView('champion-dashboard');
    else if (targetRole === 'BUYER') setCurrentView('buyer-dashboard');
    else if (targetRole === 'ADMIN') setCurrentView('admin-dashboard');

    addToast('Role Switched', `Switched active dashboard to ${targetRole}.`, 'info');
  };

  const handleLogout = async () => {
    try {
      await signOutFirebaseUser();
    } catch {}
    setCurrentUser(null);
    setIsProfileOpen(false);
    addToast('Logged Out', 'You have been securely signed out.', 'info');
    setCurrentView('login');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#E5EBE5] px-3 sm:px-6 py-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-3 max-w-full">
        {/* Left: Hamburger Button (Mobile) + Quick Brand Indicator */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-stone-700 hover:text-[#004D36] hover:bg-emerald-50 transition-colors cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div
            onClick={() => setCurrentView('farmer-dashboard')}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#004D36] flex items-center justify-center text-white">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-[#004D36] tracking-tight">Kishan Bhai</span>
          </div>
        </div>

        {/* Center: Search Bar with Suggestions */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <HomeSearchBar />
        </div>

        {/* Right-Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Language Selector */}
          <LanguageSwitcher />

          {/* Notifications Center */}
          <NotificationCenter />

          {/* User Profile & Role Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl hover:bg-stone-50 border border-stone-200/80 transition-all cursor-pointer"
              aria-expanded={isProfileOpen}
            >
              {/* Avatar */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#087443] to-[#004D36] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {avatarInitial}
              </div>

              {/* Name & Role (Desktop) */}
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#14251F] leading-tight truncate max-w-[130px]">
                  {farmerName}
                </div>
                <div className="text-[10px] font-semibold text-[#087443] flex items-center gap-1">
                  <span>{roleLabel}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20A464]"></span>
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Header */}
                <div className="px-4 py-3 border-b border-stone-100">
                  <p className="text-xs font-bold text-[#14251F]">{farmerName}</p>
                  <p className="text-[11px] text-[#66756D] truncate">
                    {currentUser?.email || `${farmerName.toLowerCase().replace(/\s+/g, '')}@kishanbhai.in`}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F6E9] text-[#087443] border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-[#20A464]" />
                    <span>Active Profile: {roleLabel}</span>
                  </div>
                </div>

                {/* Dashboard Switchers */}
                <div className="px-2 py-1.5 border-b border-stone-100">
                  <div className="px-2 py-1 text-[10px] font-extrabold uppercase text-[#66756D] tracking-wider">
                    Switch Persona View
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('FARMER')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      userRole === 'FARMER'
                        ? 'bg-[#E8F6E9] text-[#087443] font-bold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>🌾 Farmer Dashboard</span>
                    {userRole === 'FARMER' && <span className="text-[10px] text-[#20A464]">Active</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('CHAMPION')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      userRole === 'CHAMPION'
                        ? 'bg-[#E8F6E9] text-[#087443] font-bold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>🏛️ Village Champion Hub</span>
                    {userRole === 'CHAMPION' && <span className="text-[10px] text-[#20A464]">Active</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('BUYER')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      userRole === 'BUYER'
                        ? 'bg-[#E8F6E9] text-[#087443] font-bold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>🏢 Buyer Procurement</span>
                    {userRole === 'BUYER' && <span className="text-[10px] text-[#20A464]">Active</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('ADMIN')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      userRole === 'ADMIN'
                        ? 'bg-[#E8F6E9] text-[#087443] font-bold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>⚙️ Admin Console</span>
                    {userRole === 'ADMIN' && <span className="text-[10px] text-[#20A464]">Active</span>}
                  </button>
                </div>

                {/* Account Links */}
                <div className="px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-stone-500" />
                    <span>My Farm Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-stone-500" />
                    <span>Preferences & Language</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Logout (साइन आउट)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Row (When on smaller screens) */}
      <div className="mt-2.5 md:hidden">
        <HomeSearchBar />
      </div>
    </header>
  );
};
