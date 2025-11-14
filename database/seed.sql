-- Clear existing data
TRUNCATE TABLE order_items, orders, payments, products, users RESTART IDENTITY CASCADE;

-- Insert sample users
-- Password for all users: 'password123'
-- Valid Bcrypt hash generated with bcrypt.hash('password123', 10)
INSERT INTO users (email, password, name, phone, address) VALUES
('test@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', '+919876543210', '123 Test Street, Mumbai, Maharashtra'),
('john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', '+919876543211', '456 Main Road, Delhi'),
('jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith', '+919876543212', '789 Park Avenue, Bangalore'),
('alice@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice Johnson', '+919876543213', '321 Garden Street, Pune'),
('bakshita34@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bakshita', '+919876543214', '567 Sector 15, Meerut, Uttar Pradesh');

-- Insert 21 products across 5 categories

-- ELECTRONICS (5 products)
INSERT INTO products (name, description, price, category, stock, image_url) VALUES
('iPhone 15 Pro', 'Latest Apple smartphone with A17 Pro chip, titanium design, and advanced camera system', 134900, 'Electronics', 50, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'),
('Samsung Galaxy S24 Ultra', 'Premium Android flagship with S Pen, 200MP camera, and AI features', 124999, 'Electronics', 45, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'),
('Sony WH-1000XM5', 'Industry-leading noise canceling wireless headphones with premium sound quality', 29990, 'Electronics', 80, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800'),
('iPad Air M2', 'Powerful tablet with M2 chip, perfect for creativity and productivity', 59900, 'Electronics', 60, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'),
('Dell XPS 15', 'Premium laptop with Intel i7, 16GB RAM, stunning OLED display for professionals', 145900, 'Electronics', 35, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800');

-- FASHION (5 products)
INSERT INTO products (name, description, price, category, stock, image_url) VALUES
('Levi''s 501 Original Jeans', 'Classic straight fit denim jeans, timeless style and comfort', 3999, 'Fashion', 120, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'),
('Nike Air Max Sneakers', 'Iconic athletic shoes with Air cushioning technology and modern design', 8999, 'Fashion', 90, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'),
('Zara Wool Blazer', 'Premium wool blend blazer, perfect for formal and semi-formal occasions', 6999, 'Fashion', 65, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'),
('Ray-Ban Aviator Sunglasses', 'Classic aviator sunglasses with UV protection and iconic design', 4999, 'Fashion', 150, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'),
('Fossil Leather Watch', 'Elegant analog watch with genuine leather strap and Swiss movement', 12999, 'Fashion', 75, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800');

-- HOME & LIVING (5 products)
INSERT INTO products (name, description, price, category, stock, image_url) VALUES
('Dyson V15 Vacuum Cleaner', 'Powerful cordless vacuum with laser detection and advanced filtration', 52900, 'Home & Living', 40, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800'),
('Philips Air Purifier', 'HEPA filter air purifier removes 99.97% pollutants, allergens, and viruses', 18999, 'Home & Living', 55, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'),
('IKEA Poäng Armchair', 'Comfortable bentwood armchair with cushion, perfect for relaxation', 8999, 'Home & Living', 100, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'),
('Le Creuset Dutch Oven', 'Premium cast iron cookware, perfect for slow cooking and baking', 24999, 'Home & Living', 30, 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800'),
('Nespresso Coffee Machine', 'Automatic espresso maker with milk frother, barista-quality coffee at home', 35900, 'Home & Living', 45, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800');

-- SPORTS (5 products)
INSERT INTO products (name, description, price, category, stock, image_url) VALUES
('Yoga Mat Premium', 'Eco-friendly non-slip yoga mat with extra cushioning, includes carrying strap', 2499, 'Sports', 200, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'),
('Adidas Football', 'Official size 5 football with thermal bonded construction for optimal play', 1999, 'Sports', 150, 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800'),
('Decathlon Treadmill', 'Foldable electric treadmill with digital display and 12 preset programs', 34999, 'Sports', 25, 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800'),
('Yonex Badminton Racket', 'Professional carbon fiber racket with isometric head for power and control', 8999, 'Sports', 85, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800'),
('Gym Dumbbell Set', 'Adjustable dumbbell set 5-25kg with rubber coating and chrome handles', 15999, 'Sports', 60, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800');

-- FOOD & SNACKS (1 product - THE CANDY!)
INSERT INTO products (name, description, price, category, stock, image_url) VALUES
('Mango Bite Candy', 'Sweet and tangy mango flavored candy, perfect nostalgic treat for all ages', 1, 'Food & Snacks', 10000, 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=800');

-- Note: Password for all users is 'password123'
-- Hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi