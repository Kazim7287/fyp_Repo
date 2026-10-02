
const pool = require("../config/db");

const {
  createSystemLog,
} = require("../services/systemLogService");

// =========================================================
// AUDIT HELPERS
// =========================================================

const getClientIp = (req) => {
  return (
    req.ip ||
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    null
  );
};

const getUserAgent = (req) => {
  return req.get("user-agent") || null;
};

const getAuditUserId = (req) => {
  return req.user?.id || null;
};

const getAuditUserName = (req) => {
  return (
    req.user?.name ||
    req.user?.email ||
    "Unknown"
  );
};

// =========================================================
// NODE SNAPSHOT QUERY
// =========================================================
//
// Used for audit logging.
//
// This returns the node together with its components.
// It does NOT modify anything.
// =========================================================

const getNodeSnapshot = async (db, nodeId) => {
  const result = await db.query(
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
    [nodeId]
  );

  return result.rows[0] || null;
};

// =========================================================
// GET ALL NODES
// GET /api/nodes
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

    return res.status(200).json({
      success: true,
      nodes: result.rows,
    });

  } catch (error) {
    console.error(
      "Get nodes error:",
      error
    );

    next(error);
  }
};

// =========================================================
// GET SINGLE NODE
// GET /api/nodes/:id
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

    return res.status(200).json({
      success: true,
      node: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Get node by ID error:",
      error
    );

    next(error);
  }
};

// =========================================================
// CREATE NODE
// POST /api/nodes
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

    if (
      !deviceId ||
      !nodeName ||
      !deviceType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Device ID, node name and device type are required",
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
        latitude !== undefined
          ? latitude
          : null,
        longitude !== undefined
          ? longitude
          : null,
        deviceType,
      ]
    );

    const node = nodeResult.rows[0];

    // -----------------------------------------------------
    // ADD COMPONENTS
    // -----------------------------------------------------

    for (const item of components) {
      if (!item.componentId) {
        throw new Error(
          "Each component must contain componentId"
        );
      }

      const quantity =
        item.quantity || 1;

      // Check component exists
      const componentCheck =
        await client.query(
          `
          SELECT id
          FROM components
          WHERE id = $1
          `,
          [item.componentId]
        );

      if (
        componentCheck.rows.length === 0
      ) {
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

    // -----------------------------------------------------
    // COMMIT TRANSACTION
    // -----------------------------------------------------

    await client.query("COMMIT");

    // -----------------------------------------------------
    // GET COMPLETE CREATED NODE
    // -----------------------------------------------------

    const completeNode =
      await getNodeSnapshot(
        pool,
        node.id
      );

    // -----------------------------------------------------
    // SYSTEM AUDIT LOG — CREATE
    // -----------------------------------------------------

    await createSystemLog({
      userId: getAuditUserId(req),

      userName:
        getAuditUserName(req),

      action: "CREATE",

      module: "Monitoring Nodes",

      resourceType: "node",

      resourceId: node.id,

      description:
        `Monitoring node "${node.node_name}" was created.`,

      oldValues: null,

      newValues: completeNode,

      ipAddress:
        getClientIp(req),

      userAgent:
        getUserAgent(req),

      status: "Success",

      severity: "Info",
    });

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Node created successfully",
      node: completeNode,
    });

  } catch (error) {
    // -----------------------------------------------------
    // ROLLBACK
    // -----------------------------------------------------

    await client.query("ROLLBACK");

    // -----------------------------------------------------
    // DUPLICATE DEVICE ID
    // -----------------------------------------------------

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message:
          "A node with this device ID already exists",
      });
    }

    console.error(
      "Create node error:",
      error
    );

    next(error);

  } finally {
    client.release();
  }
};

