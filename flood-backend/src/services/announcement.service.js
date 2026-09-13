const pool = require("../config/db");

// =========================================================
// GET ALL ANNOUNCEMENTS
// =========================================================

const getAnnouncements = async ({
  status,
  category,
  priority,
  search,
} = {}) => {
  const conditions = [];
  const values = [];

  let query = `
    SELECT
      a.id,
      a.title,
      a.category,
      a.priority,
      a.status,
      a.published_at,
      a.expires_at,
      a.content,
      a.author_id,
      a.created_at,
      a.updated_at
    FROM announcements a
  `;

  // -------------------------------------------------------
  // STATUS FILTER
  // -------------------------------------------------------

  if (status) {
    values.push(status);
    conditions.push(`a.status = $${values.length}`);
  }

  // -------------------------------------------------------
  // CATEGORY FILTER
  // -------------------------------------------------------

  if (category) {
    values.push(category);
    conditions.push(`a.category = $${values.length}`);
  }

  // -------------------------------------------------------
  // PRIORITY FILTER
  // -------------------------------------------------------

  if (priority) {
    values.push(priority);
    conditions.push(`a.priority = $${values.length}`);
  }

  // -------------------------------------------------------
  // SEARCH
  // -------------------------------------------------------

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        a.title ILIKE $${values.length}
        OR
        a.content ILIKE $${values.length}
        OR
        a.category ILIKE $${values.length}
      )
    `);
  }

  // -------------------------------------------------------
  // WHERE
  // -------------------------------------------------------

  if (conditions.length > 0) {
    query += `
      WHERE ${conditions.join(" AND ")}
    `;
  }

  // -------------------------------------------------------
  // ORDER
  // -------------------------------------------------------

  query += `
    ORDER BY a.created_at DESC
  `;

  const result = await pool.query(query, values);

  return result.rows;
};


// =========================================================
// GET SINGLE ANNOUNCEMENT
// =========================================================

const getAnnouncementById = async (id) => {
  const query = `
    SELECT
      a.id,
      a.title,
      a.category,
      a.priority,
      a.status,
      a.published_at,
      a.expires_at,
      a.content,
      a.author_id,
      a.created_at,
      a.updated_at
    FROM announcements a
    WHERE a.id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
};


// =========================================================
// CREATE ANNOUNCEMENT
// =========================================================

const createAnnouncement = async ({
  title,
  category,
  priority,
  status,
  published_at,
  expires_at,
  content,
  author_id,
}) => {
  const query = `
    INSERT INTO announcements (
      title,
      category,
      priority,
      status,
      published_at,
      expires_at,
      content,
      author_id
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8
    )
    RETURNING
      id,
      title,
      category,
      priority,
      status,
      published_at,
      expires_at,
      content,
      author_id,
      created_at,
      updated_at
  `;

  const values = [
    title,
    category,
    priority,
    status,
    published_at || null,
    expires_at || null,
    content,
    author_id || null,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};


// =========================================================
// UPDATE ANNOUNCEMENT
// =========================================================

const updateAnnouncement = async (
  id,
  {
    title,
    category,
    priority,
    status,
    published_at,
    expires_at,
    content,
  }
) => {
  const query = `
    UPDATE announcements
    SET
      title = $1,
      category = $2,
      priority = $3,
      status = $4,
      published_at = $5,
      expires_at = $6,
      content = $7,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING
      id,
      title,
      category,
      priority,
      status,
      published_at,
      expires_at,
      content,
      author_id,
      created_at,
      updated_at
  `;

  const values = [
    title,
    category,
    priority,
    status,
    published_at || null,
    expires_at || null,
    content,
    id,
  ];

  const result = await pool.query(query, values);

  return result.rows[0] || null;
};


// =========================================================
// DELETE ANNOUNCEMENT
// =========================================================

const deleteAnnouncement = async (id) => {
  const query = `
    DELETE FROM announcements
    WHERE id = $1
    RETURNING id
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
};


// =========================================================
// UPDATE STATUS
// =========================================================

const updateAnnouncementStatus = async (
  id,
  status
) => {
  const query = `
    UPDATE announcements
    SET
      status = $1,
      published_at =
        CASE
          WHEN $1 = 'Published'
               AND published_at IS NULL
          THEN CURRENT_TIMESTAMP
          ELSE published_at
        END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      title,
      category,
      priority,
      status,
      published_at,
      expires_at,
      content,
      author_id,
      created_at,
      updated_at
  `;

  const result = await pool.query(
    query,
    [status, id]
  );

  return result.rows[0] || null;
};


// =========================================================
// GET ANNOUNCEMENT STATISTICS
// =========================================================

const getAnnouncementStats = async () => {
  const query = `
    SELECT
      COUNT(*)::INTEGER AS total_announcements,

      COUNT(*) FILTER (
        WHERE status = 'Published'
      )::INTEGER AS published_announcements,

      COUNT(*) FILTER (
        WHERE status = 'Draft'
      )::INTEGER AS draft_announcements,

      COUNT(*) FILTER (
        WHERE status = 'Archived'
      )::INTEGER AS archived_announcements,

      COUNT(*) FILTER (
        WHERE priority IN ('High', 'Critical')
      )::INTEGER AS high_priority_announcements,

      COUNT(*) FILTER (
        WHERE priority = 'Critical'
      )::INTEGER AS critical_announcements

    FROM announcements
  `;

  const result = await pool.query(query);

  return result.rows[0];
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  updateAnnouncementStatus,
  getAnnouncementStats,
};