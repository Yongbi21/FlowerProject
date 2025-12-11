-- This script alters the existing 'requests' table to move fields
-- from the JSONB 'data' column to dedicated columns.
-- This makes querying simpler and aligns with the new requirement
-- to have a "wide" table for all request types.

-- First, add all the new columns to the requests table.
-- We make them nullable for now to handle existing rows.
ALTER TABLE requests
  ADD COLUMN recipient_name VARCHAR(255),
  ADD COLUMN occasion VARCHAR(255),
  ADD COLUMN other_occasion VARCHAR(255),
  ADD COLUMN preferences TEXT,
  ADD COLUMN addon VARCHAR(255),
  ADD COLUMN card_message TEXT,
  ADD COLUMN full_name VARCHAR(255),
  ADD COLUMN event_date DATE,
  ADD COLUMN venue TEXT,
  ADD COLUMN additional_notes TEXT;

-- Here you would typically run a data migration script to move data
-- from the 'data' JSONB column to the new columns.
-- Example (you would need to adapt this and run it in your environment):
/*
UPDATE requests
SET
  recipient_name = data->>'recipientName',
  occasion = COALESCE(data->>'eventType', data->>'occasion'),
  other_occasion = COALESCE(data->>'otherEventType', data->>'otherOccasion'),
  preferences = data->>'preferences',
  addon = data->>'addon',
  card_message = data->>'message',
  full_name = data->>'fullName',
  event_date = (data->>'eventDate')::DATE,
  venue = data->>'venue',
  additional_notes = data->>'details'
WHERE data IS NOT NULL;
*/

-- After migrating the data, the 'data' column can be dropped.
ALTER TABLE requests
  DROP COLUMN data;

-- Optionally, you can now add NOT NULL constraints to columns
-- that should always be required for a specific request type,
-- though this is better handled by application logic if the table
-- is to remain flexible.
-- e.g., ALTER TABLE requests ALTER COLUMN full_name SET NOT NULL;
-- (This would fail if there are special_order rows with NULL full_name)

COMMENT ON COLUMN requests.recipient_name IS 'From SpecialOrder.jsx';
COMMENT ON COLUMN requests.occasion IS 'Shared: from SpecialOrder.jsx (occasion) and BookEvent.jsx (eventType)';
COMMENT ON COLUMN requests.other_occasion IS 'Shared: from SpecialOrder.jsx (otherOccasion) and BookEvent.jsx (otherEventType)';
COMMENT ON COLUMN requests.preferences IS 'From SpecialOrder.jsx';
COMMENT ON COLUMN requests.addon IS 'From SpecialOrder.jsx';
COMMENT ON COLUMN requests.card_message IS 'From SpecialOrder.jsx';
COMMENT ON COLUMN requests.full_name IS 'From BookEvent.jsx';
COMMENT ON COLUMN requests.event_date IS 'From BookEvent.jsx';
COMMENT ON COLUMN requests.venue IS 'From BookEvent.jsx';
COMMENT ON COLUMN requests.additional_notes IS 'From BookEvent.jsx';