// =========================================================
// UPDATE NODE
// PUT /api/nodes/:id
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

    // -----------------------------------------------------
    // TRANSACTION
    // -----------------------------------------------------

    await client.query("BEGIN");

    // -----------------------------------------------------
    // GET OLD NODE BEFORE UPDATE
    // -----------------------------------------------------

    const oldNode =
      await getNodeSnapshot(
        client,
        id
      );

    if (!oldNode) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Node not found",
      });
    }

    // -----------------------------------------------------
    // UPDATE NODE
    // -----------------------------------------------------

    const nodeResult = await client.query(
      `
      UPDATE nodes
      SET
        device_id =
          COALESCE($1, device_id),

        node_name =
          COALESCE($2, node_name),

        location_name = $3,

        latitude = $4,

        longitude = $5,

        device_type =
          COALESCE($6, device_type),

        updated_at =
          CURRENT_TIMESTAMP

      WHERE id = $7

      RETURNING *
      `,
      [
        deviceId || null,
        nodeName || null,
        locationName || null,
        latitude !== undefined
          ? latitude
          : null,
        longitude !== undefined
          ? longitude
          : null,
        deviceType || null,
        id,
      ]
    );

    if (
      nodeResult.rows.length === 0
    ) {
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
          message:
            "Components must be an array",
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

        const componentCheck =
          await client.query(
            `
            SELECT id
            FROM components
            WHERE id = $1
            `,
            [item.componentId]
          );

        if (
          componentCheck.rows.length === 0
        ) {
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

    // -----------------------------------------------------
    // COMMIT TRANSACTION
    // -----------------------------------------------------

    await client.query("COMMIT");

    // -----------------------------------------------------
    // GET UPDATED NODE
    // -----------------------------------------------------

    const updatedNode =
      await getNodeSnapshot(
        pool,
        id
      );

    // -----------------------------------------------------
    // SYSTEM AUDIT LOG — UPDATE
    // -----------------------------------------------------

    await createSystemLog({
      userId: getAuditUserId(req),

      userName:
        getAuditUserName(req),

      action: "UPDATE",

      module: "Monitoring Nodes",

      resourceType: "node",

      resourceId: id,

      description:
        `Monitoring node "${updatedNode.node_name}" was updated.`,

      oldValues: oldNode,

      newValues: updatedNode,

      ipAddress:
        getClientIp(req),

      userAgent:
        getUserAgent(req),

      status: "Success",

      severity: "Info",
    });

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Node updated successfully",
      node: updatedNode,
    });

  } catch (error) {

    // -----------------------------------------------------
    // ROLLBACK
    // -----------------------------------------------------

    await client.query("ROLLBACK");

    // -----------------------------------------------------
    // DUPLICATE DEVICE ID
    // -----------------------------------------------------

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message:
          "A node with this device ID already exists",
      });
    }

    console.error(
      "Update node error:",
      error
    );

    next(error);

  } finally {
    client.release();
  }
};

// =========================================================
// DELETE NODE
// DELETE /api/nodes/:id
// =========================================================

const deleteNode = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // -----------------------------------------------------
    // START TRANSACTION
    // -----------------------------------------------------

    await client.query("BEGIN");

    // -----------------------------------------------------
    // GET NODE BEFORE DELETE
    // -----------------------------------------------------

    const oldNode =
      await getNodeSnapshot(
        client,
        id
      );

    if (!oldNode) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Node not found",
      });
    }

    // -----------------------------------------------------
    // DELETE NODE
    // -----------------------------------------------------

    await client.query(
      `
      DELETE FROM nodes
      WHERE id = $1
      `,
      [id]
    );

    // -----------------------------------------------------
    // COMMIT
    // -----------------------------------------------------

    await client.query("COMMIT");

    // -----------------------------------------------------
    // SYSTEM AUDIT LOG — DELETE
    // -----------------------------------------------------

    await createSystemLog({
      userId: getAuditUserId(req),

      userName:
        getAuditUserName(req),

      action: "DELETE",

      module: "Monitoring Nodes",

      resourceType: "node",

      resourceId: id,

      description:
        `Monitoring node "${oldNode.node_name}" was deleted.`,

      oldValues: oldNode,

      newValues: null,

      ipAddress:
        getClientIp(req),

      userAgent:
        getUserAgent(req),

      status: "Success",

      severity: "Warning",
    });

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Node deleted successfully",
    });

  } catch (error) {

    // -----------------------------------------------------
    // ROLLBACK
    // -----------------------------------------------------

    await client.query("ROLLBACK");

    console.error(
      "Delete node error:",
      error
    );

    next(error);

  } finally {
    client.release();
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
