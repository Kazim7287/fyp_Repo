const pool = require("../config/db");

// =========================================================
// GET ALL NODES
// =========================================================

const getNodes = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        n.id,
        n.device_id,
        n.node_name,
        n.location_name,
        n.latitude,
        n.longitude,
        n.device_type,
        n.connection,
        n.battery,
        n.last_seen,
        n.created_at,
        n.updated_at,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', c.id,
              'name', c.name,
              'category', c.category,
              'model', c.model,
              'manufacturer', c.manufacturer,
              'interface', c.interface,
              'voltage', c.voltage,
              'quantity', nc.quantity
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS components

      FROM nodes n

      LEFT JOIN node_components nc
        ON n.id = nc.node_id

      LEFT JOIN components c
        ON nc.component_id = c.id

      GROUP BY n.id

      ORDER BY n.id DESC
    `);

    res.status(200).json({
      success: true,
      nodes: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET SINGLE NODE
// =========================================================

const getNodeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        n.id,
        n.device_id,
        n.node_name,
        n.location_name,
        n.latitude,
        n.longitude,
        n.device_type,
        n.connection,
        n.battery,
        n.last_seen,
        n.created_at,
        n.updated_at,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', c.id,
              'name', c.name,
              'category', c.category,
              'model', c.model,
              'manufacturer', c.manufacturer,
              'interface', c.interface,
              'voltage', c.voltage,
              'quantity', nc.quantity
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS components

      FROM nodes n

      LEFT JOIN node_components nc
        ON n.id = nc.node_id

      LEFT JOIN components c
        ON nc.component_id = c.id

      WHERE n.id = $1

      GROUP BY n.id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Node not found",
      });
    }

    res.status(200).json({
      success: true,
      node: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// CREATE NODE
// =========================================================

const createNode = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const {
      deviceId,
      nodeName,
      locationName,
      latitude,
      longitude,
      deviceType,
      components = [],
    } = req.body;

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!deviceId || !nodeName || !deviceType) {
      return res.status(400).json({
        success: false,
        message: "Device ID, node name and device type are required",
      });
    }

    if (!Array.isArray(components)) {
      return res.status(400).json({
        success: false,
        message: "Components must be an array",
      });
    }

    // -----------------------------------------------------
    // TRANSACTION
    // -----------------------------------------------------

    await client.query("BEGIN");

    // -----------------------------------------------------
    // CREATE NODE
    // -----------------------------------------------------

    const nodeResult = await client.query(
      `
      INSERT INTO nodes (
        device_id,
        node_name,
        location_name,
        latitude,
        longitude,
        device_type,
        connection,
        battery,
        last_seen
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        NULL,
        NULL,
        NULL
      )
      RETURNING *
      `,
      [
        deviceId,
        nodeName,
        locationName || null,
        latitude !== undefined ? latitude : null,
        longitude !== undefined ? longitude : null,
        deviceType,
      ]
    );

    const node = nodeResult.rows[0];

    // -----------------------------------------------------
    // ADD COMPONENTS
    // -----------------------------------------------------

    for (const item of components) {
      if (!item.componentId) {
        throw new Error("Each component must contain componentId");
      }

      const quantity = item.quantity || 1;

      // Check component exists
      const componentCheck = await client.query(
        `
        SELECT id
        FROM components
        WHERE id = $1
        `,
        [item.componentId]
      );

      if (componentCheck.rows.length === 0) {
        throw new Error(
          `Component with ID ${item.componentId} does not exist`
        );
      }

      await client.query(
        `
        INSERT INTO node_components (
          node_id,
          component_id,
          quantity
        )
        VALUES ($1, $2, $3)
        `,
        [
          node.id,
          item.componentId,
          quantity,
        ]
      );
    }

    await client.query("COMMIT");

    // -----------------------------------------------------
    // RETURN COMPLETE NODE
    // -----------------------------------------------------

    const completeNode = await pool.query(
      `
      SELECT
        n.id,
        n.device_id,
        n.node_name,
        n.location_name,
        n.latitude,
        n.longitude,
        n.device_type,
        n.connection,
        n.battery,
        n.last_seen,
        n.created_at,
        n.updated_at,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', c.id,
              'name', c.name,
              'category', c.category,
              'model', c.model,
              'manufacturer', c.manufacturer,
              'interface', c.interface,
              'voltage', c.voltage,
              'quantity', nc.quantity
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS components

      FROM nodes n

      LEFT JOIN node_components nc
        ON n.id = nc.node_id

      LEFT JOIN components c
        ON nc.component_id = c.id

      WHERE n.id = $1

      GROUP BY n.id
      `,
      [node.id]
    );

    res.status(201).json({
      success: true,
      message: "Node created successfully",
      node: completeNode.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A node with this device ID already exists",
      });
    }

    next(error);
  } finally {
    client.release();
  }
};

// =========================================================
// UPDATE NODE
// =========================================================

const updateNode = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const {
      deviceId,
      nodeName,
      locationName,
      latitude,
      longitude,
      deviceType,
      components,
    } = req.body;

    await client.query("BEGIN");

    // -----------------------------------------------------
    // UPDATE NODE
    // -----------------------------------------------------

    const nodeResult = await client.query(
      `
      UPDATE nodes
      SET
        device_id = COALESCE($1, device_id),
        node_name = COALESCE($2, node_name),
        location_name = $3,
        latitude = $4,
        longitude = $5,
        device_type = COALESCE($6, device_type),
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $7

      RETURNING *
      `,
      [
        deviceId || null,
        nodeName || null,
        locationName || null,
        latitude !== undefined ? latitude : null,
        longitude !== undefined ? longitude : null,
        deviceType || null,
        id,
      ]
    );

    if (nodeResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Node not found",
      });
    }

    // -----------------------------------------------------
    // UPDATE COMPONENTS
    // -----------------------------------------------------

    if (components !== undefined) {
      if (!Array.isArray(components)) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: "Components must be an array",
        });
      }

      // Remove old components
      await client.query(
        `
        DELETE FROM node_components
        WHERE node_id = $1
        `,
        [id]
      );

      // Add new components
      for (const item of components) {
        if (!item.componentId) {
          throw new Error(
            "Each component must contain componentId"
          );
        }

        const componentCheck = await client.query(
          `
          SELECT id
          FROM components
          WHERE id = $1
          `,
          [item.componentId]
        );

        if (componentCheck.rows.length === 0) {
          throw new Error(
            `Component with ID ${item.componentId} does not exist`
          );
        }

        await client.query(
          `
          INSERT INTO node_components (
            node_id,
            component_id,
            quantity
          )
          VALUES ($1, $2, $3)
          `,
          [
            id,
            item.componentId,
            item.quantity || 1,
          ]
        );
      }
    }

    await client.query("COMMIT");

    // -----------------------------------------------------
    // RETURN UPDATED NODE
    // -----------------------------------------------------

    const updatedNode = await pool.query(
      `
      SELECT
        n.id,
        n.device_id,
        n.node_name,
        n.location_name,
        n.latitude,
        n.longitude,
        n.device_type,
        n.connection,
        n.battery,
        n.last_seen,
        n.created_at,
        n.updated_at,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', c.id,
              'name', c.name,
              'category', c.category,
              'model', c.model,
              'manufacturer', c.manufacturer,
              'interface', c.interface,
              'voltage', c.voltage,
              'quantity', nc.quantity
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS components

      FROM nodes n

      LEFT JOIN node_components nc
        ON n.id = nc.node_id

      LEFT JOIN components c
        ON nc.component_id = c.id

      WHERE n.id = $1

      GROUP BY n.id
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Node updated successfully",
      node: updatedNode.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A node with this device ID already exists",
      });
    }

    next(error);
  } finally {
    client.release();
  }
};

// =========================================================
// DELETE NODE
// =========================================================

const deleteNode = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM nodes
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Node not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Node deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getNodes,
  getNodeById,
  createNode,
  updateNode,
  deleteNode,
};