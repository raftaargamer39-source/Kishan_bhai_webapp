/**
 * Supabase Service Provider for Kishan Bhai
 * Handles real-time client initialization, strongly typed database schemas,
 * real-time subscriptions, and persistent CRUD operations for users, farms, and transactions.
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export interface DatabaseSchema {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<UserRow>;
      };
      farms: {
        Row: FarmRow;
        Insert: Omit<FarmRow, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<FarmRow>;
      };
      transactions: {
        Row: TransactionRow;
        Insert: Omit<TransactionRow, 'created_at'> & { created_at?: string };
        Update: Partial<TransactionRow>;
      };
      clusters: {
        Row: ClusterRow;
        Insert: Omit<ClusterRow, 'created_at'> & { created_at?: string };
        Update: Partial<ClusterRow>;
      };
      harvest_lots: {
        Row: HarvestLotRow;
        Insert: Omit<HarvestLotRow, 'created_at'> & { created_at?: string };
        Update: Partial<HarvestLotRow>;
      };
      bulk_orders: {
        Row: BulkOrderRow;
        Insert: Omit<BulkOrderRow, 'created_at'> & { created_at?: string };
        Update: Partial<BulkOrderRow>;
      };
      appointments: {
        Row: AppointmentRow;
        Insert: Partial<AppointmentRow> & { farmer_name: string; farmer_phone: string; expert_name: string; problem_description: string; preferred_slot: string };
        Update: Partial<AppointmentRow>;
      };
      user_logins: {
        Row: UserLoginRow;
        Insert: Partial<UserLoginRow> & { user_id: string; user_name: string };
        Update: Partial<UserLoginRow>;
      };
    };
  };
}

// 1. Database Table Row Types
export interface UserLoginRow {
  id: string;
  user_id: string;
  user_name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  village?: string | null;
  state?: string | null;
  login_method: string;
  login_time: string;
  device_info?: string | null;
  metadata?: Record<string, any>;
}

export interface AppointmentRow {
  id: string;
  farmer_id?: string;
  farmer_name: string;
  farmer_phone: string;
  farmer_village?: string;
  farmer_state?: string;
  expert_id: string;
  expert_name: string;
  expert_specialization?: string;
  expert_institution?: string;
  consultation_type: 'VOICE' | 'VIDEO';
  preferred_slot: string;
  problem_description: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  metadata?: Record<string, any>;
  created_at: string;
}
export interface UserRow {
  id: string;
  full_name: string;
  phone: string;
  role: 'FARMER' | 'CHAMPION' | 'ADMIN' | 'INSTITUTIONAL_BUYER';
  village: string;
  state: string;
  cluster_id?: string | null;
  preferred_language: 'hi' | 'en' | 'gu' | 'mr';
  is_verified?: boolean;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmRow {
  id: string;
  user_id: string;
  farm_name: string;
  size_acres: number;
  soil_type: 'Black Cotton (Regur)' | 'Alluvial Silt' | 'Red Sandy Loam' | 'Clayey Loam';
  irrigation_type: 'Drip' | 'Sprinkler' | 'Canal Furrow' | 'Rainfed';
  crops: string[];
  village: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  soil_ph?: number | null;
  organic_carbon_pct?: number | null;
  nitrogen_kg_ha?: number | null;
  phosphorus_kg_ha?: number | null;
  potassium_kg_ha?: number | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  service_id: string;
  service_name: string;
  amount_usdc: number;
  amount_inr?: number;
  asset: string;
  network: string;
  status: 'INITIATED' | 'PENDING' | 'SETTLED' | 'FAILED';
  tx_id: string;
  sender_address: string;
  receiver_address: string;
  facilitator: string;
  explorer_url: string;
  is_real_blockchain_tx: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ClusterRow {
  id: string;
  name: string;
  village: string;
  state: string;
  champion_id: string;
  champion_name: string;
  total_acres: number;
  member_count: number;
  primary_crops: string[];
  collective_harvest_kg: number;
  bulk_savings_percent: number;
  description?: string;
  created_at: string;
}

export interface HarvestLotRow {
  id: string;
  cluster_id: string;
  farmer_id: string;
  farmer_name: string;
  crop: string;
  variety: string;
  quantity_kg: number;
  quality_grade: 'A+ Export' | 'Grade A Premium' | 'Grade B Standard' | 'Organic Certified';
  expected_harvest_date: string;
  min_price_per_kg: number;
  status: 'AVAILABLE' | 'BID_ACCEPTED' | 'SOLD' | 'DISPATCHED';
  moisture_pct: number;
  notes?: string;
  created_at: string;
}

export interface BulkOrderRow {
  id: string;
  cluster_id: string;
  category: 'Fertilizer' | 'Seeds' | 'Pesticides' | 'Equipment';
  item_name: string;
  target_quantity: number;
  current_quantity: number;
  unit: string;
  standard_price: number;
  bulk_price: number;
  savings_pct: number;
  status: 'AGGREGATING' | 'ORDERED' | 'DISPATCHED' | 'DELIVERED';
  deadline_date: string;
  created_at: string;
}

// 2. Client Initialization (Environment-safe & Lazy)
export const SUPABASE_PROJECT_ID = 'sphasblonzgvkninmjva';
const DEFAULT_SUPABASE_URL = 'https://sphasblonzgvkninmjva.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_eEBFN75JQVyYkZ-8kXT5nw_PZCbgS31';

const getEnv = (key: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch {}
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key] as string;
    }
  } catch {}
  return '';
};

export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || DEFAULT_SUPABASE_ANON_KEY;

let clientInstance: SupabaseClient<DatabaseSchema> | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-supabase'));
};

export const getSupabase = (): SupabaseClient<DatabaseSchema> | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient<DatabaseSchema>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return clientInstance;
};

// 3. PostgreSQL Database Schema Definition (SQL DDL script)
export const SUPABASE_APPOINTMENTS_ONLY_SQL = `
-- ============================================================================
-- Kishan Bhai - Appointments Table for Supabase (Run in SQL Editor)
-- Project: sphasblonzgvkninmjva
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY DEFAULT ('apt_' || replace(gen_random_uuid()::text, '-', '')),
  farmer_id TEXT,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  farmer_village TEXT,
  farmer_state TEXT,
  expert_id TEXT NOT NULL,
  expert_name TEXT NOT NULL,
  expert_specialization TEXT,
  expert_institution TEXT,
  consultation_type TEXT NOT NULL DEFAULT 'VOICE' CHECK (consultation_type IN ('VOICE', 'VIDEO')),
  preferred_slot TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Realtime Publication for instant appointment updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Public Access Policies
CREATE POLICY "Public read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Public insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update appointments" ON public.appointments FOR UPDATE USING (true);
`;

export const SUPABASE_USER_LOGINS_SQL = `
-- ============================================================================
-- Kishan Bhai - User Logins Table for Supabase (Run in SQL Editor)
-- Project: sphasblonzgvkninmjva
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_logins (
  id TEXT PRIMARY KEY DEFAULT ('log_' || replace(gen_random_uuid()::text, '-', '')),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'FARMER',
  village TEXT,
  state TEXT,
  login_method TEXT NOT NULL DEFAULT 'phone',
  login_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_info TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Realtime Broadcasts
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_logins;

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;

-- Public Access Policies
CREATE POLICY "Public read user_logins" ON public.user_logins FOR SELECT USING (true);
CREATE POLICY "Public insert user_logins" ON public.user_logins FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update user_logins" ON public.user_logins FOR UPDATE USING (true);
`;

export const SUPABASE_COMBINED_ESSENTIALS_SQL = `
-- ============================================================================
-- Kishan Bhai - Combined Appointments & User Logins Tables
-- Project: sphasblonzgvkninmjva
-- ============================================================================

-- 1. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY DEFAULT ('apt_' || replace(gen_random_uuid()::text, '-', '')),
  farmer_id TEXT,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  farmer_village TEXT,
  farmer_state TEXT,
  expert_id TEXT NOT NULL,
  expert_name TEXT NOT NULL,
  expert_specialization TEXT,
  expert_institution TEXT,
  consultation_type TEXT NOT NULL DEFAULT 'VOICE' CHECK (consultation_type IN ('VOICE', 'VIDEO')),
  preferred_slot TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. USER LOGINS TABLE
CREATE TABLE IF NOT EXISTS public.user_logins (
  id TEXT PRIMARY KEY DEFAULT ('log_' || replace(gen_random_uuid()::text, '-', '')),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'FARMER',
  village TEXT,
  state TEXT,
  login_method TEXT NOT NULL DEFAULT 'phone',
  login_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_info TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Realtime Broadcasts
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments, public.user_logins;

-- Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;

-- Public Access Policies
CREATE POLICY "Public read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Public insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update appointments" ON public.appointments FOR UPDATE USING (true);

CREATE POLICY "Public read user_logins" ON public.user_logins FOR SELECT USING (true);
CREATE POLICY "Public insert user_logins" ON public.user_logins FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update user_logins" ON public.user_logins FOR UPDATE USING (true);
`;

export const SUPABASE_SQL_SCHEMA = `
-- ============================================================================
-- Kishan Bhai - PostgreSQL Schema for Supabase
-- Tables: users, farms, transactions, clusters, harvest_lots, bulk_orders, appointments
-- Includes Row Level Security (RLS) & Realtime Publication
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('FARMER', 'CHAMPION', 'ADMIN', 'INSTITUTIONAL_BUYER')),
  village TEXT NOT NULL,
  state TEXT NOT NULL,
  cluster_id TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'hi' CHECK (preferred_language IN ('hi', 'en', 'gu', 'mr')),
  is_verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. FARMS TABLE
CREATE TABLE IF NOT EXISTS public.farms (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  size_acres NUMERIC(6, 2) NOT NULL,
  soil_type TEXT NOT NULL,
  irrigation_type TEXT NOT NULL,
  crops TEXT[] NOT NULL DEFAULT '{}',
  village TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  soil_ph NUMERIC(4, 2),
  organic_carbon_pct NUMERIC(4, 2),
  nitrogen_kg_ha NUMERIC(6, 2),
  phosphorus_kg_ha NUMERIC(6, 2),
  potassium_kg_ha NUMERIC(6, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TRANSACTIONS TABLE (Algorand Settlements)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  amount_usdc NUMERIC(10, 4) NOT NULL,
  amount_inr NUMERIC(10, 2),
  asset TEXT NOT NULL DEFAULT 'USDC',
  network TEXT NOT NULL DEFAULT 'Algorand Testnet',
  status TEXT NOT NULL CHECK (status IN ('INITIATED', 'PENDING', 'SETTLED', 'FAILED')),
  tx_id TEXT NOT NULL UNIQUE,
  sender_address TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  facilitator TEXT NOT NULL DEFAULT 'GoPlausible',
  explorer_url TEXT NOT NULL,
  is_real_blockchain_tx BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CLUSTERS TABLE
CREATE TABLE IF NOT EXISTS public.clusters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  village TEXT NOT NULL,
  state TEXT NOT NULL,
  champion_id TEXT NOT NULL,
  champion_name TEXT NOT NULL,
  total_acres NUMERIC(8, 2) NOT NULL DEFAULT 0,
  member_count INT NOT NULL DEFAULT 1,
  primary_crops TEXT[] NOT NULL DEFAULT '{}',
  collective_harvest_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
  bulk_savings_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. HARVEST LOTS TABLE
CREATE TABLE IF NOT EXISTS public.harvest_lots (
  id TEXT PRIMARY KEY,
  cluster_id TEXT NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
  farmer_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  crop TEXT NOT NULL,
  variety TEXT NOT NULL,
  quantity_kg NUMERIC(10, 2) NOT NULL,
  quality_grade TEXT NOT NULL,
  expected_harvest_date DATE NOT NULL,
  min_price_per_kg NUMERIC(8, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BID_ACCEPTED', 'SOLD', 'DISPATCHED')),
  moisture_pct NUMERIC(4, 2) NOT NULL DEFAULT 8.0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. BULK ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.bulk_orders (
  id TEXT PRIMARY KEY,
  cluster_id TEXT NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('Fertilizer', 'Seeds', 'Pesticides', 'Equipment')),
  item_name TEXT NOT NULL,
  target_quantity NUMERIC(10, 2) NOT NULL,
  current_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  standard_price NUMERIC(10, 2) NOT NULL,
  bulk_price NUMERIC(10, 2) NOT NULL,
  savings_pct NUMERIC(5, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'AGGREGATING' CHECK (status IN ('AGGREGATING', 'ORDERED', 'DISPATCHED', 'DELIVERED')),
  deadline_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. APPOINTMENTS TABLE (Talk to Agri-Expert Bookings)
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY DEFAULT ('apt_' || replace(gen_random_uuid()::text, '-', '')),
  farmer_id TEXT,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  farmer_village TEXT,
  farmer_state TEXT,
  expert_id TEXT NOT NULL,
  expert_name TEXT NOT NULL,
  expert_specialization TEXT,
  expert_institution TEXT,
  consultation_type TEXT NOT NULL DEFAULT 'VOICE' CHECK (consultation_type IN ('VOICE', 'VIDEO')),
  preferred_slot TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Realtime Publication for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.users, public.farms, public.transactions, public.harvest_lots, public.bulk_orders, public.appointments;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Public Access Policies
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public write users" ON public.users FOR ALL USING (true);

CREATE POLICY "Public read farms" ON public.farms FOR SELECT USING (true);
CREATE POLICY "Public write farms" ON public.farms FOR ALL USING (true);

CREATE POLICY "Public read transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Public write transactions" ON public.transactions FOR ALL USING (true);

CREATE POLICY "Public read clusters" ON public.clusters FOR SELECT USING (true);
CREATE POLICY "Public write clusters" ON public.clusters FOR ALL USING (true);

CREATE POLICY "Public read harvest_lots" ON public.harvest_lots FOR SELECT USING (true);
CREATE POLICY "Public write harvest_lots" ON public.harvest_lots FOR ALL USING (true);

CREATE POLICY "Public read bulk_orders" ON public.bulk_orders FOR SELECT USING (true);
CREATE POLICY "Public write bulk_orders" ON public.bulk_orders FOR ALL USING (true);

CREATE POLICY "Public read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Public write appointments" ON public.appointments FOR ALL USING (true);
`;

// 4. Real-time Service Layer & CRUD Handlers

/**
 * Real-time Subscription to Transactions Table
 */
