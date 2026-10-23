/**
 * Shared Type Definitions for Kishan Bhai Platform
 */

export type UserRole = 'FARMER' | 'CHAMPION' | 'BUYER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  village: string;
  state: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  isGpsVerified?: boolean;
  verified: boolean;
  farmSizeAcres?: number;
  crops?: string[];
  preferredLanguage?: 'en' | 'hi';
  walletAddress?: string;
  createdAt: string;
}

export interface VirtualCluster {
  id: string;
  name: string;
  village: string;
  state: string;
  championId: string;
  championName: string;
  description: string;
  totalAcres: number;
  memberCount: number;
  primaryCrops: string[];
  collectiveHarvestKg: number;
  bulkSavingsPercent: number;
  members: {
    id: string;
    farmerName: string;
    acres: number;
    crops: string[];
    village: string;
    joinedAt: string;
  }[];
  createdAt: string;
}

export interface ClusterBuyingNeed {
  item: string;
  category: string;
  quantityNeeded: number;
  unit: string;
  targetPriceInr?: number;
  pledgedCount?: number;
  status: 'OPEN' | 'FULFILLED';
}

export interface ClusterChatMessage {
  id: string;
  clusterId: string;
  senderId: string;
  senderName: string;
  senderVillage?: string;
  senderRole?: 'FARMER' | 'CHAMPION' | 'BUYER' | 'EXPERT' | string;
  text: string;
  buyingNeed?: ClusterBuyingNeed;
  timestamp: string;
}

export interface GroupBuyMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  text: string;
  timestamp: string;
}

export interface GroupBuyPledge {
  id?: string;
  farmerId: string;
  farmerName: string;
  village?: string;
  quantity: number;
  pledgedAt: string;
  notes?: string;
}

export interface BulkOrderRequirement {
  id: string;
  clusterId: string;
  clusterName: string;
  groupName?: string;
  category: 'Fertilizer' | 'Seeds' | 'Pesticide' | 'Bio-Nutrients' | 'Mulch Sheets' | 'Solar & Irrigation' | 'Machinery & Tools' | 'Cattle Feed' | 'General Hardware' | 'Custom Household & Groceries' | string;
  itemName: string;
  itemDescription?: string;
  imageUrl?: string;
  targetQuantity: number;
  currentQuantity: number;
  unit: 'Bags (50kg)' | 'Quintals' | 'Kilograms' | 'Litres' | 'Rolls' | 'Units' | 'Sets' | 'Packets' | string;
  standardRetailPrice: number; // in INR
  negotiatedBulkPrice: number; // in INR
  tierDiscounts?: { minQty: number; discountPct: number; priceInr: number; label: string }[];
  savingsPercentage: number;
  deadlineDate: string;
  status: 'AGGREGATING' | 'ORDER_PLACED' | 'SHIPPED' | 'DISTRIBUTED';
  location?: string;
  creatorName?: string;
  creatorId?: string;
  connectedMembersCount?: number;
  farmerPledges: GroupBuyPledge[];
  chatMessages?: GroupBuyMessage[];
}

export interface SharedCartItemContributor {
  userId: string;
  userName: string;
  userVillage?: string;
  quantity: number;
  notes?: string;
  addedAt: string;
}

export interface SharedCartItem {
  id: string;
  title: string;
  category: string;
  unit: string;
  retailPrice: number;
  wholesalePrice: number;
  imageUrl?: string;
  targetTierQty: number;
  totalQuantity: number;
  contributors: SharedCartItemContributor[];
  supplierName?: string;
}

