import api from "./axios";

// =========================================================
// GET ALL ALERTS
// GET /api/alerts
// =========================================================

export const getAlerts = async () => {
  const response = await api.get("/alerts");

  return response.data;
};

// =========================================================
// GET ALERT BY ID
// GET /api/alerts/:id
// =========================================================

export const getAlertById = async (id) => {
  const response = await api.get(`/alerts/${id}`);

  return response.data;
};

// =========================================================
// CREATE MANUAL ALERT
// POST /api/alerts
// =========================================================

export const createAlert = async (alertData) => {
  const response = await api.post(
    "/alerts",
    alertData
  );

  return response.data;
};

// =========================================================
// ACKNOWLEDGE ALERT
// PATCH /api/alerts/:id/acknowledge
// =========================================================

export const acknowledgeAlertApi = async (id) => {
  const response = await api.patch(
    `/alerts/${id}/acknowledge`
  );

  return response.data;
};

// =========================================================
// RESOLVE ALERT
// PATCH /api/alerts/:id/resolve
// =========================================================

export const resolveAlertApi = async (id) => {
  const response = await api.patch(
    `/alerts/${id}/resolve`
  );

  return response.data;
};