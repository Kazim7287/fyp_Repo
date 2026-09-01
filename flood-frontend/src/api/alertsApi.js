import axios from "axios";

/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
|
| VITE_API_URL should normally be something like:
|
| Development:
| VITE_API_URL=http://localhost:5000/api
|
| Production:
| VITE_API_URL=http://16.171.225.118/api
|
|--------------------------------------------------------------------------
*/

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
*/

const alertsApi = axios.create({
  baseURL: API_URL,

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| GET ALL ALERTS
|--------------------------------------------------------------------------
|
| GET /api/alerts
|
*/

export const getAlertsApi = async (params = {}) => {
  const response = await alertsApi.get(
    "/alerts",
    {
      params,
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE ALERT
|--------------------------------------------------------------------------
|
| GET /api/alerts/:id
|
*/

export const getAlertByIdApi = async (id) => {
  const response = await alertsApi.get(
    `/alerts/${id}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| CREATE MANUAL ALERT
|--------------------------------------------------------------------------
|
| POST /api/alerts
|
*/

export const createAlertApi = async (
  alertData
) => {
  const response = await alertsApi.post(
    "/alerts",
    alertData
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| ACKNOWLEDGE ALERT
|--------------------------------------------------------------------------
|
| PATCH /api/alerts/:id/acknowledge
|
*/

export const acknowledgeAlertApi = async (
  id
) => {
  const response = await alertsApi.patch(
    `/alerts/${id}/acknowledge`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| RESOLVE ALERT
|--------------------------------------------------------------------------
|
| PATCH /api/alerts/:id/resolve
|
*/

export const resolveAlertApi = async (
  id
) => {
  const response = await alertsApi.patch(
    `/alerts/${id}/resolve`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default alertsApi;