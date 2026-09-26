CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  full_name VARCHAR(255),
  phone VARCHAR(100),
  city VARCHAR(255),
  discipline VARCHAR(255),
  club_name VARCHAR(255),
  account_type VARCHAR(50) NOT NULL DEFAULT 'athlete',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_type VARCHAR(50) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  city VARCHAR(255),
  discipline VARCHAR(255),
  club_name VARCHAR(255),
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  reviewer_note TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS directory_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  account_type VARCHAR(50) NOT NULL,
  entry_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  discipline VARCHAR(255),
  club_name VARCHAR(255),
  role VARCHAR(255),
  member_count INTEGER DEFAULT 0,
  license_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_items (
  id SERIAL PRIMARY KEY,
  kind VARCHAR(30) NOT NULL,
  data JSONB NOT NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS content_items_kind_idx ON content_items (kind);

CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  category VARCHAR(50) DEFAULT 'event',
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competitions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  location VARCHAR(255),
  type VARCHAR(100),
  status VARCHAR(100),
  hero_image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  club VARCHAR(255),
  discipline VARCHAR(255),
  role VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(100),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
