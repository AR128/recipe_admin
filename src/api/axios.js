import axios from "axios";
import { auth } from "../firebase";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const currentUser = auth.currentUser;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._firebaseRetry ||
      !currentUser
    ) {
      return Promise.reject(error);
    }

    originalRequest._firebaseRetry = true;
    try {
      const idToken = await currentUser.getIdToken(true);
      setAuthToken(idToken);
      originalRequest.headers.Authorization = `Bearer ${idToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default api;
