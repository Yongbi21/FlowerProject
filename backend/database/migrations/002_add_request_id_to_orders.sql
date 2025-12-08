-- Migration: Add request_id to orders table to link bookings to orders
-- Run this to update existing database

USE flowerforge;

-- Add request_id to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS request_id INT AFTER user_id,
ADD FOREIGN KEY IF NOT EXISTS fk_orders_request_id (request_id) REFERENCES requests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_request_id ON orders(request_id);

SELECT 'Migration completed successfully!' as message;
