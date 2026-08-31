const express = require("express");

const {
  getNodes,
  getNodeById,
  createNode,
  updateNode,
  deleteNode,
} = require("../controllers/nodeController");

const router = express.Router();

// GET /api/nodes
router.get("/", getNodes);

// GET /api/nodes/:id
router.get("/:id", getNodeById);

// POST /api/nodes
router.post("/", createNode);

// PUT /api/nodes/:id
router.put("/:id", updateNode);

// DELETE /api/nodes/:id
router.delete("/:id", deleteNode);

module.exports = router;