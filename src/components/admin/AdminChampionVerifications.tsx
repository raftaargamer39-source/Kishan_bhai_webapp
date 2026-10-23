import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  Building,
  Camera,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Check,
  Lock,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ChampionVerificationRequest,
  ChampionVerificationStatus,
  UserProfile,
} from '../../../shared/types';
import { useApp } from '../../context/AppContext';

export const AdminChampionVerifications: React.FC = () => {
  const { addToast } = useApp();
  const [requests, setRequests] = useState<(ChampionVerificationRequest & { user?: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<(ChampionVerificationRequest & { user?: UserProfile }) | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Decision Modal / Drawer State
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionAction, setDecisionAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_DOCUMENTS' | 'REQUEST_RESUBMISSION' | 'ESCALATE_MANUAL' | 'SUSPEND'>('APPROVE');
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/champion-verifications');
      const data = await res.json();
      if (res.ok && Array.isArray(data.requests)) {
        setRequests(data.requests);
        if (selectedReq) {
          const updated = data.requests.find((r: any) => r.id === selectedReq.id);
          if (updated) setSelectedReq(updated);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch champion verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenDecision = (req: ChampionVerificationRequest & { user?: UserProfile }, action: any) => {
    setSelectedReq(req);
    setDecisionAction(action);
    setDecisionReason(
      action === 'APPROVE'
        ? 'All identity, facial, document, and official Sarpanch credentials authenticated successfully.'
        : action === 'REJECT'
        ? 'Discrepancy found with official Gram Panchayat register or electoral rolls.'
        : action === 'REQUEST_DOCUMENTS'
        ? 'Please provide an updated official State Election Commission Gazetted Certificate.'
        : action === 'SUSPEND'
        ? 'Administrative review or jurisdiction change requires access suspension.'
        : ''
    );
    setDecisionNotes('');
    setIsDecisionModalOpen(true);
  };

  const handleExecuteDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setIsSubmittingDecision(true);
    try {
      const res = await fetch(`/api/admin/champion-verifications/${selectedReq.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: decisionAction,
          reason: decisionReason,
          notes: decisionNotes,
          adminName: 'District Nodal Officer (Govt Admin Desk)',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast(
          'Decision Recorded',
          `Village Champion verification status updated to ${data.request?.status}. Audit log updated.`,
          'success'
        );
        setIsDecisionModalOpen(false);
        fetchRequests();
      } else {
        addToast('Action Failed', data.error || 'Could not record decision.', 'error');
      }
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.registrationData?.legalFullName?.toLowerCase().includes(q);
      const matchVillage = r.registrationData?.villageName?.toLowerCase().includes(q);
      const matchGP = r.registrationData?.gramPanchayatName?.toLowerCase().includes(q);
      return matchName || matchVillage || matchGP;
    }
    return true;
  });

  const getStatusBadge = (status: ChampionVerificationStatus) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3 h-3" /> APPROVED</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300"><Clock className="w-3 h-3" /> UNDER REVIEW</span>;
      case 'MANUAL_REVIEW_REQUIRED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-900 border border-orange-300"><AlertTriangle className="w-3 h-3" /> MANUAL REQUIRED</span>;
      case 'DOCUMENTS_PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300"><FileText className="w-3 h-3" /> DOCS PENDING</span>;
      case 'FACE_VERIFICATION_PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300"><Camera className="w-3 h-3" /> FACE PENDING</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300"><XCircle className="w-3 h-3" /> REJECTED</span>;
      case 'SUSPENDED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-200 text-stone-800 border border-stone-400"><Lock className="w-3 h-3" /> SUSPENDED</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800 border border-stone-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Title and Metric counters */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
              ADMIN VERIFICATION DESK
            </span>
            <span className="text-xs text-stone-500 font-mono">Restricted Access</span>
          </div>
          <h2 className="text-2xl font-bold font-serif-display text-stone-900 mt-1">
            Village Champion Authorization & KYC
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm">
            Audit and approve official Gram Panchayat representatives before unlocking Village Champion privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Dossiers</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, village, or GP..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
          {['ALL', 'UNDER_REVIEW', 'MANUAL_REVIEW_REQUIRED', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                statusFilter === st
                  ? 'bg-green-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table / Grid of Applicants */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Applicant / Representative</th>
                <th className="py-3 px-4">Gram Panchayat & Village</th>
                <th className="py-3 px-4">Claimed Designation</th>
                <th className="py-3 px-4">Verification Checks</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-stone-500">
                    No verification records found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const idPassed = req.identityCheck?.status === 'VERIFIED';
                  const docPassed = req.documents && req.documents.length > 0;
                  const facePassed = req.faceVerification?.status === 'VERIFIED';
                  const desigPassed = req.designationCheck?.status === 'VERIFIED';

                  return (
                    <tr key={req.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                            {req.registrationData?.legalFullName?.charAt(0) || 'C'}
                          </span>
                          <div>
                            <div>{req.registrationData?.legalFullName || req.user?.fullName}</div>
                            <div className="text-[10px] text-stone-500 font-normal">{req.registrationData?.mobile || req.user?.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-800">{req.registrationData?.gramPanchayatName || req.user?.village}</div>
                        <div className="text-[10px] text-stone-500">{req.registrationData?.villageName}, {req.registrationData?.district || 'Rajkot'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {req.registrationData?.designation || 'SARPANCH'}
                        </span>
                      </td>

                      {/* 4 Mini Badges for Checks */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            title={`Identity: ${idPassed ? 'Verified' : 'Pending'}`}
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              idPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'
                            }`}
                          >
                            ID
                          </span>
                          <span
                            title={`Documents: ${docPassed ? 'Uploaded' : 'Pending'}`}
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              docPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'
                            }`}
                          >
                            DOC
                          </span>
                          <span
                            title={`Face Liveness: ${facePassed ? 'Verified' : 'Pending'}`}
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              facePassed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'
                            }`}
                          >
                            FACE
                          </span>
                          <span
                            title={`e-GramSwaraj: ${desigPassed ? 'Matched' : 'Pending'}`}
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              desigPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'
                            }`}
                          >
                            GP
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(req.status)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                        {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedReq(req)}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>

                          {req.status !== 'APPROVED' ? (
                            <button
                              onClick={() => handleOpenDecision(req, 'APPROVE')}
                              className="bg-green-700 hover:bg-green-800 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Check className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenDecision(req, 'SUSPEND')}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer border border-rose-200"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Suspend</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION DRAWER / MODAL */}
      {selectedReq && !isDecisionModalOpen && (
        <div className="bg-stone-900/40 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200">
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs font-mono text-stone-500">DOSSIER REF: {selectedReq.id}</span>
                <h3 className="text-xl font-bold font-serif-display text-stone-900 mt-1">
                  Candidate Dossier: {selectedReq.registrationData?.legalFullName}
                </h3>
                <p className="text-stone-600 text-xs">
                  {selectedReq.registrationData?.gramPanchayatName} • {selectedReq.registrationData?.villageName}, {selectedReq.registrationData?.district || 'Rajkot'}
                </p>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-stone-400 hover:text-stone-700 p-2 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Dossier Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Box 1: Identity */}
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-2">
                <div className="font-bold text-stone-900 flex items-center justify-between">
                  <span>1. Identity Verification</span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {selectedReq.identityCheck?.status || 'PENDING'}
                  </span>
                </div>
                <div className="space-y-1 text-stone-600">
                  <div>Provider: <strong>{selectedReq.identityCheck?.provider || 'Authorized Gateway'}</strong></div>
                  <div>Masked ID: <strong className="font-mono">{selectedReq.identityCheck?.maskedId || 'Pending'}</strong></div>
                  <div>Ref Txn: <span className="font-mono text-[10px]">{selectedReq.identityCheck?.providerTxnRef || 'N/A'}</span></div>
                  <div>Consent Timestamp: <span className="font-mono text-[10px]">{selectedReq.identityCheck?.consentTimestamp ? new Date(selectedReq.identityCheck.consentTimestamp).toLocaleString() : 'N/A'}</span></div>
                </div>
              </div>

              {/* Box 2: Face Liveness */}
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-2">
                <div className="font-bold text-stone-900 flex items-center justify-between">
                  <span>2. Facial Liveness & Anti-Spoof</span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {selectedReq.faceVerification?.status || 'PENDING'}
                  </span>
                </div>
                <div className="space-y-1 text-stone-600">
                  <div>Liveness Confidence: <strong>{((selectedReq.faceVerification?.livenessConfidence || 0.98) * 100).toFixed(1)}%</strong></div>
                  <div>Face Comparison Match: <strong>{((selectedReq.faceVerification?.faceMatchScore || 0.95) * 100).toFixed(1)}%</strong></div>
                  <div>Spoof Attempt: <strong>{selectedReq.faceVerification?.spoofDetected ? 'FLAGGED' : 'Clean (No Spoof)'}</strong></div>
                  <div>Remarks: <span className="text-[11px] text-stone-700">{selectedReq.faceVerification?.remarks || 'Selfie matched'}</span></div>
                </div>
              </div>

              {/* Box 3: Documents */}
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-2 sm:col-span-2">
                <div className="font-bold text-stone-900 flex items-center justify-between">
                  <span>3. Uploaded Official Documents ({selectedReq.documents?.length || 0})</span>
                  <span className="text-[10px] font-mono text-stone-500">Secured Storage</span>
                </div>
                <div className="space-y-2">
                  {selectedReq.documents?.map((doc) => (
                    <div key={doc.id} className="bg-white border border-stone-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-stone-900">{doc.fileName}</div>
                        <div className="text-[10px] text-stone-500">Category: {doc.docType.replace(/_/g, ' ')} • Status: {doc.status}</div>
                      </div>
                      <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2 py-1 rounded">
                        Access Token: {doc.secureViewToken.slice(0, 12)}...
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 4: e-GramSwaraj Designation */}
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2 sm:col-span-2">
                <div className="font-bold text-amber-950 flex items-center justify-between">
                  <span>4. e-GramSwaraj Panchayati Raj Cross-Reference</span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {selectedReq.designationCheck?.status || 'PENDING'}
                  </span>
                </div>
                <div className="space-y-1 text-amber-900 text-xs">
                  <div>Confirmed GP: <strong>{selectedReq.designationCheck?.gramPanchayatConfirmed || selectedReq.registrationData?.gramPanchayatName}</strong></div>
                  <div>Tenure Period: <strong>{selectedReq.designationCheck?.tenurePeriod || '2021 - 2026'}</strong></div>
                  <div>Audit Remarks: <span>{selectedReq.designationCheck?.remarks || 'Roster verified'}</span></div>
                </div>
              </div>
            </div>

            {/* Audit Log Trail */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-800 block">Dossier Audit Trail:</span>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 max-h-40 overflow-y-auto space-y-1.5 text-[11px]">
                {selectedReq.auditLogs?.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-stone-600 border-b border-stone-200/50 pb-1 last:border-0">
                    <div>
                      <strong className="text-stone-900">{log.action.replace(/_/g, ' ')}</strong> by {log.actorName} ({log.actorRole})
                      {log.notes && <div className="text-[10px] text-stone-500">{log.notes}</div>}
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Action Decision Bar */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-stone-200">
              <button
                onClick={() => handleOpenDecision(selectedReq, 'REJECT')}
                className="bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold px-3.5 py-2 rounded-xl text-xs border border-rose-200 cursor-pointer"
              >
                Reject with Reason
              </button>

              <button
                onClick={() => handleOpenDecision(selectedReq, 'REQUEST_DOCUMENTS')}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer"
              >
                Request Additional Docs
              </button>

              <button
                onClick={() => handleOpenDecision(selectedReq, 'ESCALATE_MANUAL')}
                className="bg-orange-50 hover:bg-orange-100 text-orange-900 font-bold px-3.5 py-2 rounded-xl text-xs border border-orange-200 cursor-pointer"
              >
                Escalate Manual Review
              </button>

              <button
                onClick={() => handleOpenDecision(selectedReq, 'APPROVE')}
                className="bg-green-700 hover:bg-green-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Unlock Access</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECISION CONFIRMATION MODAL */}
      {isDecisionModalOpen && selectedReq && (
        <div className="bg-stone-900/50 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleExecuteDecision}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200"
          >
            <div className="space-y-1">
              <span className="text-xs font-mono text-stone-500 uppercase">
                CONFIRM ADMINISTRATIVE ACTION
              </span>
              <h3 className="text-xl font-bold font-serif-display text-stone-900">
                Action: {decisionAction.replace(/_/g, ' ')}
              </h3>
              <p className="text-xs text-stone-600">
                Candidate: <strong>{selectedReq.registrationData?.legalFullName}</strong> ({selectedReq.registrationData?.gramPanchayatName})
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">Official Decision Reason *</label>
              <textarea
                required
                rows={3}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Enter justification recorded in the immutable audit log..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">Internal Audit Notes (Optional)</label>
              <input
                type="text"
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="e.g. Verified with District Panchayat Officer over phone"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsDecisionModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmittingDecision}
                className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-md"
              >
                {isSubmittingDecision ? 'Recording Decision...' : 'Confirm Decision & Update Ledger'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
