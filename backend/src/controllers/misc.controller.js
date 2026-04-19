const { query } = require('../db');
const bcrypt = require('bcryptjs');
const {getPublicUrl} = require('../middlewares/upload');

// ─── FEATURED STUDENTS ────────────────────────────────────────────────────────

const getStudents = async (req, res) => {
  const { academic_year } = req.query;
  try {
    const conditions = ['is_active = true'];
    const params = [];
    if (academic_year) { conditions.push(`academic_year = $1`); params.push(academic_year); }
    const result = await query(
      `SELECT * FROM featured_students WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      params
    );
    res.json({ students: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const createStudent = async (req, res) => {
  const { name, avatar_url, achievement, academic_year, description, facebook_url } = req.body;
  if (!name) return res.status(400).json({ message: 'Tên sinh viên là bắt buộc' });
  try {
    const result = await query(`
      INSERT INTO featured_students (name, avatar_url, achievement, academic_year, description, facebook_url)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [name, avatar_url, achievement, academic_year, description, facebook_url]);
    res.status(201).json({ message: 'Thêm sinh viên thành công', student: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateStudent = async (req, res) => {
  const { name, avatar_url, achievement, academic_year, description, facebook_url, is_active } = req.body;
  try {
    const result = await query(`
      UPDATE featured_students SET
        name = COALESCE($1, name), avatar_url = COALESCE($2, avatar_url),
        achievement = COALESCE($3, achievement), academic_year = COALESCE($4, academic_year),
        description = COALESCE($5, description), facebook_url = COALESCE($6, facebook_url),
        is_active = COALESCE($7, is_active)
      WHERE id = $8 RETURNING *
    `, [name, avatar_url, achievement, academic_year, description, facebook_url, is_active, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ student: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    await query('DELETE FROM featured_students WHERE id = $1', [req.params.id]);
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────

const getDocuments = async (req, res) => {
  const { category } = req.query;
  try {
    const conditions = [];
    const params = [];
    if (category) { conditions.push(`c.slug = $1`); params.push(category); }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const result = await query(`
      SELECT d.*, c.name AS category_name, c.slug AS category_slug
      FROM documents d
      LEFT JOIN categories c ON d.category_id = c.id
      ${where}
      ORDER BY d.created_at DESC
    `, params);
    res.json({ documents: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const createDocument = async (req, res) => {
  const { title, file_url, type, description, category_id } = req.body;
  if (!title || !file_url) return res.status(400).json({ message: 'Tiêu đề và file là bắt buộc' });
  try {
    const result = await query(`
      INSERT INTO documents (title, file_url, type, description, category_id)
      VALUES ($1,$2,$3,$4,$5) RETURNING *
    `, [title, file_url, type, description, category_id || null]);
    res.status(201).json({ document: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateDocument = async (req, res) => {
  const { title, file_url, type, description, category_id } = req.body;
  try {
    const result = await query(`
      UPDATE documents SET
        title = COALESCE($1, title),
        file_url = COALESCE($2, file_url),
        type = COALESCE($3, type),
        description = COALESCE($4, description),
        category_id = $5
      WHERE id = $6 RETURNING *
    `, [title, file_url, type, description, category_id || null, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ document: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    await query('DELETE FROM documents WHERE id = $1', [req.params.id]);
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ─── BANNERS ──────────────────────────────────────────────────────────────────

const getBanners = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM banners ORDER BY order_index ASC, created_at DESC`
    );
    res.json({ banners: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const createBanner = async (req, res) => {
  const { title, image_url, link, is_active = true, order_index = 0 } = req.body;
  if (!image_url) return res.status(400).json({ message: 'URL ảnh là bắt buộc' });
  try {
    const result = await query(`
      INSERT INTO banners (title, image_url, link, is_active, order_index)
      VALUES ($1,$2,$3,$4,$5) RETURNING *
    `, [title, image_url, link, is_active, order_index]);
    res.status(201).json({ banner: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateBanner = async (req, res) => {
  const { title, image_url, link, is_active, order_index } = req.body;
  try {
    const result = await query(`
      UPDATE banners SET
        title = COALESCE($1, title),
        image_url = COALESCE($2, image_url),
        link = COALESCE($3, link),
        is_active = COALESCE($4, is_active),
        order_index = COALESCE($5, order_index)
      WHERE id = $6 RETURNING *
    `, [title, image_url, link, is_active, order_index, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ banner: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    await query('DELETE FROM banners WHERE id = $1', [req.params.id]);
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

const getCategories = async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, COUNT(p.id) AS post_count
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
      GROUP BY c.id ORDER BY c.name
    `);
    res.json({ categories: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ─── UPLOAD ───────────────────────────────────────────────────────────────────

const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Không có file nào được upload' });
  const publicUrl = getPublicUrl(req.file.key);
  if (!publicUrl) return res.status(500).json({ message: 'Không thể lấy URL file đã upload' });
  res.json({ url: publicUrl, key: req.file.key });
};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

const getDashboardStats = async (req, res) => {
  try {
    const [posts, drafts, students, documents, banners, topPosts] = await Promise.all([
      query(`SELECT COUNT(*) FROM posts WHERE status = 'published'`),
      query(`SELECT COUNT(*) FROM posts WHERE status = 'draft'`),
      query(`SELECT COUNT(*) FROM featured_students WHERE is_active = true`),
      query(`SELECT COUNT(*) FROM documents`),
      query(`SELECT COUNT(*) FROM banners WHERE is_active = true`),
      query(`SELECT title, slug, views_count FROM posts WHERE status = 'published' ORDER BY views_count DESC LIMIT 5`),
    ]);
    res.json({
      stats: {
        publishedPosts: parseInt(posts.rows[0].count),
        draftPosts:     parseInt(drafts.rows[0].count),
        activeStudents: parseInt(students.rows[0].count),
        totalDocuments: parseInt(documents.rows[0].count),
        activeBanners:  parseInt(banners.rows[0].count),
      },
      topPosts: topPosts.rows,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ─── USER MANAGEMENT (admin only) ─────────────────────────────────────────────

const getUsers = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, avatar_url, created_at FROM users ORDER BY created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, role = 'editor' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  if (password.length < 8) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, created_at
    `, [name, email.toLowerCase().trim(), hash, role]);
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Email đã tồn tại' });
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateUser = async (req, res) => {
  const { name, role } = req.body;
  // Không cho phép tự hạ quyền chính mình
  if (req.params.id === req.user.id && role && role !== req.user.role) {
    return res.status(400).json({ message: 'Không thể thay đổi quyền của chính mình' });
  }
  try {
    const result = await query(`
      UPDATE users SET
        name = COALESCE($1, name),
        role = COALESCE($2, role)
      WHERE id = $3 RETURNING id, name, email, role
    `, [name, role, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const deleteUser = async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' });
  }
  try {
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Xóa người dùng thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = {
  getStudents, createStudent, updateStudent, deleteStudent,
  getDocuments, createDocument, updateDocument, deleteDocument,
  getBanners, createBanner, updateBanner, deleteBanner,
  getCategories,
  uploadFile,
  getDashboardStats,
  getUsers, createUser, updateUser, deleteUser,
};
