CREATE TABLE IF NOT EXISTS components (
    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    model VARCHAR(150),
    manufacturer VARCHAR(150),
    interface VARCHAR(150),
    voltage VARCHAR(50),

    quantity INTEGER NOT NULL DEFAULT 0
        CHECK (quantity >= 0),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_components_category
ON components(category);