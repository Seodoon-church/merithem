-- Update orders table to match application requirements
-- Version: 1.0.1
-- Date: 2025-11-04

-- Drop the JSONB shipping_address column and add individual fields
ALTER TABLE orders
    DROP COLUMN IF EXISTS shipping_address CASCADE;

-- Add individual shipping address fields
ALTER TABLE orders
    ADD COLUMN shipping_address VARCHAR(255),
    ADD COLUMN shipping_city VARCHAR(100),
    ADD COLUMN shipping_state VARCHAR(100),
    ADD COLUMN shipping_postal_code VARCHAR(20),
    ADD COLUMN shipping_country VARCHAR(2) DEFAULT 'KR',
    ADD COLUMN phone_number VARCHAR(20);

-- Rename total to total_amount for consistency
ALTER TABLE orders
    RENAME COLUMN total TO total_amount;

-- Add order_date column
ALTER TABLE orders
    ADD COLUMN order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update order_items table - rename columns for consistency
ALTER TABLE order_items
    RENAME COLUMN unit_price TO price_at_time;

ALTER TABLE order_items
    RENAME COLUMN subtotal TO total_price;

-- Add deleted_at for soft delete on products
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_at for soft delete on devices
ALTER TABLE devices
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create cart_items table if not exists
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Add trigger for cart_items updated_at
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add image_url column to products (single image for simplicity)
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

COMMENT ON TABLE cart_items IS 'Shopping cart items for users';
