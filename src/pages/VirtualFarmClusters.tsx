import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Users,
  Sprout,
  Plus,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Package,
  Layers,
  MapPin,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { VirtualCluster } from '../../shared/types';
import { KishanCommunitySection } from '../components/community/KishanCommunitySection';

export const VirtualFarmClustersPage: React.FC = () => {
  const { currentUser, userRole } = useUserStore();
  const { addToast } = useApp();
  const [clusters, setClusters] = useState<VirtualCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<VirtualCluster | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState<VirtualCluster | null>(null);

  // Create cluster state
  const [clusterName, setClusterName] = useState('');
  const [village, setVillage] = useState('Anandpur');
  const [crops, setCrops] = useState('Cotton, Wheat');
  const [description, setDescription] = useState('');

  // Join cluster state
  const [joinedAcres, setJoinedAcres] = useState('3.5');

  const fetchClusters = () => {
    fetch('/api/clusters')
      .then((res) => res.json())
      .then((data) => {
        if (data.clusters) {
          setClusters(data.clusters);
          if (!selectedCluster && data.clusters.length > 0) {
            setSelectedCluster(data.clusters[0]);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  const handleCreateCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clusterName.trim()) return;

    try {
      const res = await fetch('/api/clusters/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clusterName,
          village,
          championId: currentUser?.id,
          championName: currentUser?.fullName || 'Anita Devi',
          description,
          primaryCrops: crops.split(',').map((c) => c.trim()),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClusters((prev) => [...prev, data.cluster]);
        setSelectedCluster(data.cluster);
        setShowCreateModal(false);
        setClusterName('');
        setDescription('');
        addToast('Cluster Created', `Virtual Cluster "${data.cluster.name}" is now live!`, 'success');
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    }
  };

  const handleJoinCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showJoinModal) return;

    try {
      const res = await fetch('/api/clusters/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clusterId: showJoinModal.id,
          farmerId: currentUser?.id || 'usr_farmer_1',
          farmerName: currentUser?.fullName || 'Ramesh Patel',
          acres: parseFloat(joinedAcres) || 3.5,
          crops: currentUser?.crops || ['Cotton'],
          village: currentUser?.village || 'Anandpur',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClusters((prev) => prev.map((c) => (c.id === data.cluster.id ? data.cluster : c)));
        setSelectedCluster(data.cluster);
        setShowJoinModal(null);
        addToast('Joined Virtual Cluster', `Your ${joinedAcres} acres are now digitally synchronized with ${data.cluster.name}.`, 'success');
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-green-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <span className="bg-white/15 text-emerald-200 text-xs px-3 py-1 rounded-full font-mono border border-white/20 backdrop-blur-xs">
              CORE INNOVATION MATRIX
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-2">
              Virtual Farm Clusters
            </h1>
            <p className="text-stone-200 text-xs sm:text-sm max-w-2xl">
              "We don't combine farmers' land. We combine their digital strength."
              Aggregate smallholder bargaining power without legal land friction.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white hover:bg-emerald-50 text-green-700 text-xs font-semibold px-4 py-2.5 rounded-2xl shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Cluster</span>
          </button>
        </div>
      </div>

      {/* Interactive Visual Cluster Diagram */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-bold font-display text-lg text-stone-900">
              Live Digital Cluster Architecture
            </h3>
            <p className="text-xs text-stone-500">
              Visual representation of digital synchronization between independent plots
            </p>
          </div>
          <span className="text-xs font-mono bg-emerald-500/15 text-green-700 px-3 py-1 rounded-full font-semibold border border-emerald-600/20">
            Selected: {selectedCluster?.name || 'Anandpur Cluster'}
          </span>
        </div>

        {/* The Graphic Matrix */}
        <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/80 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Node 1: Independent Farmers */}
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-2xs space-y-2 text-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-green-700 flex items-center justify-center mx-auto font-bold text-xs">
              🌾
            </div>
            <h4 className="font-bold text-xs text-stone-900">Independent Smallholders</h4>
            <p className="text-[11px] text-stone-500">
              {selectedCluster && selectedCluster.members.length > 0
                ? `${selectedCluster.members.slice(0, 3).map((m) => `${m.farmerName} (${m.acres} ac)`).join(', ')} maintain 100% individual land title ownership.`
                : 'Individual farmers retain 100% title deed rights while coordinating virtually.'}
            </p>
          </div>

          {/* Node 2: Digital Aggregator */}
          <div className="bg-[#182613] text-white p-4 rounded-2xl border border-white/20 shadow-md space-y-2 text-center relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-200 flex items-center justify-center mx-auto font-bold text-xs">
              ⚡
            </div>
            <h4 className="font-bold text-xs text-white">Digital Cluster Mesh</h4>
            <p className="text-[11px] text-emerald-100">
              Aggregates {selectedCluster?.totalAcres || 0} acres of demand for seeds, fertilizers & machinery.
            </p>
          </div>

          {/* Node 3: Wholesale Power */}
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-2xs space-y-2 text-center">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-800 flex items-center justify-center mx-auto font-bold text-xs">
              💰
            </div>
            <h4 className="font-bold text-xs text-stone-900">Wholesale Negotiation</h4>
            <p className="text-[11px] text-stone-500">
              Unlocks {selectedCluster?.bulkSavingsPercent || 0}% direct factory discount on farm inputs.
            </p>
          </div>

          {/* Node 4: Collective Harvest */}
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-2xs space-y-2 text-center">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center mx-auto font-bold text-xs">
              🏢
            </div>
            <h4 className="font-bold text-xs text-stone-900">Institutional Mandi</h4>
            <p className="text-[11px] text-stone-500">
              Direct delivery of {((selectedCluster?.collectiveHarvestKg || 0) / 1000).toFixed(1)} tons to buyers.
            </p>
          </div>
        </div>
      </div>

      {/* Registered Clusters Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold font-display text-lg text-stone-900">Active Regional Clusters</h3>
          <span className="text-xs text-stone-500">{clusters.length} Registered Clusters</span>
        </div>

        {clusters.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-white/80 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-green-700 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-stone-900">No Virtual Clusters Active Yet</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Create the first Virtual Farm Cluster in your village to start pooling farm acreage, ordering bulk inputs, and coordinating collective harvests.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-5 py-2.5 rounded-2xl shadow transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.99] border border-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Virtual Cluster</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clusters.map((cluster) => {
            const isSelected = selectedCluster?.id === cluster.id;
            const isUserMember = cluster.members.some((m) => m.id === currentUser?.id);

            return (
              <div
                key={cluster.id}
                onClick={() => setSelectedCluster(cluster)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                  isSelected
                    ? 'bg-white/80 backdrop-blur-lg border-green-700 shadow-md ring-2 ring-green-700/20'
                    : 'bg-white/60 backdrop-blur-lg border-white/80 shadow-xs hover:bg-white/80 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-green-700 border border-emerald-600/20 px-2 py-0.5 rounded-full">
                        {cluster.village}, {cluster.state}
                      </span>
                      {isUserMember && (
                        <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          You Are a Member
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-lg text-stone-900 mt-1.5">{cluster.name}</h4>
                    <p className="text-xs text-stone-500">Champion: {cluster.championName}</p>
                  </div>

                  <span className="text-xs font-mono font-bold text-green-700 bg-emerald-500/15 px-2.5 py-1 rounded-xl border border-emerald-600/20">
                    {cluster.bulkSavingsPercent}% Savings
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">{cluster.description}</p>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-stone-200/50 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Total Area</span>
                    <span className="font-bold text-stone-900">{cluster.totalAcres} Acres</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Members</span>
                    <span className="font-bold text-stone-900">{cluster.memberCount} Farmers</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Pooled Crop</span>
                    <span className="font-bold text-green-700">{(cluster.collectiveHarvestKg / 1000).toFixed(1)} Tons</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div className="flex flex-wrap gap-1">
                    {cluster.primaryCrops.map((c) => (
                      <span key={c} className="text-[10px] bg-white/70 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200/60 font-medium">
                        {c}
                      </span>
                    ))}
                  </div>

                  {!isUserMember && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowJoinModal(cluster);
                      }}
                      className="bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs border border-white/20"
                    >
                      Join Cluster
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
           KISHAN COMMUNITY — FARMERS TOGETHER
           Mounted below Virtual Farm Clusters overview
      ════════════════════════════════════════════════════════════════════ */}
      <KishanCommunitySection />

      {/* Create Cluster Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold font-display text-lg text-stone-900">Initiate Virtual Farm Cluster</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handleCreateCluster} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Cluster Name:</label>
                <input
                  type="text"
                  required
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  placeholder="e.g. Anandpur Organic Pulses Cluster"
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Village / Region:</label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Primary Crops (comma separated):</label>
                <input
                  type="text"
                  value={crops}
                  onChange={(e) => setCrops(e.target.value)}
                  placeholder="Cotton, Wheat, Mustard"
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Cluster Objective & Description:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Collaborative digital group for bulk fertilizer negotiation and shared harvesting."
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-stone-500 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Launch Cluster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Cluster Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold font-display text-lg text-stone-900">Join Virtual Cluster</h3>
                <p className="text-xs text-stone-500">{showJoinModal.name}</p>
              </div>
              <button onClick={() => setShowJoinModal(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handleJoinCluster} className="space-y-4 text-xs">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900">
                <p className="font-semibold">Zero Land Consolidation Guarantee</p>
                <p className="text-[11px] mt-0.5">
                  You retain complete individual ownership of your land while syncing your digital buying and selling power.
                </p>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Acres to Digitally Coordinate:</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={joinedAcres}
                  onChange={(e) => setJoinedAcres(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 text-sm font-bold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(null)}
                  className="px-3 py-2 text-stone-500 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Confirm Cluster Membership
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
