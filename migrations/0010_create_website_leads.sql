CREATE TABLE IF NOT EXISTS website_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'Homepage Callback Form',
  status TEXT NOT NULL DEFAULT 'New',
  marketing_consent INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_website_leads_created_at
  ON website_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_website_leads_status_created
  ON website_leads(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_website_leads_ip_created
  ON website_leads(ip_hash, created_at);
