const pool = require("../config/db");

// =========================================================
// GET ALL RESEARCH
// =========================================================

const getAllResearch = async ({
  search = "",
  status = "all",
  category = "all",
}) => {
  const values = [];
  const conditions = [];

  if (search.trim()) {
    values.push(`%${search.trim()}%`);

    conditions.push(`
      (
        title ILIKE $${values.length}
        OR authors ILIKE $${values.length}
        OR category ILIKE $${values.length}
        OR abstract ILIKE $${values.length}
      )
    `);
  }

  if (status !== "all") {
    values.push(status);

    conditions.push(
      `status = $${values.length}`
    );
  }

  if (category !== "all") {
    values.push(category);

    conditions.push(
      `category = $${values.length}`
    );
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const query = `
    SELECT
      id,
      title,
      authors,
      category,
      abstract,
      publication_date,
      status,
      image_url,
      pdf_url,
      created_at,
      updated_at
    FROM research
    ${whereClause}
    ORDER BY created_at DESC
  `;

  const result = await pool.query(
    query,
    values
  );

  return result.rows;
};

// =========================================================
// GET SINGLE RESEARCH
// =========================================================

const getResearchById = async (id) => {
  const query = `
    SELECT
      id,
      title,
      authors,
      category,
      abstract,
      publication_date,
      status,
      image_url,
      pdf_url,
      created_at,
      updated_at
    FROM research
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
};

// =========================================================
// CREATE RESEARCH
// =========================================================

const createResearch = async ({
  title,
  authors,
  category,
  abstract,
  publicationDate,
  status = "Draft",
  imageUrl = null,
  pdfUrl = null,
}) => {
  const query = `
    INSERT INTO research (
      title,
      authors,
      category,
      abstract,
      publication_date,
      status,
      image_url,
      pdf_url
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING
      id,
      title,
      authors,
      category,
      abstract,
      publication_date,
      status,
      image_url,
      pdf_url,
      created_at,
      updated_at
  `;

  const values = [
    title,
    authors,
    category,
    abstract,
    publicationDate,
    status,
    imageUrl,
    pdfUrl,
  ];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0];
};

// =========================================================
// UPDATE RESEARCH
// =========================================================

const updateResearch = async (
  id,
  {
    title,
    authors,
    category,
    abstract,
    publicationDate,
    status,
    imageUrl,
    pdfUrl,
  }
) => {
  const query = `
    UPDATE research
    SET
      title = $1,
      authors = $2,
      category = $3,
      abstract = $4,
      publication_date = $5,
      status = $6,
      image_url = COALESCE($7, image_url),
      pdf_url = COALESCE($8, pdf_url)
    WHERE id = $9
    RETURNING
      id,
      title,
      authors,
      category,
      abstract,
      publication_date,
      status,
      image_url,
      pdf_url,
      created_at,
      updated_at
  `;

  const values = [
    title,
    authors,
    category,
    abstract,
    publicationDate,
    status,
    imageUrl,
    pdfUrl,
    id,
  ];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0] || null;
};

// =========================================================
// DELETE RESEARCH
// =========================================================

const deleteResearch = async (id) => {
  const query = `
    DELETE FROM research
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
// TOGGLE STATUS
// =========================================================

const toggleResearchStatus = async (id) => {
  const query = `
    UPDATE research
    SET status =
      CASE
        WHEN status = 'Published'
          THEN 'Draft'
        ELSE 'Published'
      END
    WHERE id = $1
    RETURNING
      id,
      title,
      authors,
      category,
      abstract,
      publication_date,
      status,
      image_url,
      pdf_url,
      created_at,
      updated_at
  `;

  const result = await pool.query(
    query,
    [id]
  );

  return result.rows[0] || null;
};

// =========================================================
// RESEARCH STATISTICS
// =========================================================

const getResearchStats = async () => {
  const query = `
    SELECT
      COUNT(*)::INTEGER AS total_research,

      COUNT(*) FILTER (
        WHERE status = 'Published'
      )::INTEGER AS published_research,

      COUNT(*) FILTER (
        WHERE status = 'Draft'
      )::INTEGER AS draft_research,

      COUNT(*) FILTER (
        WHERE category = 'AI'
      )::INTEGER AS ai_research
    FROM research
  `;

  const result = await pool.query(query);

  return result.rows[0];
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  getAllResearch,
  getResearchById,
  createResearch,
  updateResearch,
  deleteResearch,
  toggleResearchStatus,
  getResearchStats,
};