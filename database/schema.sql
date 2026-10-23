-- ============================================================================
-- KISAN BHAI PRODUCTION DATABASE SCHEMA (PostgreSQL 15+)
-- Small Farms. One Powerful Network.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types
CREATE TYPE user_role AS ENUM ('FARMER', 'EXPERT', 'ADMIN', 'BUYER', 'CHAMPION');
CREATE TYPE data_source_type AS ENUM ('LIVE_API', 'VERIFIED_DATABASE', 'ESTIMATE', 'DEMO');
CREATE TYPE crop_stage AS ENUM ('SOWING', 'VEGETATIVE', 'FLOWERING', 'GRAIN_FILLING', 'MATURITY', 'HARVESTED');
CREATE TYPE soil_moisture_level AS ENUM ('CRITICAL', 'LOW', 'OPTIMAL', 'SATURATED', 'WATERLOGGED');
CREATE TYPE pest_risk_level AS ENUM ('LOW', 'MODERATE', 'HIGH', 'SEVERE');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');

-- 1. USERS & FARMER PROFILES
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'FARMER',
    village VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    pincode VARCHAR(16),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    preferred_language VARCHAR(16) NOT NULL DEFAULT 'hi',
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS farmer_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_land_acres NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    irrigated_land_acres NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    irrigation_source VARCHAR(64) NOT NULL DEFAULT 'Borewell',
    soil_type VARCHAR(64) NOT NULL DEFAULT 'Clay Loam (Vertisol)',
    kisan_credit_card_holder BOOLEAN NOT NULL DEFAULT FALSE,
    pm_kisan_beneficiary BOOLEAN NOT NULL DEFAULT TRUE,
    algorand_wallet_address VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- 2. FARMS & CROPS
