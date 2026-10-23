/**
 * Smart Irrigation & IoT Sensor Telemetry Engine
 * Combines in-ground multi-depth capacitive soil sensors, meteorological precipitation models,
 * and phenological crop water demand to calculate irrigation recommendations.
 */

import {
  SmartIrrigationStatus,
  IoTSensor,
  IrrigationRecord,
  WaterAnalytics,
} from '../../shared/types.js';
import { db } from './db.js';

// Pre-seeded IoT Sensors for Anandpur Farm Node
let SENSORS_STORE: IoTSensor[] = [
  {
    id: 'sensor_sm_104',
    name: 'Root-Zone Capacitive Moisture Probe (S-104)',
    label: 'Soil Moisture',
    type: 'SOIL_MOISTURE',
    value: 38,
    unit: '% VWC',
    status: 'ONLINE',
    lastReadingTime: '2 mins ago',
    batteryPct: 92,
    depthCm: 25,
    location: 'North Plot 1B - Cotton',
    isDemo: false,
    optimalRange: '35% - 55%',
    interpretation: 'Adequate moisture buffer; depletion beginning in upper 10cm layer.',
    statusColor: 'green',
  },
  {
    id: 'sensor_st_105',
    name: 'Sub-Surface Soil Thermistor (S-105)',
    label: 'Soil Temperature',
    type: 'SOIL_TEMPERATURE',
    value: 24.8,
    unit: '°C',
    status: 'ONLINE',
    lastReadingTime: '2 mins ago',
    batteryPct: 88,
    depthCm: 15,
    location: 'North Plot 1B - Cotton',
    isDemo: false,
    optimalRange: '20°C - 28°C',
    interpretation: 'Optimal thermal zone for biological microbial nitrification.',
    statusColor: 'green',
  },
  {
    id: 'sensor_ch_106',
    name: 'Canopy Micro-Climate Hygrometer (S-106)',
    label: 'Canopy Humidity',
    type: 'CANOPY_HUMIDITY',
    value: 68,
    unit: '% RH',
    status: 'ONLINE',
    lastReadingTime: '5 mins ago',
    batteryPct: 79,
    depthCm: 0,
    location: 'Field Center Mast',
    isDemo: false,
    optimalRange: '50% - 70%',
    interpretation: 'High vapor density. Transpiration rate reduced.',
    statusColor: 'green',
  },
  {
    id: 'sensor_ec_107',
    name: 'Soil Salinity & EC Sensor (S-107)',
    label: 'Electrical Conductivity',
    type: 'SOIL_EC',
    value: 1.14,
    unit: 'dS/m',
    status: 'ONLINE',
    lastReadingTime: '12 mins ago',
    batteryPct: 94,
    depthCm: 30,
    location: 'North Plot 1B',
    isDemo: false,
    optimalRange: '0.8 - 2.0 dS/m',
    interpretation: 'Non-saline healthy root substrate.',
    statusColor: 'green',
  },
  {
    id: 'sensor_ph_108',
    name: 'Substrate Ion-Selective pH Sensor (S-108)',
    label: 'Substrate pH',
    type: 'SOIL_PH',
    value: 7.3,
    unit: 'pH',
    status: 'ONLINE',
    lastReadingTime: '15 mins ago',
    batteryPct: 85,
    depthCm: 20,
    location: 'North Plot 1B',
    isDemo: false,
    optimalRange: '6.5 - 7.8',
    interpretation: 'Near-neutral; ideal nutrient bioavailability.',
    statusColor: 'green',
  },
];

