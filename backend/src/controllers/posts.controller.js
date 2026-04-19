const slugify = require('slugify');
const { query, withTransaction } = require('../db');

const makeSlug = (title) =>
  slugify(title, { lower: true, strict: true, locale: 'vi' }) + '-' + Date.now();

const getPostById = async (req, res) => {
  try {
    const result = await query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    res.json({ post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

// GET /api/posts  (public - chỉ published)
const getPosts = async (req, res) => {
  const { page = 1, limit = 10, category, tag, search } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = ["p.status = 'published'"];
    const params = [];
    let i = 1;

    if (category) { conditions.push(`c.slug = $${i++}`); params.push(category); }
    if (search)   { conditions.push(`(p.title ILIKE $${i} OR p.summary ILIKE $${i})`); params.push(`%${search}%`); i++; }

    const where = conditions.join(' AND ');
    const joinTag = tag
      ? `JOIN post_tags pt ON p.id = pt.post_id JOIN tags t ON pt.tag_id = t.id AND t.slug = '${tag}'`
      : '';

    const dataQuery = `
      SELECT p.id, p.title, p.slug, p.summary, p.thumbnail_url,
             p.views_count, p.published_at,
             u.name AS author_name,
             c.name AS category_name, c.slug AS category_slug
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${joinTag}
      WHERE ${where}
      ORDER BY p.published_at DESC
      LIMIT $${i++} OFFSET $${i++}
    `;
    params.push(parseInt(limit), offset);

    const countQuery = `
      SELECT COUNT(*) FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      ${joinTag}
      WHERE ${where}
    `;

    const [dataResult, countResult] = await Promise.all([
      query(dataQuery, params),
      query(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      posts: dataResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (err) {
    console.error('POSTS ERROR:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/posts/:slug  (public)
const getPostBySlug = async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*,
             u.name AS author_name, u.avatar_url AS author_avatar,
             c.name AS category_name, c.slug AS category_slug,
             COALESCE(
               JSON_AGG(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
               FILTER (WHERE t.id IS NOT NULL), '[]'
             ) AS tags
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.slug = $1 AND p.status = 'published'
      GROUP BY p.id, u.name, u.avatar_url, c.name, c.slug
    `, [req.params.slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }

    // Tăng views_count bất đồng bộ, không chặn response
    query('UPDATE posts SET views_count = views_count + 1 WHERE slug = $1', [req.params.slug])
      .catch(console.error);

    res.json({ post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/admin/posts  (admin/editor - xem tất cả kể cả draft)
const getAllPostsAdmin = async (req, res) => {
  const { page = 1, limit = 15, status, category, id } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [];
    const params = [];
    let i = 1;

    if (status)   { conditions.push(`p.status = $${i++}`); params.push(status); }
    if (category) { conditions.push(`c.slug = $${i++}`); params.push(category); }
    if (id)        { conditions.push(`p.id = $${i++}`); params.push(id); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await query(`
      SELECT p.id, p.title, p.slug, p.status, p.views_count,
             p.published_at, p.created_at,
             u.name AS author_name,
             c.name AS category_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT $${i++} OFFSET $${i++}
    `, [...params, parseInt(limit), offset]);

    const countResult = await query(
      `SELECT COUNT(*) FROM posts p LEFT JOIN categories c ON p.category_id = c.id ${where}`,
      params
    );

    res.json({
      posts: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/admin/posts  (tạo bài viết)
const createPost = async (req, res) => {
  const { title, summary, content, thumbnail_url, status = 'draft', category_id, tag_ids = [] } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Tiêu đề và nội dung là bắt buộc' });
  }

  try {
    const slug = makeSlug(title);
    const publishedAt = status === 'published' ? new Date() : null;

    const result = await withTransaction(async (client) => {
      const post = await client.query(`
        INSERT INTO posts (title, slug, summary, content, thumbnail_url, status, author_id, category_id, published_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *
      `, [title, slug, summary, content, thumbnail_url, status, req.user.id, category_id || null, publishedAt]);

      const postId = post.rows[0].id;

      if (tag_ids.length > 0) {
        const tagValues = tag_ids.map((_, idx) => `($1, $${idx + 2})`).join(', ');
        await client.query(
          `INSERT INTO post_tags (post_id, tag_id) VALUES ${tagValues}`,
          [postId, ...tag_ids]
        );
      }
      return post.rows[0];
    });

    res.status(201).json({ message: 'Tạo bài viết thành công', post: result });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/admin/posts/:id  (cập nhật bài viết)
const updatePost = async (req, res) => {
  const { title, summary, content, thumbnail_url, status, category_id, tag_ids } = req.body;
  const { id } = req.params;

  try {
    const existing = await query('SELECT * FROM posts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    const old = existing.rows[0];

    // Editor chỉ được sửa bài của chính mình
    if (req.user.role === 'editor' && old.author_id !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa bài này' });
    }

    const publishedAt = status === 'published' && !old.published_at ? new Date() : old.published_at;

    const result = await withTransaction(async (client) => {
      const post = await client.query(`
        UPDATE posts SET
          title = COALESCE($1, title),
          summary = COALESCE($2, summary),
          content = COALESCE($3, content),
          thumbnail_url = COALESCE($4, thumbnail_url),
          status = COALESCE($5, status),
          category_id = $6,
          published_at = $7
        WHERE id = $8 RETURNING *
      `, [title, summary, content, thumbnail_url, status, category_id || null, publishedAt, id]);

      if (Array.isArray(tag_ids)) {
        await client.query('DELETE FROM post_tags WHERE post_id = $1', [id]);
        if (tag_ids.length > 0) {
          const tagValues = tag_ids.map((_, idx) => `($1, $${idx + 2})`).join(', ');
          await client.query(
            `INSERT INTO post_tags (post_id, tag_id) VALUES ${tagValues}`,
            [id, ...tag_ids]
          );
        }
      }
      return post.rows[0];
    });

    res.json({ message: 'Cập nhật thành công', post: result });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE /api/admin/posts/:id
const deletePost = async (req, res) => {
  try {
    const result = await query('DELETE FROM posts WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    res.json({ message: 'Xóa bài viết thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getPosts, getPostBySlug, getAllPostsAdmin, createPost, updatePost, deletePost, getPostById };
