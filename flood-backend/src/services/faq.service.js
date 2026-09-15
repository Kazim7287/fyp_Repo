const pool = require("../config/db");

// =========================================================
// GET ALL FAQs
// =========================================================

const getAllFAQs = async ({
  search = "",
  category = null,
  status = null,
} = {}) => {
  const values = [];
  const conditions = [];

  let query = `
    SELECT
      id,
      question,
      answer,
      category,
      status,
      featured,
      display_order,
      created_at,
      updated_at
    FROM faqs
  `;

  // =======================================================
  // SEARCH
  // =======================================================

  if (search && search.trim() !== "") {
    values.push(`%${search.trim()}%`);

    conditions.push(`
      (
        question ILIKE $${values.length}
        OR answer ILIKE $${values.length}
      )
    `);
  }

  // =======================================================
  // CATEGORY FILTER
  // =======================================================

  if (category && category !== "all") {
    values.push(category);

    conditions.push(
      `category = $${values.length}`
    );
  }

  // =======================================================
  // STATUS FILTER
  // =======================================================

  if (status && status !== "all") {
    values.push(status);

    conditions.push(
      `status = $${values.length}`
    );
  }

  // =======================================================
  // WHERE CLAUSE
  // =======================================================

  if (conditions.length > 0) {
    query += `
      WHERE ${conditions.join(" AND ")}
    `;
  }

  // =======================================================
  // ORDER
  // =======================================================

  query += `
    ORDER BY display_order ASC, id ASC
  `;

  const result = await pool.query(
    query,
    values
  );

  return result.rows;
};


// =========================================================
// GET FAQ BY ID
// =========================================================

const getFAQById = async (id) => {
  const query = `
    SELECT
      id,
      question,
      answer,
      category,
      status,
      featured,
      display_order,
      created_at,
      updated_at
    FROM faqs
    WHERE id = $1
  `;

  const result = await pool.query(
    query,
    [id]
  );

  return result.rows[0] || null;
};


// =========================================================
// CREATE FAQ
// =========================================================

const createFAQ = async ({
  question,
  answer,
  category,
  status = "Draft",
  featured = false,
  display_order = 1,
}) => {
  const query = `
    INSERT INTO faqs (
      question,
      answer,
      category,
      status,
      featured,
      display_order
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    )
    RETURNING
      id,
      question,
      answer,
      category,
      status,
      featured,
      display_order,
      created_at,
      updated_at
  `;

  const values = [
    question,
    answer,
    category,
    status,
    featured,
    display_order,
  ];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0];
};


// =========================================================
// UPDATE FAQ
// =========================================================

const updateFAQ = async (
  id,
  {
    question,
    answer,
    category,
    status,
    featured,
    display_order,
  }
) => {
  const query = `
    UPDATE faqs
    SET
      question = $1,
      answer = $2,
      category = $3,
      status = $4,
      featured = $5,
      display_order = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING
      id,
      question,
      answer,
      category,
      status,
      featured,
      display_order,
      created_at,
      updated_at
  `;

  const values = [
    question,
    answer,
    category,
    status,
    featured,
    display_order,
    id,
  ];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0] || null;
};


// =========================================================
// DELETE FAQ
// =========================================================

const deleteFAQ = async (id) => {
  const query = `
    DELETE FROM faqs
    WHERE id = $1
    RETURNING id
  `;

  const result = await pool.query(
    query,
    [id]
  );

  return result.rows[0] || null;
};


// =========================================================
// UPDATE FAQ STATUS
// =========================================================

const updateFAQStatus = async (
  id,
  status
) => {
  const query = `
    UPDATE faqs
    SET
      status = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      question,
      answer,
      category,
      status,
      featured,
      display_order,
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
// UPDATE FEATURED STATUS
// =========================================================

const updateFAQFeatured = async (
  id,
  featured
) => {
  const query = `
    UPDATE faqs
    SET
      featured = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      question,
      answer,
      category,
      status,
      featured,
      display_order,
      created_at,
      updated_at
  `;

  const result = await pool.query(
    query,
    [featured, id]
  );

  return result.rows[0] || null;
};


// =========================================================
// GET FAQ STATISTICS
// =========================================================

const getFAQStats = async () => {
  const query = `
    SELECT
      COUNT(*)::INTEGER AS total_faqs,

      COUNT(*) FILTER (
        WHERE status = 'Published'
      )::INTEGER AS published_faqs,

      COUNT(*) FILTER (
        WHERE status = 'Draft'
      )::INTEGER AS draft_faqs,

      COUNT(*) FILTER (
        WHERE featured = TRUE
      )::INTEGER AS featured_faqs

    FROM faqs
  `;

  const result = await pool.query(
    query
  );

  return result.rows[0];
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  updateFAQStatus,
  updateFAQFeatured,
  getFAQStats,
};