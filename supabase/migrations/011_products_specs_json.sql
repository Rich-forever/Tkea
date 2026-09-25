-- Add JSONB column for category-specific product specs
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb;

-- Backfill a safe empty object in case records were inserted before this migration
UPDATE products
SET specs = '{}'::jsonb
WHERE specs IS NULL;

-- Keep product update timestamps aligned when specs is edited
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
