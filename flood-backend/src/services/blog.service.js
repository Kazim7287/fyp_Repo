const pool = require("../config/db");

// =========================================================
// BLOG SERVICE
// =========================================================

// ---------------------------------------------------------
// GET ALL BLOGS
// ---------------------------------------------------------

const getAllBlogs = async ({
  search = "",
  status = "all",
  category = "all",
  page = 1,
  limit = 10,
}) => {
  const offset = (page - 1) * limit;

  const conditions = [];
  const values = [];

  // -------------------------------------------------------
  // SEARCH
  // -------------------------------------------------------

  if (search.trim()) {
    values.push(`%${search.trim()}%`);

    conditions.push(`
      (
        title ILIKE $${values.length}
        OR category ILIKE $${values.length}
        OR excerpt ILIKE $${values.length}
      )
    `);
  }

  // -------------------------------------------------------
  // STATUS FILTER
  // -------------------------------------------------------

  if (status !== "all") {
    values.push(status);

    conditions.push(
      `status = $${values.length}`
    );
  }

  // -------------------------------------------------------
  // CATEGORY FILTER
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // COUNT
  // -------------------------------------------------------

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM blogs
    ${whereClause}
  `;

  const countResult = await pool.query(
    countQuery,
    values
  );

  const total = Number(
    countResult.rows[0].total
  );

  // -------------------------------------------------------
  // PAGINATION
  // -------------------------------------------------------

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  // -------------------------------------------------------
  // BLOGS
  // -------------------------------------------------------

  const blogsQuery = `
    SELECT
      id,
      title,
      category,
      status,
      featured,
      excerpt,
      content,
      image_url,
      views,
      published_at,
      created_at,
      updated_at
    FROM blogs
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
  `;

  const blogsResult = await pool.query(
    blogsQuery,
    values
  );

  return {
    blogs: blogsResult.rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ---------------------------------------------------------
// GET BLOG BY ID
// ---------------------------------------------------------

const getBlogById = async (id) => {
  const result = await pool.query(
    `
      SELECT
        id,
        title,
        category,
        status,
        featured,
        excerpt,
        content,
        image_url,
        views,
        published_at,
        created_at,
        updated_at
      FROM blogs
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

// ---------------------------------------------------------
// CREATE BLOG
// ---------------------------------------------------------

const createBlog = async ({
  title,
  category,
  status = "Draft",
  featured = false,
  excerpt,
  content,
  image_url = null,
}) => {
  const publishedAt =
    status === "Published"
      ? new Date()
      : null;

  const result = await pool.query(
    `
      INSERT INTO blogs (
        title,
        category,
        status,
        featured,
        excerpt,
        content,
        image_url,
        views,
        published_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        0,
        $8
      )
      RETURNING
        id,
        title,
        category,
        status,
        featured,
        excerpt,
        content,
        image_url,
        views,
        published_at,
        created_at,
        updated_at
    `,
    [
      title,
      category,
      status,
      featured,
      excerpt,
      content,
      image_url,
      publishedAt,
    ]
  );

  return result.rows[0];
};

// ---------------------------------------------------------
// UPDATE BLOG
// ---------------------------------------------------------

const updateBlog = async (
  id,
  {
    title,
    category,
    status,
    featured,
    excerpt,
    content,
    image_url,
  }
) => {
  const existingBlog = await getBlogById(id);

  if (!existingBlog) {
    return null;
  }

  let publishedAt =
    existingBlog.published_at;

  // -------------------------------------------------------
  // Draft -> Published
  // -------------------------------------------------------

  if (
    status === "Published" &&
    existingBlog.status !== "Published"
  ) {
    publishedAt = new Date();
  }

  // -------------------------------------------------------
  // Published -> Draft
  // -------------------------------------------------------

  if (status === "Draft") {
    publishedAt = null;
  }

  const result = await pool.query(
    `
      UPDATE blogs
      SET
        title = $1,
        category = $2,
        status = $3,
        featured = $4,
        excerpt = $5,
        content = $6,
        image_url = COALESCE($7, image_url),
        published_at = $8
      WHERE id = $9
      RETURNING
        id,
        title,
        category,
        status,
        featured,
        excerpt,
        content,
        image_url,
        views,
        published_at,
        created_at,
        updated_at
    `,
    [
      title,
      category,
      status,
      featured,
      excerpt,
      content,
      image_url,
      publishedAt,
      id,
    ]
  );

  return result.rows[0];
};

// ---------------------------------------------------------
// DELETE BLOG
// ---------------------------------------------------------

const deleteBlog = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM blogs
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

  return result.rows[0] || null;
};

// ---------------------------------------------------------
// TOGGLE PUBLISH
// ---------------------------------------------------------

const togglePublish = async (id) => {
  const existingBlog = await getBlogById(id);

  if (!existingBlog) {
    return null;
  }

  const newStatus =
    existingBlog.status === "Published"
      ? "Draft"
      : "Published";

  const publishedAt =
    newStatus === "Published"
      ? new Date()
      : null;

  const result = await pool.query(
    `
      UPDATE blogs
      SET
        status = $1,
        published_at = $2
      WHERE id = $3
      RETURNING
        id,
        title,
        category,
        status,
        featured,
        excerpt,
        content,
        image_url,
        views,
        published_at,
        created_at,
        updated_at
    `,
    [
      newStatus,
      publishedAt,
      id,
    ]
  );

  return result.rows[0];
};

// ---------------------------------------------------------
// INCREMENT VIEWS
// ---------------------------------------------------------

const incrementViews = async (id) => {
  const result = await pool.query(
    `
      UPDATE blogs
      SET views = views + 1
      WHERE id = $1
      AND status = 'Published'
      RETURNING id, views
    `,
    [id]
  );

  return result.rows[0] || null;
};

// ---------------------------------------------------------
// GET BLOG STATISTICS
// ---------------------------------------------------------

const getBlogStats = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(*)::INTEGER AS total_posts,

      COUNT(*) FILTER (
        WHERE status = 'Published'
      )::INTEGER AS published_posts,

      COUNT(*) FILTER (
        WHERE status = 'Draft'
      )::INTEGER AS draft_posts,

      COUNT(*) FILTER (
        WHERE featured = TRUE
      )::INTEGER AS featured_posts,

      COALESCE(
        SUM(views),
        0
      )::BIGINT AS total_views

    FROM blogs
  `);

  return result.rows[0];
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublish,
  incrementViews,
  getBlogStats,
};