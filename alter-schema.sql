CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop foreign key constraints
ALTER TABLE addresses DROP CONSTRAINT IF EXISTS addresses_user_id_fkey;
ALTER TABLE wishlist DROP CONSTRAINT IF EXISTS wishlist_user_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_address_id_fkey;
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Drop primary key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey CASCADE;

-- Add new UUID column to users and generate UUIDs
ALTER TABLE users ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
UPDATE users SET new_id = gen_random_uuid();
ALTER TABLE users ALTER COLUMN new_id SET NOT NULL;

-- Add temporary UUID columns to related tables
ALTER TABLE addresses ADD COLUMN new_user_id UUID;
ALTER TABLE wishlist ADD COLUMN new_user_id UUID;
ALTER TABLE reviews ADD COLUMN new_user_id UUID;
ALTER TABLE orders ADD COLUMN new_user_id UUID;
ALTER TABLE requests ADD COLUMN new_user_id UUID;
ALTER TABLE notifications ADD COLUMN new_user_id UUID;
ALTER TABLE messages ADD COLUMN new_sender_id UUID;
ALTER TABLE messages ADD COLUMN new_receiver_id UUID;

-- Map old integer IDs to new UUIDs
UPDATE addresses SET new_user_id = users.new_id FROM users WHERE addresses.user_id = users.id;
UPDATE wishlist SET new_user_id = users.new_id FROM users WHERE wishlist.user_id = users.id;
UPDATE reviews SET new_user_id = users.new_id FROM users WHERE reviews.user_id = users.id;
UPDATE orders SET new_user_id = users.new_id FROM users WHERE orders.user_id = users.id;
UPDATE requests SET new_user_id = users.new_id FROM users WHERE requests.user_id = users.id;
UPDATE notifications SET new_user_id = users.new_id FROM users WHERE notifications.user_id = users.id;
UPDATE messages SET new_sender_id = users.new_id FROM users WHERE messages.sender_id = users.id;
UPDATE messages SET new_receiver_id = users.new_id FROM users WHERE messages.receiver_id = users.id;

-- Drop old integer columns and rename new UUID columns
ALTER TABLE users DROP COLUMN id;
ALTER TABLE users RENAME COLUMN new_id TO id;

ALTER TABLE addresses DROP COLUMN user_id;
ALTER TABLE addresses RENAME COLUMN new_user_id TO user_id;

ALTER TABLE wishlist DROP COLUMN user_id;
ALTER TABLE wishlist RENAME COLUMN new_user_id TO user_id;

ALTER TABLE reviews DROP COLUMN user_id;
ALTER TABLE reviews RENAME COLUMN new_user_id TO user_id;

ALTER TABLE orders DROP COLUMN user_id;
ALTER TABLE orders RENAME COLUMN new_user_id TO user_id;

ALTER TABLE requests DROP COLUMN user_id;
ALTER TABLE requests RENAME COLUMN new_user_id TO user_id;

ALTER TABLE notifications DROP COLUMN user_id;
ALTER TABLE notifications RENAME COLUMN new_user_id TO user_id;

ALTER TABLE messages DROP COLUMN sender_id;
ALTER TABLE messages RENAME COLUMN new_sender_id TO sender_id;

ALTER TABLE messages DROP COLUMN receiver_id;
ALTER TABLE messages RENAME COLUMN new_receiver_id TO receiver_id;

-- Add primary key to users
ALTER TABLE users ADD PRIMARY KEY (id);

-- Make foreign key columns NOT NULL (if they should be)
ALTER TABLE addresses ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE wishlist ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE reviews ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE requests ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE messages ALTER COLUMN sender_id SET NOT NULL;
ALTER TABLE messages ALTER COLUMN receiver_id SET NOT NULL;

-- Drop address_id NOT NULL constraint
ALTER TABLE orders ALTER COLUMN address_id DROP NOT NULL;

-- Recreate foreign key constraints
ALTER TABLE addresses ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE wishlist ADD CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE requests ADD CONSTRAINT requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id);
ALTER TABLE messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES users(id);
ALTER TABLE orders ADD CONSTRAINT orders_address_id_fkey FOREIGN KEY (address_id) REFERENCES addresses(id);