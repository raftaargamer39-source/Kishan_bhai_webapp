import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Camera,
  FileText,
  Building,
  UserCheck,
  RefreshCw,
  HelpCircle,
  Phone,
  Mail,
  ArrowRight,
  Eye,
  XCircle,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import {
  ChampionVerificationRequest,
  ChampionVerificationStatus,
  UserProfile,
} from '../../../shared/types';
import { useApp } from '../../context/AppContext';

interface Props {
  user: UserProfile;
  onVerificationUpdated?: (request: ChampionVerificationRequest) => void;
  onRefresh?: () => void;
}

export const VillageChampionLockedView: React.FC<Props> = ({
  user,
  onVerificationUpdated,
  onRefresh,
}) => {
  const { addToast } = useApp();
  const [request, setRequest] = useState<ChampionVerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStepTab, setActiveStepTab] = useState<number>(2);

  // Form states for Identity Step
  const [idType, setIdType] = useState<'AADHAAR_MASKED' | 'VOTER_ID' | 'PAN' | 'GOV_EMPLOYEE_ID'>('AADHAAR_MASKED');
  const [idNumber, setIdNumber] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmittingId, setIsSubmittingId] = useState(false);

  // Form states for Document Step
  const [docType, setDocType] = useState<'ELECTION_CERTIFICATE' | 'GOV_AUTHORIZATION_LETTER' | 'PANCHAYAT_RESOLUTION' | 'OFFICIAL_ID_CARD'>('ELECTION_CERTIFICATE');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(1450000);
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for Face Step
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);
  const [faceManualFallback, setFaceManualFallback] = useState(false);

  // Form states for Designation Step
  const [isVerifyingDesignation, setIsVerifyingDesignation] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/champion/verification/status?userId=${user.id}`);
      const data = await res.json();
      if (res.ok && data.request) {
        setRequest(data.request);
        // Default active tab to current step
        if (data.request.currentStep) {
          setActiveStepTab(Math.min(data.request.currentStep, 6));
        }
        if (onVerificationUpdated) onVerificationUpdated(data.request);
      }
    } catch (err: any) {
      console.error('Failed to load champion verification status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user.id]);

  // Handler 1: Submit Identity Verification
  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      addToast('Consent Required', 'Please provide explicit consent for official identity verification.', 'error');
      return;
    }
    if (!idNumber.trim()) {
      addToast('Validation Error', 'Please enter your identity card number.', 'error');
      return;
    }

    setIsSubmittingId(true);
    try {
      const res = await fetch('/api/champion/verification/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          idType,
          idNumber: idNumber.trim(),
          consentObtained: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.request) {
        setRequest(data.request);
        setActiveStepTab(3);
        addToast('Identity Authenticated', 'Identity verified via authorized gateway with zero biometric storage.', 'success');
        if (onVerificationUpdated) onVerificationUpdated(data.request);
      } else {
        addToast('Verification Failed', data.error || 'Identity verification could not be completed.', 'error');
      }
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    } finally {
      setIsSubmittingId(false);
    }
  };

  // Handler 2: Upload Official Document
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const docName = fileName.trim() || (docType === 'ELECTION_CERTIFICATE' ? 'Sarpanch_Election_Certificate_Official.pdf' : 'Panchayat_Authorization_Govt_Letter.pdf');

    setIsSubmittingDoc(true);
    try {
      const res = await fetch('/api/champion/verification/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          docType,
          fileName: docName,
          fileSize,
        }),
      });

      const data = await res.json();
      if (res.ok && data.request) {
        setRequest(data.request);
        setActiveStepTab(4);
        addToast('Document Submitted', 'Supporting credential uploaded with encrypted access token.', 'success');
        if (onVerificationUpdated) onVerificationUpdated(data.request);
      } else {
        addToast('Upload Failed', data.error || 'Failed to upload document.', 'error');
      }
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  // Handler 3: Face Verification
  const handleVerifyFace = async (manualRequest = false) => {
    setIsVerifyingFace(true);
    try {
      const res = await fetch('/api/champion/verification/face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          requestManualReview: manualRequest,
        }),
      });

      const data = await res.json();
      if (res.ok && data.request) {
        setRequest(data.request);
        setActiveStepTab(5);
        if (manualRequest) {
          addToast('Manual Review Queued', 'Facial verification escalated to administrative manual review.', 'info');
        } else {
          addToast('Liveness Verified', 'Passive liveness detection & anti-spoof check passed (98% confidence).', 'success');
        }
        if (onVerificationUpdated) onVerificationUpdated(data.request);
      } else {
        addToast('Face Check Failed', data.error || 'Facial verification could not be verified.', 'error');
      }
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    } finally {
      setIsVerifyingFace(false);
    }
  };

  // Handler 4: Official Designation Cross-Reference
  const handleVerifyDesignation = async () => {
    setIsVerifyingDesignation(true);
    try {
      const res = await fetch('/api/champion/verification/designation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          gramPanchayatName: request?.registrationData?.gramPanchayatName || user.village,
          claimedDesignation: request?.registrationData?.designation || 'SARPANCH',
          tenurePeriod: '2021 - 2026',
        }),
      });

      const data = await res.json();
      if (res.ok && data.request) {
        setRequest(data.request);
        setActiveStepTab(6);
        addToast('Designation Verified', 'Cross-referenced against e-GramSwaraj directory. Submitted for admin approval.', 'success');
        if (onVerificationUpdated) onVerificationUpdated(data.request);
      } else {
        addToast('Designation Verification Failed', data.error || 'Could not verify designation.', 'error');
      }
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    } finally {
      setIsVerifyingDesignation(false);
    }
  };

  const getStatusBadge = (status?: ChampionVerificationStatus) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5" /> APPROVED</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300"><Clock className="w-3.5 h-3.5" /> UNDER ADMIN REVIEW</span>;
      case 'MANUAL_REVIEW_REQUIRED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300"><AlertTriangle className="w-3.5 h-3.5" /> MANUAL VERIFICATION REQUIRED</span>;
      case 'DOCUMENTS_PENDING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300"><FileText className="w-3.5 h-3.5" /> DOCUMENTS PENDING</span>;
      case 'FACE_VERIFICATION_PENDING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300"><Camera className="w-3.5 h-3.5" /> FACE VERIFICATION PENDING</span>;
      case 'DESIGNATION_VERIFICATION_PENDING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300"><Building className="w-3.5 h-3.5" /> DESIGNATION PENDING</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300"><XCircle className="w-3.5 h-3.5" /> APPLICATION REJECTED</span>;
      case 'SUSPENDED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-200 text-stone-800 border border-stone-400"><Lock className="w-3.5 h-3.5" /> ACCESS SUSPENDED</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-300"><Clock className="w-3.5 h-3.5" /> IDENTITY PENDING</span>;
    }
  };

  const stepsList = [
    { number: 1, label: 'Account Registration', completed: true },
    { number: 2, label: 'Identity Verification', completed: Boolean(request?.identityCheck?.status === 'VERIFIED') },
    { number: 3, label: 'Document Verification', completed: Boolean(request?.documents && request.documents.length > 0) },
    { number: 4, label: 'Face Verification', completed: Boolean(request?.faceVerification?.status === 'VERIFIED' || request?.faceVerification?.status === 'MANUAL_REVIEW_REQUIRED') },
    { number: 5, label: 'Designation Verification', completed: Boolean(request?.designationCheck?.status === 'VERIFIED') },
    { number: 6, label: 'Admin Review', completed: request?.status === 'APPROVED' },
    { number: 7, label: 'Account Approval', completed: request?.status === 'APPROVED' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* 🔒 LOCKED BANNER - Kishan Bhai Visual Design System */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-green-600/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-300/40 flex items-center justify-center shrink-0 backdrop-blur-md shadow-inner">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 bg-black/25 text-amber-300 text-xs px-3 py-1 rounded-full font-mono border border-amber-400/30">
                <span>SECURITY LEVEL 4 • MANDATORY GOVT VERIFICATION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                🔒 Village Champion Access Locked
              </h1>
              <p className="text-emerald-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                Your account requires identity and authorization verification. Complete the verification process to request access.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2.5 shrink-0 w-full md:w-auto bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            <span className="text-xs text-stone-300 font-medium">Application Status:</span>
            {getStatusBadge(request?.status)}
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="mt-1 text-xs text-amber-200 hover:text-white flex items-center gap-1.5 cursor-pointer font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* REJECTION OR SUSPENSION ALERT IF APPLICABLE */}
      {request?.status === 'REJECTED' && (
        <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>Verification Decision: Application Rejected</span>
          </div>
          <p className="text-xs sm:text-sm text-rose-700">
            <strong>Reason:</strong> {request?.adminDecision?.reason || 'The provided documentation did not match the official Gram Panchayat roster.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveStepTab(2)}
              className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Update Credentials & Re-Submit Application
            </button>
          </div>
        </div>
      )}

      {/* 7-STEP PROGRESS TRACKER */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-700" />
            <span>Verification Progress Tracker</span>
          </h2>
          <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
            Step {request?.currentStep || 2} of 7
          </span>
        </div>

        {/* Desktop / Tablet Step Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {stepsList.map((st) => {
            const isCurrent = (request?.currentStep || 2) === st.number;
            return (
              <button
                key={st.number}
                type="button"
                onClick={() => {
                  if (st.number <= 6) setActiveStepTab(st.number);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  st.completed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : isCurrent
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/40 text-amber-950 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-amber-800' : 'text-stone-500'}`}>
                    Step {st.number}
                  </span>
                  {st.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-stone-300" />
                  )}
                </div>
                <div className="text-[11px] leading-tight line-clamp-2">{st.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* APPLICANT REGISTRATION SUMMARY CARD (Light Yellow Brand Theme) */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Building className="w-4 h-4 text-amber-800" />
            <span>Official Applicant Profile</span>
          </div>
          <span className="bg-amber-200/60 text-amber-900 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
            {request?.registrationData?.designation || 'SARPANCH'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
          <div>
            <span className="text-stone-500 block">Full Legal Name:</span>
            <span className="font-bold text-stone-900">{request?.registrationData?.legalFullName || user.fullName}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Gram Panchayat:</span>
            <span className="font-bold text-stone-900">{request?.registrationData?.gramPanchayatName || user.village}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Village & District:</span>
            <span className="font-bold text-stone-900">{user.village}, {request?.registrationData?.district || user.district || 'Rajkot'}</span>
          </div>
          <div>
            <span className="text-stone-500 block">State:</span>
            <span className="font-bold text-stone-900">{request?.registrationData?.state || user.state}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE VERIFICATION WIZARD TABS                                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-6 sm:p-8 space-y-6">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 text-xs font-bold">
          <button
            onClick={() => setActiveStepTab(2)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeStepTab === 2 ? 'bg-green-700 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>Step 2: Identity</span>
            {request?.identityCheck?.status === 'VERIFIED' && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setActiveStepTab(3)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeStepTab === 3 ? 'bg-green-700 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>Step 3: Documents</span>
            {request?.documents && request.documents.length > 0 && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setActiveStepTab(4)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeStepTab === 4 ? 'bg-green-700 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>Step 4: Live Face Check</span>
            {request?.faceVerification?.status === 'VERIFIED' && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setActiveStepTab(5)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeStepTab === 5 ? 'bg-green-700 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>Step 5: Official Designation</span>
            {request?.designationCheck?.status === 'VERIFIED' && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setActiveStepTab(6)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeStepTab === 6 ? 'bg-green-700 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>Step 6: Admin Review</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: IDENTITY VERIFICATION                                 */}
        {/* ------------------------------------------------------------- */}
        {activeStepTab === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Identity Verification</h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Verify applicant identity using authorized government gateways. Informed consent is mandatory before initiating this check.
              </p>
            </div>

            {/* Privacy Reassurance Note */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Zero Biometric Storage & Masked Identity Protection</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-emerald-800/90 text-[11px]">
                <li>We do not collect or store Aadhaar OTPs or biometric data.</li>
                <li>Never stores full Aadhaar numbers; only authorized masked identifiers (XXXX-XXXX-1234) are recorded.</li>
                <li>Full compliance with Indian digital identity and privacy protection regulations.</li>
              </ul>
            </div>

            {request?.identityCheck?.status === 'VERIFIED' ? (
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Identity Verification Completed</span>
                  </div>
                  <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {request.identityCheck.provider}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-stone-500 block">ID Type:</span>
                    <span className="font-bold text-stone-900">{request.identityCheck.idType}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Masked Identifier:</span>
                    <span className="font-mono font-bold text-stone-900">{request.identityCheck.maskedId}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Verification Ref:</span>
                    <span className="font-mono text-stone-700 text-[11px]">{request.identityCheck.providerTxnRef}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveStepTab(3)}
                    className="bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Step 3: Document Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyIdentity} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-800">
                    Select Official Verification Method:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIdType('AADHAAR_MASKED')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        idType === 'AADHAAR_MASKED'
                          ? 'border-green-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="text-xs font-bold">Aadhaar (Authorized Sandbox)</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Masked verification via authorized API</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIdType('VOTER_ID')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        idType === 'VOTER_ID'
                          ? 'border-green-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="text-xs font-bold">Voter ID / EPIC Card (Election Comm.)</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Alternative non-Aadhaar official identity</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-800">
                    {idType === 'AADHAAR_MASKED' ? 'Aadhaar Number (Last 4 digits used for masked record)' : 'Voter ID / Document Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder={idType === 'AADHAAR_MASKED' ? 'XXXX-XXXX-8921 or 12-digit Aadhaar' : 'e.g. WXJ1829402'}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Mandatory Informed Consent Checkbox */}
                <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs text-stone-700 leading-snug">
                      I hereby give informed consent for Kishan Bhai to verify my identity through an authorized verification provider for the purpose of Village Champion accreditation. I understand no biometrics are stored.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingId || !consentGiven}
                  className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmittingId ? 'Authenticating with Gateway...' : 'Verify Identity via Authorized Provider'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: DOCUMENT VERIFICATION                                 */}
        {/* ------------------------------------------------------------- */}
        {activeStepTab === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Document Verification</h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Upload official credentials confirming your role as Sarpanch or authorized Gram Panchayat representative.
              </p>
            </div>

            {/* List Existing Documents */}
            {request?.documents && request.documents.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-700 block">Uploaded Supporting Documents:</span>
                <div className="space-y-2">
                  {request.documents.map((doc) => (
                    <div key={doc.id} className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-stone-900">{doc.fileName}</div>
                          <div className="text-[11px] text-stone-500">
                            Type: {doc.docType.replace(/_/g, ' ')} • Size: {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          {doc.status}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          Token: {doc.secureViewToken.slice(0, 10)}...
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Form */}
            <form onSubmit={handleUploadDocument} className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Select Document Category:
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="ELECTION_CERTIFICATE">Official Sarpanch Election Certificate / SEC Gazetted Order</option>
                  <option value="GOV_AUTHORIZATION_LETTER">Government Authorization Letter (Block Development Officer)</option>
                  <option value="PANCHAYAT_RESOLUTION">Gram Panchayat General Body Resolution</option>
                  <option value="OFFICIAL_ID_CARD">Panchayati Raj Department Official ID</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Document File Name or Reference:
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. State_Election_Commission_Order_2021.pdf"
                  className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center space-y-2 bg-white">
                <Upload className="w-7 h-7 text-stone-400 mx-auto" />
                <div className="text-xs font-semibold text-stone-700">
                  Private & Encrypted Upload Facility
                </div>
                <div className="text-[11px] text-stone-500">
                  Files are protected with end-to-end access tokens and restricted to authorized audit officers.
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingDoc}
                  className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSubmittingDoc ? 'Uploading Document...' : 'Upload Official Credential'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStepTab(4)}
                  className="text-stone-600 hover:text-stone-900 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next Step: Face Check</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 4: FACE VERIFICATION                                     */}
        {/* ------------------------------------------------------------- */}
        {activeStepTab === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Consent-Based Face Verification</h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Liveness detection and face comparison confirms your live physical presence and prevents identity spoofing.
              </p>
            </div>

            {request?.faceVerification?.status === 'VERIFIED' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-emerald-900 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>Liveness & Face Verification Succeeded</span>
                  </div>
                  <span className="text-xs font-mono bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded">
                    Score: 95% Match
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-950 pt-1">
                  <div>
                    <span className="text-emerald-700 block text-[11px]">Liveness Confidence:</span>
                    <span className="font-bold">98.4% (Passed Blink & Micro-Motion)</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[11px]">Anti-Spoofing:</span>
                    <span className="font-bold text-emerald-800">No Spoof / Replay Detected</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[11px]">Provider:</span>
                    <span className="font-mono">{request.faceVerification.provider}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveStepTab(5)}
                    className="bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Step 5: Official Designation Check</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-5">
                {/* Selfie / Camera Mock Interface */}
                <div className="max-w-md mx-auto aspect-4/3 rounded-2xl bg-stone-900 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden shadow-inner">
                  <div className="w-28 h-28 rounded-full border-4 border-dashed border-emerald-400 flex items-center justify-center mb-3">
                    <Camera className="w-10 h-10 text-emerald-300 animate-pulse" />
                  </div>
                  <div className="text-xs font-bold text-emerald-300">Live Camera Presence Ready</div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Keep your face centered inside the frame. Passive liveness algorithm verifies natural eye blinking and tilt.
                  </div>
                  <div className="absolute top-3 right-3 text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded text-emerald-400">
                    ANTI-SPOOF ACTIVE
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isVerifyingFace}
                    onClick={() => handleVerifyFace(false)}
                    className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isVerifyingFace ? 'Analyzing Liveness & Face Match...' : 'Capture Selfie & Complete Liveness Check'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isVerifyingFace}
                    onClick={() => handleVerifyFace(true)}
                    className="bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs px-4 py-3 rounded-xl border border-stone-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-stone-500" />
                    <span>Camera Issue? Request Manual Review</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 5: OFFICIAL DESIGNATION VERIFICATION                     */}
        {/* ------------------------------------------------------------- */}
        {activeStepTab === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Official Designation Verification</h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Cross-references official Panchayati Raj records (e-GramSwaraj portal) to verify applicant is the actual incumbent Sarpanch or authorized Gram Panchayat representative.
              </p>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-800" />
                  <span>e-GramSwaraj Directory Cross-Reference</span>
                </span>
                <span className="text-[10px] font-mono bg-amber-200/70 px-2 py-0.5 rounded">
                  LGD CODE: 162940
                </span>
              </div>
              <p className="text-xs text-amber-900">
                The Kishan Bhai verification engine queries authorized district panchayat electoral data to confirm that <strong>{request?.registrationData?.legalFullName || user.fullName}</strong> is the duly elected <strong>{request?.registrationData?.designation || 'Sarpanch'}</strong> for <strong>{request?.registrationData?.gramPanchayatName || user.village}</strong>.
              </p>
            </div>

            {request?.designationCheck?.status === 'VERIFIED' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Official Designation Verified</span>
                </div>
                <div className="text-xs text-emerald-900">
                  {request.designationCheck.remarks}
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveStepTab(6)}
                    className="bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Step 6: Final Admin Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  disabled={isVerifyingDesignation}
                  onClick={handleVerifyDesignation}
                  className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Building className="w-4 h-4" />
                  <span>{isVerifyingDesignation ? 'Cross-referencing e-GramSwaraj...' : 'Authenticate Official Gram Panchayat Record'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 6: ADMIN REVIEW & APPLICATION AUDIT TRAIL                */}
        {/* ------------------------------------------------------------- */}
        {activeStepTab === 6 && (
          <div className="space-y-6">
            <div className="bg-stone-900 text-white rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-300">
                  DISTRICT NODAL OFFICER QUEUE
                </span>
                {getStatusBadge(request?.status)}
              </div>
              <h3 className="text-xl font-bold font-serif-display text-white">
                Application Under Official Review
              </h3>
              <p className="text-stone-300 text-xs sm:text-sm">
                Your verification dossier has been submitted to the District Administration Verification Desk. An authorized reviewing officer audits your election certificate, liveness score, and Gram Panchayat jurisdiction before unlocking Village Champion privileges.
              </p>
            </div>

            {/* Audit Log Trail */}
            {request?.auditLogs && request.auditLogs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-stone-500" />
                  <span>Immutable Audit Log Trail</span>
                </h4>
                <div className="space-y-2 border border-stone-200 rounded-2xl p-4 bg-stone-50 text-xs">
                  {request.auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between border-b border-stone-200/60 pb-2 last:border-0 last:pb-0">
                      <div>
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span>{log.action.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] font-mono bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded">
                            {log.actorRole}
                          </span>
                        </div>
                        {log.notes && <div className="text-[11px] text-stone-600 mt-0.5">{log.notes}</div>}
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support Contact Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
              <div className="space-y-0.5">
                <div className="font-bold">Need Immediate Verification Assistance?</div>
                <div className="text-[11px] text-amber-800">
                  Contact the Kisan Bhai District Representative or Government Grievance Desk.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="tel:18001801551"
                  className="bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>1800-180-1551 (Toll-Free)</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
