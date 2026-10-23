import React, { useState } from 'react';
import {
  Building,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { INDIAN_STATES_AND_DISTRICTS, getDistrictsForState } from '../../data/indianStatesAndDistricts';
import { ChampionDesignation } from '../../../shared/types';
import { useUserStore } from '../../store/userStore';
import { useApp } from '../../context/AppContext';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const VillageChampionRegisterForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { setCurrentUser, setUserRole } = useUserStore();
  const { setCurrentView, addToast } = useApp();

  const [legalFullName, setLegalFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('Gujarat');
  const [district, setDistrict] = useState('Rajkot');
  const [block, setBlock] = useState('Kotda Sangani');
  const [villageName, setVillageName] = useState('Anandpur');
  const [gramPanchayatName, setGramPanchayatName] = useState('Anandpur Gram Panchayat');
  const [designation, setDesignation] = useState<ChampionDesignation>('SARPANCH');
  const [gpIdNumber, setGpIdNumber] = useState('');
  const [panchayatAddress, setPanchayatAddress] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToCodeOfConduct, setAgreedToCodeOfConduct] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const availableDistricts = getDistrictsForState(state);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!legalFullName.trim()) {
      setErrorMsg('Full legal name as per government records is required.');
      return;
    }
    if (!mobile.trim()) {
      setErrorMsg('Mobile number is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Official email address is required.');
      return;
    }
    if (!villageName.trim() || !gramPanchayatName.trim()) {
      setErrorMsg('Village name and Gram Panchayat name are mandatory.');
      return;
    }
    if (!agreedToTerms || !agreedToCodeOfConduct) {
      setErrorMsg('You must agree to the privacy policy, verification terms, and representative code of conduct.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/champion/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legalFullName: legalFullName.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          state,
          district,
          block: block.trim(),
          villageName: villageName.trim(),
          gramPanchayatName: gramPanchayatName.trim(),
          designation,
          gramPanchayatIdNumber: gpIdNumber.trim() || undefined,
          panchayatOfficeAddress: panchayatAddress.trim() || undefined,
          agreedToTerms: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        // Set user in local store
        setCurrentUser(data.user);
        setUserRole('CHAMPION');
        addToast(
          'Registration Submitted',
          'Village Champion application received. Your dashboard is locked pending verification.',
          'info'
        );
        if (onSuccess) {
          onSuccess();
        } else {
          setCurrentView('champion-dashboard');
        }
      } else {
        setErrorMsg(data.error || 'Failed to submit registration.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs px-3 py-1 rounded-full font-mono border border-amber-300 font-semibold">
          <Building className="w-3.5 h-3.5 text-amber-800" />
          <span>OFFICIAL GRAM PANCHAYAT REPRESENTATIVE PORTAL</span>
        </div>
        <h2 className="text-2xl font-bold font-serif-display text-stone-900">
          Register as a Village Champion
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm">
          Sarpanches, Up-Sarpanches, and authorized Gram Panchayat officials can register to lead virtual farm clusters, coordinate collective harvest pooling, and represent local farmers.
        </p>
      </div>

      {/* Lock Notice */}
      <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-2xl text-xs space-y-1.5">
        <div className="font-bold flex items-center gap-2 text-amber-900">
          <Lock className="w-4 h-4 text-amber-800" />
          <span>Access Restriction Notice:</span>
        </div>
        <p className="text-amber-900/90 leading-relaxed text-[11px]">
          Upon registration, your Village Champion dashboard will remain <strong>LOCKED</strong> until our 7-step identity, document, and designation verification process is successfully reviewed and approved.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Personal & Contact Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-green-700" />
            <span>1. Official Representative Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">Full Legal Name *</label>
              <input
                type="text"
                required
                value={legalFullName}
                onChange={(e) => setLegalFullName(e.target.value)}
                placeholder="e.g. Vikramsinh Danubha Jadeja"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <span className="text-[10px] text-stone-500">As printed on government identity cards</span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">Mobile Number *</label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98250 12345"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <span className="text-[10px] text-stone-500">Used for official verification notices</span>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarpanch.anandpur@gov.in or email@kishanbhai.in"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Jurisdiction & Panchayat Information */}
        <div className="space-y-3 pt-2 border-t border-stone-200">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4 text-green-700" />
            <span>2. Gram Panchayat & Jurisdiction Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">Official Designation *</label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value as any)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="SARPANCH">Sarpanch (ग्राम प्रधान / सरपंच)</option>
                <option value="UP_SARPANCH">Up-Sarpanch (उप-सरपंच)</option>
                <option value="GRAM_PANCHAYAT_SECRETARY">Gram Panchayat Secretary (ग्राम विकास अधिकारी / सचिव)</option>
                <option value="WARD_MEMBER">Ward Member (वार्ड सदस्य)</option>
                <option value="AUTHORIZED_PANCHAYAT_REP">Authorized Gram Panchayat Representative</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">State *</label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  const dists = getDistrictsForState(e.target.value);
                  if (dists && dists.length > 0) setDistrict(dists[0]);
                }}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {INDIAN_STATES_AND_DISTRICTS.map((s) => (
                  <option key={s.state} value={s.state}>{s.state}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">District *</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">Block / Taluka *</label>
              <input
                type="text"
                required
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                placeholder="e.g. Kotda Sangani"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">Village Name *</label>
              <input
                type="text"
                required
                value={villageName}
                onChange={(e) => setVillageName(e.target.value)}
                placeholder="e.g. Anandpur"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">Gram Panchayat Name *</label>
              <input
                type="text"
                required
                value={gramPanchayatName}
                onChange={(e) => setGramPanchayatName(e.target.value)}
                placeholder="e.g. Anandpur Gram Panchayat"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700">
                Gram Panchayat LGD ID / Registration Code (Optional)
              </label>
              <input
                type="text"
                value={gpIdNumber}
                onChange={(e) => setGpIdNumber(e.target.value)}
                placeholder="e.g. GP-GUJ-RJK-2022-108 or LGD Code 162940"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700">
                Panchayat Office Address / Location Details (Optional)
              </label>
              <input
                type="text"
                value={panchayatAddress}
                onChange={(e) => setPanchayatAddress(e.target.value)}
                placeholder="e.g. Gram Panchayat Bhavan, Main Market Road, Anandpur"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Legal Verification & Privacy Declarations */}
        <div className="space-y-3 pt-2 border-t border-stone-200">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-green-700" />
            <span>3. Verification Agreement & Terms</span>
          </h3>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 text-xs text-stone-700">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="leading-snug">
                I agree to the <strong>Privacy Policy and Verification Terms</strong>. I understand that my identity and authorization documents will be verified via authorized government registries before access is unlocked.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToCodeOfConduct}
                onChange={(e) => setAgreedToCodeOfConduct(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="leading-snug">
                I solemnly certify that I hold the official designation specified above and will act in the best agricultural interest of smallholder farmers within my Gram Panchayat jurisdiction.
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-stone-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !agreedToTerms || !agreedToCodeOfConduct}
            className="w-full sm:w-auto bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-bold text-xs px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application & Proceed to Verification'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
