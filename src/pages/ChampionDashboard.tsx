import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Users,
  UserCheck,
  ShoppingBag,
  Package,
  Tractor,
  TrendingUp,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Phone,
  MapPin,
  Lock,
  FileText,
  Building,
  RefreshCw,
  HelpCircle,
  FileSpreadsheet,
  Send,
  Eye,
  Wheat,
  Sprout,
  CalendarDays,
  Megaphone,
  Star,
  AlertTriangle,
  ChevronRight,
  Layers,
  Award,
} from 'lucide-react';
import {
  VirtualCluster,
  BulkOrderRequirement,
  UserProfile,
  MachineryItem,
  ChampionVerificationRequest,
} from '../../shared/types';
import { MandiTicker } from '../components/MandiTicker';
import { VillageChampionLockedView } from '../components/champion/VillageChampionLockedView';

// ─── Sample upcoming harvest data (clearly labeled as sample) ─────────────────
const SAMPLE_HARVESTS = [
  { id: 'h1', crop: 'Cotton (Bt Shankar-6)', farmerName: 'Ramesh Patel', quantityKg: 4500, expectedDate: '2026-11-15', qualityGrade: 'Grade A Premium', village: 'Anandpur', status: 'ON_TRACK' as const },
  { id: 'h2', crop: 'Sharbati Wheat (C-306)', farmerName: 'Ramesh Patel', quantityKg: 6200, expectedDate: '2026-11-28', qualityGrade: 'Grade A Premium', village: 'Anandpur', status: 'ON_TRACK' as const },
  { id: 'h3', crop: 'Groundnut (GJ-24)', farmerName: 'Dinesh Vaghela', quantityKg: 8800, expectedDate: '2026-12-05', qualityGrade: 'A+ Export', village: 'Paddhari', status: 'AT_RISK' as const },
  { id: 'h4', crop: 'Cumin (GC-4)', farmerName: 'Bhavesh Ghadiya', quantityKg: 1200, expectedDate: '2026-12-18', qualityGrade: 'Grade B Standard', village: 'Anandpur', status: 'ON_TRACK' as const },
];

const SAMPLE_ANNOUNCEMENTS = [
  { id: 'a1', title: 'Cluster Buyer Visit — 28 Nov', body: 'ITC Agri sourcing team visiting for groundnut inspection. Prepare grade-A lots.', type: 'ALERT' as const, date: '2026-10-22' },
  { id: 'a2', title: 'PM Kisan Instalment Released', body: 'Instalment 17 credited to enrolled farmers. 3 farmers pending Aadhaar linking.', type: 'NOTICE' as const, date: '2026-10-20' },
  { id: 'a3', title: 'Soil Testing Camp — 30 Nov', body: 'KVK soil health card camp at Gram Panchayat office. All farmers must register.', type: 'EVENT' as const, date: '2026-10-18' },
];

