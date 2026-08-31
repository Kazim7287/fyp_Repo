import api from "./axios";

// =========================================================
// GET ALL NODES
// =========================================================

export const getNodes = async () => {
  const response = await api.get("/nodes");

  return response.data;
};

// =========================================================
// GET SINGLE NODE
// =========================================================

export const getNodeById = async (id) => {
  const response = await api.get(`/nodes/${id}`);

  return response.data;
};

// =========================================================
// CREATE NODE
// =========================================================

export const createNode = async (nodeData) => {
  const response = await api.post(
    "/nodes",
    nodeData
  );

  return response.data;
};

// =========================================================
// UPDATE NODE
// =========================================================

export const updateNode = async (id, nodeData) => {
  const response = await api.put(
    `/nodes/${id}`,
    nodeData
  );

  return response.data;
};

// =========================================================
// DELETE NODE
// =========================================================

export const deleteNode = async (id) => {
  const response = await api.delete(
    `/nodes/${id}`
  );

  return response.data;
};