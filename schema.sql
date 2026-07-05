-- Run this once against your Neon (or any) Postgres database.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  role VARCHAR(10) NOT NULL CHECK (role IN ('donor','patient')),
  name VARCHAR(100),
  blood_group VARCHAR(3) CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  city VARCHAR(100),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  last_donation_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Only used when Twilio is not configured (demo/local mode).
CREATE TABLE IF NOT EXISTS otp_codes (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes (phone);

CREATE TABLE IF NOT EXISTS blood_requests (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES users(id),
  blood_group_needed VARCHAR(3) NOT NULL CHECK (blood_group_needed IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  city VARCHAR(100),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  units_needed INT DEFAULT 1,
  notes VARCHAR(255),
  status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending','accepted','completed','cancelled')),
  accepted_donor_id INT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS request_matches (
  id SERIAL PRIMARY KEY,
  request_id INT NOT NULL REFERENCES blood_requests(id),
  donor_id INT NOT NULL REFERENCES users(id),
  distance_km DECIMAL(6,2),
  status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  UNIQUE (request_id, donor_id)
);
