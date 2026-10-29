-- 001_init.sql: initial schema for the Event Management System (SAD section 4.1.3).
-- Status and role values are enforced with CHECK constraints.

CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  role            VARCHAR(20)  NOT NULL DEFAULT 'ATTENDEE'
                  CHECK (role IN ('ATTENDEE', 'ORGANIZER', 'ADMIN')),
  active          BOOLEAN      NOT NULL DEFAULT TRUE,
  failed_attempts INTEGER      NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE events (
  id           SERIAL PRIMARY KEY,
  organizer_id INTEGER      NOT NULL REFERENCES users(id),
  category_id  INTEGER      NOT NULL REFERENCES categories(id),
  title        VARCHAR(150) NOT NULL,
  description  TEXT,
  venue        VARCHAR(200) NOT NULL,
  start_time   TIMESTAMPTZ  NOT NULL,
  end_time     TIMESTAMPTZ  NOT NULL,
  capacity     INTEGER      NOT NULL CHECK (capacity BETWEEN 1 AND 10000),
  status       VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
               CHECK (status IN ('DRAFT', 'PUBLISHED', 'CANCELLED')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE TABLE registrations (
  id               SERIAL PRIMARY KEY,
  event_id         INTEGER     NOT NULL REFERENCES events(id),
  user_id          INTEGER     NOT NULL REFERENCES users(id),
  status           VARCHAR(20) NOT NULL
                   CHECK (status IN ('CONFIRMED', 'WAITLISTED', 'CANCELLED', 'CHECKED_IN')),
  ticket_id        VARCHAR(40) NOT NULL UNIQUE,
  queue_position   INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_in_at    TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ
);

-- One active (not cancelled) registration per user and event (EVT-F-021).
CREATE UNIQUE INDEX uq_registrations_active
  ON registrations (event_id, user_id)
  WHERE status <> 'CANCELLED';

CREATE TABLE notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users(id),
  type       VARCHAR(40) NOT NULL,
  message    TEXT        NOT NULL,
  read       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_id is nullable: a failed login for an unknown email has no user.
CREATE TABLE audit_logs (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action     VARCHAR(50) NOT NULL,
  details    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE revoked_tokens (
  token_id   VARCHAR(64) PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for the 2-second response target (EVT-NF-001).
CREATE INDEX idx_events_status_start   ON events (status, start_time);
CREATE INDEX idx_events_category       ON events (category_id);
CREATE INDEX idx_registrations_event   ON registrations (event_id, status);
CREATE INDEX idx_notifications_user    ON notifications (user_id, read);
CREATE INDEX idx_revoked_tokens_expiry ON revoked_tokens (expires_at);