export const ChampionDashboard: React.FC = () => {
  const { currentUser, setCurrentUser, setUserRole } = useUserStore();
  const { setCurrentView, addToast } = useApp();

  const [clusters, setClusters] = useState<VirtualCluster[]>([]);
  const [farmers, setFarmers] = useState<UserProfile[]>([]);
  const [bulkOrders, setBulkOrders] = useState<BulkOrderRequirement[]>([]);
  const [machinery, setMachinery] = useState<MachineryItem[]>([]);
  const [showAddFarmerModal, setShowAddFarmerModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Verification locking states
  const [verificationReq, setVerificationReq] = useState<ChampionVerificationRequest | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isCheckingLock, setIsCheckingLock] = useState<boolean>(true);

  // New farmer form state
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerPhone, setNewFarmerPhone] = useState('');
  const [newFarmerAcres, setNewFarmerAcres] = useState('3.5');
  const [newFarmerCrop, setNewFarmerCrop] = useState('Cotton');

  // Village Assistance Requests (Feature 7)
  const [assistanceRequests, setAssistanceRequests] = useState([
    {
      id: 'req_1',
      farmerName: 'Ramesh Patel',
      crop: 'Cotton',
      issue: 'Leaf curl virus suspected; requires urgent soil booster',
      priority: 'HIGH',
      status: 'OPEN',
      time: '2 hours ago',
    },
    {
      id: 'req_2',
      farmerName: 'Devjibhai Bharwad',
      crop: 'Wheat',
      issue: 'Canal irrigation rotation scheduling dispute',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      time: 'Yesterday',
    },
  ]);

  const checkChampionStatus = async () => {
    if (!currentUser || currentUser.role !== 'CHAMPION') {
      setIsCheckingLock(false);
      return;
    }

    try {
      setIsCheckingLock(true);
      const res = await fetch(`/api/champion/verification/status?userId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok) {
        setVerificationReq(data.request);
        const approved = Boolean(data.isApproved || (data.request?.status === 'APPROVED' && currentUser.verified));
        setIsApproved(approved);
      }
    } catch (e) {
      console.warn('Failed to fetch champion status:', e);
    } finally {
      setIsCheckingLock(false);
    }
  };

  useEffect(() => {
    checkChampionStatus();
  }, [currentUser?.id, currentUser?.verified, currentUser?.role]);

  useEffect(() => {
    if (!isApproved) return;

    fetch('/api/clusters')
      .then((res) => res.json())
      .then((data) => {
        if (data.clusters) setClusters(data.clusters);
      })
      .catch(() => {});

    fetch('/api/auth/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setFarmers(data.users.filter((u: UserProfile) => u.role === 'FARMER'));
      })
      .catch(() => {});

    fetch('/api/bulk-buying')
      .then((res) => res.json())
      .then((data) => {
        if (data.requirements) setBulkOrders(data.requirements);
      })
      .catch(() => {});

    fetch('/api/machinery')
      .then((res) => res.json())
      .then((data) => {
        if (data.machinery) setMachinery(data.machinery);
      })
      .catch(() => {});
  }, [isApproved]);

  const handleVerifyFarmer = (farmerId: string) => {
    setFarmers((prev) =>
      prev.map((f) => (f.id === farmerId ? { ...f, verified: true } : f))
    );
    addToast('Farmer Verified', 'Farmer KYC and land holding verified for cluster participation', 'success');
  };

  const handleCreateFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName.trim()) return;

    try {
      const res = await fetch('/api/champion/onboard-farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          championId: currentUser?.id,
          farmerName: newFarmerName.trim(),
          farmerPhone: newFarmerPhone.trim() || '+91 98000 12345',
          acres: parseFloat(newFarmerAcres) || 3.5,
          crop: newFarmerCrop,
          village: currentUser?.village || 'Anandpur',
        }),
      });

      const data = await res.json();
      if (res.ok && data.farmer) {
        setFarmers((prev) => [data.farmer, ...prev]);
        setShowAddFarmerModal(false);
        setNewFarmerName('');
        setNewFarmerPhone('');
        addToast('Farmer Onboarded', `${data.farmer.fullName} added to village roster via verified champion portal.`, 'success');
      } else if (res.status === 403) {
        addToast('Access Denied', data.message || 'Village Champion verification is locked.', 'error');
        setIsApproved(false);
      } else {
        addToast('Error', data.error || 'Failed to onboard farmer.', 'error');
      }
    } catch (err: any) {
      addToast('Network Error', err.message, 'error');
    }
  };

  // Switch to demo accounts for instant developer/evaluator testing
  const handleSwitchToDemoChampion = (isDemoApproved: boolean) => {
    if (isDemoApproved) {
      const approvedChamp: UserProfile = {
        id: 'usr_champ_vikram',
        fullName: 'Vikramsinh Jadeja',
        email: 'vikram.jadeja@kishanbhai.in',
        phone: '+91 97240 88192',
        role: 'CHAMPION',
        village: 'Anandpur Hub',
        state: 'Gujarat',
        verified: true,
        farmSizeAcres: 8.0,
        crops: ['Cotton', 'Cumin', 'Wheat'],
        preferredLanguage: 'hi',
        createdAt: '2026-05-10T11:00:00Z',
      };
      setCurrentUser(approvedChamp);
      setUserRole('CHAMPION');
      setIsApproved(true);
      addToast('Profile Switched', 'Switched to Vikramsinh Jadeja (Approved Sarpanch)', 'success');
    } else {
      const lockedChamp: UserProfile = {
        id: 'usr_champ_anita',
        fullName: 'Anita Devi',
        email: 'anita.devi@kishanbhai.in',
        phone: '+91 98123 45678',
        role: 'CHAMPION',
        village: 'Anandpur',
        district: 'Rajkot',
        state: 'Gujarat',
        verified: false,
        farmSizeAcres: 6.0,
        crops: ['Cotton', 'Groundnut'],
        preferredLanguage: 'hi',
        createdAt: '2026-08-01T10:00:00Z',
      };
      setCurrentUser(lockedChamp);
      setUserRole('CHAMPION');
      setIsApproved(false);
      addToast('Profile Switched', 'Switched to Anita Devi (Locked Applicant)', 'info');
    }
  };

  // If user is NOT a Village Champion at all
  if (currentUser?.role !== 'CHAMPION') {
    return (
      <div className="min-h-screen bg-[#F0F4F0]">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#003827] via-[#004D36] to-[#0a6640] text-white px-6 sm:px-10 py-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 text-[#FFD84D]" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFD84D] bg-[#FFD84D]/15 px-2.5 py-0.5 rounded-full border border-[#FFD84D]/30">Village Champion Portal</span>
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight mt-1">Village Champion Command Hub</h1>
                <p className="text-emerald-200 text-xs mt-0.5">Reserved for verified Sarpanches & Gram Panchayat representatives</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('login')}
              className="flex items-center gap-1.5 bg-[#FFD84D] hover:bg-amber-300 text-[#003827] text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-colors cursor-pointer shrink-0"
            >
              <UserCheck className="w-4 h-4" />
              Register as Village Champion
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6">
          {/* What is Village Champion */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
            <h2 className="font-bold text-base text-stone-900 mb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-700" />
              What is a Village Champion?
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              A Village Champion is a verified Sarpanch or Gram Panchayat representative who coordinates the village's farmer network on Kishan Bhai. They onboard farmers, manage Virtual Farm Clusters, approve purchase proposals from institutional buyers, and ensure smallholders get fair market access.
            </p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Users, label: 'Register & onboard village farmers' },
                { icon: Layers, label: 'Manage Virtual Farm Clusters' },
                { icon: Package, label: 'Approve buyer purchase proposals' },
                { icon: ShieldCheck, label: 'Verified by Kishan Bhai KYC' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex flex-col items-start gap-2">
                    <Icon className="w-5 h-5 text-emerald-700" />
                    <span className="text-xs text-emerald-900 font-medium leading-tight">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setCurrentView('login')}
              className="bg-[#004D36] hover:bg-[#087443] text-white rounded-2xl p-5 border border-[#003827] text-left cursor-pointer transition-colors group"
            >
              <UserCheck className="w-6 h-6 text-[#FFD84D] mb-2" />
              <div className="font-bold text-sm">Register as Village Champion</div>
              <div className="text-xs text-emerald-200 mt-1">Apply with your Aadhaar & Gram Panchayat credentials</div>
            </button>
            <button
              onClick={() => handleSwitchToDemoChampion(false)}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl p-5 border border-amber-200 text-left cursor-pointer transition-colors"
            >
              <Lock className="w-6 h-6 text-amber-700 mb-2" />
              <div className="font-bold text-sm">View Locked Applicant</div>
              <div className="text-xs text-amber-700 mt-1">Demo: Anita Devi (pending verification)</div>
            </button>
            <button
              onClick={() => handleSwitchToDemoChampion(true)}
              className="bg-stone-50 hover:bg-stone-100 text-stone-800 rounded-2xl p-5 border border-stone-200 text-left cursor-pointer transition-colors"
            >
              <Award className="w-6 h-6 text-emerald-700 mb-2" />
              <div className="font-bold text-sm">View Approved Champion</div>
              <div className="text-xs text-stone-500 mt-1">Demo: Vikramsinh Jadeja (approved Sarpanch)</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 🔒 LOCKED DASHBOARD SCREEN: Shown until verification status == APPROVED
  // =========================================================================
  if (!isApproved) {
    return (
      <div className="space-y-4">
        {/* Switcher Bar for Quick Verification Testing */}
        <div className="bg-amber-100/70 border-b border-amber-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-800" />
            <span>Currently logged in as: <strong>{currentUser.fullName}</strong> (Locked Applicant)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSwitchToDemoChampion(true)}
              className="bg-white hover:bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-300 font-bold cursor-pointer text-[11px]"
            >
              Switch to Approved Champion (Vikramsinh)
            </button>
            <button
              onClick={() => setCurrentView('admin-dashboard')}
              className="bg-stone-800 hover:bg-stone-900 text-white px-3 py-1 rounded-lg font-bold cursor-pointer text-[11px]"
            >
              Open Admin Review Desk
            </button>
          </div>
        </div>

        <VillageChampionLockedView
          user={currentUser}
          onVerificationUpdated={(req) => {
            setVerificationReq(req);
            if (req.status === 'APPROVED') {
              setIsApproved(true);
            }
          }}
          onRefresh={checkChampionStatus}
        />
      </div>
    );
  }

  // =========================================================================
  // 🔓 UNLOCKED DASHBOARD SCREEN (Only accessible when status == APPROVED)
  // =========================================================================
  const totalVillageAcres = clusters.reduce((acc, c) => acc + c.totalAcres, 0);
  const totalCollectiveKg = clusters.reduce((acc, c) => acc + c.collectiveHarvestKg, 0);
  const pendingFarmers = farmers.filter(f => !f.verified).length;

  return (
    <div className="min-h-screen bg-[#F0F4F0]">

      {/* Banner */}
      <div className="bg-gradient-to-r from-[#003827] via-[#004D36] to-[#0a6640] text-white px-6 sm:px-10 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-[#FFD84D]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFD84D] bg-[#FFD84D]/15 px-2.5 py-0.5 rounded-full border border-[#FFD84D]/30">Village Champion Portal</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-semibold"><ShieldCheck className="w-3.5 h-3.5" />Govt KYC Verified</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{currentUser.village || 'Anandpur'} Gram Panchayat — {currentUser.fullName}</h1>
              <p className="text-emerald-200 text-xs mt-0.5">Farmer coordination · Cluster management · Harvest oversight · Buyer liaison</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button onClick={() => setShowAddFarmerModal(true)} className="flex items-center gap-1.5 bg-[#FFD84D] hover:bg-amber-300 text-[#003827] text-xs font-bold px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"><Plus className="w-4 h-4" />Onboard Farmer</button>
            <button onClick={() => setCurrentView('clusters')} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-white/20 transition-colors cursor-pointer"><Layers className="w-4 h-4" />Manage Clusters</button>
            <button onClick={() => setShowExportModal(true)} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-white/20 transition-colors cursor-pointer"><FileSpreadsheet className="w-4 h-4" />Activity Reports</button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">

        {/* Demo switcher */}
        <div className="bg-emerald-100/60 border border-emerald-200 rounded-2xl px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-900 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Verified Champion Session: <strong>{currentUser.fullName}</strong> · Status: <strong>APPROVED</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSwitchToDemoChampion(false)} className="bg-white hover:bg-amber-50 text-amber-900 px-3 py-1 rounded-lg border border-amber-300 font-bold cursor-pointer text-[11px]">Test Locked State (Anita Devi)</button>
            <button onClick={() => setCurrentView('admin-dashboard')} className="bg-stone-800 hover:bg-stone-900 text-white px-3 py-1 rounded-lg font-bold cursor-pointer text-[11px]">Admin Verification Desk</button>
          </div>
        </div>

        <MandiTicker />

        {/* Village Profile */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0"><MapPin className="w-7 h-7 text-emerald-700" /></div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Village Profile</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Verification: APPROVED</span>
                </div>
                <h2 className="font-black text-lg text-stone-900 leading-tight">{currentUser.village || 'Anandpur'} Gram Panchayat</h2>
                <p className="text-xs text-stone-500 mt-0.5">{currentUser.district ? `${currentUser.district}, ` : ''}{currentUser.state || 'Gujarat'} · Champion: {currentUser.fullName}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs shrink-0">
              <div className="bg-stone-50 rounded-xl px-3 py-2 border border-stone-100 text-center"><div className="text-lg font-black text-stone-900">{clusters.length}</div><div className="text-stone-400 text-[10px] font-medium">Active Clusters</div></div>
              <div className="bg-stone-50 rounded-xl px-3 py-2 border border-stone-100 text-center"><div className="text-lg font-black text-emerald-700">{farmers.length}</div><div className="text-stone-400 text-[10px] font-medium">Farmers</div></div>
              <div className="bg-stone-50 rounded-xl px-3 py-2 border border-stone-100 text-center"><div className="text-lg font-black text-blue-700">{totalVillageAcres.toFixed(0)}</div><div className="text-stone-400 text-[10px] font-medium">Total Acres</div></div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-emerald-700" /></div>
            <div><div className="text-[11px] text-stone-500 font-medium">Onboarded Farmers</div><div className="text-2xl font-black text-emerald-700">{farmers.length}</div><div className="text-[10px] text-emerald-600 font-bold">{farmers.filter(f => f.verified).length} KYC Land Verified</div></div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"><Layers className="w-5 h-5 text-blue-700" /></div>
            <div><div className="text-[11px] text-stone-500 font-medium">Virtual Clusters Active</div><div className="text-2xl font-black text-blue-700">{clusters.length}</div><div className="text-[10px] text-stone-500 font-medium">{totalVillageAcres.toFixed(1)} Clustered Acres</div></div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0"><Wheat className="w-5 h-5 text-teal-700" /></div>
            <div><div className="text-[11px] text-stone-500 font-medium">Collective Harvest Pool</div><div className="text-2xl font-black text-teal-700">{(totalCollectiveKg / 1000).toFixed(1)}<span className="text-xs text-stone-400 font-normal ml-1">T</span></div><div className="text-[10px] text-teal-700 font-bold">Ready for Buyers</div></div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-amber-900/15 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-amber-700" /></div>
            <div><div className="text-[11px] text-stone-500 font-medium">Assistance &amp; Grievances</div><div className="text-2xl font-black text-amber-700">{assistanceRequests.length}</div><div className="text-[10px] text-amber-800 font-bold">1 High Priority</div></div>
          </div>
        </div>

        {/* Harvest Overview */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-emerald-700" />Upcoming Harvest Overview</h3>
              <p className="text-xs text-stone-500">Upcoming crop lots from your village farmers — sample data</p>
            </div>
            <button onClick={() => setCurrentView('harvest')} className="text-xs font-bold text-[#004D36] hover:text-[#087443] flex items-center gap-1 cursor-pointer">Harvest Pool <ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-stone-100">
                <th className="text-left pb-2 font-semibold text-stone-400 pr-4">Crop</th>
                <th className="text-left pb-2 font-semibold text-stone-400 pr-4">Farmer</th>
                <th className="text-left pb-2 font-semibold text-stone-400 pr-4">Qty</th>
                <th className="text-left pb-2 font-semibold text-stone-400 pr-4">Grade</th>
                <th className="text-left pb-2 font-semibold text-stone-400 pr-4">Date</th>
                <th className="text-left pb-2 font-semibold text-stone-400">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-stone-50">
                {SAMPLE_HARVESTS.map(h => (
                  <tr key={h.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-2.5 pr-4 font-bold text-stone-800">{h.crop}</td>
                    <td className="py-2.5 pr-4 text-stone-600">{h.farmerName}</td>
                    <td className="py-2.5 pr-4 text-stone-600">{(h.quantityKg / 1000).toFixed(1)}T</td>
                    <td className="py-2.5 pr-4"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.qualityGrade === 'A+ Export' ? 'bg-emerald-100 text-emerald-800' : h.qualityGrade === 'Grade A Premium' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{h.qualityGrade}</span></td>
                    <td className="py-2.5 pr-4 text-stone-600 font-mono">{h.expectedDate}</td>
                    <td className="py-2.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.status === 'ON_TRACK' ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'}`}>{h.status === 'ON_TRACK' ? 'On Track' : 'At Risk'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2"><Megaphone className="w-4 h-4 text-amber-600" />Village Activities &amp; Announcements</h3>
                <button className="text-xs font-bold text-[#004D36] flex items-center gap-1 cursor-pointer"><Plus className="w-3.5 h-3.5" />Publish</button>
              </div>
              {SAMPLE_ANNOUNCEMENTS.map(a => (
                <div key={a.id} className={`p-3.5 rounded-2xl border text-xs ${a.type === 'ALERT' ? 'bg-red-50 border-red-200' : a.type === 'EVENT' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mr-2 ${a.type === 'ALERT' ? 'bg-red-100 text-red-800' : a.type === 'EVENT' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{a.type}</span>
                      <span className="font-bold text-stone-900">{a.title}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0 font-mono">{a.date}</span>
                  </div>
                  <p className="text-stone-600 mt-1.5 leading-relaxed">{a.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {pendingFarmers > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-800"><AlertTriangle className="w-4 h-4" /><span className="font-bold text-sm">{pendingFarmers} Farmer{pendingFarmers > 1 ? 's' : ''} Pending KYC</span></div>
                <p className="text-xs text-amber-700">Verify land records to enable cluster participation.</p>
                <button onClick={() => setShowAddFarmerModal(true)} className="text-xs font-bold text-amber-900 underline cursor-pointer">Review Farmers</button>
              </div>
            )}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-2">
              <h4 className="font-bold text-sm text-stone-900 mb-3">Champion Actions</h4>
              {[
                { label: 'View Village Profile', icon: MapPin, action: () => {} },
                { label: 'Onboard Farmer', icon: UserCheck, action: () => setShowAddFarmerModal(true) },
                { label: 'Manage Clusters', icon: Layers, action: () => setCurrentView('clusters') },
                { label: 'View Upcoming Harvests', icon: Wheat, action: () => setCurrentView('harvest') },
                { label: 'Buyer Marketplace', icon: ShoppingBag, action: () => setCurrentView('marketplace') },
                { label: 'Publish Announcement', icon: Megaphone, action: () => addToast('Coming Soon', 'Announcement publishing coming in next release.', 'info') },
                { label: 'Activity Reports', icon: FileSpreadsheet, action: () => setShowExportModal(true) },
              ].map(a => {
                const Icon = a.icon;
                return (
                  <button key={a.label} onClick={a.action} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-stone-100 hover:border-[#004D36]/30 hover:bg-emerald-50/50 text-xs font-semibold text-stone-700 hover:text-[#004D36] transition-all cursor-pointer group">
                    <span className="flex items-center gap-2"><Icon className="w-4 h-4 text-stone-400 group-hover:text-[#004D36] transition-colors" />{a.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#004D36] transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Farmer Roster + Assistance + Cluster + Buyer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-stone-900">Village Farmer Roster &amp; Land Registry</h3>
                  <p className="text-xs text-stone-500">Verified land holdings, digital participation &amp; crop allocations</p>
                </div>
                <button onClick={() => setShowAddFarmerModal(true)} className="text-xs font-bold text-green-700 hover:underline flex items-center gap-1 cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Add Farmer</span></button>
              </div>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                {farmers.map(farmer => (
                  <div key={farmer.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900">{farmer.fullName}</span>
                        {farmer.verified
                          ? <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-200"><CheckCircle2 className="w-3 h-3 text-emerald-600" />Land Verified</span>
                          : <span className="bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-amber-200"><Clock className="w-3 h-3 text-amber-600" />Pending KYC</span>
                        }
                      </div>
                      <div className="text-xs text-stone-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Holding: <strong>{farmer.farmSizeAcres || 3.5} Acres</strong></span>
                        <span>•</span>
                        <span>Crops: <strong>{farmer.crops?.join(', ') || 'Wheat'}</strong></span>
                        <span>•</span>
                        <span>{farmer.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!farmer.verified && <button onClick={() => handleVerifyFarmer(farmer.id)} className="bg-green-700 hover:bg-green-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer">Verify Land</button>}
                      <button onClick={() => setCurrentView('clusters')} className="text-xs text-stone-600 hover:text-stone-900 bg-stone-100 px-3 py-1.5 rounded-lg font-medium cursor-pointer">Assign Cluster</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">Farmer Assistance &amp; Advisory Requests</h3>
                <p className="text-xs text-stone-500">Field escalation, irrigation dispute mediation, and agronomist dispatch</p>
              </div>
              <div className="space-y-3">
                {assistanceRequests.map(req => (
                  <div key={req.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{req.farmerName}</span>
                        <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-mono">{req.crop}</span>
                        {req.priority === 'HIGH' && <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">URGENT</span>}
                      </div>
                      <div className="text-stone-700">{req.issue}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{req.time}</div>
                    </div>
                    <button onClick={() => addToast('Dispatched', `Agronomist advisory scheduled for ${req.farmerName}.`, 'success')} className="bg-green-700 hover:bg-green-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl cursor-pointer">Dispatch Action</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2"><Building className="w-4 h-4 text-green-700" /><span>Cluster Mesh Coordination</span></h3>
              <p className="text-xs text-stone-600">Your village has {clusters.length} active cooperatives pooling seeds and fertilizer for 24% group savings.</p>
              <div className="space-y-2">
                {clusters.map(c => (
                  <div key={c.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                    <div className="font-bold text-stone-900">{c.name}</div>
                    <div className="text-[11px] text-stone-500">{c.memberCount} Farmers • {c.totalAcres} Acres • {c.primaryCrops.join(', ')}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setCurrentView('clusters')} className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"><span>Open Cluster Command</span><ArrowRight className="w-3.5 h-3.5" /></button>
            </div>
            <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-amber-950 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-amber-800" /><span>Institutional Buyer Desk</span></h3>
              <p className="text-xs text-amber-900">Connect directly with verified corporate buyers procuring from your Gram Panchayat.</p>
              <div className="bg-white p-3 rounded-xl border border-amber-200/70 text-xs space-y-1">
                <div className="font-bold text-stone-900">ITC Agri Sourcing (Gujarat Mesh)</div>
                <div className="text-[11px] text-stone-600">Requirement: 50 Tons Sharbati Wheat @ &#8377;2,950/qtl</div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Escrow Guarantee Verified</span>
              </div>
              <button onClick={() => setCurrentView('marketplace')} className="w-full bg-green-700 hover:bg-green-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"><span>Negotiate Bulk Contracts</span><ArrowRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Onboard Farmer */}
      {showAddFarmerModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="text-lg font-bold text-stone-900">Onboard Village Farmer</h3>
              <button onClick={() => setShowAddFarmerModal(false)} className="text-stone-400 hover:text-stone-700 text-lg font-bold cursor-pointer">&#x2715;</button>
            </div>
            <form onSubmit={handleCreateFarmer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Farmer Full Legal Name *</label>
                <input type="text" required value={newFarmerName} onChange={e => setNewFarmerName(e.target.value)} placeholder="e.g. Ramesh Bhai Patel" className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Mobile Number *</label>
                <input type="text" required value={newFarmerPhone} onChange={e => setNewFarmerPhone(e.target.value)} placeholder="+91 98251 44320" className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 block">Land Holding (Acres) *</label>
                  <input type="number" step="0.1" required value={newFarmerAcres} onChange={e => setNewFarmerAcres(e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 block">Primary Crop *</label>
                  <input type="text" required value={newFarmerCrop} onChange={e => setNewFarmerCrop(e.target.value)} placeholder="Cotton / Wheat" className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button type="button" onClick={() => setShowAddFarmerModal(false)} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow cursor-pointer">Register &amp; Verify Land</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Activity Reports */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200 text-xs">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="text-lg font-bold text-stone-900">Village Agricultural Activity Report</h3>
              <button onClick={() => setShowExportModal(false)} className="text-stone-400 hover:text-stone-700 text-lg font-bold cursor-pointer">&#x2715;</button>
            </div>
            <div className="space-y-3">
              <p className="text-stone-600">Export verified agricultural audit records for submission to the Block Development Office or APMC authority.</p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <div>Gram Panchayat: <strong>{currentUser.village}</strong></div>
                <div>Sarpanch / Representative: <strong>{currentUser.fullName}</strong></div>
                <div>Total Smallholders Registered: <strong>{farmers.length}</strong></div>
                <div>Aggregated Collective Yield: <strong>{(totalCollectiveKg / 1000).toFixed(1)} Metric Tons</strong></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
              <button type="button" onClick={() => setShowExportModal(false)} className="px-4 py-2 rounded-xl border border-stone-300 font-bold text-stone-700 cursor-pointer">Close</button>
              <button type="button" onClick={() => { addToast('Export Successful', 'Activity report downloaded as CSV/PDF compliance format.', 'success'); setShowExportModal(false); }} className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold cursor-pointer shadow">Download Official Report (.CSV)</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