export function subscribeToTransactions(
  onInsert: (tx: TransactionRow) => void,
  onUpdate?: (tx: TransactionRow) => void
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channel = supabase
    .channel('realtime_transactions')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'transactions' },
      (payload) => onInsert(payload.new as TransactionRow)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'transactions' },
      (payload) => onUpdate && onUpdate(payload.new as TransactionRow)
    )
    .subscribe();

  return channel;
}

/**
 * Real-time Subscription to Farms Table
 */
export function subscribeToFarms(
  onUpdate: (farm: FarmRow) => void
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channel = supabase
    .channel('realtime_farms')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'farms' },
      (payload) => onUpdate(payload.new as FarmRow)
    )
    .subscribe();

  return channel;
}

/**
 * Real-time Subscription to Users Table
 */
export function subscribeToUsers(
  onUpdate: (user: UserRow) => void
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channel = supabase
    .channel('realtime_users')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'users' },
      (payload) => onUpdate(payload.new as UserRow)
    )
    .subscribe();

  return channel;
}

// 5. Data Access Methods with Fallback Resilience

/**
 * Fetch all farms for a specific user
 */
export async function getFarmsByUserId(userId: string): Promise<FarmRow[]> {
  const supabase = getSupabase();
  if (!supabase) {
    // Local memory fallback
    return [
      {
        id: 'farm_01',
        user_id: userId,
        farm_name: 'Anandpur North Field',
        size_acres: 4.5,
        soil_type: 'Black Cotton (Regur)',
        irrigation_type: 'Drip',
        crops: ['Cotton (Bt)', 'Groundnut (GG-20)', 'Sharbati Wheat'],
        village: 'Anandpur',
        state: 'Gujarat',
        latitude: 22.3039,
        longitude: 70.8022,
        soil_ph: 7.2,
        organic_carbon_pct: 0.65,
        nitrogen_kg_ha: 145,
        phosphorus_kg_ha: 22,
        potassium_kg_ha: 310,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.warn('[Supabase] Failed to fetch farms, returning empty list:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Save or update farm details
 */
export async function upsertFarm(farm: Partial<FarmRow> & { id: string; user_id: string }): Promise<FarmRow | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return farm as FarmRow;
  }

  const payload: any = {
    ...farm,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('farms')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Upsert farm error:', error.message);
    return null;
  }
  return data;
}

/**
 * Record a settled blockchain transaction
 */
export async function recordTransaction(tx: Omit<TransactionRow, 'created_at'>): Promise<TransactionRow | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ...tx, created_at: new Date().toISOString() };
  }

  const { data, error } = await (supabase.from('transactions') as any)
    .insert([tx])
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Record transaction error:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch recent transactions for a user
 */
export async function getTransactionsByUserId(userId: string): Promise<TransactionRow[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.warn('[Supabase] Fetch transactions error:', error.message);
    return [];
  }
  return data || [];
}

