import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  PhoneCall,
  Video,
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  UserCheck,
  Award,
  X,
  Database,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileCode2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EXPERTS_DIRECTORY } from '../data/agriData';
import { ExpertConsultant } from '../../shared/types';
import {
  recordAppointment,
  getAppointments,
  subscribeToAppointments,
  checkSupabaseHealth,
  SUPABASE_APPOINTMENTS_ONLY_SQL,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  AppointmentRow,
} from '../services/supabaseClient';

export const TalkToExpertPage: React.FC = () => {
  const { language, addToast } = useApp();
  const { currentUser, farmerProfile } = useUserStore();

  const [selectedExpert, setSelectedExpert] = useState<ExpertConsultant | null>(null);
  const [consultType, setConsultType] = useState<'VOICE' | 'VIDEO'>('VOICE');
  const [problemDescription, setProblemDescription] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('Today, 04:00 PM - 05:00 PM');
  const [farmerName, setFarmerName] = useState(currentUser?.fullName || farmerProfile.name || 'Ramesh Patel');
  const [farmerPhone, setFarmerPhone] = useState(currentUser?.phone || farmerProfile.mobile || '+91 98251 44320');

  // Supabase Integration & Appointment State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    configured: boolean;
    connected: boolean;
    tableExists: boolean;
    projectId: string;
    errorMessage?: string;
  }>({
    configured: true,
    connected: false,
    tableExists: false,
    projectId: SUPABASE_PROJECT_ID,
  });
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Sync farmer details if store loads later
  useEffect(() => {
    if (currentUser?.fullName && !farmerName) {
      setFarmerName(currentUser.fullName);
    }
    if (currentUser?.phone && !farmerPhone) {
      setFarmerPhone(currentUser.phone);
    }
  }, [currentUser, farmerProfile]);

  // Load Supabase health and appointments
  const refreshData = async () => {
    setIsLoadingAppointments(true);
    try {
      const health = await checkSupabaseHealth();
      setSupabaseStatus(health);

      const { appointments: list } = await getAppointments();
      setAppointments(list);
    } catch (e: any) {
      console.warn('Failed to load appointments from Supabase:', e);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Subscribe to realtime updates on Supabase appointments table
    const channel = subscribeToAppointments((newApp) => {
      setAppointments((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);
      addToast(
        language === 'hi' ? 'नया परामर्श अपडेट' : 'Appointment Synchronized',
        `Supabase realtime event: Appointment for ${newApp.expert_name} confirmed.`,
        'success'
      );
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_APPOINTMENTS_ONLY_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    addToast('SQL Copied', 'Paste this script directly into your Supabase SQL Editor.', 'info');
  };

  const handleBookConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpert) return;

    setIsSubmitting(true);

    const appointmentPayload = {
      farmer_id: currentUser?.id || 'usr_farmer',
      farmer_name: farmerName.trim(),
      farmer_phone: farmerPhone.trim(),
      farmer_village: farmerProfile.village || 'Anandpur',
      farmer_state: farmerProfile.state || 'Gujarat',
      expert_id: selectedExpert.id,
      expert_name: selectedExpert.name,
      expert_specialization: selectedExpert.specialization,
      expert_institution: selectedExpert.institution,
      consultation_type: consultType,
      preferred_slot: preferredSlot,
      problem_description: problemDescription.trim(),
      status: 'CONFIRMED' as const,
      metadata: {
        bookedAt: new Date().toISOString(),
        expertRating: selectedExpert.rating,
        district: farmerProfile.district || 'Rajkot',
      },
    };

    try {
      // 1. Save directly into Supabase backend
      const result = await recordAppointment(appointmentPayload);

      // 2. Also notify Express backend for audit & memory fallback
      fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      }).catch((err) => console.warn('Backend mirror error:', err));

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#059669', '#34D399', '#FBBF24'],
        });
      } catch {}

      if (result.savedToSupabase) {
        addToast(
          'Supabase Saved ⚡',
          `Appointment with ${selectedExpert.name} successfully saved in Supabase backend (Project: ${SUPABASE_PROJECT_ID})!`,
          'success'
        );
      } else {
        addToast(
          'Appointment Recorded',
          `Your appointment with ${selectedExpert.name} is booked and cached locally. ${result.error ? `(Supabase Notice: ${result.error})` : ''}`,
          'info'
        );
      }

      // Update state
      setAppointments((prev) => [result.data, ...prev.filter((a) => a.id !== result.data.id)]);
      setSelectedExpert(null);
      setProblemDescription('');

      // Refresh health to check if table is active
      const health = await checkSupabaseHealth();
      setSupabaseStatus(health);
    } catch (err: any) {
      addToast('Error', err?.message || 'Failed to submit appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3B11] to-green-700 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>{language === 'hi' ? 'कृषि वैज्ञानिक व विशेषज्ञ परामर्श' : 'Verified Agronomist & Scientist Advisory'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {language === 'hi' ? 'विशेषज्ञ से बात करें' : 'Talk to Agri-Expert & KVK Scientist'}
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            {language === 'hi'
              ? 'आईसीएआर और कृषि विज्ञान केंद्र (KVK) के मान्यता प्राप्त विशेषज्ञों से सीधे फोन या वीडियो कॉल पर परामर्श लें।'
              : 'Direct 1-on-1 consultations with verified entomologists, soil scientists, and horticulture agronomists in your regional language.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-500/30 p-3 rounded-2xl backdrop-blur-md self-start md:self-auto">
          <ShieldCheck className="w-6 h-6 text-emerald-300 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-white">ICAR & KVK Certified</div>
            <div className="text-emerald-200/80 text-[11px]">Free Government Subsidized</div>
          </div>
        </div>
      </div>

      {/* Supabase Integration Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-stone-900">Supabase Backend:</span>
              <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
                {SUPABASE_PROJECT_ID}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
              </span>
              {supabaseStatus.tableExists ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ✓ Table `appointments` Active
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Ready to sync
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Whenever you book a consultation below, details are automatically transmitted and saved to your Supabase PostgreSQL database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSqlModal(true)}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="View or copy Supabase SQL Script"
          >
            <FileCode2 className="w-3.5 h-3.5 text-stone-600" />
            <span>Supabase SQL Setup</span>
          </button>

          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/editor`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Booked Appointments Section (Realtime Live Display) */}
      {appointments.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-stone-900">
                {language === 'hi' ? 'आपकी निर्धारित परामर्श नियुक्तियां' : 'Your Booked Consultations (Supabase Backend)'}
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {appointments.length}
              </span>
            </div>

            <button
              onClick={refreshData}
              disabled={isLoadingAppointments}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-all cursor-pointer flex items-center gap-1 text-xs"
              title="Refresh from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAppointments ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-50 transition-all space-y-2.5 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md mb-1">
                      {apt.consultation_type === 'VOICE' ? (
                        <>
                          <PhoneCall className="w-3 h-3" /> Voice Call
                        </>
                      ) : (
                        <>
                          <Video className="w-3 h-3" /> Video Diagnostic
                        </>
                      )}
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm">{apt.expert_name}</h4>
                    <p className="text-[11px] text-stone-500">{apt.expert_specialization}</p>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    {apt.status}
                  </span>
                </div>

                <div className="text-xs text-stone-700 bg-white p-2.5 rounded-lg border border-stone-100">
                  <div className="font-semibold text-stone-800 mb-0.5">Problem / Query:</div>
                  <p className="line-clamp-2 text-stone-600 text-[11px]">{apt.problem_description}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                  <span className="flex items-center gap-1 font-medium text-emerald-800">
                    <Clock className="w-3 h-3 text-emerald-600" /> {apt.preferred_slot}
                  </span>
                  <span className="font-mono text-[10px] text-stone-400">
                    ID: {apt.id.substring(0, 10)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EXPERTS_DIRECTORY.map((expert) => (
          <div
            key={expert.id}
            className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Top Profile */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={expert.avatarUrl}
                    alt={expert.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600/30"
                    referrerPolicy="no-referrer"
                  />
                  {expert.isAvailableNow && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{expert.rating}</span>
                    <span className="text-stone-400 font-normal">({expert.totalConsultations} calls)</span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-base leading-tight mt-0.5">{expert.name}</h3>
                  <p className="text-xs text-stone-500 font-medium">{expert.specialization}</p>
                </div>
              </div>

              {/* Institution */}
              <div className="mt-3 p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-700 font-medium">
                🏛️ {expert.institution}
              </div>

              {/* Languages */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {expert.languages.map((lang, idx) => (
                  <span key={idx} className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {lang}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-stone-600">
                <span className="text-[11px] font-semibold text-stone-500">{expert.experienceYears} Years Experience</span>
                <span className={`text-[11px] font-bold ${expert.isAvailableNow ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {expert.isAvailableNow ? '🟢 Available Now' : '🟡 Next: 2 hrs'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-stone-100 flex gap-2">
              <button
                onClick={() => {
                  setSelectedExpert(expert);
                  setConsultType('VOICE');
                }}
                className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Specialist</span>
              </button>

              <button
                onClick={() => {
                  setSelectedExpert(expert);
                  setConsultType('VIDEO');
                }}
                className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Book Video Consultation"
              >
                <Video className="w-4 h-4 text-emerald-700" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Form Modal */}
      {selectedExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedExpert.avatarUrl}
                  alt={selectedExpert.name}
                  className="w-12 h-12 rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">{selectedExpert.name}</h3>
                  <p className="text-xs text-stone-500">{selectedExpert.specialization}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedExpert(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookConsultation} className="space-y-4">
              {/* Farmer Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {language === 'hi' ? 'किसान का नाम' : 'Farmer Name'}
                  </label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    required
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {language === 'hi' ? 'फ़ोन नंबर (कॉलबैक के लिए)' : 'Phone Number (For Callback)'}
                  </label>
                  <input
                    type="tel"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    required
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultType('VOICE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                      consultType === 'VOICE'
                        ? 'bg-green-700 text-white border-green-700'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Direct Phone Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType('VIDEO')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                      consultType === 'VIDEO'
                        ? 'bg-green-700 text-white border-green-700'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Diagnostic</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Preferred Time Window</label>
                <select
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden font-semibold"
                >
                  <option value="Today, 04:00 PM - 05:00 PM">Today, 04:00 PM - 05:00 PM</option>
                  <option value="Today, 06:00 PM - 07:00 PM">Today, 06:00 PM - 07:00 PM</option>
                  <option value="Tomorrow, 09:00 AM - 10:00 AM">Tomorrow, 09:00 AM - 10:00 AM</option>
                  <option value="Tomorrow, 02:00 PM - 03:00 PM">Tomorrow, 02:00 PM - 03:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Crop Problem / Query Details</label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                  placeholder="e.g. Yellow patches on cotton leaf margins after heavy irrigation..."
                  required
                ></textarea>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>100% Free ICAR Agronomy Support (₹0 Fee)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                  ⚡ Supabase Sync
                </span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedExpert(null)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>Confirm & Save Appointment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SQL Setup Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-2 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-700" />
                  <span>Supabase Database Schema Setup</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Project ID: <code className="text-emerald-700 font-mono font-bold">{SUPABASE_PROJECT_ID}</code>
                </p>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-2">
              <p>
                To create the <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-emerald-800 font-bold">appointments</code> table in your Supabase backend:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-stone-700 font-medium pl-1">
                <li>
                  Click the <strong>Copy SQL</strong> button below.
                </li>
                <li>
                  Open your{' '}
                  <a
                    href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 underline font-bold inline-flex items-center gap-0.5"
                  >
                    Supabase SQL Editor <ExternalLink className="w-3 h-3" />
                  </a>
                  .
                </li>
                <li>Paste and click <strong>Run</strong>. The appointments will immediately sync in real-time!</li>
              </ol>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-xl border border-stone-300 bg-stone-950 text-stone-100 font-mono text-[11px] p-4">
              <pre className="overflow-x-auto max-h-60 overflow-y-auto whitespace-pre leading-relaxed">
                {SUPABASE_APPOINTMENTS_ONLY_SQL}
              </pre>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-stone-400">
                Includes RLS Policies & Realtime Publication.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