// Pre-seeded Irrigation Session Logs
let IRRIGATION_HISTORY: IrrigationRecord[] = [
  {
    id: 'irr_log_01',
    date: '2026-08-30T18:00:00Z',
    dateLabel: 'Yesterday, 06:00 PM',
    durationMinutes: 35,
    waterVolumeLitres: 1400,
    crop: 'Cotton (Bt)',
    fieldName: 'Plot 1B (Main Field)',
    method: 'Drip Micro-Emitter',
    pumpType: 'Solar DC Surface Pump (5 HP)',
    status: 'COMPLETED',
    loggedBy: 'AUTO_AI',
    notes: 'Scheduled evening micro-irrigation cycle completed normally.',
    savedToDiary: true,
  },
  {
    id: 'irr_log_02',
    date: '2026-08-29T06:00:00Z',
    dateLabel: '29 Aug, 06:00 AM',
    durationMinutes: 0,
    waterVolumeLitres: 0,
    crop: 'Wheat / Cotton',
    fieldName: 'Plot 2 (Furrows)',
    method: 'Drip',
    pumpType: 'Solar DC Surface Pump',
    status: 'SKIPPED_RAIN',
    loggedBy: 'AUTO_AI',
    notes: 'Auto-delayed due to 18mm regional rainfall. Water saved: 2,100 L.',
    savedToDiary: true,
  },
  {
    id: 'irr_log_03',
    date: '2026-08-28T17:30:00Z',
    dateLabel: '28 Aug, 05:30 PM',
    durationMinutes: 40,
    waterVolumeLitres: 1600,
    crop: 'Cotton (Bt)',
    fieldName: 'Plot 1B (Main Field)',
    method: 'Drip Micro-Emitter',
    pumpType: 'Solar DC Surface Pump (5 HP)',
    status: 'COMPLETED',
    loggedBy: 'MANUAL',
    notes: 'Post-fertilizer fertigation run with soluble NPK 19:19:19.',
    savedToDiary: true,
  },
  {
    id: 'irr_log_04',
    date: '2026-08-26T06:15:00Z',
    dateLabel: '26 Aug, 06:15 AM',
    durationMinutes: 30,
    waterVolumeLitres: 1200,
    crop: 'Groundnut (GG-20)',
    fieldName: 'Plot 3 (South Acre)',
    method: 'Micro-Sprinkler',
    pumpType: 'Solar DC Surface Pump',
    status: 'COMPLETED',
    loggedBy: 'AUTO_AI',
    notes: 'Morning pod development hydration cycle.',
    savedToDiary: true,
  },
];

// Current live pump status in memory
let livePumpStatus: 'IDLE' | 'RUNNING' | 'SCHEDULED' = 'IDLE';
let isDemoMode = false;

// Compute water usage analytics
function computeWaterAnalytics(): WaterAnalytics {
  const dailyUsage = [
    { day: 'Mon', date: '25 Aug', usedLitres: 1200, baselineLitres: 1800, savedLitres: 600 },
    { day: 'Tue', date: '26 Aug', usedLitres: 1200, baselineLitres: 1800, savedLitres: 600 },
    { day: 'Wed', date: '27 Aug', usedLitres: 0, baselineLitres: 1600, savedLitres: 1600 },
    { day: 'Thu', date: '28 Aug', usedLitres: 1600, baselineLitres: 2000, savedLitres: 400 },
    { day: 'Fri', date: '29 Aug', usedLitres: 0, baselineLitres: 1800, savedLitres: 1800 },
    { day: 'Sat', date: '30 Aug', usedLitres: 1400, baselineLitres: 1900, savedLitres: 500 },
    { day: 'Sun', date: '31 Aug', usedLitres: 0, baselineLitres: 1800, savedLitres: 1800 },
  ];

  const weeklyUsage = [
    { week: 'Week 1', usedLitres: 4800, savedLitres: 1800 },
    { week: 'Week 2', usedLitres: 5200, savedLitres: 2100 },
    { week: 'Week 3', usedLitres: 4600, savedLitres: 2400 },
    { week: 'This Week', usedLitres: 5400, savedLitres: 2300 },
  ];

  const totalUsedWeekLitres = 5400;
  const totalSavedWeekLitres = 2300;
  // Electricity / Diesel savings benchmark (~₹0.45 per litre pumping cost in Saurashtra)
  const estimatedCostSavedInr = Math.round(totalSavedWeekLitres * 0.54);

  return {
    dailyUsage,
    weeklyUsage,
    totalUsedWeekLitres,
    totalSavedWeekLitres,
    estimatedCostSavedInr,
    pumpRunHoursThisWeek: 3.2,
  };
}