// 6. Appointment Booking Integration Layer (Talk to Expert & KVK Advisory)

const APPOINTMENTS_STORAGE_KEY = 'kb_appointments_cache';

const getCachedAppointments = (): AppointmentRow[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (e) {
    console.warn('[Supabase Cache] Failed to read appointments cache:', e);
  }
  return [];
};

const saveCachedAppointments = (appointments: AppointmentRow[]): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    }
  } catch (e) {
    console.warn('[Supabase Cache] Failed to write appointments cache:', e);
  }
};

/**
 * Record a new expert consultation appointment into Supabase
 */
export async function recordAppointment(
  appointment: Omit<AppointmentRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
): Promise<{ success: boolean; data: AppointmentRow; savedToSupabase: boolean; error?: string }> {
  const generatedId = appointment.id || `apt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullRecord: AppointmentRow = {
    ...appointment,
    id: generatedId,
    status: appointment.status || 'CONFIRMED',
    created_at: appointment.created_at || new Date().toISOString(),
  };

  // Always store in local cache first for instant UI response and offline safety
  const localList = getCachedAppointments();
  const updatedList = [fullRecord, ...localList.filter((a) => a.id !== fullRecord.id)];
  saveCachedAppointments(updatedList);

  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: true,
      data: fullRecord,
      savedToSupabase: false,
      error: 'Supabase client is not configured with valid credentials.',
    };
  }

  try {
    // Attempt insert into Supabase appointments table
    const { data, error } = await (supabase.from('appointments') as any)
      .insert([fullRecord])
      .select()
      .single();

    if (error) {
      console.warn('[Supabase] Failed to write appointment to public.appointments:', error.message);
      return {
        success: true,
        data: fullRecord,
        savedToSupabase: false,
        error: error.message,
      };
    }

    // Success in Supabase!
    const savedRecord = (data as AppointmentRow) || fullRecord;
    const syncedList = [savedRecord, ...localList.filter((a) => a.id !== savedRecord.id)];
    saveCachedAppointments(syncedList);

    return {
      success: true,
      data: savedRecord,
      savedToSupabase: true,
    };
  } catch (err: any) {
    console.error('[Supabase] Unexpected exception writing appointment:', err);
    return {
      success: true,
      data: fullRecord,
      savedToSupabase: false,
      error: err?.message || 'Network exception',
    };
  }
}

/**
 * Fetch all appointments from Supabase, seamlessly falling back or merging with cached items
 */
export async function getAppointments(farmerPhoneOrId?: string): Promise<{ appointments: AppointmentRow[]; source: 'supabase' | 'local' }> {
  const localItems = getCachedAppointments();
  const supabase = getSupabase();

  if (!supabase) {
    return { appointments: localItems, source: 'local' };
  }

  try {
    let query = supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (farmerPhoneOrId) {
      query = query.or(`farmer_phone.eq.${farmerPhoneOrId},farmer_id.eq.${farmerPhoneOrId}`);
    }
    const { data, error } = await query.limit(50);

    if (error) {
      console.warn('[Supabase] Could not fetch appointments from database:', error.message);
      return { appointments: localItems, source: 'local' };
    }

    if (data && Array.isArray(data)) {
      // Merge unique appointments
      const map = new Map<string, AppointmentRow>();
      (data as AppointmentRow[]).forEach((item) => map.set(item.id, item));
      localItems.forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      });
      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      saveCachedAppointments(combined);
      return { appointments: combined, source: 'supabase' };
    }
  } catch (e: any) {
    console.warn('[Supabase] Fetch error:', e?.message);
  }

  return { appointments: localItems, source: 'local' };
}

/**
 * Real-time Subscription to new appointments
 */
export function subscribeToAppointments(
  onInsert: (app: AppointmentRow) => void
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const channel = supabase
      .channel('realtime_appointments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'appointments' },
        (payload) => {
          if (payload.new) {
            onInsert(payload.new as AppointmentRow);
          }
        }
      )
      .subscribe();

    return channel;
  } catch (e) {
    console.warn('[Supabase Realtime] Could not subscribe to appointments:', e);
    return null;
  }
}

/**
 * Check Supabase backend health and appointments table readiness
 */
export async function checkSupabaseHealth(): Promise<{
  configured: boolean;
  connected: boolean;
  tableExists: boolean;
  projectId: string;
  url: string;
  errorMessage?: string;
}> {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return {
      configured: false,
      connected: false,
      tableExists: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      errorMessage: 'Supabase credentials not configured.',
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      configured: true,
      connected: false,
      tableExists: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      errorMessage: 'Failed to initialize Supabase client instance.',
    };
  }

  try {
    const { data, error } = await supabase.from('appointments').select('id').limit(1);
    if (error) {
      // Table doesn't exist yet or permission denied
      const isMissingTable = error.code === 'PGRST205' || error.message.includes('Could not find the table');
      return {
        configured: true,
        connected: true,
        tableExists: !isMissingTable,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        errorMessage: error.message,
      };
    }
    return {
      configured: true,
      connected: true,
      tableExists: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      tableExists: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      errorMessage: err?.message || 'Connection failure',
    };
  }
}

// 7. User Sign-in & Authentication Tracking Layer

const USER_LOGINS_STORAGE_KEY = 'kb_user_logins_cache';

const getCachedUserLogins = (): UserLoginRow[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(USER_LOGINS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (e) {
    console.warn('[Supabase Cache] Failed to read logins cache:', e);
  }
  return [];
};

const saveCachedUserLogins = (logins: UserLoginRow[]): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(USER_LOGINS_STORAGE_KEY, JSON.stringify(logins.slice(0, 30)));
    }
  } catch (e) {
    console.warn('[Supabase Cache] Failed to write logins cache:', e);
  }
};

/**
 * Record a user login into Supabase user_logins table
 */
export async function recordUserLogin(
  login: Omit<UserLoginRow, 'id' | 'login_time'> & { id?: string; login_time?: string }
): Promise<{ success: boolean; data: UserLoginRow; savedToSupabase: boolean; error?: string }> {
  const generatedId = login.id || `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullRecord: UserLoginRow = {
    ...login,
    id: generatedId,
    login_time: login.login_time || new Date().toISOString(),
  };

  // Cache locally
  const localList = getCachedUserLogins();
  const updatedList = [fullRecord, ...localList.filter((l) => l.id !== fullRecord.id)].slice(0, 30);
  saveCachedUserLogins(updatedList);

  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: true,
      data: fullRecord,
      savedToSupabase: false,
      error: 'Supabase client is not configured.',
    };
  }

  try {
    const { data, error } = await (supabase.from('user_logins') as any)
      .insert([fullRecord])
      .select()
      .single();

    if (error) {
      console.warn('[Supabase] Failed to write to public.user_logins:', error.message);
      return {
        success: true,
        data: fullRecord,
        savedToSupabase: false,
        error: error.message,
      };
    }

    const savedRecord = (data as UserLoginRow) || fullRecord;
    const syncedList = [savedRecord, ...localList.filter((l) => l.id !== savedRecord.id)].slice(0, 30);
    saveCachedUserLogins(syncedList);

    return {
      success: true,
      data: savedRecord,
      savedToSupabase: true,
    };
  } catch (err: any) {
    console.warn('[Supabase] Exception writing user login:', err?.message);
    return {
      success: true,
      data: fullRecord,
      savedToSupabase: false,
      error: err?.message,
    };
  }
}

