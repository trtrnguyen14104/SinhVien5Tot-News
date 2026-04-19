require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./index');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Bắt đầu seed dữ liệu mẫu...');

    // Admin user
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['Admin SV5T', 'admin@sv5tot.edu.vn', passwordHash, 'admin']);

    // Categories
    const categories = [
      { name: 'Bản tin', slug: 'ban-tin', description: 'Tin tức hoạt động phong trào SV5T' },
      { name: 'Tiêu chuẩn', slug: 'tieu-chuan', description: 'Bộ tiêu chuẩn Sinh viên 5 Tốt các cấp' },
      { name: 'Gương mặt tiêu biểu', slug: 'guong-mat-tieu-bieu', description: 'Những sinh viên tiêu biểu của khoa' },
      { name: 'Hoạt động', slug: 'hoat-dong', description: 'Các hoạt động tình nguyện, văn hóa, thể thao' },
    ];
    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (name, slug, description)
        VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING
      `, [cat.name, cat.slug, cat.description]);
    }

    // Tags
    const tags = [
      { name: 'SV5T', slug: 'sv5t' },
      { name: 'Tình nguyện', slug: 'tinh-nguyen' },
      { name: 'Học bổng', slug: 'hoc-bong' },
      { name: 'Nghiên cứu', slug: 'nghien-cuu' },
      { name: 'Cấp trường', slug: 'cap-truong' },
      { name: 'Cấp khoa', slug: 'cap-khoa' },
    ];
    for (const tag of tags) {
      await client.query(`
        INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING
      `, [tag.name, tag.slug]);
    }

    // Featured students
    const students = [
      {
        name: 'Nguyễn Thị An',
        achievement: 'GPA 3.85/4.0 · Bí thư Chi đoàn · Tình nguyện Mùa hè xanh 2024',
        academic_year: '2021-2025',
        description: 'Sinh viên xuất sắc toàn diện, vừa học giỏi vừa tích cực hoạt động phong trào.',
        facebook_url: 'https://facebook.com',
      },
      {
        name: 'Trần Văn Bình',
        achievement: 'GPA 3.65/4.0 · Trưởng ban Học thuật HSV khoa · NCKH cấp trường',
        academic_year: '2022-2026',
        description: 'Đam mê nghiên cứu tâm lý học tích cực, đã công bố 2 bài báo khoa học sinh viên.',
        facebook_url: 'https://facebook.com',
      },
      {
        name: 'Lê Thị Cẩm',
        achievement: 'GPA 3.72/4.0 · Phó Chủ tịch HSV khoa · Học bổng Vallet 2024',
        academic_year: '2022-2026',
        description: 'Nhận học bổng Vallet danh giá, tích cực tham gia công tác hội sinh viên.',
        facebook_url: 'https://facebook.com',
      },
    ];
    for (const s of students) {
      await client.query(`
        INSERT INTO featured_students (name, achievement, academic_year, description, facebook_url)
        VALUES ($1, $2, $3, $4, $5)
      `, [s.name, s.achievement, s.academic_year, s.description, s.facebook_url]);
    }

    console.log('✅ Seed hoàn thành!');
    console.log('📧 Email: admin@sv5tot.edu.vn');
    console.log('🔑 Mật khẩu: Admin@123');
  } catch (err) {
    console.error('❌ Seed thất bại:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