export function getSmartIrrigationStatus(customMoisture?: number, customRainProb?: number): SmartIrrigationStatus {
  const moistureSensor = SENSORS_STORE.find((s) => s.type === 'SOIL_MOISTURE');
  const currentMoisture = customMoisture !== undefined ? customMoisture : (moistureSensor ? moistureSensor.value : 38);
  const rainProb48h = customRainProb !== undefined ? customRainProb : 70; // 70% rain forecast scenario

  // Core Agronomic Decision Engine:
  // If substantial rain is expected (>=45%) and soil moisture is above critical wilting (>=25%),
  // we advise DELAYING irrigation to conserve ground water and prevent soil saturation.
  const isRainImminent = rainProb48h >= 45;
  const isMoistureCritical = currentMoisture < 25;
  const shouldIrrigate = isMoistureCritical ? true : !isRainImminent && currentMoisture < 45;

  let rootZoneCondition: 'Moist / Adequate' | 'Moderate Depletion' | 'Critical Stress' | 'Saturated' = 'Moderate Depletion';
  if (currentMoisture >= 65) rootZoneCondition = 'Saturated';
  else if (currentMoisture >= 45) rootZoneCondition = 'Moist / Adequate';
  else if (currentMoisture < 25) rootZoneCondition = 'Critical Stress';

  let decisionReason = '';
  let decisionTitle = '';

  if (!shouldIrrigate && isRainImminent) {
    decisionTitle = 'NO — Irrigation Not Recommended';
    decisionReason = `Rain is expected within the next 18-24 hours (${rainProb48h}% probability) and current soil moisture (${currentMoisture}%) is adequate. Irrigating now risks waterlogging, root asphyxiation, and fertilizer runoff.`;
  } else if (!shouldIrrigate && currentMoisture >= 45) {
    decisionTitle = 'NO — Irrigation Not Needed';
    decisionReason = `Current soil moisture (${currentMoisture}%) is within the optimal zone (35%-55%). Crop has sufficient water buffer for the next 48 hours.`;
  } else {
    decisionTitle = 'YES — Irrigation Recommended';
    decisionReason = `Soil moisture (${currentMoisture}%) has dropped below the threshold (45%). No rain is expected in the next 48 hours. Cotton is at water-sensitive boll setting stage.`;
  }

  // Hourly moisture curve
  const hourlyMoistureCurve = [
    { time: '00:00', moisturePct: Math.round(currentMoisture + 4), thresholdPct: 50 },
    { time: '04:00', moisturePct: Math.round(currentMoisture + 2), thresholdPct: 50 },
    { time: '08:00', moisturePct: Math.round(currentMoisture), thresholdPct: 50 },
    { time: '12:00', moisturePct: Math.max(15, Math.round(currentMoisture - 4)), thresholdPct: 50 },
    { time: '16:00', moisturePct: Math.max(15, Math.round(currentMoisture - 2)), thresholdPct: 50 },
    { time: '20:00', moisturePct: Math.round(currentMoisture + 6), thresholdPct: 50 },
    { time: '24:00', moisturePct: Math.round(currentMoisture + 8), thresholdPct: 50 },
  ];

  return {
    soilMoisturePct: currentMoisture,
    rootZoneCondition,
    cropGrowthStage: 'Cotton (Bt): Peak Flowering & Boll Formation',
    activeCropName: 'Cotton (Bt)',
    temperatureC: 31,
    rainForecast48hPct: rainProb48h,
    irrigationRequired: shouldIrrigate,
    decisionTitle,
    recommendedDurationMinutes: shouldIrrigate ? 40 : 0,
    decisionReason,
    bestIrrigationTime: shouldIrrigate
      ? 'Today Evening (05:30 PM - 06:15 PM) or Tomorrow Dawn (06:00 AM)'
      : 'Hold off until after tomorrow\'s rain window (evaluate on Wednesday)',
    priority: shouldIrrigate ? (isMoistureCritical ? 'High' : 'Medium') : 'Low',
    pumpStatus: livePumpStatus,
    waterSavedThisMonthLitres: 18400,
    waterStatusScore: 78,
    scoreBreakdown: {
      soilMoisture: currentMoisture >= 35 ? 'Good' : 'Moderate',
      rainForecast: isRainImminent ? 'Delay Active' : 'Good',
      cropDemand: 'Moderate',
      temperature: 'High',
    },
    estimatedWaterRequirementLitresPerAcre: shouldIrrigate ? 3800 : 0,
    lastIrrigationText: 'Yesterday, 06:00 PM (35 min, 1,400 L)',
    hourlyMoistureCurve,
    sensors: SENSORS_STORE,
    history: IRRIGATION_HISTORY,
    analytics: computeWaterAnalytics(),
    isDemoSensorMode: isDemoMode,
  };
}

