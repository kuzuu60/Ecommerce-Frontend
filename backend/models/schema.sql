CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 0,
    stock INT DEFAULT 0,
    brand VARCHAR(100),
    sku VARCHAR(100),
    weight NUMERIC(6,2),
    warranty_information VARCHAR(255),
    shipping_information VARCHAR(255),
    availability_status VARCHAR(50),
    thumbnail TEXT,
    images JSONB,
    reviews JSONB,
    dimensions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
