import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Tractor,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { MachineryItem } from '../../shared/types';

export const MachineryPage: React.FC = () => {
  const currentUser = useUserStore(state => state.currentUser);
  const { addToast } = useApp();
  const [machinery, setMachinery] = useState<MachineryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MachineryItem | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-09-05');
  const [hours, setHours] = useState('4');

  useEffect(() => {
    fetch('/api/machinery')
      .then((res) => res.json())
      .then((data) => {
        if (data.machinery) setMachinery(data.machinery);
      })
      .catch(() => {});
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const res = await fetch('/api/machinery/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineryId: selectedItem.id,
          farmerId: currentUser?.id || 'usr_farmer_1',
          farmerName: currentUser?.fullName || 'Ramesh Patel',
          date: bookingDate,
          hours: parseInt(hours) || 4,
        }),
      });

      if (res.ok) {
        addToast('Equipment Reserved', `${selectedItem.name} booked for ${hours} hours on ${bookingDate}. (Prototype Flow)`, 'success');
        setSelectedItem(null);
      }
    } catch (e: any) {
      addToast('Error', e.message, 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Banner */}
      <div className="bg-green-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 space-y-3 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/15 text-emerald-200 text-xs px-3 py-1 rounded-full font-mono border border-white/20 backdrop-blur-xs">
              VILLAGE RESOURCE SHARING
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-2">
            Shared Village Machinery Roster
          </h1>
          <p className="text-stone-200 text-xs sm:text-sm max-w-2xl mt-1">
            High-capital farm machinery (Tractors, Tillers, Drone Sprayers, Harvesters) shared among cluster members on an on-demand hourly schedule.
          </p>
        </div>
      </div>

      {/* Machinery Cards */}
      {machinery.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-white/80 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-800 flex items-center justify-center mx-auto">
            <Tractor className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-stone-900">No Equipment Listed Yet</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Machinery and tractors registered by Village Champions and equipment owners will appear here for booking.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {machinery.map((item) => (
          <div
            key={item.id}
            className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/80 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold bg-green-700/10 text-green-700 border border-green-700/20 px-2.5 py-0.5 rounded-full">
                  {item.category || item.type || 'Equipment'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    item.available ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-600/20' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {item.available ? '● Available' : '● Scheduled'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-lg text-stone-900">{item.name}</h3>
                <p className="text-xs text-stone-500">{item.village || item.currentLocationVillage || 'Anandpur'} Village Hub</p>
              </div>

              <div className="p-3 bg-white/70 backdrop-blur-xs rounded-2xl border border-white/80 space-y-1 text-xs shadow-2xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Specification:</span>
                  <span className="font-semibold text-stone-900">{item.hpOrCapacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Hourly Rate:</span>
                  <span className="font-bold text-green-700">₹{item.hourlyRateInr} / Hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Operator:</span>
                  <span className="text-stone-700">{item.operatorIncluded !== false ? 'Driver Included' : 'Self-drive'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedItem(item)}
              className="w-full bg-green-700 hover:bg-green-800 text-white text-xs font-semibold py-3 rounded-2xl transition-all shadow cursor-pointer border border-white/20 active:scale-[0.99]"
            >
              Book Equipment Slot
            </button>
          </div>
        ))}
      </div>
      )}

      {/* Booking Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold font-display text-lg text-stone-900">Book Equipment</h3>
                <p className="text-xs text-stone-500">{selectedItem.name}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handleBook} className="space-y-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">Rate:</span>
                  <span className="font-bold text-emerald-700">₹{selectedItem.hourlyRateInr}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Included:</span>
                  <span>{selectedItem.operatorIncluded ? 'Dedicated Village Operator' : 'Self Service'}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Reservation Date:</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Required Hours:</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none"
                />
              </div>

              <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 text-teal-900 font-bold flex justify-between">
                <span>Estimated Rental Cost:</span>
                <span>₹{((parseInt(hours) || 1) * selectedItem.hourlyRateInr).toLocaleString()}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-3 py-2 text-stone-500 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