export function getAllSensors(): IoTSensor[] {
  return SENSORS_STORE;
}

export function getSensorById(id: string): IoTSensor | undefined {
  return SENSORS_STORE.find((s) => s.id === id);
}

export function toggleSensorDemoMode(enable?: boolean): boolean {
  isDemoMode = enable !== undefined ? enable : !isDemoMode;
  SENSORS_STORE = SENSORS_STORE.map((s) => ({
    ...s,
    isDemo: isDemoMode,
  }));
  return isDemoMode;
}

export function simulateSensorPreset(preset: 'DRY' | 'WET' | 'RAIN_DELAY' | 'OFFLINE'): SmartIrrigationStatus {
  if (preset === 'DRY') {
    SENSORS_STORE = SENSORS_STORE.map((s) => {
      if (s.type === 'SOIL_MOISTURE') return { ...s, value: 22, status: 'ONLINE', interpretation: 'Critical root depletion. Immediate watering advised.' };
      if (s.type === 'SOIL_TEMPERATURE') return { ...s, value: 29.4 };
      return { ...s, status: 'ONLINE' };
    });
    return getSmartIrrigationStatus(22, 10);
  }

  if (preset === 'WET') {
    SENSORS_STORE = SENSORS_STORE.map((s) => {
      if (s.type === 'SOIL_MOISTURE') return { ...s, value: 62, status: 'ONLINE', interpretation: 'Soil field capacity saturated. No irrigation required.' };
      return { ...s, status: 'ONLINE' };
    });
    return getSmartIrrigationStatus(62, 15);
  }

  if (preset === 'OFFLINE') {
    SENSORS_STORE = SENSORS_STORE.map((s, idx) => ({
      ...s,
      status: idx === 0 ? 'OFFLINE' : idx === 1 ? 'DELAYED' : 'ONLINE',
      interpretation: idx === 0 ? 'Sensor telemetry packet lost. Using agro-climatic model estimates.' : s.interpretation,
    }));
    return getSmartIrrigationStatus(38, 70);
  }

  // Default RAIN_DELAY preset
  SENSORS_STORE = SENSORS_STORE.map((s) => {
    if (s.type === 'SOIL_MOISTURE') return { ...s, value: 38, status: 'ONLINE', interpretation: 'Adequate moisture buffer; depletion beginning in upper 10cm.' };
    return { ...s, status: 'ONLINE' };
  });
  return getSmartIrrigationStatus(38, 70);
}

export function setPumpState(state: 'IDLE' | 'RUNNING' | 'SCHEDULED'): 'IDLE' | 'RUNNING' | 'SCHEDULED' {
  livePumpStatus = state;
  return livePumpStatus;
}

export function addIrrigationLog(
  recordData: Omit<IrrigationRecord, 'id' | 'date'>
): { record: IrrigationRecord; diaryEntry: any } {
  const newRecord: IrrigationRecord = {
    id: `irr_log_${Date.now()}`,
    date: new Date().toISOString(),
    ...recordData,
    savedToDiary: true,
  };

  IRRIGATION_HISTORY = [newRecord, ...IRRIGATION_HISTORY];

  // Auto create corresponding Farm Diary entry
  const diaryEntry = {
    id: `diary_irr_${Date.now()}`,
    farmerId: 'usr_farmer_ramesh',
    date: new Date().toISOString().split('T')[0],
    category: 'IRRIGATION',
    title: `Smart Irrigation Logged: ${newRecord.crop}`,
    notes: `${newRecord.durationMinutes} minutes cycle via ${newRecord.method}. Water volume: ${newRecord.waterVolumeLitres} Litres. ${newRecord.notes}`,
    cropName: newRecord.crop,
    plotLocation: newRecord.fieldName,
    costInr: Math.round(newRecord.durationMinutes * 4.5),
    syncedWithCloud: true,
  };

  return { record: newRecord, diaryEntry };
}
