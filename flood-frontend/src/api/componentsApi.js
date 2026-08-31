
import api from "./axios";

// =========================================================
// GET ALL COMPONENTS
// =========================================================

export const getComponents = async () => {
  const response = await api.get("/components");

  return response.data;
};

// =========================================================
// CREATE COMPONENT
// =========================================================

export const createComponent = async (componentData) => {
  const response = await api.post(
    "/components",
    componentData
  );

  return response.data;
};

// =========================================================
// UPDATE COMPONENT
// =========================================================

export const updateComponent = async (
  id,
  componentData
) => {
  const response = await api.put(
    `/components/${id}`,
    componentData
  );

  return response.data;
};

// =========================================================
// DELETE COMPONENT
// =========================================================

export const deleteComponent = async (id) => {
  const response = await api.delete(
    `/components/${id}`
  );

  return response.data;
};
