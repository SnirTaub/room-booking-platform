-- DEV ONLY: drop and recreate main tables
DROP TABLE IF EXISTS room_amenities;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS users;

-- Users
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rooms (listings)
CREATE TABLE rooms (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  location    TEXT NOT NULL,          
  capacity    INTEGER NOT NULL,       
  status      TEXT NOT NULL,          
  region_code TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Room amenities (e.g. WIFI, KITCHEN)
CREATE TABLE room_amenities (
  room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  amenity TEXT  NOT NULL
);

-- Bookings
CREATE TABLE bookings (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id    BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time   TIMESTAMPTZ NOT NULL,
  status     TEXT NOT NULL,           
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Basic indexes
CREATE INDEX idx_rooms_location_capacity
  ON rooms (location, capacity);

CREATE INDEX idx_bookings_room_time
  ON bookings (room_id, start_time, end_time);

-- A few example rooms so the UI isn't empty
INSERT INTO rooms (name, location, capacity, status, region_code) VALUES
  ('Sea-view loft with balcony',         'Tel Aviv', 4, 'ACTIVE', 'IL-TLV'),
  ('Designer apartment near Rothschild', 'Tel Aviv', 2, 'ACTIVE', 'IL-TLV'),
  ('Spacious family flat by the beach',  'Tel Aviv', 6, 'ACTIVE', 'IL-TLV');

INSERT INTO room_amenities (room_id, amenity) VALUES
  (1, 'WIFI'), (1, 'AIR_CONDITIONING'), (1, 'KITCHEN'), (1, 'SEA_VIEW'), (1, 'BALCONY'),
  (2, 'WIFI'), (2, 'AIR_CONDITIONING'), (2, 'KITCHEN'),
  (3, 'WIFI'), (3, 'KITCHEN'), (3, 'CRIB');