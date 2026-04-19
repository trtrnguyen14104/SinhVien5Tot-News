require('dotenv').config();
const { pool } = require('./index');

const createTables = `
  -- Extension cho UUID
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Users
  CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role        VARCHAR(10) NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Categories
  CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Posts
  CREATE TABLE IF NOT EXISTS posts (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title         VARCHAR(255) NOT NULL,
    slug          VARCHAR(300) UNIQUE NOT NULL,
    summary       TEXT,
    content       TEXT NOT NULL,
    thumbnail_url TEXT,
    status        VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    views_count   INT NOT NULL DEFAULT 0,
    author_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    category_id   INT REFERENCES categories(id) ON DELETE SET NULL,
    published_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Tags
  CREATE TABLE IF NOT EXISTS tags (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(80) NOT NULL,
    slug  VARCHAR(100) UNIQUE NOT NULL
  );

  -- Post Tags (many-to-many)
  CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id  INT  REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
  );

  -- Featured Students (Gương mặt tiêu biểu)
  CREATE TABLE IF NOT EXISTS featured_students (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(100) NOT NULL,
    avatar_url    TEXT,
    achievement   TEXT,
    academic_year VARCHAR(20),
    description   TEXT,
    facebook_url  VARCHAR(255),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Documents (Tài liệu - tiêu chuẩn, biểu mẫu...)
  CREATE TABLE IF NOT EXISTS documents (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255) NOT NULL,
    file_url    TEXT NOT NULL,
    type        VARCHAR(50),
    description TEXT,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Banners
  CREATE TABLE IF NOT EXISTS banners (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255),
    image_url   TEXT NOT NULL,
    link        VARCHAR(500),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Indexes để tăng hiệu suất query
  CREATE INDEX IF NOT EXISTS idx_posts_status      ON posts(status);
  CREATE INDEX IF NOT EXISTS idx_posts_category    ON posts(category_id);
  CREATE INDEX IF NOT EXISTS idx_posts_author      ON posts(author_id);
  CREATE INDEX IF NOT EXISTS idx_posts_published   ON posts(published_at DESC);
  CREATE INDEX IF NOT EXISTS idx_posts_slug        ON posts(slug);
  CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category_id);

  -- Trigger tự động cập nhật updated_at cho posts
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
  CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Bắt đầu migration...');
    await client.query(createTables);
    console.log('✅ Migration hoàn thành! Tất cả bảng đã được tạo.');
  } catch (err) {
    console.error('❌ Migration thất bại:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
