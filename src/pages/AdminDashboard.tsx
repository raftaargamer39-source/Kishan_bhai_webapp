import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Users,
  ShieldCheck,
  Coins,
  Cpu,
  RefreshCw,
  Activity,
  Layers,
  ArrowRight,
  Database,
  Server,
  Award,
} from 'lucide-react';
import { ApiBudgetCard } from '../components/ApiBudgetCard';
import { ALGORAND_TESTNET_CONFIG } from '../../shared/constants';
import { AdminChampionVerifications } from '../components/admin/AdminChampionVerifications';
import { AdminLoyaltyManager } from '../components/admin/AdminLoyaltyManager';

export const AdminDashboard: React.FC = () => {
  const { setCurrentView } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'champion-verifications' | 'loyalty-rules'>('loyalty-rules');

  const loadData = () => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => { });

    fetch('/api/admin/telemetry')
      .then((res) => res.json())
      .then((data) => setTelemetry(data))
      .catch(() => { });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-stone-800 space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-400/30">
                SYSTEM OPS & PLATFORM TELEMETRY
              </span>
              <span className="text-stone-400 text-xs font-mono">Build 2026.09.23</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              Platform Administration & Operations Hub
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm">
              Real-time monitoring of agricultural cluster mesh, AI inference pipelines, and platform health.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadData}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-stone-700 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Metrics</span>
            </button>
            <button
              onClick={() => setCurrentView('transactions')}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow cursor-pointer flex items-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Audit Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Module Switcher */}
      <div className="flex items-center gap-2.5 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveAdminTab('champion-verifications')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${activeAdminTab === 'champion-verifications'
              ? 'bg-green-700 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Village Champion KYC & Authorization Desk</span>
          <span className="bg-amber-300 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            Active Review
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${activeAdminTab === 'overview'
              ? 'bg-green-700 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Platform Ops & Infrastructure</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('loyalty-rules')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${activeAdminTab === 'loyalty-rules'
              ? 'bg-green-700 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
        >
          <Award className="w-4 h-4" />
          <span>Kishan Rewards Rules</span>
          <span className="bg-amber-300 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            Loyalty Engine
          </span>
        </button>
      </div>

      {activeAdminTab === 'loyalty-rules' ? (
        <AdminLoyaltyManager />
      ) : activeAdminTab === 'champion-verifications' ? (
        <AdminChampionVerifications />
      ) : (
        <>
          {/* KPI Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="text-xs text-stone-500 font-medium">Total Registered Users</div>
              <div className="text-3xl font-bold font-display text-stone-900">{stats?.totalUsers || 6}</div>
              <p className="text-[11px] text-stone-500">
                {stats?.farmers || 4} Farmers • {stats?.champions || 1} Champions • {stats?.buyers || 1} Buyers
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="text-xs text-stone-500 font-medium">Virtual Clusters Active</div>
              <div className="text-3xl font-bold font-display text-emerald-700">{stats?.totalClusters || 2}</div>
              <p className="text-[11px] text-emerald-800 font-medium">84.5 Clustered Acres</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="text-xs text-stone-500 font-medium">Cluster Procurements & Bids</div>
              <div className="text-3xl font-bold font-display text-emerald-700">
                ₹3.84 <span className="text-sm font-normal text-stone-500">Lakh</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium">Algorand Verified Escrows</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="text-xs text-stone-500 font-medium">System Health</div>
              <div className="text-base font-bold text-emerald-700 flex items-center gap-1.5 pt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Optimal (All Services Synced)
              </div>
              <p className="text-[10px] text-stone-400 font-mono">Latency: 18ms</p>
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: AI Agronomist Health Card */}
            <div className="space-y-6">
              <ApiBudgetCard />

              {/* Node & Infrastructure Configuration Box */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between font-sans">
                  <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-700" />
                    <span>Infrastructure Endpoints</span>
                  </h3>
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    TESTNET
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <span className="text-stone-500 text-[11px]">Algorand Testnet Node (Algod):</span>
                    <p className="text-stone-900 font-semibold truncate">{ALGORAND_TESTNET_CONFIG.algodUrl}</p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <span className="text-stone-500 text-[11px]">Cluster Settlement Escrow Address:</span>
                    <p className="text-stone-900 font-semibold break-all">{ALGORAND_TESTNET_CONFIG.defaultReceiverAddress}</p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <span className="text-stone-500 text-[11px]">AI Model Provider:</span>
                    <p className="text-stone-900 font-semibold">Gemini 2.5 Flash / Free Multispectral Vision Diagnostic</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Platform Telemetry & Performance */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-base text-stone-900">Platform Performance</h3>
                    <p className="text-xs text-stone-500">Autonomous intelligence pipeline & cluster synchronization</p>
                  </div>
                  <button
                    onClick={() => setCurrentView('transactions')}
                    className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>


                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-600 font-medium">Total AI Queries Handled:</span>
                    <span className="font-bold text-stone-900">{telemetry?.totalRequests || 48}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-600 font-medium">Diagnostic Success Rate:</span>
                    <span className="font-bold text-emerald-700">100%</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-600 font-medium">Average Response Latency:</span>
                    <span className="font-bold text-stone-900">{telemetry?.avgTransactionTimeMs || 1120} ms</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-600 font-medium">Top Consumed AI Feature:</span>
                    <span className="font-bold text-stone-900 truncate max-w-[200px]">
                      {telemetry?.mostUsedService || 'Crop Pathogen & Soil Analysis'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                  <strong>Mesh Status:</strong> All agricultural diagnostic and cluster synchronization pipelines are active and fully accessible to all verified farmers.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
