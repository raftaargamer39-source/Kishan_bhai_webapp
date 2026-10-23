-- Migration: 001_initial_schema
-- Created: 2026-08-31
-- Description: Core tables for users, farmer profiles, farms, and crops

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'FARMER',
    village VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    pincode VARCHAR(16),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    preferred_language VARCHAR(16) NOT NULL DEFAULT 'hi',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    CONSTRAINT unique_user_profile_m1 UNIQUE (user_id)
);
