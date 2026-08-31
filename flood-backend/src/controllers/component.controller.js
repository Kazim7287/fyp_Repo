const pool = require("../config/db");

// =========================================================
// GET ALL COMPONENTS
// =========================================================

const getComponents = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        category,
        model,
        manufacturer,
        interface,
        voltage,
        quantity,
        created_at,
        updated_at
      FROM components
      ORDER BY id DESC
    `);

    res.status(200).json({
      success: true,
      components: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// CREATE COMPONENT
// =========================================================

const createComponent = async (req, res, next) => {
  try {
    const {
      name,
      category,
      model,
      manufacturer,
      interface: componentInterface,
      voltage,
      quantity,
    } = req.body;

    if (!name || !category || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category and quantity are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO components
      (
        name,
        category,
        model,
        manufacturer,
        interface,
        voltage,
        quantity
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        name,
        category,
        model || null,
        manufacturer || null,
        componentInterface || null,
        voltage || null,
        quantity,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Component created successfully",
      component: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// UPDATE COMPONENT
// =========================================================

const updateComponent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      name,
      category,
      model,
      manufacturer,
      interface: componentInterface,
      voltage,
      quantity,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE components
      SET
        name = $1,
        category = $2,
        model = $3,
        manufacturer = $4,
        interface = $5,
        voltage = $6,
        quantity = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
      `,
      [
        name,
        category,
        model || null,
        manufacturer || null,
        componentInterface || null,
        voltage || null,
        quantity,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Component not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Component updated successfully",
      component: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE COMPONENT
// =========================================================

const deleteComponent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM components
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Component not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Component deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComponents,
  createComponent,
  updateComponent,
  deleteComponent,
};