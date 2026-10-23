import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  BookOpen,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  Layers,
  Sprout,
  X,
  FileSpreadsheet,
  Download,
  Trash2,
  Mic,
  Sparkles,
} from 'lucide-react';
import { FarmDiaryRecord } from '../../shared/types';
import { FieldVoiceDictatorModal } from '../components/speech/FieldVoiceDictatorModal';
import { InlineMicButton } from '../components/speech/InlineMicButton';

export const FarmDiaryPage: React.FC = () => {
  const currentUser = useUserStore(state => state.currentUser);
  const { farmDiary, addDiaryEntry, deleteDiaryEntry, language, addToast } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // New Record State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<FarmDiaryRecord['category']>('Fertilizer');
  const [crop, setCrop] = useState('BT Cotton');
  const [title, setTitle] = useState('');
  const [expenseAmountInr, setExpenseAmountInr] = useState<number>(0);
  const [revenueAmountInr, setRevenueAmountInr] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const categories = [
    'All',
    'Sowing',
    'Fertilizer',
    'Disease & Pest',
    'Irrigation',
    'Labour',
    'Harvesting',
    'Sale',
    'General',
  ];

  const filteredDiary = farmDiary.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  const totalExpenses = farmDiary.reduce((acc, item) => acc + (item.expenseAmountInr || 0), 0);
  const totalRevenue = farmDiary.reduce((acc, item) => acc + (item.revenueAmountInr || 0), 0);
  const netBalance = totalRevenue - totalExpenses;

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addDiaryEntry({
      date,
      category,
      crop,
      title,
      expenseAmountInr: expenseAmountInr > 0 ? Number(expenseAmountInr) : undefined,
      revenueAmountInr: revenueAmountInr > 0 ? Number(revenueAmountInr) : undefined,
      notes,
    });

    setTitle('');
    setExpenseAmountInr(0);
    setRevenueAmountInr(0);
    setNotes('');
    setIsAddModalOpen(false);
  };

  const handleExportData = () => {
    addToast('Farm Diary Exported', 'CSV statement with all recorded expenditures generated.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3B11] to-green-700 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>{language === 'hi' ? 'डिजिटल खेत खाता और दैनिक डायरी' : 'Digital Farm Ledger & Activity Log'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {language === 'hi' ? 'खेत डायरी (खाता बही)' : 'Farm Diary & Expense Tracker'}
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            {language === 'hi'
              ? 'खाद, बीज, कीटनाशक, मजदूरी और उपज बिक्री का दैनिक हिसाब रखें। मौसमी लाभ-हानि का पारदर्शी ब्योरा।'
              : 'Record farm operations, sprayings, labour wages, and harvest sales in an audit-ready digital ledger.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Hands-Free Field Voice Dictator Button */}
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 px-4 py-3 rounded-2xl shadow-lg transition-all cursor-pointer text-xs font-bold shrink-0 border border-emerald-300/40 active:scale-95"
          >
            <Mic className="w-4 h-4 text-stone-950 animate-pulse" />
            <span>{language === 'hi' ? 'बोलकर डायरी लिखें (Hands-Free)' : 'Dictate Farm Note (Field Voice)'}</span>
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-950/90 text-emerald-200 border border-emerald-500/30 px-4 py-3 rounded-2xl transition-all cursor-pointer text-xs font-bold shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold px-5 py-3 rounded-2xl shadow-lg transition-all cursor-pointer text-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'नया खर्च / कार्य दर्ज करें' : 'Record Activity'}</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-xs font-semibold text-stone-500 mb-1">Total Recorded Expenses (कुल खर्च)</div>
          <div className="text-2xl font-bold text-rose-600 font-display">
            ₹{totalExpenses.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Inputs, labour, sprayings</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-xs font-semibold text-stone-500 mb-1">Total Farm Income (कुल आमदनी)</div>
          <div className="text-2xl font-bold text-emerald-700 font-display">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Harvest sales, subsidies</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-xs font-semibold text-stone-500 mb-1">Net Seasonal Margin (शुद्ध शेष)</div>
          <div className={`text-2xl font-bold font-display ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            ₹{netBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Current season balance</div>
        </div>
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-green-700 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Diary Timeline Entries */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-sm">
            {language === 'hi' ? 'खेत गतिविधि इतिहास' : 'Farm Activity Timeline & Entries'}
          </h3>
          <span className="text-xs text-stone-500 font-mono">{filteredDiary.length} ENTRIES</span>
        </div>

        <div className="divide-y divide-stone-100">
          {filteredDiary.length > 0 ? (
            filteredDiary.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500 font-mono">{item.date}</span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-green-700">{item.crop}</span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">{item.title}</h4>
                  {item.notes && <p className="text-xs text-stone-600">{item.notes}</p>}
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  {item.expenseAmountInr && item.expenseAmountInr > 0 && (
                    <div className="text-right">
                      <div className="text-[10px] text-stone-400 uppercase font-bold">Expense</div>
                      <div className="text-sm font-bold font-display text-rose-600">
                        -₹{item.expenseAmountInr.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {item.revenueAmountInr && item.revenueAmountInr > 0 && (
                    <div className="text-right">
                      <div className="text-[10px] text-stone-400 uppercase font-bold">Income</div>
                      <div className="text-sm font-bold font-display text-emerald-700">
                        +₹{item.revenueAmountInr.toLocaleString()}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => deleteDiaryEntry(item.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-stone-500">
              <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-xs">No farm entries recorded in this category yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
                <BookOpen className="w-5 h-5" />
                <span>{language === 'hi' ? 'खेत गतिविधि दर्ज करें' : 'Record Farm Log'}</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                  >
                    <option value="Fertilizer">Fertilizer (उर्वरक / खाद)</option>
                    <option value="Disease & Pest">Disease & Pest Spray</option>
                    <option value="Irrigation">Irrigation (सिंचाई)</option>
                    <option value="Labour">Labour & Weeding (मजदूरी)</option>
                    <option value="Harvesting">Harvesting (कटाई)</option>
                    <option value="Sale">Sale of Produce (फसल बिक्री)</option>
                    <option value="Sowing">Sowing & Seeds</option>
                    <option value="General">General Operation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">Crop</label>
                    <InlineMicButton
                      lang={language === 'hi' ? 'hi-IN' : 'en-IN'}
                      onTranscript={(text) => setCrop(text)}
                      tooltip="Dictate crop name"
                    />
                  </div>
                  <input
                    type="text"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                    placeholder="e.g. BT Cotton / Wheat"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Expense (₹)</label>
                  <input
                    type="number"
                    value={expenseAmountInr || ''}
                    onChange={(e) => setExpenseAmountInr(parseInt(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Income / Revenue (₹ - If selling produce)</label>
                <input
                  type="number"
                  value={revenueAmountInr || ''}
                  onChange={(e) => setRevenueAmountInr(parseInt(e.target.value) || 0)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                  placeholder="0"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">Activity Title</label>
                  <InlineMicButton
                    lang={language === 'hi' ? 'hi-IN' : 'en-IN'}
                    onTranscript={(text) => setTitle(text)}
                    tooltip="Dictate activity title"
                  />
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                  placeholder="e.g. Sprayed Bio-Neem Oil for Aphid prevention"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">Detailed Field Notes</label>
                  <InlineMicButton
                    lang={language === 'hi' ? 'hi-IN' : 'en-IN'}
                    onTranscript={(text) => setNotes((prev) => (prev ? `${prev} ${text}` : text))}
                    tooltip="Dictate detailed field notes"
                  />
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                  placeholder="Dosage, weather during spraying, labour count..."
                ></textarea>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Field Voice Dictator Modal */}
      <FieldVoiceDictatorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        defaultCrop={currentUser?.crops?.[0] || 'BT Cotton'}
        language={language}
        onSaveEntry={(entry) => {
          addDiaryEntry(entry);
          addToast(
            'Voice Entry Saved',
            `Recorded "${entry.title}" in Farm Diary ledger.`,
            'success'
          );
        }}
      />
    </div>
  );
};