export interface SharedClusterCart {
  id: string;
  clusterId: string;
  clusterName: string;
  village: string;
  title: string;
  status: 'OPEN' | 'LOCKED' | 'ORDER_PLACED' | 'DELIVERED';
  deliveryAddress: string;
  coordinatorName: string;
  coordinatorPhone: string;
  items: SharedCartItem[];
  totalRetailAmount: number;
  totalWholesaleAmount: number;
  totalSavings: number;
  lockedAt?: string;
  orderPlacedAt?: string;
  checkoutDetails?: {
    paymentMethod: 'SPLIT_UPI' | 'COOPERATIVE_CREDIT' | 'CASH_ON_DELIVERY';
    deliveryDate: string;
    pickupLocation: string;
    receiptNumber: string;
    contributorSplits: {
      userId: string;
      userName: string;
      itemCount: number;
      amountDue: number;
      paidStatus: 'PAID' | 'PENDING';
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface MachineryItem {
  id: string;
  name: string;
  type: 'Tractor' | 'Harvester' | 'Rotavator' | 'Laser Leveler' | 'Solar Drone Sprayer' | 'Seeder';
  category?: string;
  village?: string;
  operatorIncluded?: boolean;
  modelYear: string;
  hpOrCapacity: string;
  hourlyRateInr: number;
  available: boolean;
  currentLocationVillage: string;
  ownerContact: string;
  description: string;
  isDemoPrototype: boolean;
  upcomingBookings: {
    bookingId: string;
    farmerName: string;
    village: string;
    date: string;
    hours: number;
    status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
}

export interface HarvestPoolLot {
  id: string;
  clusterId: string;
  clusterName: string;
  farmerId: string;
  farmerName: string;
  village: string;
  crop: string;
  variety: string;
  quantityKg: number;
  qualityGrade: 'A+ Export' | 'Grade A Premium' | 'Grade B Standard' | 'Organic Certified';
  expectedHarvestDate: string;
  minimumTargetPricePerKg: number; // in INR
  status: 'AVAILABLE' | 'COMMITTED_TO_BUYER' | 'HARVESTED_SOLD';
  moisturePercentage?: number;
  notes?: string;
}

export interface BuyerPurchaseRequest {
  id: string;
  harvestLotId: string;
  crop: string;
  quantityKg: number;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  offeredPricePerKg: number;
  totalOfferedInr: number;
  deliveryLocation: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  requestedAt: string;
  clusterName: string;
  farmerName: string;
}

export interface TransactionRecord {
  id: string;
  serviceId: string;
  serviceName: string;
  amountUsdc: number;
  asset: 'USDC' | 'ALGO';
  network: 'Algorand Testnet';
  status: 'PENDING' | 'VERIFIED' | 'SETTLED' | 'FAILED';
  txId: string;
  senderAddress: string;
  receiverAddress: string;
  timestamp: string;
  facilitator: string;
  explorerUrl: string;
  executionTimeMs?: number;
  isRealBlockchainTx: boolean;
}

export interface WeatherRiskBreakdown {
  rainRisk: number; // 0-100
  heatRisk: number; // 0-100
  windRisk: number; // 0-100
  diseaseRisk: number; // 0-100
  overallScore: number; // 0-100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  summary: string;
}

export interface WeatherFarmingAction {
  id: string;
  type: 'RAIN' | 'HEAT' | 'WIND' | 'HUMIDITY' | 'TEMPERATURE' | 'GENERAL';
  title: string;
  conditionDescription: string;
  recommendedAction: string;
  actionCategory: 'IRRIGATION' | 'PEST_DISEASE' | 'SPRAY' | 'FIELD_OPS' | 'GENERAL';
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  icon: string;
}

export interface WeatherAlertItem {
  id: string;
  type: 'HEAVY_RAIN' | 'HEAT_WAVE' | 'STRONG_WIND' | 'HIGH_HUMIDITY' | 'COLD_WAVE';
  icon: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  whatIsHappening: string;
  whenItMayHappen: string;
  whatFarmerShouldDo: string;
  issuedAt: string;
}

export interface DailyForecastItem {
  day: string;
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  rainChance: number;
  humidity: number;
  windKmh: number;
  advisory: string;
  icon: string;
}

export interface WeatherData {
  location: string;
  temperatureC: number;
  feelsLikeC?: number;
  condition: string;
  humidity: number;
  windSpeedKmh: number;
  windDirection?: string;
  rainfallProbability: number;
  cloudConditions?: string;
  sunrise?: string;
  sunset?: string;
  uvIndex?: number;
  pressureHpa?: number;
  forecast: DailyForecastItem[];
  farmingAdvisory: string;
  farmingActions?: WeatherFarmingAction[];
  riskScore?: WeatherRiskBreakdown;
  alerts?: WeatherAlertItem[];
  cached: boolean;
  isDemo?: boolean;
  lastUpdated: string;
}

export interface ApiBudgetStats {
  monthlyLimitInr: number;
  currentUsageInr: number;
  remainingBudgetInr: number;
  totalApiRequests: number;
  cachedRequestsSaved: number;
  modelInUse: string;
  breakdown: {
    geminiAiInr: number;
    weatherApiInr: number;
    algorandNodeInr: number;
  };
}

export interface FarmingActionCard {
  title: string;
  crop: string;
  currentMoisture?: number;
  recommendedTime?: string;
  reason: string;
  actionType: 'IRRIGATION' | 'DISEASE_SPRAY' | 'FERTILIZER' | 'MARKET_SELL' | 'GENERAL';
  badge?: string;
  actionLabel?: string;
  actionView?: string;
}

export interface DiseaseAnalysisResult {
  possibleDisease: string;
  cropName: string;
  confidence: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  symptoms: string;
  recommendedAction: string;
  prevention: string;
  disclaimer: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  imageUrl?: string;
  imageBase64?: string;
  modelUsed?: string;
  language?: string;
  detectedLanguage?: string;
  farmingActionCard?: FarmingActionCard;
  actionCard?: FarmingActionCard;
  diseaseAnalysis?: DiseaseAnalysisResult;
  sources?: string[];
  feedback?: 'like' | 'dislike';
  isStreaming?: boolean;
  executedAction?: {
    actionType: string;
    actionTitle: string;
    summary: string;
    modifiedData: any;
    targetView?: string;
  };
  toolCall?: {
    toolName: 'crop_analysis' | 'farm_intelligence' | 'weather_intelligence' | 'general_guidance' | 'app_modifier';
    status: 'executed' | 'in_progress';
    resultData?: any;
    txId?: string;
  };
}

export interface AIConversationSession {
  id: string;
  title: string;
  preview?: string;
  lastUpdated?: string;
  updatedAt?: string;
  createdAt?: string;
  farmerId?: string;
  crop?: string;
  cropContext?: string;
  language?: string;
  messagesCount?: number;
  messages: AIChatMessage[];
}

// 1. My Crops Module
export interface CropLifecycleItem {
  id: string;
  cropName: string;
  hindiName: string;
  variety: string;
  sowingDate: string;
  areaAcres: number;
  stage: 'Sowing / Seedling' | 'Vegetative' | 'Flowering & Pod Initiation' | 'Grain Filling / Boll Dev' | 'Maturity & Harvesting';
  stageProgressPct: number;
  healthScore: number; // 0-100
  expectedHarvestDate: string;
  expectedYieldQuintals: number;
  soilMoistureStatus: 'OPTIMAL' | 'MODERATE' | 'DEFICIENT' | 'EXCESS';
  pestVulnerability: 'LOW' | 'MEDIUM' | 'HIGH';
  pestWatchlist: string[];
  recentAction: string;
  imageUrl: string;
  harvestReminder?: {
    enabled: boolean;
    reminderDaysBefore: number[]; // e.g. [7, 3, 1]
    channel: 'push' | 'sms' | 'voice' | 'all';
    scheduledDate: string;
  };
}

// 2. Disease Scanner Module
export interface DiseaseScanImageQuality {
  clarity: 'GOOD' | 'POOR' | 'EXCELLENT';
  lighting: 'GOOD' | 'POOR' | 'OPTIMAL';
  cropVisibility: 'CLEAR' | 'OBSCURED';
  leafVisibility: 'CLEAR' | 'OBSCURED';
  resolution: string;
  passed: boolean;
  issues?: string[];
  suggestions?: string[];
}

export interface DiseaseDifferentialPossibility {
  issue: string;
  probabilityPct: number;
  isPrimary?: boolean;
  category?: 'Fungal' | 'Bacterial' | 'Viral' | 'Nutrient' | 'Pest' | 'Abiotic';
}

export interface ChemicalTreatmentItem {
  name: string;
  activeIngredient: string;
  dosage: string;
  sprayGuidelines: string;
  waitingPeriodDays: string | number;
  safetyPrecautions: string;
  estimatedCost?: string;
}

export interface OrganicTreatmentItem {
  name: string;
  bioAgentOrBotanical: string;
  dosage: string;
  preparationMethod: string;
  soilOrFoliar: 'Foliar Spray' | 'Soil Drench' | 'Seed Treatment' | 'Bio-Formulation';
  ecoBenefit: string;
  estimatedCost?: string;
}

export interface DiseaseApplicationTiming {
  bestTimeOfDay: string;
  timingReason: string;
  growthStage: string;
  weatherConditions: {
    temperatureRange: string;
    windSpeedLimit: string;
    rainfastnessHours: string;
    humidityWindow?: string;
  };
  sprayIntervalDays: string;
  expectedRecoveryTimeline: {
    day1to2: string;
    day4to5: string;
    day7to10: string;
  };
}

export interface DoctorReportCard {
  reportId: string;
  generatedAt: string;
  patientCrop: {
    farmerName: string;
    villageOrLocation: string;
    fieldPlotName: string;
    cropType: string;
    variety?: string;
    growthStage: string;
    affectedAcreagePct?: string;
  };
  clinicalDiagnosis: {
    primaryDisease: string;
    pathogenScientificName: string;
    diseaseCategory: 'Fungal' | 'Bacterial' | 'Viral' | 'Nutrient' | 'Pest' | 'Abiotic';
    severityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'MEDIUM';
    confidenceScore: number;
    diagnosticSymptoms: string[];
    probableCauses: string[];
  };
  treatmentPrescription: {
    organicProtocol: string[];
    chemicalProtocol: string[];
    criticalTimingRule: string;
    preHarvestInterval: string;
  };
  doctorReviewSection: {
    reviewStatus: 'PENDING_OFFICER_REVIEW' | 'VERIFIED' | 'FOLLOW_UP_REQUIRED';
    doctorNotesPlaceholder: string;
    nextInspectionDate: string;
    kvkExtensionCenter: string;
  };
}

export interface DiseaseScanResult {
  id: string;
  cropName: string;
  patchId?: string;
  patchName?: string;
  detectedCrop?: string;
  pathogen: string;
  possibleDisease?: string;
  hindiName?: string;
  confidenceScore: number;
  confidenceExplanation?: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'MEDIUM';
  symptoms: string[];
  causes?: string[];
  recommendedAction?: string[];
  recommendedChemical?: string[];
  recommendedOrganic?: string[];
  chemicalTreatments?: ChemicalTreatmentItem[];
  organicTreatments?: OrganicTreatmentItem[];
  applicationTiming?: DiseaseApplicationTiming;
  doctorReportCard?: DoctorReportCard;
  preventionSteps: string[];
  differentialPossibilities?: DiseaseDifferentialPossibility[];
  imageQuality?: DiseaseScanImageQuality;
  clusterAdvisory?: string;
  advisoryDisclaimer?: string;
  scannedAt: string;
  sampleImageUrl?: string;
  isDemo?: boolean;
  farmerId?: string;
}

export type PatchHealthStatus = 'HEALTHY' | 'UNDER_OBSERVATION' | 'TREATMENT_ACTIVE' | 'RECOVERING' | 'CRITICAL';

export type PatchTimelineEventType = 
  | 'INITIAL_SCAN' 
  | 'FOLLOWUP_SCAN' 
  | 'TREATMENT_SPRAY' 
  | 'SOIL_APPLICATION' 
  | 'IRRIGATION_FLUSH' 
  | 'EXPERT_ADVISORY' 
  | 'RECOVERY_VERIFIED';

export interface PatchTimelineEvent {
  id: string;
  patchId: string;
  date: string;
  time?: string;
  type: PatchTimelineEventType;
  title: string;
  hindiTitle?: string;
  description: string;
  hindiDescription?: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'HEALTHY';
  healthScore: number; // 0-100
  recoveryRatePct?: number; // 0-100%
  pathogenOrIssue?: string;
  treatmentDetails?: {
    productName: string;
    treatmentType: 'Chemical' | 'Organic' | 'Biological' | 'Cultural';
    dosage: string;
    costInr?: number;
    applicator?: string;
    weatherCondition?: string;
  };
  imageUrl?: string;
  imageThumbnailUrl?: string;
  scanResultId?: string;
  recordedBy: 'AI_SCANNER' | 'FARMER' | 'AGRONOMIST_KVK';
  notes?: string;
  nextScheduledFollowUpDate?: string;
}

export interface CropPatch {
  id: string;
  name: string;
  hindiName?: string;
  cropName: string;
  variety: string;
  areaAcres: number;
  locationLabel: string;
  soilType: string;
  sowingDate: string;
  currentStatus: PatchHealthStatus;
  currentHealthScore: number; // 0-100
  initialInfectionDate?: string;
  activePathogen?: string;
  activePathogenHindi?: string;
  baselineSeverity?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  currentSeverity?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'HEALTHY';
  overallRecoveryPct: number; // 0-100%
  nextActionDate?: string;
  nextActionTitle?: string;
  initialImageUrl?: string;
  latestImageUrl?: string;
  timelineEvents: PatchTimelineEvent[];
}

// 3. Smart Irrigation & IoT Sensors
export interface IoTSensor {
  id: string;
  name: string;
  type: 'SOIL_MOISTURE' | 'SOIL_TEMPERATURE' | 'CANOPY_HUMIDITY' | 'SOIL_EC' | 'SOIL_PH';
  label: string;
  value: number;
  unit: string;
  status: 'ONLINE' | 'DELAYED' | 'OFFLINE';
  lastReadingTime: string;
  batteryPct: number;
  depthCm?: number;
  location: string;
  isDemo: boolean;
  optimalRange: string;
  interpretation: string;
  statusColor: 'green' | 'amber' | 'rose';
}

export interface IrrigationRecord {
  id: string;
  date: string;
  dateLabel: string;
  durationMinutes: number;
  waterVolumeLitres: number;
  crop: string;
  fieldName: string;
  method: string;
  pumpType: string;
  status: 'COMPLETED' | 'SCHEDULED' | 'SKIPPED_RAIN';
  loggedBy: 'AUTO_AI' | 'MANUAL';
  notes: string;
  savedToDiary?: boolean;
}

export interface WaterAnalytics {
  dailyUsage: { day: string; date: string; usedLitres: number; baselineLitres: number; savedLitres: number }[];
  weeklyUsage: { week: string; usedLitres: number; savedLitres: number }[];
  totalUsedWeekLitres: number;
  totalSavedWeekLitres: number;
  estimatedCostSavedInr: number;
  pumpRunHoursThisWeek: number;
}

export interface SmartIrrigationStatus {
  soilMoisturePct: number;
  rootZoneCondition: 'Moist / Adequate' | 'Moderate Depletion' | 'Critical Stress' | 'Saturated';
  cropGrowthStage: string;
  activeCropName?: string;
  temperatureC?: number;
  rainForecast48hPct: number;
  irrigationRequired: boolean;
  decisionTitle?: string;
  recommendedDurationMinutes: number;
  decisionReason: string;
  bestIrrigationTime: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  pumpStatus: 'IDLE' | 'RUNNING' | 'SCHEDULED';
  waterSavedThisMonthLitres: number;
  waterStatusScore?: number;
  scoreBreakdown?: {
    soilMoisture: 'Good' | 'Moderate' | 'Low' | 'Critical';
    rainForecast: 'Good' | 'Moderate' | 'High' | 'Delay Active';
    cropDemand: 'Low' | 'Moderate' | 'High';
    temperature: 'Normal' | 'Moderate' | 'High';
  };
  estimatedWaterRequirementLitresPerAcre?: number;
  lastIrrigationText?: string;
  hourlyMoistureCurve: { time: string; moisturePct: number; thresholdPct: number }[];
  sensors?: IoTSensor[];
  history?: IrrigationRecord[];
  analytics?: WaterAnalytics;
  isDemoSensorMode?: boolean;
}

// 4. Soil Health Module
export interface NutrientMetric {
  name: string;
  hindiName: string;
  symbol: string;
  currentValue: number;
  unit: string;
  idealRange: string;
  status: 'Good' | 'Moderate' | 'Needs Attention';
  statusColor: 'green' | 'amber' | 'rose';
  recommendation: string;
  soilContextNote?: string;
}

export interface SoilHealthData {
  farmerName: string;
  village: string;
  district?: string;
  state?: string;
  sampleId: string;
  testDate: string;
  soilHealthScore: number; // 0-100
  scoreClassification?: 'Optimal Fertility' | 'Good Fertility Index' | 'Moderate Soil Stress' | 'Degraded';
  soilType: string;
  soilPh: number;
  phStatus: 'Acidic' | 'Neutral' | 'Slightly Alkaline' | 'Alkaline';
  phIdealRange?: string;
  organicCarbonPct: number;
  organicCarbonStatus: 'Low' | 'Medium' | 'High';
  organicCarbonIdealRange?: string;
  nitrogenKgHa: number;
  nitrogenStatus: 'Low' | 'Medium' | 'High';
  nitrogenIdealRange?: string;
  phosphorusKgHa: number;
  phosphorusStatus: 'Low' | 'Medium' | 'High';
  phosphorusIdealRange?: string;
  potassiumKgHa: number;
  potassiumStatus: 'Low' | 'Medium' | 'High';
  potassiumIdealRange?: string;
  electricalConductivityDsM: number;
  micronutrients: { name: string; value: string; status: 'Adequate' | 'Deficient'; ideal?: string }[];
  organicRejuvenationPlan: string[];
  chemicalFertilizerRecommendations: string[];
  lastUpdated?: string;
  isVerified?: boolean;
  documentUrl?: string;
}

export interface SoilRecordHistoryItem {
  id: string;
  year: number;
  testDate: string;
  sampleId: string;
  labName: string;
  overallScore: number;
  soilHealthScore?: number;
  testedBy?: string;
  ph?: number;
  soilType: string;
  soilPh: number;
  organicCarbonPct: number;
  nitrogenKgHa: number;
  phosphorusKgHa: number;
  potassiumKgHa: number;
  electricalConductivityDsM: number;
  status: 'Verified' | 'Self-Reported' | 'OCR-Extracted';
  notes?: string;
  documentUrl?: string;
}

export interface SoilImprovementPlanItem {
  id: string;
  category: 'Organic Matter' | 'Crop Rotation' | 'Nutrient Balance' | 'Nutrient Management' | 'Irrigation & Drainage' | 'Fertilizer Reduction' | 'Soil Testing' | string;
  title: string;
  description: string;
  actionSteps?: string[];
  timeline?: string;
  timeframe?: string;
  impactLevel?: 'High' | 'Medium' | 'Essential' | string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dosageOrMethod?: string;
  expectedOutcome?: string;
  estimatedCostInr?: number;
  recommendedInputs?: string[];
}

export interface SoilCropSuitabilityInsight {
  suitableCrops: {
    cropName: string;
    hindiName: string;
    matchScore?: number;
    suitabilityScore?: number;
    reason: string;
  }[];
  highlySuitableCrops?: {
    cropName: string;
    hindiName: string;
    suitabilityScore: number;
    reason: string;
  }[];
  lessSuitableCrops: {
    cropName: string;
    hindiName: string;
    concern?: string;
    constraint?: string;
    remedyIfGrown?: string;
    requiredModification?: string;
  }[];
  soilTexture?: string;
  waterRetentionCapacity?: string;
  infiltrationRate?: string;
  irrigationRecommendation?: string;
}

// 5. Market Prices Module
export interface MandiPriceRecord {
  id: string;
  crop: string;
  variety: string;
  mandi: string;
  district: string;
  state: string;
  minPricePerQuintal: number;
  maxPricePerQuintal: number;
  modalPricePerQuintal: number;
  priceChangeDailyPct: number;
  dailyArrivalQuintals: number;
  distanceKm: number;
  date: string;
  isBestMandi?: boolean;
  priceTrend: { date: string; price: number }[];
}

// 6. Profit Calculator Module
export interface ProfitCalculationInput {
  cropName: string;
  farmSizeAcres: number;
  seedCostPerAcre: number;
  fertilizerCostPerAcre: number;
  pesticideCostPerAcre: number;
  labourCostPerAcre: number;
  irrigationPowerCostPerAcre: number;
  machineryRentalCostPerAcre: number;
  otherMiscCostPerAcre: number;
  expectedYieldQuintalsPerAcre: number;
  expectedSellingPricePerQuintal: number;
}

export interface ProfitCalculationResult {
  totalInvestment: number;
  totalCostPerAcre: number;
  expectedGrossRevenue: number;
  netProfit: number;
  netProfitPerAcre: number;
  returnOnInvestmentPct: number;
  breakEvenYieldQuintalsPerAcre: number;
  breakEvenPricePerQuintal: number;
  costBreakdown: { category: string; amount: number; percentage: number }[];
}

// 7. Crop Recommendation Engine
export interface CropLifecycleStageAction {
  stage: string;
  hindiStage?: string;
  daysRange: string;
  title: string;
  description: string;
  recommendedActions: string[];
  waterAdvice: string;
  nutritionAdvice: string;
  pestVigilance: string;
  iconName?: string;
}

export interface CropDiseaseGuide {
  name: string;
  hindiName?: string;
  symptoms: string;
  organicRemedy: string;
  chemicalSpray: string;
  prevention: string;
}

export interface CropPestGuide {
  name: string;
  hindiName?: string;
  symptoms: string;
  ipmControl: string;
  thresholdAction: string;
}

export interface CropDetail {
  id: string;
  cropName: string;
  hindiName: string;
  scientificName?: string;
  variety: string;
  suitabilityScore: number; // 0-100%
  expectedYieldPerAcre: string; // e.g. "18 - 22 Quintals"
  expectedYieldQuintals: number;
  estimatedCostPerAcre: number;
  potentialRevenuePerAcre: number;
  estimatedProfitPerAcre: number;
  waterRequirement: 'Low' | 'Medium' | 'High' | 'Low (Rainfed / Drip)' | 'High (Canal / Flood)';
  waterRequirementDetail: string;
  durationDays: number;
  marketRisk: 'Low' | 'Medium' | 'Moderate' | 'High';
  bestSeason: 'Kharif' | 'Rabi' | 'Zaid' | 'Multi-Season';
  suitableSoils: string[];
  suitableClimate: string;
  sowingPeriod: string;
  whyThisCrop: string;
  overview: string;
  growthStages: CropLifecycleStageAction[];
  nutrientRequirements: {
    basal: string;
    topDressing: string;
    micronutrients: string;
  };
  commonDiseases: CropDiseaseGuide[];
  commonPests: CropPestGuide[];
  harvestIndicators: string[];
  storageConsiderations: string[];
  marketInformation: {
    currentMandiPricePerQuintal: number;
    mspPricePerQuintal?: number;
    demandTrend: 'Strong Bullish' | 'High & Stable' | 'Moderate' | 'Volatile';
    topBuyers: string;
    exportDemand: string;
  };
  keySuccessTips: string[];
  governmentSubsidiesAvailable: string[];
  imageUrl: string;
}

export type CropRecommendationItem = CropDetail;

export type MicronutrientMetric = { name: string; value: string; status: 'Adequate' | 'Deficient'; ideal?: string };

export type FarmingGoalType = 'Maximum Profit' | 'Low Water Requirement' | 'Low Risk' | 'Short Duration' | 'High Yield' | 'Sustainable Farming' | string;
export type AvailableWaterLevel = 'Low' | 'Moderate' | 'Abundant' | string;
export type IrrigationMethodType = 'Drip' | 'Sprinkler' | 'Flood' | 'Rainfed' | string;
export type CropSeasonType = 'Kharif' | 'Rabi' | 'Zaid' | 'All' | 'Auto-Detected' | string;

export interface CropCatalogItem {
  id: string;
  cropName: string;
  hindiName: string;
  scientificName: string;
  variety: string;
  season: string;
  durationDays: number;
  averageYieldQuintalsPerAcre: number;
  estimatedCostPerAcreInr: number;
  estimatedRevenuePerAcreInr: number;
  estimatedNetProfitPerAcreInr: number;
  waterRequirement: string;
  soilPhRange: string;
  suitableSoilTypes: string[];
  description: string;
  imageUrl: string;
  stages: {
    stageName: string;
    startDay: number;
    endDay: number;
    description: string;
    waterAdvice: string;
    nutritionAdvice: string;
  }[];
  fertilizerPlan: {
    nitrogenKgAcre: number;
    phosphorusKgAcre: number;
    potassiumKgAcre: number;
    basalDose: string;
    topDressing: string;
    micronutrients: string;
  };
  diseases: {
    name: string;
    symptoms: string;
    organicControl: string;
    chemicalControl: string;
  }[];
  pests: {
    name: string;
    symptoms: string;
    ipmControl: string;
    chemicalSpray: string;
  }[];
  harvestIndicators: string[];
  postHarvestStorage: string;
  mandiPriceReference: string;
  mspSupport: boolean;
  mspPriceInr?: number;
  marketHubs: string[];
}

export interface CropRecommendationResultItem {
  cropId: string;
  cropName: string;
  hindiName: string;
  variety: string;
  season: string;
  suitabilityScore: number;
  expectedYieldRange: string;
  estimatedCostPerAcreInr: number;
  estimatedRevenuePerAcreInr: number;
  estimatedNetProfitPerAcreInr: number;
  durationDays: string;
  waterRequirement: string;
  marketRisk: string;
  soilCompatibility: string;
  sowingWindow: string;
  reasons: string[];
  mandiPriceReference?: string;
}

export interface CropRecommendationInput {
  state: string;
  district: string;
  village: string;
  gpsCoordinates?: { lat: number; lng: number };
  farmSizeAcres: number;
  availableWater: 'Low' | 'Moderate' | 'Abundant' | string;
  irrigationType: 'Drip' | 'Sprinkler' | 'Flood' | 'Rainfed' | string;
  farmingExperience: 'Beginner (<3 yrs)' | 'Intermediate (3-10 yrs)' | 'Expert (>10 yrs)' | string;
  budgetPerAcre: number;
  soilType: string;
  soilPh?: number;
  nitrogen?: number | string;
  nitrogenKgHa?: number;
  phosphorus?: number | string;
  phosphorusKgHa?: number;
  potassium?: number | string;
  potassiumKgHa?: number;
  organicCarbon?: number | string;
  organicCarbonPct?: number;
  unknownSoilDetails?: boolean;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'All' | 'Auto-Detected' | string;
  farmingGoal: 'Maximum Profit' | 'Low Water Requirement' | 'Low Risk' | 'Short Duration' | 'High Yield' | 'Sustainable Farming' | string;
}

export interface CropRecommendationResult {
  topCrops: CropDetail[];
  topRecommendations?: CropRecommendationResultItem[];
  aiAdvice: {
    kishanBhaiAdvice?: string;
    kisanBhaiAdvice?: string;
    whyReasons: string[];
    topPickName: string;
    seasonalNote: string;
    resourceAlignment: string;
  };
  aiExplanation?: string;
  district?: string;
  season?: string;
  farmingGoal?: string;
  inputSummary: CropRecommendationInput;
  timestamp: string;
  isDemo?: boolean;
}

export interface CropComparisonItem {
  crop: CropDetail;
  metrics: {
    suitabilityScore: number;
    estimatedCostPerAcre: number;
    expectedYieldPerAcre: string;
    potentialRevenuePerAcre: number;
    estimatedProfitPerAcre: number;
    waterRequirement: string;
    durationDays: number;
    marketRisk: string;
  };
}

// 8. Government Schemes
export interface GovernmentScheme {
  id: string;
  name: string;
  hindiName: string;
  ministry: string;
  category: 'Direct Income Support' | 'Crop Insurance' | 'Credit & Loan' | 'Irrigation Subsidy' | 'Organic & Soil' | 'Farm Mechanization' | string;
  benefitSummary: string;
  financialAssistance: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  applicationProcess: string[];
  officialPortalUrl: string;
  isVerifiedOfficial: boolean;
  stateAvailability: string; // 'All India' or specific state (e.g., 'Gujarat', 'Assam', 'Maharashtra', 'Uttar Pradesh')
  isStateExclusive?: boolean; // true if funded directly by State Government
  applicableStates?: string[]; // e.g. ['Gujarat', 'All India']
  stateRecommendationBadge?: string; // e.g. '⭐ Top Recommended for Gujarat Farmers'
  stateSpecificBenefit?: string; // State-specific top-up or special grant rule
  stateDepartment?: string; // e.g. 'Gujarat Agro Industries / iKhedut' or 'Assam Directorate of Agriculture'
  statePortalUrl?: string; // Official state application portal
  applicationStartDate?: string;
  applicationDeadline?: string;
  applicationStatus?: 'Open' | 'Closing Soon' | 'Year-round Open' | 'Upcoming Window' | 'Closed';
  daysRemaining?: number;
  nextInstallmentDate?: string;
  disbursementCycle?: string;
  liveBeneficiaries?: string;
  portalStatus?: 'Active' | 'Under Maintenance' | 'High Traffic';
  lastUpdated?: string;
}

export interface StateSchemeIntelligence {
  state: string;
  stateHindi: string;
  officialPortalName: string;
  officialPortalUrl: string;
  helplineNumber: string;
  primaryNodalDepartment: string;
  stateTopBenefitHighlight: string;
  recommendedFocusCrops: string[];
  exclusiveSchemesCount: number;
  totalAvailableSchemesCount: number;
  subsidyAlert: string;
}

export interface SchemeApplication {
  id: string;
  schemeId: string;
  schemeName: string;
  farmerName: string;
  applicationDate: string; // Exact Date of Application
  acknowledgementNumber: string;
  appliedAmountOrBenefit?: string;
  status: 'Submitted' | 'Document Verification' | 'Tehsil Approved' | 'Disbursed' | 'Action Required';
  currentStage: number;
  remarks: string;
  lastUpdated: string;
}

// 9. Farm Diary
export interface FarmDiaryEntry {
  id: string;
  date: string;
  category: 'Sowing' | 'Irrigation' | 'Fertilizer' | 'Pesticide' | 'Disease & Pest' | 'Expense' | 'Harvest' | 'Sales' | string;
  crop: string;
  title: string;
  quantityOrDose?: string;
  expenseAmountInr?: number;
  incomeAmountInr?: number;
  revenueAmountInr?: number;
  notes: string;
  imageUrl?: string;
  syncedWithCloud: boolean;
}
export type FarmDiaryRecord = FarmDiaryEntry;

// 10. Community Module
export type CommunityPostType = 'DISCUSSION' | 'QUESTION' | 'TIP' | 'ANNOUNCEMENT';

export interface CommunityComment {
  id: string;
  postId?: string;
  authorId?: string;
  authorName: string;
  authorRole?: string;
  village?: string;
  authorVillage?: string;
  authorAvatar?: string;
  content: string;
  likesCount?: number;
  likedUserIds?: string[];
  isHelpful?: boolean;
  parentId?: string;
  replies?: CommunityComment[];
  createdAt: string;
  updatedAt?: string;
}

export interface CommunityPost {
  id: string;
  authorId?: string;
  authorName: string;
  authorVillage?: string;
  authorDistrict?: string;
  authorState?: string;
  authorRole?: 'Farmer' | 'Village Champion' | 'KVK Agronomist' | string;
  authorAvatar?: string;
  authorBadge?: string;
  groupId?: string;
  groupName?: string;
  title?: string;
  content: string;
  category: 'Crop Advice' | 'Pest Outbreak' | 'Machinery Sharing' | 'Market Trends' | 'Success Story' | string;
  cropTag?: string;
  tags?: string[];
  imageUrl?: string;
  images?: string[];
  postType?: CommunityPostType;
  poll?: CommunityPoll;
  likesCount: number;
  commentsCount: number;
  repliesCount?: number;
  comments?: CommunityComment[];
  likedUserIds?: string[];
  savedUserIds?: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  isPinned?: boolean;
  isHelpfulAnswered?: boolean;
  createdAt: string;
}
export type CommunityPostItem = CommunityPost;

// 11. Talk to Expert (KVK / ICAR)
export interface ExpertProfile {
  id: string;
  name: string;
  designation: string;
  organization: string;
  institution?: string;
  specialty: string;
  specialization?: string;
  experienceYears: number;
  rating: number;
  totalConsultations: number;
  languages: string[];
  isOnline: boolean;
  isAvailableNow?: boolean;
  availableSlot: string;
  phone: string;
  avatarUrl?: string;
}
export type ExpertConsultant = ExpertProfile;

// 12. Farm Alerts
export interface FarmAlert {
  id: string;
  title: string;
  hindiTitle?: string;
  category: 'WEATHER_ALERT' | 'PEST_OUTBREAK' | 'IRRIGATION_REMINDER' | 'MANDI_SPIKE' | 'SCHEME_DEADLINE' | 'WEATHER' | 'PEST' | 'MARKET' | 'IRRIGATION' | 'GOVERNMENT' | string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  description: string;
  actionTitle?: string;
  actionLabel?: string;
  targetView?: string;
  actionUrl?: string;
  isRead: boolean;
}
export type FarmAlertItem = FarmAlert;


export interface FarmerProfileData {
  name: string;
  mobile: string;
  state: string;
  district: string;
  village: string;
  farmSizeAcres: number;
  soilType: string;
  mainCrop: string;
  preferredLanguage: string;
}

// ==========================================
// 13. Village Champion Verification System
// ==========================================

export type ChampionVerificationStatus =
  | 'REGISTERED'
  | 'IDENTITY_PENDING'
  | 'DOCUMENTS_PENDING'
  | 'FACE_VERIFICATION_PENDING'
  | 'DESIGNATION_VERIFICATION_PENDING'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type ChampionDesignation =
  | 'SARPANCH'
  | 'UP_SARPANCH'
  | 'GRAM_PANCHAYAT_SECRETARY'
  | 'WARD_MEMBER'
  | 'AUTHORIZED_PANCHAYAT_REP';

export interface VillageChampionRegistrationData {
  userId: string;
  legalFullName: string;
  mobile: string;
  email: string;
  state: string;
  district: string;
  block: string;
  villageName: string;
  gramPanchayatName: string;
  designation: ChampionDesignation;
  gramPanchayatIdNumber?: string;
  panchayatOfficeAddress?: string;
  agreedToTerms: boolean;
  termsAgreedAt: string;
}

export interface ChampionIdentityCheck {
  provider: 'AUTHORIZED_AADHAAR_GATEWAY' | 'DIGILOCKER_SANDBOX' | 'OFFICIAL_GOV_ID';
  idType: 'AADHAAR_MASKED' | 'VOTER_ID' | 'PAN' | 'GOV_EMPLOYEE_ID';
  maskedId: string; // Strictly masked e.g. "XXXX-XXXX-8921"
  providerTxnRef: string;
  consentObtained: boolean;
  consentTimestamp: string;
  verifiedAt: string;
  status: 'VERIFIED' | 'FAILED' | 'PENDING';
  remarks?: string;
}

export interface ChampionDocument {
  id: string;
  docType: 'ELECTION_CERTIFICATE' | 'GOV_AUTHORIZATION_LETTER' | 'PANCHAYAT_RESOLUTION' | 'OFFICIAL_ID_CARD';
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  secureViewToken: string;
  status: 'PENDING' | 'VALID' | 'REJECTED' | 'RESUBMISSION_REQUESTED';
  remarks?: string;
}

export interface ChampionFaceVerification {
  provider: 'LIVENESS_FACE_MATCH_AI';
  livenessPassed: boolean;
  livenessConfidence: number; // e.g. 0.98 (98%)
  faceMatchScore: number; // e.g. 0.95 (95%)
  spoofDetected: boolean;
  selfieCaptureTimestamp: string;
  verifiedAt: string;
  status: 'VERIFIED' | 'FAILED' | 'MANUAL_REVIEW_REQUIRED';
  remarks?: string;
}

export interface ChampionDesignationCheck {
  officialSourceChecked: 'E_GRAM_SWARAJ' | 'PANCHAYAT_RAJ_DIRECTORY' | 'DISTRICT_COLLECTORATE_RECORD';
  crossReferenceMatched: boolean;
  gramPanchayatConfirmed: string;
  tenurePeriod: string; // e.g. "2021 - 2026"
  status: 'VERIFIED' | 'MANUAL_VERIFICATION_REQUIRED' | 'DISCREPANCY_FLAGGED';
  verifiedAt?: string;
  remarks?: string;
}

export interface ChampionAuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  previousStatus: ChampionVerificationStatus;
  newStatus: ChampionVerificationStatus;
  reason?: string;
  notes?: string;
}

export interface ChampionVerificationRequest {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  status: ChampionVerificationStatus;
  currentStep: number; // 1 to 7
  registrationData: VillageChampionRegistrationData;
  identityCheck?: ChampionIdentityCheck;
  documents: ChampionDocument[];
  faceVerification?: ChampionFaceVerification;
  designationCheck?: ChampionDesignationCheck;
  adminDecision?: {
    decidedBy: string;
    decidedAt: string;
    decision: 'APPROVED' | 'REJECTED' | 'RESUBMISSION_REQUESTED' | 'SUSPENDED' | 'MANUAL_REVIEW';
    reason?: string;
    adminNotes?: string;
  };
  auditLogs: ChampionAuditLogEntry[];
}

// ----------------------------------------------------
// KISHAN COMMUNITY — FARMERS TOGETHER DATA MODELS
// ----------------------------------------------------

export type CommunityGroupCategory =
  | 'Rice Farming'
  | 'Wheat Farming'
  | 'Cotton Farming'
  | 'Vegetable Farming'
  | 'Organic Farming'
  | 'Dairy Farming'
  | 'Modern Farming Technology'
  | 'Agricultural Business'
  | 'Irrigation and Water Management'
  | 'Pest and Disease Management'
  | 'General Farmer Discussion'
  | string;

export interface GroupResourceItem {
  id: string;
  title: string;
  type: 'PDF' | 'GUIDE' | 'VIDEO' | 'SCHEME';
  description: string;
  url?: string;
}

export interface FarmerCommunityGroup {
  id: string;
  name: string;
  description: string;
  category: CommunityGroupCategory;
  location: string;
  cropInterest: string;
  imageUrl?: string;
  isPrivate: boolean;
  rules?: string[];
  ownerId: string;
  ownerName: string;
  moderatorIds: string[];
  memberIds: string[];
  memberCount: number;
  pendingRequestIds?: string[];
  pinnedPostIds?: string[];
  resources?: GroupResourceItem[];
  createdAt: string;
}

export interface CommunityPollOption {
  id: string;
  text: string;
  votes: number;
  votedUserIds: string[];
}

export interface CommunityPoll {
  id: string;
  question: string;
  options: CommunityPollOption[];
  totalVotes: number;
}

export interface ContentReport {
  id: string;
  targetType: 'POST' | 'COMMENT';
  targetId: string;
  reportedBy: string;
  reporterName?: string;
  reason: 'MISINFORMATION_HARMFUL' | 'SPAM_SCAM' | 'INAPPROPRIATE_LANGUAGE' | 'OFF_TOPIC' | 'OTHER';
  details?: string;
  createdAt: string;
}

