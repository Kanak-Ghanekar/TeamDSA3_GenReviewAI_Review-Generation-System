-- Enable necessary extensions (UUID generation and pgvector for future RAG)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- -------------------------------------------------------------
-- 1. DROP TABLES & ENUMS IF THEY EXIST (For clean resets)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS rag_documents CASCADE;
DROP TABLE IF EXISTS retention_predictions CASCADE;
DROP TABLE IF EXISTS complaint_severity CASCADE;
DROP TABLE IF EXISTS sentiment_labels CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS private_feedback CASCADE;
DROP TABLE IF EXISTS ai_drafts CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS review_sessions CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS business_templates CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS "BusinessCategory" CASCADE;
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "FunnelStage" CASCADE;
DROP TYPE IF EXISTS "RoutedPath" CASCADE;
DROP TYPE IF EXISTS "FeedbackStatus" CASCADE;
DROP TYPE IF EXISTS "AlertChannel" CASCADE;
DROP TYPE IF EXISTS "Sentiment" CASCADE;
DROP TYPE IF EXISTS "Intent" CASCADE;
DROP TYPE IF EXISTS "Severity" CASCADE;
DROP TYPE IF EXISTS "DocumentType" CASCADE;

-- -------------------------------------------------------------
-- 2. CREATE ENUM TYPES
-- -------------------------------------------------------------
CREATE TYPE "BusinessCategory" AS ENUM ('restaurant', 'tyre_shop', 'salon_retail', 'hotel', 'other');
CREATE TYPE "Role" AS ENUM ('owner', 'graphura_admin');
CREATE TYPE "FunnelStage" AS ENUM ('scanned', 'rated', 'completed', 'abandoned');
CREATE TYPE "RoutedPath" AS ENUM ('public', 'private');
CREATE TYPE "FeedbackStatus" AS ENUM ('new', 'in_progress', 'resolved', 'escalated');
CREATE TYPE "AlertChannel" AS ENUM ('dashboard', 'whatsapp', 'email');
CREATE TYPE "Sentiment" AS ENUM ('positive', 'neutral', 'negative', 'mixed');
CREATE TYPE "Intent" AS ENUM ('complaint', 'suggestion', 'appreciation', 'inquiry');
CREATE TYPE "Severity" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "DocumentType" AS ENUM ('review', 'faq', 'branding_guideline', 'menu_item');

-- -------------------------------------------------------------
-- 3. CREATE OPERATIONAL TABLES
-- -------------------------------------------------------------

-- USERS TABLE (Owners & Admins)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role "Role" NOT NULL DEFAULT 'owner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BUSINESS TEMPLATES TABLE
CREATE TABLE business_templates (
    template_key TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    tone_descriptor TEXT NOT NULL,
    color_tokens JSONB NOT NULL,
    default_tags JSONB NOT NULL -- stored as jsonb array: ["Friendly Staff", etc.]
);

