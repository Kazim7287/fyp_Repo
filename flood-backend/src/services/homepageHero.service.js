
const pool = require("../config/db");

// =========================================================
// GET HOMEPAGE HERO
// =========================================================

const getHomepageHero = async () => {
  const result = await pool.query(`
    SELECT *
    FROM homepage_hero
    ORDER BY id DESC
    LIMIT 1
  `);

  return result.rows[0] || null;
};

// =========================================================
// SAVE HOMEPAGE HERO
// =========================================================

const saveHomepageHero = async (data) => {
  const {
    hero_heading,
    hero_description,
    metadata_tag,
    primary_cta_label,
    primary_cta_url,
    secondary_cta_label,
    secondary_cta_url,
    banner_image_url,
    banner_image_key,
    banner_image_alt,
    focal_x,
    focal_y,
  } = data;

  const result = await pool.query(
    `
    INSERT INTO homepage_hero (
      hero_heading,
      hero_description,
      metadata_tag,
      primary_cta_label,
      primary_cta_url,
      secondary_cta_label,
      secondary_cta_url,
      banner_image_url,
      banner_image_key,
      banner_image_alt,
      focal_x,
      focal_y
    )
    VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12
    )
    ON CONFLICT ((TRUE))
    DO UPDATE SET
      hero_heading = EXCLUDED.hero_heading,
      hero_description = EXCLUDED.hero_description,
      metadata_tag = EXCLUDED.metadata_tag,
      primary_cta_label = EXCLUDED.primary_cta_label,
      primary_cta_url = EXCLUDED.primary_cta_url,
      secondary_cta_label = EXCLUDED.secondary_cta_label,
      secondary_cta_url = EXCLUDED.secondary_cta_url,
      banner_image_url = EXCLUDED.banner_image_url,
      banner_image_key = EXCLUDED.banner_image_key,
      banner_image_alt = EXCLUDED.banner_image_alt,
      focal_x = EXCLUDED.focal_x,
      focal_y = EXCLUDED.focal_y,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
    `,
    [
      hero_heading,
      hero_description,
      metadata_tag || null,
      primary_cta_label || null,
      primary_cta_url || null,
      secondary_cta_label || null,
      secondary_cta_url || null,
      banner_image_url || null,
      banner_image_key || null,
      banner_image_alt || null,
      focal_x ?? 50,
      focal_y ?? 50,
    ]
  );

  return result.rows[0];
};

// =========================================================
// PUBLISH HOMEPAGE HERO
// =========================================================

const publishHomepageHero = async () => {
  const result = await pool.query(`
    UPDATE homepage_hero
    SET
      status = 'published',
      published_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `);

  return result.rows[0] || null;
};

module.exports = {
  getHomepageHero,
  saveHomepageHero,
  publishHomepageHero,
};
