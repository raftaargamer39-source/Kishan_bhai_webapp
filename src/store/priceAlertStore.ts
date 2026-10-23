import { create } from 'zustand';
import {
  getStoredPriceAlerts,
  addPriceAlert as addServiceAlert,
  deletePriceAlert as deleteServiceAlert,
  togglePriceAlert as toggleServiceAlert,
  PriceAlert,
} from '../services/priceAlertService';

interface PriceAlertStore {
  priceAlerts: PriceAlert[];
  isAlertModalOpen: boolean;
  newCrop: string;
  newTargetPrice: string;
  newCondition: 'ABOVE' | 'BELOW';
  
  setAlertModalOpen: (isOpen: boolean) => void;
  setNewCrop: (crop: string) => void;
  setNewTargetPrice: (price: string) => void;
  setNewCondition: (condition: 'ABOVE' | 'BELOW') => void;
  
  loadAlerts: () => void;
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isActive'>) => void;
  toggleAlert: (id: string) => void;
  deleteAlert: (id: string) => void;
}

export const usePriceAlertStore = create<PriceAlertStore>((set, get) => ({
  priceAlerts: [],
  isAlertModalOpen: false,
  newCrop: 'Cotton (Kapas)',
  newTargetPrice: '7500',
  newCondition: 'ABOVE',
  
  setAlertModalOpen: (isOpen) => set({ isAlertModalOpen: isOpen }),
  setNewCrop: (crop) => set({ newCrop: crop }),
  setNewTargetPrice: (price) => set({ newTargetPrice: price }),
  setNewCondition: (condition) => set({ newCondition: condition }),
  
  loadAlerts: () => {
    set({ priceAlerts: getStoredPriceAlerts() });
  },
  
  addAlert: (alert) => {
    addServiceAlert(alert);
    set({ priceAlerts: getStoredPriceAlerts() });
  },
  
  toggleAlert: (id) => {
    toggleServiceAlert(id);
    set({ priceAlerts: getStoredPriceAlerts() });
  },
  
  deleteAlert: (id) => {
    deleteServiceAlert(id);
    set({ priceAlerts: getStoredPriceAlerts() });
  }
}));