-- BUSINESSES TABLE (Scoped to Owner)
CREATE TABLE businesses (
    business_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category "BusinessCategory" NOT NULL,
    template_key TEXT NOT NULL REFERENCES business_templates(template_key),
    google_place_id TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    country_code TEXT,
    rating_threshold NUMERIC(2,1) NOT NULL DEFAULT 4.0,
    cooldown_hours INT NOT NULL DEFAULT 24,
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DEVICES TABLE (Anonymous fingerprint for cooldown check)
CREATE TABLE devices (
    device_id TEXT NOT NULL,
    business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
    last_submission_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (device_id, business_id)
);

-- REVIEW SESSIONS TABLE (Dashboard Funnel tracking)
CREATE TABLE review_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
    device_id TEXT,
    funnel_stage "FunnelStage" NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- RATINGS TABLE
CREATE TABLE ratings (
    rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES review_sessions(session_id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
    stars SMALLINT NOT NULL CHECK (stars >= 1 AND stars <= 5),
    selected_tags JSONB NOT NULL, -- JSONB text[] equivalent
    routed_path "RoutedPath" NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI DRAFTS TABLE
CREATE TABLE ai_drafts (
    draft_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rating_id UUID NOT NULL REFERENCES ratings(rating_id) ON DELETE CASCADE,
    draft_options JSONB NOT NULL, -- JSONB text[] of generated variations
    selected_option_index SMALLINT,
    edited_text TEXT,
    posted_to_google BOOLEAN NOT NULL DEFAULT FALSE,
    posted_at TIMESTAMPTZ,
    model_used TEXT NOT NULL,
    generation_latency_ms INT NOT NULL
);

-- PRIVATE FEEDBACK TABLE (Detractors)
CREATE TABLE private_feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rating_id UUID NOT NULL REFERENCES ratings(rating_id) ON DELETE CASCADE,
    feedback_text TEXT,
    contact_info TEXT, -- Option to encrypt at rest
    status "FeedbackStatus" NOT NULL DEFAULT 'new',
    resolved_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ALERTS TABLE
CREATE TABLE alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES private_feedback(feedback_id) ON DELETE CASCADE,
    channel "AlertChannel" NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ
);

-- -------------------------------------------------------------
-- 4. CREATE FUTURE ROADMAP TABLES (NLP, ML, RAG, Audit)
-- -------------------------------------------------------------

-- SENTIMENT LABELS TABLE (NLP Engine)
CREATE TABLE sentiment_labels (
    label_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL CHECK (source_type IN ('rating', 'feedback')),
    source_id UUID NOT NULL,
    overall_sentiment "Sentiment" NOT NULL,
    aspect_sentiments JSONB NOT NULL, -- aspect levels: {"food": "positive", "service": "negative"}
    emotion TEXT,
    intent "Intent",
    complaint_category TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    is_ai_generated_text BOOLEAN,
    labeled_by TEXT NOT NULL CHECK (labeled_by IN ('manual', 'model')),
    labeled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COMPLAINT SEVERITY TABLE (ML neural-network priority alerts)
CREATE TABLE complaint_severity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES private_feedback(feedback_id) ON DELETE CASCADE,
    severity "Severity" NOT NULL,
    model_version TEXT NOT NULL,
    predicted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RETENTION PREDICTIONS TABLE (ML Churn modeling)
CREATE TABLE retention_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id_or_hashed_contact_id TEXT NOT NULL,
    churn_probability NUMERIC(4,3) NOT NULL,
    model_version TEXT NOT NULL,
    predicted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RAG DOCUMENTS TABLE (Vector store inside Postgres)
CREATE TABLE rag_documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
    document_type "DocumentType" NOT NULL,
    content_text TEXT NOT NULL,
    source_date TIMESTAMPTZ NOT NULL,
    embedding_vector vector(1536) -- Configured for standard 1536-dimensional embeddings (e.g. OpenAI/Gemini)
);

-- AUDIT LOG TABLE (Compliance records)
CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details JSONB NOT NULL
);

-- -------------------------------------------------------------
-- 5. SEED INITIAL BASE DATA (Required for templates to work)
-- -------------------------------------------------------------
INSERT INTO business_templates (template_key, display_name, tone_descriptor, color_tokens, default_tags) VALUES
('restaurant', 'Restaurant & Dining', 'food-forward, warm, appreciative of hospitality', 
 '{"primary": "#d9381e", "bg": "#faf7f2", "card": "#ffffff", "text": "#2c2523", "border": "#e8e2d9", "accent": "#f2e3d5"}',
 '["Delicious Food", "Friendly Staff", "Fast Service", "Nice Atmosphere", "Great Value"]'),

('tyre_shop', 'Tyre Shop & Auto', 'direct, honest, trust-focused, emphasizing safety/speed', 
 '{"primary": "#f97316", "bg": "#0f172a", "card": "#1e293b", "text": "#f8fafc", "border": "#334155", "accent": "#2d1d15"}',
 '["Quick Service", "Upfront Pricing", "Professional Crew", "Honest Advice", "Quality Tyres"]'),

('salon_retail', 'Salon & Retail', 'stylish, confident, detailed, aesthetics-focused', 
 '{"primary": "#ec4899", "bg": "#fff1f2", "card": "#ffffff", "text": "#4c0519", "border": "#ffe4e6", "accent": "#fce7f3"}',
 '["Talented Stylists", "Clean Salon", "Trendy Selection", "Personal Attention", "Relaxing Vibe"]'),

('hotel', 'Boutique Hotel', 'refined, welcoming, luxurious, detail-oriented', 
 '{"primary": "#d4af37", "bg": "#0a1128", "card": "#101f42", "text": "#f0f4f8", "border": "#1e3a8a", "accent": "#1e293b"}',
 '["Stunning Rooms", "Excellent Location", "Impeccable Service", "Great Amenities", "Comfy Beds"]');