CREATE TABLE IF NOT EXISTS farms (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    survey_number VARCHAR(128),
    area_acres NUMERIC(8, 2) NOT NULL,
    soil_type VARCHAR(64) NOT NULL,
    water_source VARCHAR(64) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crops (
    id VARCHAR(64) PRIMARY KEY,
    farm_id VARCHAR(64) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(128) NOT NULL,
    hindi_name VARCHAR(128),
    variety VARCHAR(128) NOT NULL,
    season VARCHAR(32) NOT NULL DEFAULT 'Rabi',
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    area_acres NUMERIC(8, 2) NOT NULL,
    stage crop_stage NOT NULL DEFAULT 'SOWING',
    stage_progress_pct INT NOT NULL DEFAULT 0 CHECK (stage_progress_pct >= 0 AND stage_progress_pct <= 100),
    health_score INT NOT NULL DEFAULT 95 CHECK (health_score >= 0 AND health_score <= 100),
    expected_yield_quintals NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    actual_yield_quintals NUMERIC(8, 2),
    soil_moisture_status soil_moisture_level NOT NULL DEFAULT 'OPTIMAL',
    pest_vulnerability pest_risk_level NOT NULL DEFAULT 'LOW',
    pest_watchlist TEXT[] DEFAULT ARRAY[]::TEXT[],
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. SOIL RECORDS & NUTRIENT PROFILES
CREATE TABLE IF NOT EXISTS soil_records (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_id VARCHAR(64) REFERENCES farms(id) ON DELETE SET NULL,
    sample_id VARCHAR(128) NOT NULL,
    lab_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL,
    overall_health_score INT NOT NULL CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
    soil_type VARCHAR(64) NOT NULL,
    soil_ph NUMERIC(4, 2) NOT NULL,
    electrical_conductivity_ds_m NUMERIC(6, 3) NOT NULL,
    organic_carbon_pct NUMERIC(5, 3) NOT NULL,
    nitrogen_kg_ha NUMERIC(8, 2) NOT NULL,
    phosphorus_kg_ha NUMERIC(8, 2) NOT NULL,
    potassium_kg_ha NUMERIC(8, 2) NOT NULL,
    zinc_ppm NUMERIC(6, 2),
    iron_ppm NUMERIC(6, 2),
    manganese_ppm NUMERIC(6, 2),
    copper_ppm NUMERIC(6, 2),
    boron_ppm NUMERIC(6, 2),
    sulphur_ppm NUMERIC(6, 2),
    report_file_url TEXT,
    source_type data_source_type NOT NULL DEFAULT 'VERIFIED_DATABASE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. SMART IRRIGATION & SENSORS
CREATE TABLE IF NOT EXISTS irrigation_sensors (
    id VARCHAR(64) PRIMARY KEY,
    farm_id VARCHAR(64) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    sensor_name VARCHAR(128) NOT NULL,
    depth_inches INT NOT NULL DEFAULT 6,
    soil_moisture_pct NUMERIC(5, 2) NOT NULL,
    soil_temp_celsius NUMERIC(5, 2) NOT NULL,
    electrical_conductivity NUMERIC(5, 2) NOT NULL,
    battery_level_pct INT NOT NULL DEFAULT 95,
    last_ping TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) NOT NULL DEFAULT 'ONLINE'
);

CREATE TABLE IF NOT EXISTS irrigation_logs (
    id VARCHAR(64) PRIMARY KEY,
    farm_id VARCHAR(64) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    action VARCHAR(64) NOT NULL,
    duration_minutes INT NOT NULL,
    water_volume_liters NUMERIC(10, 2) NOT NULL,
    triggered_by VARCHAR(64) NOT NULL DEFAULT 'AI_AUTOMATION',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. DISEASE SCANS & VISION AUDIT
CREATE TABLE IF NOT EXISTS disease_scans (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(128) NOT NULL,
    image_storage_key VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    detected_disease VARCHAR(255) NOT NULL,
    hindi_disease_name VARCHAR(255),
    confidence_score NUMERIC(5, 2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    severity pest_risk_level NOT NULL DEFAULT 'MODERATE',
    symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
    organic_remedy TEXT NOT NULL,
    chemical_remedy TEXT NOT NULL,
    preventive_measures TEXT[] DEFAULT ARRAY[]::TEXT[],
    model_version VARCHAR(64) NOT NULL DEFAULT 'gemini-3.7-vision-agri-v1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. AI CONVERSATIONS & SESSIONS
CREATE TABLE IF NOT EXISTS ai_conversations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Farming Consultation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(16) NOT NULL CHECK (sender IN ('user', 'model', 'system')),
    content TEXT NOT NULL,
    audio_url TEXT,
    action_cards JSONB,
    tokens_used INT DEFAULT 0,
    cost_inr NUMERIC(8, 4) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. MANDI MARKET PRICES & PURCHASES
CREATE TABLE IF NOT EXISTS market_prices (
    id VARCHAR(64) PRIMARY KEY,
    commodity VARCHAR(128) NOT NULL,
    hindi_commodity VARCHAR(128),
    variety VARCHAR(128),
    market_name VARCHAR(255) NOT NULL,
    district VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    min_price_inr NUMERIC(10, 2) NOT NULL,
    max_price_inr NUMERIC(10, 2) NOT NULL,
    modal_price_inr NUMERIC(10, 2) NOT NULL,
    msp_price_inr NUMERIC(10, 2),
    price_trend VARCHAR(16) NOT NULL DEFAULT 'STABLE',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_type data_source_type NOT NULL DEFAULT 'LIVE_API'
);

-- 8. FARM DIARY & EXPENSES / REVENUE
CREATE TABLE IF NOT EXISTS farm_diary (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_id VARCHAR(64) REFERENCES crops(id) ON DELETE SET NULL,
    entry_date DATE NOT NULL,
    category VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    quantity_or_dose VARCHAR(128),
    expense_amount_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    revenue_amount_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    voice_note_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. GOVERNMENT SCHEMES
CREATE TABLE IF NOT EXISTS government_schemes (
    id VARCHAR(64) PRIMARY KEY,
    scheme_name VARCHAR(255) NOT NULL,
    hindi_name VARCHAR(255),
    category VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    eligibility_criteria TEXT[] NOT NULL,
    benefits_summary TEXT NOT NULL,
    financial_subsidy_pct NUMERIC(5, 2),
    max_subsidy_inr NUMERIC(12, 2),
    official_portal_url TEXT NOT NULL,
    last_verified_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. COMMUNITY POSTS & MODERATION
CREATE TABLE IF NOT EXISTS community_posts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(32) NOT NULL DEFAULT 'FARMER',
    village VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    tag VARCHAR(64) NOT NULL DEFAULT 'Crop Health',
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    is_moderated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_comments (
    id VARCHAR(64) PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(32) NOT NULL DEFAULT 'FARMER',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. AUDIT LOGS & API TELEMETRY
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_id VARCHAR(64),
    actor_role VARCHAR(32),
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(128) NOT NULL,
    resource_id VARCHAR(128),
    details JSONB,
    ip_address VARCHAR(64),
    user_agent TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_usage_metrics (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    endpoint VARCHAR(255) NOT NULL,
    service_type VARCHAR(64) NOT NULL,
    status_code INT NOT NULL,
    response_duration_ms INT NOT NULL,
    tokens_consumed INT DEFAULT 0,
    cost_inr NUMERIC(8, 4) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON crops(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_soil_user_id ON soil_records(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_scans_user_id ON disease_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_commodity ON market_prices(commodity, district);
CREATE INDEX IF NOT EXISTS idx_farm_diary_user_date ON farm_diary(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_community_posts_tag ON community_posts(tag, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_metrics(created_at DESC);
