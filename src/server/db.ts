/**
 * In-memory resilient Database for Kishan Bhai
 * Clean state with 0 mock/demo records.
 */

import {
  UserProfile,
  VirtualCluster,
  BulkOrderRequirement,
  MachineryItem,
  HarvestPoolLot,
  BuyerPurchaseRequest,
  TransactionRecord,
  ApiBudgetStats,
  AIConversationSession,
  DiseaseScanResult,
  CropDetail,
  CropRecommendationResult,
  SoilHealthData,
  SoilRecordHistoryItem,
  ClusterChatMessage,
  SharedClusterCart,
  SharedCartItem,
  SharedCartItemContributor,
  ChampionVerificationRequest,
  ChampionVerificationStatus,
  ChampionDesignation,
} from '../../shared/types.js';
import {
  CROP_RECOMMENDATIONS_DATABASE,
  INITIAL_SOIL_HEALTH,
  INITIAL_SOIL_HISTORY,
} from '../data/agriData.js';

class InMemoryDB {
  users: Map<string, UserProfile> = new Map();
  championVerifications: Map<string, ChampionVerificationRequest> = new Map();
  clusters: Map<string, VirtualCluster> = new Map();
  clusterChatMessages: Map<string, ClusterChatMessage[]> = new Map();
  sharedCarts: Map<string, SharedClusterCart> = new Map();
  bulkRequirements: Map<string, BulkOrderRequirement> = new Map();
  machinery: Map<string, MachineryItem> = new Map();
  harvestLots: Map<string, HarvestPoolLot> = new Map();
  purchaseRequests: Map<string, BuyerPurchaseRequest> = new Map();
  transactions: Map<string, TransactionRecord> = new Map();
  conversations: Map<string, AIConversationSession> = new Map();
  diseaseScans: Map<string, DiseaseScanResult> = new Map();
  crops: Map<string, CropDetail> = new Map();
  cropRecommendations: Map<string, CropRecommendationResult> = new Map();
  soilHealth: Map<string, SoilHealthData> = new Map();
  soilRecords: Map<string, SoilRecordHistoryItem> = new Map();
  appointments: Map<string, any> = new Map();
  usedTxHashes: Set<string> = new Set();
  
  budgetStats: ApiBudgetStats = {
    monthlyLimitInr: 1500,
    currentUsageInr: 0,
    remainingBudgetInr: 1500,
    totalApiRequests: 0,
    cachedRequestsSaved: 0,
    modelInUse: 'gemini-3.7-flash',
    breakdown: {
      geminiAiInr: 0,
      weatherApiInr: 0,
      algorandNodeInr: 0,
    },
  };

  constructor() {
    this.seedRealWorldData();
  }

  public clearAllData() {
    this.users.clear();
    this.championVerifications.clear();
    this.clusters.clear();
    this.bulkRequirements.clear();
    this.machinery.clear();
    this.harvestLots.clear();
    this.purchaseRequests.clear();
    this.transactions.clear();
    this.conversations.clear();
    this.diseaseScans.clear();
    this.crops.clear();
    this.cropRecommendations.clear();
    this.soilHealth.clear();
    this.soilRecords.clear();
    this.usedTxHashes.clear();
    this.budgetStats = {
      monthlyLimitInr: 1500,
      currentUsageInr: 0,
      remainingBudgetInr: 1500,
      totalApiRequests: 0,
      cachedRequestsSaved: 0,
      modelInUse: 'gemini-3.7-flash',
      breakdown: {
        geminiAiInr: 0,
        weatherApiInr: 0,
        algorandNodeInr: 0,
      },
    };
  }

