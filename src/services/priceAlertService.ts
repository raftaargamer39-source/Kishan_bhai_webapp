/**
 * Local Price Alert Service using AsyncStorage (localStorage abstraction)
 * Manages user-defined crop price thresholds and triggers notifications when reached.
 */

export interface PriceAlert {
  id: string;
  crop: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  state: string;
  district: string;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
  isTriggered?: boolean;
}

const STORAGE_KEY = 'kishan_bhai_price_alerts';

/**
 * Get all stored price alerts
 */
export function getStoredPriceAlerts(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultAlerts();
    return JSON.parse(raw);
  } catch (e) {
    console.error('[PriceAlertService] Error reading alerts:', e);
    return getDefaultAlerts();
  }
}

function getDefaultAlerts(): PriceAlert[] {
  const defaults: PriceAlert[] = [
    {
      id: 'alert_1',
      crop: 'Cotton (Kapas)',
      targetPrice: 7500,
      condition: 'ABOVE',
      state: 'Gujarat',
      district: 'Rajkot',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'alert_2',
      crop: 'Wheat (Gehun)',
      targetPrice: 3000,
      condition: 'ABOVE',
      state: 'Gujarat',
      district: 'Rajkot',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];
  savePriceAlerts(defaults);
  return defaults;
}

/**
 * Save price alerts to AsyncStorage
 */
export function savePriceAlerts(alerts: PriceAlert[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch (e) {
    console.error('[PriceAlertService] Error saving alerts:', e);
  }
}

/**
 * Add a new price alert
 */
export function addPriceAlert(alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isActive'>): PriceAlert {
  const alerts = getStoredPriceAlerts();
  const newAlert: PriceAlert = {
    ...alert,
    id: `alert_${Date.now()}`,
    isActive: true,
    createdAt: new Date().toISOString(),
    isTriggered: false,
  };
  alerts.unshift(newAlert);
  savePriceAlerts(alerts);
  return newAlert;
}

/**
 * Toggle alert active status
 */
export function togglePriceAlert(id: string): PriceAlert[] {
  const alerts = getStoredPriceAlerts();
  const updated = alerts.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a));
  savePriceAlerts(updated);
  return updated;
}

/**
 * Delete a price alert
 */
export function deletePriceAlert(id: string): PriceAlert[] {
  const alerts = getStoredPriceAlerts();
  const filtered = alerts.filter((a) => a.id !== id);
  savePriceAlerts(filtered);
  return filtered;
}

/**
 * Check live market prices against user alerts and return any newly triggered alerts
 */
export function checkPriceAlerts(livePrices: { crop: string; modalPricePerQuintal: number; mandi: string }[]): { alert: PriceAlert; currentPrice: number }[] {
  const alerts = getStoredPriceAlerts();
  const triggered: { alert: PriceAlert; currentPrice: number }[] = [];
  let updated = false;

  const newAlerts = alerts.map((alert) => {
    if (!alert.isActive || alert.isTriggered) return alert;

    const match = livePrices.find(
      (p) => p.crop.toLowerCase().includes(alert.crop.toLowerCase()) || alert.crop.toLowerCase().includes(p.crop.toLowerCase())
    );

    if (match) {
      const price = match.modalPricePerQuintal;
      let conditionMet = false;
      if (alert.condition === 'ABOVE' && price >= alert.targetPrice) {
        conditionMet = true;
      } else if (alert.condition === 'BELOW' && price <= alert.targetPrice) {
        conditionMet = true;
      }

      if (conditionMet) {
        updated = true;
        triggered.push({ alert, currentPrice: price });
        return {
          ...alert,
          isTriggered: true,
          triggeredAt: new Date().toISOString(),
        };
      }
    }
    return alert;
  });

  if (updated) {
    savePriceAlerts(newAlerts);
  }

  return triggered;
}
