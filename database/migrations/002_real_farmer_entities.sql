-- Migration: 002_real_farmer_entities
-- Created: 2026-08-31
-- Description: Tables for farms, soil records, disease scans, smart irrigation, market prices, and audit logs

CREATE TABLE IF NOT EXISTS farms (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    area_acres NUMERIC(8, 2) NOT NULL,
    soil_type VARCHAR(64) NOT NULL,
    water_source VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crops (
    id VARCHAR(64) PRIMARY KEY,
    farm_id VARCHAR(64) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(128) NOT NULL,
    variety VARCHAR(128) NOT NULL,
    season VARCHAR(32) NOT NULL DEFAULT 'Rabi',
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    area_acres NUMERIC(8, 2) NOT NULL,
    stage VARCHAR(64) NOT NULL DEFAULT 'SOWING',
    stage_progress_pct INT NOT NULL DEFAULT 0,
    health_score INT NOT NULL DEFAULT 95,
    expected_yield_quintals NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disease_scans (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(128) NOT NULL,
    image_storage_key VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    detected_disease VARCHAR(255) NOT NULL,
    confidence_score NUMERIC(5, 2) NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'MODERATE',
    organic_remedy TEXT NOT NULL,
    chemical_remedy TEXT NOT NULL,
    model_version VARCHAR(64) NOT NULL DEFAULT 'gemini-3.7-vision-agri-v1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_id VARCHAR(64),
    actor_role VARCHAR(32),
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(128) NOT NULL,
    resource_id VARCHAR(128),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
