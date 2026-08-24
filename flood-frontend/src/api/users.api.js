import api from "./axios";

// =========================================================
// GET ALL USERS
// =========================================================

export const getUsers = async () => {
  const response = await api.get("/users");

  return response.data;
};


// =========================================================
// CREATE USER
// =========================================================

export const createUser = async (userData) => {
  const response = await api.post(
    "/users",
    userData
  );

  return response.data;
};


// =========================================================
// UPDATE USER
// =========================================================

export const updateUser = async (
  id,
  userData
) => {
  const response = await api.put(
    `/users/${id}`,
    userData
  );

  return response.data;
};


// =========================================================
// DISABLE USER
// =========================================================

export const disableUser = async (id) => {
  const response = await api.patch(
    `/users/${id}/disable`
  );

  return response.data;
};


// =========================================================
// ENABLE USER
// =========================================================

export const enableUser = async (id) => {
  const response = await api.patch(
    `/users/${id}/enable`
  );

  return response.data;
};