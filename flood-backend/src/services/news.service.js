
const pool = require("../config/db");

// =========================================================
// GET ALL NEWS
// =========================================================

const getNews = async ({
  status,
  category,
  search,
} = {}) => {
  const conditions = [];
  const values = [];

  let query = `
    SELECT
      id,
      title,
      category,
      description,
      author_id,
      published_at,
      status,
      featured,
      created_at,
      updated_at
    FROM news
  `;

  if (status && status !== "all") {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (category && category !== "all") {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        title ILIKE $${values.length}
        OR description ILIKE $${values.length}
        OR category ILIKE $${values.length}
      )
    `);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += `
    ORDER BY
      featured DESC,
      created_at DESC
  `;

  const result = await pool.query(query, values);

  return result.rows;
};

// =========================================================
// GET NEWS BY ID
// =========================================================

const getNewsById = async (id) => {
  const query = `
    SELECT
      id,
      title,
      category,
      description,
      author_id,
      published_at,
      status,
      featured,
      created_at,
      updated_at
    FROM news
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
};

// =========================================================
// CREATE NEWS
// =========================================================

const createNews = async ({
  title,
  category,
  description,
  author_id,
  published_at,
  status,
  featured,
}) => {
  const query = `
    INSERT INTO news (
      title,
      category,
      description,
      author_id,
      published_at,
      status,
      featured
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    )
    RETURNING
      id,
      title,
      category,
      description,
      author_id,
      published_at,
      status,
      featured,
      created_at,
      updated_at
  `;

  const values = [
    title,
    category,
    description,
    author_id || null,
    published_at || null,
    status || "Draft",
    featured ?? false,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

// =========================================================
// UPDATE NEWS
// =========================================================

const updateNews = async (
  id,
  {
    title,
    category,
    description,
    published_at,
    status,
    featured,
  }
) => {
  const query = `
    UPDATE news
    SET
      title = $1,
      category = $2,
      description = $3,
      published_at = $4,
      status = $5,
      featured = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING
      id,
      title,
      category,
      description,
      author_id,
      published_at,
      status,
      featured,
      created_at,
      updated_at
  `;

  const values = [
    title,
    category,
    description,
    published_at || null,
    status || "Draft",
    featured ?? false,
    id,
  ];

  const result = await pool.query(query, values);

  return result.rows[0] || null;
};

// =========================================================
// DELETE NEWS
// =========================================================

const deleteNews = async (id) => {
  const query = `
    DELETE FROM news
    WHERE id = $1
    RETURNING id
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
};

// =========================================================
// UPDATE NEWS STATUS
// =========================================================

const updateNewsStatus = async (id, status) => {
  const query = `
    UPDATE news
    SET
      status = $1,
      published_at = CASE
        WHEN $1 = 'Published'
          AND published_at IS NULL
        THEN CURRENT_TIMESTAMP
        WHEN $1 = 'Draft'
        THEN NULL
        ELSE published_at
      END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      title,
      category,
      description,
      author_id,
      published_at,
      status,
      featured,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [
    status,
    id,
  ]);

  return result.rows[0] || null;
};

// =========================================================
// UPDATE FEATURED STATUS
// =========================================================

const updateNewsFeatured = async (
  id,
  featured
) => {
  const query = `
    UPDATE news
    SET
      featured = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      title,
      category,
      description,
      author_id,
      published_at,
      status,
      featured,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [
    featured,
    id,
  ]);

  return result.rows[0] || null;
};

// =========================================================
// GET NEWS STATISTICS
// =========================================================

const getNewsStats = async () => {
  const query = `
    SELECT
      COUNT(*) AS total_news,

      COUNT(*) FILTER (
        WHERE status = 'Published'
      ) AS published_news,

      COUNT(*) FILTER (
        WHERE status = 'Draft'
      ) AS draft_news,

      COUNT(*) FILTER (
        WHERE featured = TRUE
      ) AS featured_news
    FROM news
  `;

  const result = await pool.query(query);

  return result.rows[0];
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  updateNewsStatus,
  updateNewsFeatured,
  getNewsStats,
};