/**
 * Fetch recent user logins from Supabase
 */
export async function getUserLogins(limit = 20): Promise<{ logins: UserLoginRow[]; source: 'supabase' | 'local' }> {
  let localItems = getCachedUserLogins();

  // Also query /api/auth/recent-logins (works on both local server and Netlify client engine)
  try {
    const apiRes = await fetch('/api/auth/recent-logins');
    if (apiRes.ok) {
      const apiData = await apiRes.json();
      if (apiData && Array.isArray(apiData.logins) && apiData.logins.length > 0) {
        const map = new Map<string, UserLoginRow>();
        apiData.logins.forEach((l: UserLoginRow) => map.set(l.id, l));
        localItems.forEach((l) => {
          if (!map.has(l.id)) map.set(l.id, l);
        });
        localItems = Array.from(map.values())
          .sort((a, b) => new Date(b.login_time).getTime() - new Date(a.login_time).getTime())
          .slice(0, limit);
        saveCachedUserLogins(localItems);
      }
    }
  } catch {}

  const supabase = getSupabase();
  if (!supabase) {
    return { logins: localItems, source: 'local' };
  }

  try {
    const supabasePromise = (supabase.from('user_logins') as any)
      .select('*')
      .order('login_time', { ascending: false })
      .limit(limit);
    const timeoutPromise = new Promise<{ data: null; error: any }>((r) =>
      setTimeout(() => r({ data: null, error: new Error('Supabase query timeout') }), 800)
    );

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]);

    if (!error && data && Array.isArray(data) && data.length > 0) {
      const map = new Map<string, UserLoginRow>();
      (data as UserLoginRow[]).forEach((item) => map.set(item.id, item));
      localItems.forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      });
      const combined = Array.from(map.values())
        .sort((a, b) => new Date(b.login_time).getTime() - new Date(a.login_time).getTime())
        .slice(0, limit);
      saveCachedUserLogins(combined);
      return { logins: combined, source: 'supabase' };
    }
  } catch (err: any) {
    // Graceful fallback to localItems
  }

  return { logins: localItems, source: 'local' };
}

/**
 * Real-time subscription to user logins
 */
export function subscribeToUserLogins(
  onInsert: (login: UserLoginRow) => void
): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const channel = supabase
      .channel('realtime_user_logins')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_logins' },
        (payload) => {
          if (payload.new) {
            onInsert(payload.new as UserLoginRow);
          }
        }
      )
      .subscribe();

    return channel;
  } catch (e) {
    console.warn('[Supabase Realtime] Could not subscribe to user_logins:', e);
    return null;
  }
}