  public seedRealWorldData() {
    this.clearAllData();

    // 0. Seed Crops & Soil Intelligence
    CROP_RECOMMENDATIONS_DATABASE.forEach((crop) => {
      this.crops.set(crop.id, crop);
    });

    this.soilHealth.set('usr_farmer_ramesh', INITIAL_SOIL_HEALTH);
    INITIAL_SOIL_HISTORY.forEach((rec) => {
      this.soilRecords.set(rec.id, rec);
    });

    // 1. Initial Verified Users
    const u1: UserProfile = {
      id: 'usr_farmer_ramesh',
      fullName: 'Ramesh Patel',
      email: 'ramesh.patel@kishanbhai.in',
      phone: '+91 98251 44320',
      role: 'FARMER',
      village: 'Anandpur',
      state: 'Gujarat',
      verified: true,
      farmSizeAcres: 4.5,
      crops: ['Cotton (Bt)', 'Groundnut (TG-37A)', 'Wheat (Sharbati)'],
      preferredLanguage: 'hi',
      createdAt: '2026-06-15T08:30:00Z',
    };

    const u2: UserProfile = {
      id: 'usr_champ_vikram',
      fullName: 'Vikramsinh Jadeja',
      email: 'vikram.jadeja@kishanbhai.in',
      phone: '+91 97240 88192',
      role: 'CHAMPION',
      village: 'Anandpur Hub',
      state: 'Gujarat',
      verified: true,
      farmSizeAcres: 8.0,
      crops: ['Cotton', 'Cumin', 'Wheat'],
      preferredLanguage: 'hi',
      createdAt: '2026-05-10T11:00:00Z',
    };

    const u3: UserProfile = {
      id: 'usr_buyer_itc',
      fullName: 'Arunav Sengupta (ITC Agri Sourcing)',
      email: 'arunav.sengupta@itc.in',
      phone: '+91 98110 55432',
      role: 'BUYER',
      village: 'Ahmedabad APMC Hub',
      state: 'Gujarat',
      verified: true,
      preferredLanguage: 'en',
      createdAt: '2026-05-20T14:15:00Z',
    };

    // Candidate Village Champion: Anita Devi (Awaiting final approval / under review)
    const u4: UserProfile = {
      id: 'usr_champ_anita',
      fullName: 'Anita Devi',
      email: 'anita.devi@kishanbhai.in',
      phone: '+91 98123 45678',
      role: 'CHAMPION',
      village: 'Anandpur',
      district: 'Rajkot',
      state: 'Gujarat',
      verified: false, // Locked until verification approved!
      farmSizeAcres: 6.0,
      crops: ['Cotton', 'Groundnut'],
      preferredLanguage: 'hi',
      createdAt: '2026-08-01T10:00:00Z',
    };

    this.users.set(u1.id, u1);
    this.users.set(u2.id, u2);
    this.users.set(u3.id, u3);
    this.users.set(u4.id, u4);

    // Seed Champion Verification Requests
    // 1) Vikramsinh Jadeja - Approved
    const reqVikram: ChampionVerificationRequest = {
      id: 'cv_req_vikram_01',
      userId: u2.id,
      createdAt: '2026-05-10T11:00:00Z',
      updatedAt: '2026-05-12T14:30:00Z',
      status: 'APPROVED',
      currentStep: 7,
      registrationData: {
        userId: u2.id,
        legalFullName: 'Vikramsinh Danubha Jadeja',
        mobile: '+91 97240 88192',
        email: 'vikram.jadeja@kishanbhai.in',
        state: 'Gujarat',
        district: 'Rajkot',
        block: 'Kotda Sangani',
        villageName: 'Anandpur Hub',
        gramPanchayatName: 'Anandpur Gram Panchayat',
        designation: 'SARPANCH',
        gramPanchayatIdNumber: 'GP-GUJ-RJK-2021-042',
        panchayatOfficeAddress: 'Gram Panchayat Bhavan, Station Road, Anandpur',
        agreedToTerms: true,
        termsAgreedAt: '2026-05-10T11:05:00Z',
      },
      identityCheck: {
        provider: 'AUTHORIZED_AADHAAR_GATEWAY',
        idType: 'AADHAAR_MASKED',
        maskedId: 'XXXX-XXXX-8819',
        providerTxnRef: 'UIDAI-SANDBOX-AUTH-8829103',
        consentObtained: true,
        consentTimestamp: '2026-05-10T11:08:00Z',
        verifiedAt: '2026-05-10T11:09:12Z',
        status: 'VERIFIED',
        remarks: 'Consent-verified masked Aadhaar via UIDAI Authorized Gateway',
      },
      documents: [
        {
          id: 'doc_vikram_01',
          docType: 'ELECTION_CERTIFICATE',
          fileName: 'State_Election_Commission_Sarpanch_Certificate_2021.pdf',
          fileSize: 1420500,
          uploadedAt: '2026-05-10T11:15:00Z',
          secureViewToken: 'sec_tok_vikram_cert_8829',
          status: 'VALID',
          remarks: 'Official seal and returning officer signature verified',
        },
      ],
      faceVerification: {
        provider: 'LIVENESS_FACE_MATCH_AI',
        livenessPassed: true,
        livenessConfidence: 0.98,
        faceMatchScore: 0.96,
        spoofDetected: false,
        selfieCaptureTimestamp: '2026-05-10T11:20:00Z',
        verifiedAt: '2026-05-10T11:20:30Z',
        status: 'VERIFIED',
        remarks: 'Live selfie matched against authorized identity photo with 96% match',
      },
      designationCheck: {
        officialSourceChecked: 'E_GRAM_SWARAJ',
        crossReferenceMatched: true,
        gramPanchayatConfirmed: 'Anandpur Gram Panchayat (LGD: 162940)',
        tenurePeriod: '2021 - 2026',
        status: 'VERIFIED',
        verifiedAt: '2026-05-10T11:25:00Z',
        remarks: 'e-GramSwaraj directory confirmed incumbent Sarpanch',
      },
      adminDecision: {
        decidedBy: 'District Nodal Officer (Govt Admin)',
        decidedAt: '2026-05-12T14:30:00Z',
        decision: 'APPROVED',
        reason: 'All 6 verification checks passed. Official election certificate validated against e-GramSwaraj.',
        adminNotes: 'Full Village Champion privileges granted.',
      },
      auditLogs: [
        {
          id: 'log_vikram_01',
          timestamp: '2026-05-10T11:00:00Z',
          actorId: u2.id,
          actorName: 'Vikramsinh Danubha Jadeja',
          actorRole: 'APPLICANT',
          action: 'REGISTER_CHAMPION_APPLICATION',
          previousStatus: 'REGISTERED',
          newStatus: 'IDENTITY_PENDING',
        },
        {
          id: 'log_vikram_02',
          timestamp: '2026-05-10T11:09:12Z',
          actorId: u2.id,
          actorName: 'Vikramsinh Danubha Jadeja',
          actorRole: 'APPLICANT',
          action: 'IDENTITY_VERIFIED',
          previousStatus: 'IDENTITY_PENDING',
          newStatus: 'DOCUMENTS_PENDING',
        },
        {
          id: 'log_vikram_03',
          timestamp: '2026-05-10T11:25:00Z',
          actorId: u2.id,
          actorName: 'Vikramsinh Danubha Jadeja',
          actorRole: 'APPLICANT',
          action: 'SUBMITTED_FOR_REVIEW',
          previousStatus: 'DOCUMENTS_PENDING',
          newStatus: 'UNDER_REVIEW',
        },
        {
          id: 'log_vikram_04',
          timestamp: '2026-05-12T14:30:00Z',
          actorId: 'admin_sys_01',
          actorName: 'District Nodal Officer',
          actorRole: 'ADMIN',
          action: 'ADMIN_APPROVE_APPLICATION',
          previousStatus: 'UNDER_REVIEW',
          newStatus: 'APPROVED',
          notes: 'Sarpanch credentials and liveness verified successfully.',
        },
      ],
    };

    // 2) Anita Devi - Under Review
    const reqAnita: ChampionVerificationRequest = {
      id: 'cv_req_anita_02',
      userId: u4.id,
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-01T10:45:00Z',
      status: 'UNDER_REVIEW',
      currentStep: 6, // Step 6: Admin Review
      registrationData: {
        userId: u4.id,
        legalFullName: 'Anita Devi Parmar',
        mobile: '+91 98123 45678',
        email: 'anita.devi@kishanbhai.in',
        state: 'Gujarat',
        district: 'Rajkot',
        block: 'Gondal',
        villageName: 'Anandpur',
        gramPanchayatName: 'Anandpur Gram Panchayat',
        designation: 'SARPANCH',
        gramPanchayatIdNumber: 'GP-GUJ-RJK-2022-108',
        panchayatOfficeAddress: 'Gram Panchayat Office, Near Main Chowk, Anandpur',
        agreedToTerms: true,
        termsAgreedAt: '2026-08-01T10:05:00Z',
      },
      identityCheck: {
        provider: 'AUTHORIZED_AADHAAR_GATEWAY',
        idType: 'AADHAAR_MASKED',
        maskedId: 'XXXX-XXXX-4567',
        providerTxnRef: 'UIDAI-SANDBOX-AUTH-9014522',
        consentObtained: true,
        consentTimestamp: '2026-08-01T10:10:00Z',
        verifiedAt: '2026-08-01T10:11:30Z',
        status: 'VERIFIED',
        remarks: 'Consent obtained; masked identifier verified.',
      },
      documents: [
        {
          id: 'doc_anita_01',
          docType: 'ELECTION_CERTIFICATE',
          fileName: 'Panchayat_Election_Notification_Sarpanch_AnitaDevi.pdf',
          fileSize: 2104500,
          uploadedAt: '2026-08-01T10:20:00Z',
          secureViewToken: 'sec_tok_anita_cert_9104',
          status: 'PENDING',
          remarks: 'Submitted for verification officer review.',
        },
        {
          id: 'doc_anita_02',
          docType: 'GOV_AUTHORIZATION_LETTER',
          fileName: 'Block_Development_Officer_Authorization_Letter.pdf',
          fileSize: 984000,
          uploadedAt: '2026-08-01T10:22:00Z',
          secureViewToken: 'sec_tok_anita_auth_9105',
          status: 'PENDING',
        },
      ],
      faceVerification: {
        provider: 'LIVENESS_FACE_MATCH_AI',
        livenessPassed: true,
        livenessConfidence: 0.99,
        faceMatchScore: 0.94,
        spoofDetected: false,
        selfieCaptureTimestamp: '2026-08-01T10:30:00Z',
        verifiedAt: '2026-08-01T10:30:45Z',
        status: 'VERIFIED',
        remarks: 'Passive liveness detection passed (blink and micro-movement verified). Match score: 94%.',
      },
      designationCheck: {
        officialSourceChecked: 'E_GRAM_SWARAJ',
        crossReferenceMatched: true,
        gramPanchayatConfirmed: 'Anandpur Gram Panchayat (LGD: 162940)',
        tenurePeriod: '2022 - 2027',
        status: 'VERIFIED',
        verifiedAt: '2026-08-01T10:38:00Z',
        remarks: 'Panchayati Raj registry matched Anita Devi as Sarpanch for Anandpur GP.',
      },
      auditLogs: [
        {
          id: 'log_anita_01',
          timestamp: '2026-08-01T10:00:00Z',
          actorId: u4.id,
          actorName: 'Anita Devi Parmar',
          actorRole: 'APPLICANT',
          action: 'REGISTER_CHAMPION_APPLICATION',
          previousStatus: 'REGISTERED',
          newStatus: 'IDENTITY_PENDING',
        },
        {
          id: 'log_anita_02',
          timestamp: '2026-08-01T10:11:30Z',
          actorId: u4.id,
          actorName: 'Anita Devi Parmar',
          actorRole: 'APPLICANT',
          action: 'IDENTITY_VERIFIED',
          previousStatus: 'IDENTITY_PENDING',
          newStatus: 'DOCUMENTS_PENDING',
        },
        {
          id: 'log_anita_03',
          timestamp: '2026-08-01T10:25:00Z',
          actorId: u4.id,
          actorName: 'Anita Devi Parmar',
          actorRole: 'APPLICANT',
          action: 'DOCUMENTS_UPLOADED',
          previousStatus: 'DOCUMENTS_PENDING',
          newStatus: 'FACE_VERIFICATION_PENDING',
        },
        {
          id: 'log_anita_04',
          timestamp: '2026-08-01T10:30:45Z',
          actorId: u4.id,
          actorName: 'Anita Devi Parmar',
          actorRole: 'APPLICANT',
          action: 'FACE_VERIFICATION_PASSED',
          previousStatus: 'FACE_VERIFICATION_PENDING',
          newStatus: 'DESIGNATION_VERIFICATION_PENDING',
        },
        {
          id: 'log_anita_05',
          timestamp: '2026-08-01T10:45:00Z',
          actorId: u4.id,
          actorName: 'Anita Devi Parmar',
          actorRole: 'APPLICANT',
          action: 'SUBMITTED_FOR_ADMIN_REVIEW',
          previousStatus: 'DESIGNATION_VERIFICATION_PENDING',
          newStatus: 'UNDER_REVIEW',
          notes: 'Applicant completed all steps; waiting for admin approval decision.',
        },
      ],
    };

    this.championVerifications.set(reqVikram.id, reqVikram);
    this.championVerifications.set(reqAnita.id, reqAnita);

    // 2. Verified Active Virtual Clusters
    const c1: VirtualCluster = {
      id: 'cluster_anandpur_01',
      name: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      village: 'Anandpur',
      state: 'Gujarat',
      championId: 'usr_champ_vikram',
      championName: 'Vikramsinh Jadeja',
      description: '42 smallholder farmers collaborating for certified organic cotton and high-oil groundnut cultivation.',
      totalAcres: 186.5,
      memberCount: 42,
      primaryCrops: ['Cotton (Shankar-6)', 'Groundnut (GG-20)'],
      collectiveHarvestKg: 145000,
      bulkSavingsPercent: 24,
      members: [
        {
          id: 'usr_farmer_ramesh',
          farmerName: 'Ramesh Patel',
          acres: 4.5,
          crops: ['Cotton', 'Groundnut'],
          village: 'Anandpur',
          joinedAt: '2026-06-18T10:00:00Z',
        },
        {
          id: 'usr_farmer_suresh',
          farmerName: 'Suresh Bhai Ahir',
          acres: 6.0,
          crops: ['Cotton', 'Wheat'],
          village: 'Anandpur',
          joinedAt: '2026-06-20T12:30:00Z',
        },
        {
          id: 'usr_farmer_manoj',
          farmerName: 'Manoj Kumar Varma',
          acres: 3.8,
          crops: ['Groundnut'],
          village: 'Anandpur',
          joinedAt: '2026-06-22T09:15:00Z',
        },
        {
          id: 'usr_farmer_bhavesh',
          farmerName: 'Bhavesh Rathod',
          acres: 5.2,
          crops: ['Cotton', 'Castor'],
          village: 'Anandpur',
          joinedAt: '2026-06-25T14:00:00Z',
        },
      ],
      createdAt: '2026-06-15T09:00:00Z',
    };

    const c2: VirtualCluster = {
      id: 'cluster_malwa_02',
      name: 'Malwa Organic Wheat & Soybean Federation',
      village: 'Dharampuri',
      state: 'Madhya Pradesh',
      championId: 'usr_champ_rajendra',
      championName: 'Rajendra Singh Tomar',
      description: 'Central Indian high-protein Sharbati wheat cluster with direct FPO milling contracts.',
      totalAcres: 245.0,
      memberCount: 58,
      primaryCrops: ['Sharbati Wheat', 'Organic Soybean'],
      collectiveHarvestKg: 280000,
      bulkSavingsPercent: 21,
      members: [],
      createdAt: '2026-06-10T10:30:00Z',
    };

    const c3: VirtualCluster = {
      id: 'cluster_vidarbha_03',
      name: 'Vidarbha High-Yield Pulse & Cotton Mesh',
      village: 'Wardha Rural',
      state: 'Maharashtra',
      championId: 'usr_champ_anil',
      championName: 'Anil Rao Deshmukh',
      description: 'Precision drip-irrigated Bt Cotton and pigeon pea (Tur Dal) cluster.',
      totalAcres: 162.0,
      memberCount: 36,
      primaryCrops: ['Bt Cotton', 'Tur Dal (Pigeon Pea)'],
      collectiveHarvestKg: 112000,
      bulkSavingsPercent: 19,
      members: [],
      createdAt: '2026-06-28T08:00:00Z',
    };

    this.clusters.set(c1.id, c1);
    this.clusters.set(c2.id, c2);
    this.clusters.set(c3.id, c3);

    // Seed Cluster Buying Chat Messages (Real-time cluster discussion for buying needs)
    this.clusterChatMessages.set('cluster_anandpur_01', [
      {
        id: 'cmsg_1',
        clusterId: 'cluster_anandpur_01',
        senderId: 'usr_champ_vikram',
        senderName: 'Vikramsinh Jadeja',
        senderVillage: 'Anandpur Hub',
        senderRole: 'CHAMPION',
        text: 'राम राम किसान भाइयों! खरीफ सीजन के लिए खाद और सोलर पंप की सामूहिक मांग तैयार हो रही है। अगर किसी को बीज या ड्रिप पाइप की ज़रूरत हो तो यहां शेयर करें।',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'cmsg_2',
        clusterId: 'cluster_anandpur_01',
        senderId: 'usr_farmer_ramesh',
        senderName: 'Ramesh Patel',
        senderVillage: 'Anandpur',
        senderRole: 'FARMER',
        text: 'मुझे अपने 4.5 एकड़ खेत के लिए 25 बोरी डीएपी और 15 बोरी यूरिया की आवश्यकता है। क्या कोई और किसान भाई साथ में ऑर्डर करेगा ताकि 24% थोक छूट मिल सके?',
        buyingNeed: {
          item: 'Coromandel Gromor DAP + IFFCO Neem Urea',
          category: 'Fertilizer',
          quantityNeeded: 40,
          unit: 'Bags (50kg)',
          targetPriceInr: 1120,
          pledgedCount: 1,
          status: 'OPEN',
        },
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'cmsg_3',
        clusterId: 'cluster_anandpur_01',
        senderId: 'usr_farmer_suresh',
        senderName: 'Suresh Bhai Ahir',
        senderVillage: 'Anandpur',
        senderRole: 'FARMER',
        text: 'रमेश भाई, मैं भी 20 बोरी डीएपी में शामिल होता हूँ! साथ में लेने से ट्रांसपोर्ट का खर्चा भी बच जाएगा।',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'cmsg_4',
        clusterId: 'cluster_anandpur_01',
        senderId: 'usr_farmer_kanti',
        senderName: 'Kantibhai Makwana',
        senderVillage: 'Dharampuri',
        senderRole: 'FARMER',
        text: 'क्या क्लस्टर में कोई 5HP सोलर सबमर्सिबल पंप लेने की योजना बना रहा है? अगर हम 5 लोग मिलकर OEM कंपनी से बात करें तो ₹50,000 की बचत हो सकती है।',
        buyingNeed: {
          item: 'Shakti 5HP DC Solar Submersible Pump & Controller',
          category: 'Solar & Irrigation',
          quantityNeeded: 5,
          unit: 'Sets',
          targetPriceInr: 118000,
          pledgedCount: 2,
          status: 'OPEN',
        },
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'cmsg_5',
        clusterId: 'cluster_anandpur_01',
        senderId: 'usr_champ_vikram',
        senderName: 'Vikramsinh Jadeja',
        senderVillage: 'Anandpur Hub',
        senderRole: 'CHAMPION',
        text: 'कांतिभाई, शक्ति सोलर के जोनल मैनेजर से बात हो गई है। जैसे ही हमारे क्लस्टर में 5 पंप का प्लेज पूरा होगा, कंपनी इंजीनियर आकर खेत पर फ्री इंस्टॉलेशन करेगा।',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ]);

    this.clusterChatMessages.set('cluster_malwa_02', [
      {
        id: 'mmsg_1',
        clusterId: 'cluster_malwa_02',
        senderId: 'usr_champ_rajendra',
        senderName: 'Rajendra Singh Tomar',
        senderVillage: 'Dharampuri',
        senderRole: 'CHAMPION',
        text: 'मालवा क्लस्टर के सभी गेहूं उत्पादक साथी ध्यान दें: शरबती गेहूं बीज (C-306) का प्रमाणित लॉट आ रहा है। अपनी ज़रूरत दर्ज करें।',
        buyingNeed: {
          item: 'Certified Sharbati Wheat Seeds (C-306 Grade-A)',
          category: 'Seeds',
          quantityNeeded: 100,
          unit: 'Quintals',
          targetPriceInr: 3400,
          pledgedCount: 8,
          status: 'OPEN',
        },
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ]);

    this.clusterChatMessages.set('cluster_vidarbha_03', [
      {
        id: 'vmsg_1',
        clusterId: 'cluster_vidarbha_03',
        senderId: 'usr_champ_anil',
        senderName: 'Anil Rao Deshmukh',
        senderVillage: 'Wardha Rural',
        senderRole: 'CHAMPION',
        text: 'कपास बुवाई के लिए महिको बोलगार्ड-2 बीज का संयुक्त ऑर्डर आज शाम 6 बजे फाइनल हो रहा है। जिन्हें भी चाहिए तुरंत बताएं।',
        buyingNeed: {
          item: 'Mahyco Bollgard-II Hybrid Cotton Seeds',
          category: 'Seeds',
          quantityNeeded: 80,
          unit: 'Packets',
          targetPriceInr: 735,
          pledgedCount: 12,
          status: 'OPEN',
        },
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
    ]);

    // 2.1 Shared Cluster Shopping Carts
    const cartAnandpur: SharedClusterCart = {
      id: 'cart_anandpur_01',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      village: 'Anandpur, Rajkot',
      title: 'Rabi 2026 Cooperative Bulk Supplies Cart',
      status: 'OPEN',
      deliveryAddress: 'Anandpur Primary Kisan Sahakari Godown, Rajkot Highway, Gujarat 360005',
      coordinatorName: 'Vikramsinh Jadeja',
      coordinatorPhone: '+91 97240 88219',
      items: [
        {
          id: 'item_dap_01',
          title: 'Coromandel Gromor 28-28-0 Complex Fertilizer',
          category: 'Fertilizer',
          unit: 'Bags (50kg)',
          retailPrice: 1850,
          wholesalePrice: 1480,
          targetTierQty: 50,
          totalQuantity: 45,
          supplierName: 'Coromandel International Cooperative Hub',
          imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69103851?w=300&auto=format&fit=crop&q=80',
          contributors: [
            {
              userId: 'usr_farmer_ramesh',
              userName: 'Ramesh Patel',
              userVillage: 'Anandpur',
              quantity: 15,
              notes: 'Needed for block A & B cotton fields',
              addedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
            },
            {
              userId: 'usr_champ_vikram',
              userName: 'Vikramsinh Jadeja',
              userVillage: 'Anandpur Hub',
              quantity: 20,
              notes: 'Groundnut sowing requirement',
              addedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            },
            {
              userId: 'usr_farmer_suresh',
              userName: 'Suresh Bhai Ahir',
              userVillage: 'Anandpur',
              quantity: 10,
              notes: 'Deliver to north borewell point',
              addedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            },
          ],
        },
        {
          id: 'item_urea_02',
          title: 'IFFCO Neem Coated Certified Urea',
          category: 'Fertilizer',
          unit: 'Bags (45kg)',
          retailPrice: 266.5,
          wholesalePrice: 242.0,
          targetTierQty: 50,
          totalQuantity: 35,
          supplierName: 'IFFCO State Regional Distribution Hub',
          imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=300&auto=format&fit=crop&q=80',
          contributors: [
            {
              userId: 'usr_farmer_ramesh',
              userName: 'Ramesh Patel',
              userVillage: 'Anandpur',
              quantity: 10,
              addedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            },
            {
              userId: 'usr_farmer_kanti',
              userName: 'Kantibhai Makwana',
              userVillage: 'Dharampuri',
              quantity: 25,
              addedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
          ],
        },
        {
          id: 'item_drip_03',
          title: 'Jain Irrigation Drip Lateral Pipe (16mm, 400m bundle)',
          category: 'Solar & Irrigation',
          unit: 'Rolls',
          retailPrice: 3600,
          wholesalePrice: 2850,
          targetTierQty: 10,
          totalQuantity: 6,
          supplierName: 'Jain Irrigation Systems Ltd Authorized Hub',
          imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=300&auto=format&fit=crop&q=80',
          contributors: [
            {
              userId: 'usr_farmer_ramesh',
              userName: 'Ramesh Patel',
              userVillage: 'Anandpur',
              quantity: 2,
              notes: 'For cumin intercropping rows',
              addedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
              userId: 'usr_farmer_suresh',
              userName: 'Suresh Bhai Ahir',
              userVillage: 'Anandpur',
              quantity: 4,
              addedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
            },
          ],
        },
      ],
      totalRetailAmount: 45 * 1850 + 35 * 266.5 + 6 * 3600,
      totalWholesaleAmount: 45 * 1480 + 35 * 242.0 + 6 * 2850,
      totalSavings: (45 * 1850 + 35 * 266.5 + 6 * 3600) - (45 * 1480 + 35 * 242.0 + 6 * 2850),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cartMalwa: SharedClusterCart = {
      id: 'cart_malwa_02',
      clusterId: 'cluster_malwa_02',
      clusterName: 'Malwa Organic Wheat Federation',
      village: 'Dharampuri, Dhar',
      title: 'Malwa Organic Inputs & Sharbati Wheat Seed Pooling',
      status: 'OPEN',
      deliveryAddress: 'Dharampuri Cooperative Collection Mandi, Dhar, MP',
      coordinatorName: 'Kailash Mandloi',
      coordinatorPhone: '+91 94250 11928',
      items: [
        {
          id: 'item_sharbati_seed_01',
          title: 'Certified Sharbati Wheat Foundation Seeds (C-306)',
          category: 'Seeds',
          unit: 'Quintals',
          retailPrice: 4200,
          wholesalePrice: 3450,
          targetTierQty: 20,
          totalQuantity: 14,
          supplierName: 'MP Rajya Beej Nigam Certified Depot',
          imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&auto=format&fit=crop&q=80',
          contributors: [
            {
              userId: 'usr_farmer_ramesh',
              userName: 'Ramesh Patel',
              userVillage: 'Anandpur',
              quantity: 4,
              addedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
            },
            {
              userId: 'usr_champ_kailash',
              userName: 'Kailash Mandloi',
              userVillage: 'Dharampuri',
              quantity: 10,
              addedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
            },
          ],
        },
      ],
      totalRetailAmount: 14 * 4200,
      totalWholesaleAmount: 14 * 3450,
      totalSavings: 14 * (4200 - 3450),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.sharedCarts.set('cluster_anandpur_01', cartAnandpur);
    this.sharedCarts.set('cluster_malwa_02', cartMalwa);

    // 3. Active Bulk Buying & Group Purchasing Demands
    const b1: BulkOrderRequirement = {
      id: 'req_urea_anandpur_01',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      groupName: 'Anandpur Sahakari Fertilizer Circle',
      category: 'Fertilizer',
      itemName: 'IFFCO Neem-Coated Technical Urea (45kg)',
      itemDescription: 'Government-approved neem-coated technical grade slow-release urea for kharif crop top-dressing.',
      targetQuantity: 500,
      currentQuantity: 425,
      unit: 'Bags (50kg)',
      standardRetailPrice: 350,
      negotiatedBulkPrice: 266.5,
      tierDiscounts: [
        { minQty: 100, discountPct: 12, priceInr: 308, label: 'Tier 1 (100 bags)' },
        { minQty: 250, discountPct: 18, priceInr: 287, label: 'Tier 2 (250 bags)' },
        { minQty: 500, discountPct: 24, priceInr: 266.5, label: 'Tier 3 (500 bags - Factory Bulk)' },
      ],
      savingsPercentage: 24,
      deadlineDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      location: 'Anandpur APMC Hub, Gujarat',
      creatorName: 'Vikramsinh Jadeja',
      creatorId: 'usr_champ_vikram',
      connectedMembersCount: 28,
      farmerPledges: [
        {
          id: 'pld_1',
          farmerId: 'usr_farmer_ramesh',
          farmerName: 'Ramesh Patel',
          village: 'Anandpur',
          quantity: 20,
          pledgedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          notes: 'Required for Plot 2 cotton field',
        },
        {
          id: 'pld_2',
          farmerId: 'usr_farmer_suresh',
          farmerName: 'Suresh Bhai Ahir',
          village: 'Anandpur',
          quantity: 35,
          pledgedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
          notes: 'Need delivery by Saturday',
        },
        {
          id: 'pld_3',
          farmerId: 'usr_farmer_bhupat',
          farmerName: 'Bhupatbhai Solanki',
          village: 'Navagam',
          quantity: 50,
          pledgedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
        },
      ],
      chatMessages: [
        {
          id: 'msg_1',
          senderId: 'usr_champ_vikram',
          senderName: 'Vikramsinh Jadeja',
          senderRole: 'Village Champion',
          text: 'IFFCO regional warehouse confirmed delivery directly to Anandpur warehouse as soon as we hit 500 bags! Only 75 bags left.',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          id: 'msg_2',
          senderId: 'usr_farmer_ramesh',
          senderName: 'Ramesh Patel',
          senderRole: 'Farmer',
          text: 'Just pledged 20 bags. Will the bags be unloaded at the panchayat warehouse?',
          timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
        },
        {
          id: 'msg_3',
          senderId: 'usr_champ_vikram',
          senderName: 'Vikramsinh Jadeja',
          senderRole: 'Village Champion',
          text: 'Yes Ramesh bhai, free unloading at Panchayat depot. We will distribute with tractor trolleys.',
          timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        },
      ],
    };

    const b2: BulkOrderRequirement = {
      id: 'req_solar_pump_02',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      groupName: 'Saurashtra Solar Irrigation Pool',
      category: 'Solar & Irrigation',
      itemName: 'Shakti 5HP Solar Submersible Pump & Smart Dual-Axis Controller',
      itemDescription: 'MNRE approved 5HP BLDC stainless steel submersible borewell pump with MPPT solar tracking inverter and 5-year on-site warranty.',
      targetQuantity: 15,
      currentQuantity: 11,
      unit: 'Sets',
      standardRetailPrice: 168000,
      negotiatedBulkPrice: 118000,
      tierDiscounts: [
        { minQty: 5, discountPct: 15, priceInr: 142800, label: 'Tier 1 (5 sets)' },
        { minQty: 10, discountPct: 25, priceInr: 126000, label: 'Tier 2 (10 sets)' },
        { minQty: 15, discountPct: 30, priceInr: 118000, label: 'Tier 3 (15 sets - Direct OEM)' },
      ],
      savingsPercentage: 30,
      deadlineDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      location: 'Rajkot Regional Sub-Depot',
      creatorName: 'Vikramsinh Jadeja',
      creatorId: 'usr_champ_vikram',
      connectedMembersCount: 16,
      farmerPledges: [
        {
          id: 'pld_s1',
          farmerId: 'usr_farmer_ramesh',
          farmerName: 'Ramesh Patel',
          village: 'Anandpur',
          quantity: 1,
          pledgedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          notes: 'For North plot 180ft borewell',
        },
        {
          id: 'pld_s2',
          farmerId: 'usr_farmer_kanti',
          farmerName: 'Kantibhai Makwana',
          village: 'Dharampuri',
          quantity: 2,
          pledgedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        },
      ],
      chatMessages: [
        {
          id: 'msg_s1',
          senderId: 'usr_champ_vikram',
          senderName: 'Vikramsinh Jadeja',
          senderRole: 'Champion',
          text: 'Factory technician will come to do installation for all 15 farmers in 3 days batch.',
          timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
        },
      ],
    };

    const b3: BulkOrderRequirement = {
      id: 'req_seed_btcotton_03',
      clusterId: 'cluster_vidarbha_03',
      clusterName: 'Vidarbha High-Yield Pulse & Cotton Mesh',
      groupName: 'Vidarbha Seed Growers Circle',
      category: 'Seeds',
      itemName: 'Mahyco Bollgard-II Hybrid Cotton Seeds (475g Pack)',
      itemDescription: 'Certified high-germination Bollgard-II hybrid cotton with sucking pest tolerance and long staple yield.',
      targetQuantity: 200,
      currentQuantity: 185,
      unit: 'Packets',
      standardRetailPrice: 920,
      negotiatedBulkPrice: 735,
      tierDiscounts: [
        { minQty: 50, discountPct: 10, priceInr: 828, label: 'Tier 1 (50 pkts)' },
        { minQty: 100, discountPct: 15, priceInr: 782, label: 'Tier 2 (100 pkts)' },
        { minQty: 200, discountPct: 20, priceInr: 735, label: 'Tier 3 (200 pkts - Wholesale)' },
      ],
      savingsPercentage: 20,
      deadlineDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      location: 'Wardha APMC Yard, Maharashtra',
      creatorName: 'Anil Rao Deshmukh',
      creatorId: 'usr_champ_anil',
      connectedMembersCount: 22,
      farmerPledges: [
        {
          id: 'pld_c1',
          farmerId: 'usr_farmer_anil',
          farmerName: 'Prakash Rao',
          village: 'Wardha Rural',
          quantity: 25,
          pledgedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
      ],
      chatMessages: [
        {
          id: 'msg_c1',
          senderId: 'usr_farmer_anil',
          senderName: 'Prakash Rao',
          senderRole: 'Farmer',
          text: 'Does this batch have the QR code seal for certified purity testing?',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: 'msg_c2',
          senderId: 'usr_champ_anil',
          senderName: 'Anil Rao Deshmukh',
          senderRole: 'Champion',
          text: 'Yes, 100% genuine Mahyco hologram sealed with batch test report included.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
    };

    const b4: BulkOrderRequirement = {
      id: 'req_drip_anandpur_04',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      groupName: 'Anandpur Micro-Irrigation Collective',
      category: 'Solar & Irrigation',
      itemName: 'Jain Drip Inline 16mm Lateral Coil (400m Roll)',
      itemDescription: 'Virgin HDPE cylindrical inline drippers spaced at 40cm, 2.4 LPH flow rate with anti-clog labyrinth design.',
      targetQuantity: 120,
      currentQuantity: 96,
      unit: 'Rolls',
      standardRetailPrice: 3800,
      negotiatedBulkPrice: 2850,
      tierDiscounts: [
        { minQty: 30, discountPct: 15, priceInr: 3230, label: 'Tier 1 (30 rolls)' },
        { minQty: 60, discountPct: 20, priceInr: 3040, label: 'Tier 2 (60 rolls)' },
        { minQty: 120, discountPct: 25, priceInr: 2850, label: 'Tier 3 (120 rolls)' },
      ],
      savingsPercentage: 25,
      deadlineDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      location: 'Anandpur Cluster Hub',
      creatorName: 'Vikramsinh Jadeja',
      creatorId: 'usr_champ_vikram',
      connectedMembersCount: 19,
      farmerPledges: [
        {
          id: 'pld_d1',
          farmerId: 'usr_farmer_ramesh',
          farmerName: 'Ramesh Patel',
          village: 'Anandpur',
          quantity: 8,
          pledgedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
      ],
      chatMessages: [],
    };

    const b5: BulkOrderRequirement = {
      id: 'req_weeder_anandpur_05',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      groupName: 'Kisan Small Equipment Club',
      category: 'Machinery & Tools',
      itemName: 'Honda GX-200 4-Stroke 7HP Multipurpose Power Weeder',
      itemDescription: 'High-torque petrol power weeder with 32-blade rotary tiller attachment, adjustable furrower, and transport wheels.',
      targetQuantity: 20,
      currentQuantity: 17,
      unit: 'Units',
      standardRetailPrice: 42000,
      negotiatedBulkPrice: 31500,
      tierDiscounts: [
        { minQty: 5, discountPct: 12, priceInr: 36960, label: 'Tier 1 (5 units)' },
        { minQty: 10, discountPct: 20, priceInr: 33600, label: 'Tier 2 (10 units)' },
        { minQty: 20, discountPct: 25, priceInr: 31500, label: 'Tier 3 (20 units)' },
      ],
      savingsPercentage: 25,
      deadlineDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      location: 'Central Machinery Hub, Anandpur',
      creatorName: 'Vikramsinh Jadeja',
      creatorId: 'usr_champ_vikram',
      connectedMembersCount: 24,
      farmerPledges: [],
      chatMessages: [],
    };

    const b6: BulkOrderRequirement = {
      id: 'req_cattle_feed_06',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      groupName: 'Anandpur Dairy & Livestock Group',
      category: 'Cattle Feed',
      itemName: 'Amul Dan Balanced Compound Cattle Feed (50kg Bag)',
      itemDescription: 'Fortified with 20% crude protein, minerals and bypass fat for improved milk fat percentage and dairy cow health.',
      targetQuantity: 250,
      currentQuantity: 210,
      unit: 'Bags (50kg)',
      standardRetailPrice: 1250,
      negotiatedBulkPrice: 960,
      tierDiscounts: [
        { minQty: 50, discountPct: 10, priceInr: 1125, label: 'Tier 1 (50 bags)' },
        { minQty: 100, discountPct: 16, priceInr: 1050, label: 'Tier 2 (100 bags)' },
        { minQty: 250, discountPct: 23, priceInr: 960, label: 'Tier 3 (250 bags)' },
      ],
      savingsPercentage: 23,
      deadlineDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'AGGREGATING',
      location: 'Village Dairy Milk Chilling Centre',
      creatorName: 'Suresh Bhai Ahir',
      creatorId: 'usr_farmer_suresh',
      connectedMembersCount: 31,
      farmerPledges: [],
      chatMessages: [],
    };

    this.bulkRequirements.set(b1.id, b1);
    this.bulkRequirements.set(b2.id, b2);
    this.bulkRequirements.set(b3.id, b3);
    this.bulkRequirements.set(b4.id, b4);
    this.bulkRequirements.set(b5.id, b5);
    this.bulkRequirements.set(b6.id, b6);

    // 4. Quality Assayed Pooled Harvest Lots
    const h1: HarvestPoolLot = {
      id: 'lot_cotton_anandpur_882',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      farmerId: 'usr_farmer_ramesh',
      farmerName: 'Ramesh Patel',
      village: 'Anandpur',
      crop: 'Cotton',
      variety: 'Shankar-6 (Organic Certified)',
      quantityKg: 45000,
      qualityGrade: 'A+ Export',
      expectedHarvestDate: '2026-09-15',
      minimumTargetPricePerKg: 75.5,
      status: 'AVAILABLE',
      moisturePercentage: 8.2,
      notes: 'Lab tested: 29.5mm staple length, zero yellow spots, micronaire 4.1.',
    };

    const h2: HarvestPoolLot = {
      id: 'lot_groundnut_anandpur_904',
      clusterId: 'cluster_anandpur_01',
      clusterName: 'Anandpur Sahakari Cotton & Groundnut Mesh',
      farmerId: 'usr_farmer_suresh',
      farmerName: 'Suresh Bhai Ahir',
      village: 'Anandpur',
      crop: 'Groundnut',
      variety: 'TAG-24 High Oil Content',
      quantityKg: 28000,
      qualityGrade: 'Grade A Premium',
      expectedHarvestDate: '2026-09-28',
      minimumTargetPricePerKg: 64.0,
      status: 'AVAILABLE',
      moisturePercentage: 7.5,
      notes: 'Oil percentage: 51.2%, Pod maturity 94%. Assayed by Saurashtra Lab.',
    };

    const h3: HarvestPoolLot = {
      id: 'lot_wheat_malwa_104',
      clusterId: 'cluster_malwa_02',
      clusterName: 'Malwa Organic Wheat & Soybean Federation',
      farmerId: 'usr_champ_rajendra',
      farmerName: 'Rajendra Singh Tomar',
      village: 'Dharampuri',
      crop: 'Wheat',
      variety: 'Sharbati Gold MP Grain',
      quantityKg: 85000,
      qualityGrade: 'Grade A Premium',
      expectedHarvestDate: '2026-10-05',
      minimumTargetPricePerKg: 29.0,
      status: 'AVAILABLE',
      moisturePercentage: 9.1,
      notes: 'Protein content 14.2%, Golden lustre kernel, premium flour standard.',
    };

    this.harvestLots.set(h1.id, h1);
    this.harvestLots.set(h2.id, h2);
    this.harvestLots.set(h3.id, h3);

    // 5. Machinery Pool Roster
    const m1: MachineryItem = {
      id: 'mach_john_deere_5050',
      name: 'John Deere 5050 D 4WD Tractor (50 HP)',
      type: 'Tractor',
      category: 'Tillage & Haulage',
      village: 'Anandpur Hub',
      modelYear: '2024',
      hpOrCapacity: '50 HP Turbocharged',
      hourlyRateInr: 480,
      available: true,
      operatorIncluded: true,
      currentLocationVillage: 'Anandpur Hub Central Yard',
      ownerContact: '+91 97240 88192 (Vikram Jadeja)',
      description: 'Equipped with dual clutch, GPS fleet beacon, and pneumatic trailer connector.',
      isDemoPrototype: false,
      upcomingBookings: [
        {
          bookingId: 'bk_101',
          farmerName: 'Ramesh Patel',
          village: 'Anandpur',
          date: '2026-09-02',
          hours: 4,
          status: 'CONFIRMED',
        },
      ],
    };

    const m2: MachineryItem = {
      id: 'mach_dji_agras_t40',
      name: 'DJI Agras T40 Precision Solar Drone Sprayer',
      type: 'Solar Drone Sprayer',
      category: 'Crop Protection & Spraying',
      village: 'Anandpur Hub',
      modelYear: '2025',
      hpOrCapacity: '40L Payload / 16 Ha/Hour',
      hourlyRateInr: 350,
      available: true,
      operatorIncluded: true,
      currentLocationVillage: 'Anandpur Drone Station',
      ownerContact: '+91 97240 88192 (Certified Pilot: Deepak)',
      description: 'Centrifugal atomization nozzles, obstacle avoidance radar, saves 30% chemical dosage.',
      isDemoPrototype: false,
      upcomingBookings: [],
    };

    const m3: MachineryItem = {
      id: 'mach_rotavator_shaktiman',
      name: 'Shaktiman Semi-Champion 7ft Rotary Tiller',
      type: 'Rotavator',
      category: 'Soil Preparation',
      village: 'Anandpur Hub',
      modelYear: '2024',
      hpOrCapacity: '48 L-Blades / 7 Feet Swath',
      hourlyRateInr: 320,
      available: true,
      operatorIncluded: false,
      currentLocationVillage: 'Anandpur Hub North Gate',
      ownerContact: '+91 98251 44320',
      description: 'Heavy duty Boron steel blades for thorough seedbed conditioning in one pass.',
      isDemoPrototype: false,
      upcomingBookings: [],
    };

    this.machinery.set(m1.id, m1);
    this.machinery.set(m2.id, m2);
    this.machinery.set(m3.id, m3);

    // 6. Recent Real Blockchain Transactions (Cluster Collective Input Purchasing & Harvest Escrows)
    const tx1: TransactionRecord = {
      id: 'tx_alg_8819241',
      serviceName: 'Cluster Bio-NPK Wholesale Purchase Settlement',
      serviceId: 'bulk-fertilizer-pool',
      amountUsdc: 142.50,
      asset: 'USDC',
      network: 'Algorand Testnet',
      status: 'SETTLED',
      txId: 'V7XW2Z3KJ9MBP8NL4QTA6C1EGF',
      senderAddress: 'KISHAN7Z4W2N8K1M9P3T5V6X8Y',
      receiverAddress: 'RECEIVER_GOPLAUSIBLE_ESCROW',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      facilitator: 'GoPlausible',
      explorerUrl: 'https://lora.algokit.io/testnet/transaction/V7XW2Z3KJ9MBP8NL4QTA6C1EGF',
      isRealBlockchainTx: true,
    };

    const tx2: TransactionRecord = {
      id: 'tx_alg_8819242',
      serviceName: 'Pooled Sharbati Wheat Institutional Buyer Escrow',
      serviceId: 'harvest-lot-escrow',
      amountUsdc: 285.00,
      asset: 'USDC',
      network: 'Algorand Testnet',
      status: 'SETTLED',
      txId: 'A3K9M2L7P4Q1W8E5T6Y0Z9X2C8',
      senderAddress: 'KISHAN7Z4W2N8K1M9P3T5V6X8Y',
      receiverAddress: 'RECEIVER_GOPLAUSIBLE_ESCROW',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      facilitator: 'GoPlausible',
      explorerUrl: 'https://lora.algokit.io/testnet/transaction/A3K9M2L7P4Q1W8E5T6Y0Z9X2C8',
      isRealBlockchainTx: true,
    };

    this.transactions.set(tx1.id, tx1);
    this.transactions.set(tx2.id, tx2);

    // 7. Seeded Farmer AI Conversation Histories
    const conv1: AIConversationSession = {
      id: 'conv_wheat_irrigation_01',
      title: "Today's Wheat Crop Advice",
      preview: "Should I irrigate my Sharbati Wheat today with upcoming weather?",
      lastUpdated: new Date(Date.now() - 3600000 * 3).toISOString(),
      messagesCount: 2,
      cropContext: 'Wheat (Sharbati)',
      messages: [
        {
          id: 'msg_u_1',
          role: 'user',
          content: 'Should I irrigate my Sharbati Wheat crop today?',
          timestamp: '10:15 AM',
        },
        {
          id: 'msg_a_1',
          role: 'assistant',
          modelUsed: 'gemini-3.7-flash',
          language: 'en',
          content: `🌱 **Recommendation: DO NOT IRRIGATE TODAY**

**Why?**
- Your soil moisture is currently **42% (Optimal)** in the root zone.
- **70% probability of rain (14-18 mm)** is forecasted across Anandpur tomorrow afternoon.
- Irrigating right before rainfall risks waterlogging, root asphyxiation, and fertilizer leaching.

**What to do:**
1. Keep the main tube-well pump on standby mode.
2. Clear field bund drainage channels to allow uniform rainwater percolation.
3. Re-check soil moisture on Friday morning after the rain clears.

⚠️ **Important Warning:** Excess standing water at the crown root stage can induce root rot and yellowing in wheat. Ensure excess drainage is unblocked.`,
          timestamp: '10:16 AM',
          farmingActionCard: {
            title: 'Irrigation Suspended (Rain Forecasted)',
            crop: 'Wheat (Sharbati)',
            currentMoisture: 42,
            recommendedTime: 'Friday 07:00 AM (Post-rain)',
            reason: '70% heavy rain expected tomorrow. Soil moisture adequate at 42%.',
            actionType: 'IRRIGATION',
            badge: 'Postponed for Rain',
            actionLabel: 'Schedule Smart Reminder',
            actionView: 'smart-irrigation',
          },
          sources: [
            'IMD Agro-Meteorological Weather Radar',
            'ICAR Wheat Agronomy Manual (ICAR-IIWBR)',
            'Kishan Bhai Soil Sensor Node #4',
          ],
        },
      ],
    };

    const conv2: AIConversationSession = {
      id: 'conv_cotton_disease_02',
      title: 'Yellow leaf problem in Cotton',
      preview: 'Leaves turning yellow with brownish spots on the edges...',
      lastUpdated: new Date(Date.now() - 3600000 * 24).toISOString(),
      messagesCount: 2,
      cropContext: 'Cotton (Bt)',
      messages: [
        {
          id: 'msg_u_2',
          role: 'user',
          content: 'My cotton leaves are turning yellowish near the margins with small brown spots. What is the cure?',
          timestamp: 'Yesterday 04:30 PM',
        },
        {
          id: 'msg_a_2',
          role: 'assistant',
          modelUsed: 'gemini-3.7-flash',
          language: 'en',
          content: `🌱 **Recommendation: Early Alternaria Leaf Spot & Magnesium Deficiency Detected**

**Why?**
- High ambient humidity (78%) combined with overcast skies in Gujarat promotes Alternaria fungal spore spread.
- Interveinal chlorosis (yellowing between veins) signifies rapid vegetative nutrient depletion during boll development.

**What to do:**
1. Foliar spray of **Mancozeb 75% WP @ 2.5g/L** or **Copper Oxychloride 50% WP @ 3g/L**.
2. Add **1% Magnesium Sulphate (MgSO4)** in the tank mix to restore chlorophyll synthesis.
3. Apply during clear sunshine hours with a fine hollow-cone nozzle.

⚠️ **Important Warning:** Do not spray within 4 hours of expected rainfall. Ensure safety masks and gloves are worn during application.`,
          timestamp: 'Yesterday 04:31 PM',
          diseaseAnalysis: {
            possibleDisease: 'Alternaria Leaf Spot & Marginal Chlorosis',
            cropName: 'Cotton (Bt)',
            confidence: 89,
            severity: 'MEDIUM',
            symptoms: 'Marginal yellowing with concentric brown necrotic spots on mature leaves.',
            recommendedAction: 'Apply Mancozeb 75% WP + 1% MgSO4 tank mix within 48 hours.',
            prevention: 'Maintain 90x60cm row aeration; avoid overhead sprinkler wetting of foliage.',
            disclaimer: 'AI result is advisory and should be verified by an agriculture expert.',
          },
          sources: [
            'Central Institute for Cotton Research (CICR) Advisory',
            'Gujarat Agricultural University (AAU) Plant Pathology Guidelines',
          ],
        },
      ],
    };

    const conv3: AIConversationSession = {
      id: 'conv_wheat_mandi_03',
      title: 'Wheat selling & APMC price advice',
      preview: 'Where should I sell 30 quintals of Sharbati wheat for highest profit?',
      lastUpdated: new Date(Date.now() - 3600000 * 48).toISOString(),
      messagesCount: 2,
      cropContext: 'Wheat (Sharbati)',
      messages: [
        {
          id: 'msg_u_3',
          role: 'user',
          content: 'Where should I sell 30 quintals of Sharbati wheat for highest profit?',
          timestamp: '2 days ago',
        },
        {
          id: 'msg_a_3',
          role: 'assistant',
          modelUsed: 'gemini-3.7-flash',
          language: 'en',
          content: `🌱 **Recommendation: Sell at Gondal APMC Mandi or Pool on Kishan Bhai Marketplace**

**Why?**
- **Gondal APMC** is quoting **₹2,680/Qtl** (+₹140 above MSP and +₹120 higher than Rajkot).
- Institutional buyer demand for premium Sharbati wheat is high this week.
- Collective cluster pooling can save ₹45/Qtl on transportation.

**What to do:**
1. Grade and clean grains to maintain <10% moisture content.
2. Pool with Anandpur Cluster to book a shared 10-ton mini-truck.
3. Target selling before the 25th when fresh northern arrivals begin.

⚠️ **Important Warning:** Protect stored bags from ground dampness using wooden pallets.`,
          timestamp: '2 days ago',
          farmingActionCard: {
            title: 'Market Arbitrage Opportunity',
            crop: 'Wheat (Sharbati)',
            recommendedTime: 'Next 3-5 days',
            reason: 'Gondal APMC quoting ₹2,680/Qtl — ₹140 premium above regional average.',
            actionType: 'MARKET_SELL',
            badge: 'High Realization',
            actionLabel: 'View Mandi Comparison',
            actionView: 'market-prices',
          },
          sources: [
            'Agmarknet Live APMC Price Feed',
            'Directorate of Marketing & Inspection (DMI)',
          ],
        },
      ],
    };

    this.conversations.set(conv1.id, conv1);
    this.conversations.set(conv2.id, conv2);
    this.conversations.set(conv3.id, conv3);

    // Initial Crop Disease Diagnostic Scans
    const scan1: DiseaseScanResult = {
      id: 'scan_wheat_rust_01',
      cropName: 'Wheat',
      detectedCrop: 'Wheat (Triticum aestivum)',
      pathogen: 'Yellow Leaf Rust (Puccinia striiformis)',
      possibleDisease: 'Yellow Leaf Rust',
      hindiName: 'गेहूँ का पीला रतुआ (स्ट्राइप रस्ट)',
      confidenceScore: 91,
      confidenceExplanation: 'The AI is reasonably confident based on the visible symptoms, but this is not a laboratory diagnosis.',
      severity: 'MODERATE',
      symptoms: [
        'Orange-yellow linear pustules on leaf surface aligned with veins',
        'Chlorotic yellow discoloration around lesion clusters',
        'Small powdery pustules rubbing off on touch',
        'Estimated affected leaf area: 18-22%',
      ],
      causes: [
        'Airborne fungal spores (Puccinia striiformis)',
        'Extended morning dew and cool temperatures (10°C - 18°C)',
        'High atmospheric humidity (>85%) over consecutive days',
        'Dense crop canopy restricting intra-row airflow',
      ],
      recommendedAction: [
        'Inspect nearby plants for similar yellow linear pustules.',
        'Remove severely affected plant material where appropriate.',
        'Improve field airflow and avoid water accumulation in furrows.',
        'Avoid unnecessary overhead irrigation to keep leaves dry.',
        'Consult a local agriculture expert before applying chemical treatment.',
      ],
      recommendedOrganic: [
        'Fermented sour buttermilk (chaas 5L per 100L water) with copper ion treatment',
        'Foliar spray of Pseudomonas fluorescens (10g/L) during calm morning dew hours',
      ],
      recommendedChemical: [
        'Propiconazole 25% EC @ 1 ml/L or Tebuconazole 25.9% EC @ 1 ml/L if spread accelerates',
      ],
      preventionSteps: [
        'Maintain proper row spacing (20-22 cm) for adequate sunlight penetration',
        'Avoid unnecessary water spray directly onto leaves',
        'Monitor relative humidity during winter fog periods',
        'Remove infected plant debris post-harvest to prevent spore overwintering',
        'Use disease-resistant certified varieties like HD-3226, DBW-187, or GW-496',
      ],
      differentialPossibilities: [
        { issue: 'Yellow Leaf Rust (Puccinia striiformis)', probabilityPct: 72, isPrimary: true, category: 'Fungal' },
        { issue: 'Nutrient Deficiency (Potassium / Zinc chlorosis)', probabilityPct: 18, category: 'Nutrient' },
        { issue: 'Other Abiotic Leaf Bleaching / Moisture Stress', probabilityPct: 10, category: 'Abiotic' },
      ],
      imageQuality: {
        clarity: 'EXCELLENT',
        lighting: 'OPTIMAL',
        cropVisibility: 'CLEAR',
        leafVisibility: 'CLEAR',
        resolution: '1920x1080 (HD)',
        passed: true,
      },
      clusterAdvisory: 'Moderate prevalence reported in 3 neighboring plots in Anandpur North cluster. Inspect field margins.',
      advisoryDisclaimer: 'AI results are advisory. For serious or spreading crop problems, consult a qualified agriculture professional.',
      scannedAt: '2026-08-30T10:30:00Z',
      sampleImageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      farmerId: 'usr_farmer_ramesh',
    };

    const scan2: DiseaseScanResult = {
      id: 'scan_cotton_blight_02',
      cropName: 'Cotton',
      detectedCrop: 'Cotton (Gossypium hirsutum)',
      pathogen: 'Bacterial Blight / Angular Leaf Spot (Xanthomonas citri pv. malvacearum)',
      possibleDisease: 'Bacterial Blight',
      hindiName: 'कपास का जीवाणु झुलसा रोग (कोणीय पत्ती धब्बा)',
      confidenceScore: 94,
      confidenceExplanation: 'The AI is reasonably confident based on the visible symptoms, but this is not a laboratory diagnosis.',
      severity: 'MODERATE',
      symptoms: [
        'Water-soaked angular brown spots delineated by secondary veins',
        'Dark brownish necrotic lesions along central leaf veins',
        'Marginal leaf curling and chlorosis',
        'Affected leaf surface area: 24%',
      ],
      causes: [
        'Bacterial pathogen Xanthomonas citri pv. malvacearum',
        'High humidity (>80%) and intermittent monsoon showers',
        'Raindrop splash dissemination across foliage',
        'Excess foliage moisture and inadequate ventilation',
      ],
      recommendedAction: [
        'Inspect surrounding cotton plants for black-arm lesions.',
        'Prune severely diseased lower leaves and safely dispose off-field.',
        'Improve field drainage to eliminate stagnant puddle humidity.',
        'Avoid working in wet fields to prevent bacterial spread.',
        'Consult a local agriculture expert before applying chemical treatment.',
      ],
      recommendedOrganic: [
        'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Cow Urine (10%) + Asafetida',
        'Bio-enriched Trichoderma viride application at root zone',
      ],
      recommendedChemical: [
        'Streptocycline (1g) + Copper Oxychloride 50% WP (25g) in 10L water',
      ],
      preventionSteps: [
        'Maintain 90x60cm row-to-row spacing for airflow',
        'Avoid high-pressure overhead irrigation that splashes bacterial slime',
        'Monitor relative humidity during monsoon intervals',
        'Remove infected plant debris after harvest',
        'Select certified resistant hybrids like Shankar-6 or certified Bt varieties',
      ],
      differentialPossibilities: [
        { issue: 'Bacterial Leaf Blight (Xanthomonas)', probabilityPct: 78, isPrimary: true, category: 'Bacterial' },
        { issue: 'Alternaria Leaf Spot', probabilityPct: 14, category: 'Fungal' },
        { issue: 'Magnesium Deficiency Chlorosis', probabilityPct: 8, category: 'Nutrient' },
      ],
      imageQuality: {
        clarity: 'GOOD',
        lighting: 'GOOD',
        cropVisibility: 'CLEAR',
        leafVisibility: 'CLEAR',
        resolution: '1600x1200',
        passed: true,
      },
      clusterAdvisory: 'Bacterial blight alert active in Saurashtra cotton cluster. Check lower canopy.',
      advisoryDisclaimer: 'AI results are advisory. For serious or spreading crop problems, consult a qualified agriculture professional.',
      scannedAt: '2026-08-28T14:15:00Z',
      sampleImageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
      farmerId: 'usr_farmer_ramesh',
    };

    const scan3: DiseaseScanResult = {
      id: 'scan_tomato_blight_03',
      cropName: 'Tomato',
      detectedCrop: 'Tomato (Solanum lycopersicum)',
      pathogen: 'Early Blight & Target Spot (Alternaria solani)',
      possibleDisease: 'Early Blight',
      hindiName: 'टमाटर का अगेती झुलसा (टारगेट स्पॉट)',
      confidenceScore: 96,
      confidenceExplanation: 'The AI is reasonably confident based on the visible symptoms, but this is not a laboratory diagnosis.',
      severity: 'HIGH',
      symptoms: [
        'Concentric dark brown rings resembling a bullseye on older leaves',
        'Distinct yellow chlorotic halo surrounding necrotic spots',
        'Stem lesions and lower foliage withering',
        'Estimated affected leaf area: 32%',
      ],
      causes: [
        'Fungal pathogen Alternaria solani',
        'Warm temperatures (24°C - 29°C) combined with wet foliage',
        'Soil splashing during heavy irrigation or rain',
        'Crowded canopy with poor light penetration',
      ],
      recommendedAction: [
        'Inspect adjacent tomato and solanaceous plants immediately.',
        'Remove severely affected lower leaves touching the soil.',
        'Stake plants upright to improve ventilation and reduce soil contact.',
        'Water at root zone using drip irrigation, never spray overhead.',
        'Consult a local agriculture expert before applying chemical treatment.',
      ],
      recommendedOrganic: [
        'Bordeaux mixture (1%) spray or copper hydroxide 53.8% DF',
        'Bacillus subtilis bio-fungicide foliar application',
      ],
      recommendedChemical: [
        'Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L',
      ],
      preventionSteps: [
        'Maintain proper spacing and stake vines off the ground',
        'Mulch soil with straw or plastic to block soil-splash spores',
        'Avoid wetting leaves during afternoon hours',
        'Remove crop residue immediately after season',
        'Rotate with non-solanaceous crops (pulses/maize) for 2+ seasons',
      ],
      differentialPossibilities: [
        { issue: 'Early Blight (Alternaria solani)', probabilityPct: 84, isPrimary: true, category: 'Fungal' },
        { issue: 'Septoria Leaf Spot', probabilityPct: 11, category: 'Fungal' },
        { issue: 'Sunscald & Leaf Scorch', probabilityPct: 5, category: 'Abiotic' },
      ],
      imageQuality: {
        clarity: 'EXCELLENT',
        lighting: 'OPTIMAL',
        cropVisibility: 'CLEAR',
        leafVisibility: 'CLEAR',
        resolution: '2048x1536',
        passed: true,
      },
      clusterAdvisory: 'Vegetable growers cluster advised to inspect nursery beds and lower canopies.',
      advisoryDisclaimer: 'AI results are advisory. For serious or spreading crop problems, consult a qualified agriculture professional.',
      scannedAt: '2026-08-25T09:00:00Z',
      sampleImageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
      farmerId: 'usr_farmer_ramesh',
    };

    this.diseaseScans.set(scan1.id, scan1);
    this.diseaseScans.set(scan2.id, scan2);
    this.diseaseScans.set(scan3.id, scan3);

    this.budgetStats = {
      monthlyLimitInr: 1500,
      currentUsageInr: 4.85,
      remainingBudgetInr: 1495.15,
      totalApiRequests: 142,
      cachedRequestsSaved: 88,
      modelInUse: 'gemini-3.7-flash',
      breakdown: {
        geminiAiInr: 3.42,
        weatherApiInr: 0.85,
        algorandNodeInr: 0.58,
      },
    };
  }
}

export const db = new InMemoryDB();
