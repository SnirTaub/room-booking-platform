import axios from "axios";
import type { AxiosInstance } from "axios";
import { getAccessToken, removeAccessToken, removeUserEmail, removeUserDisplayName } from "../utils/storage";

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      removeAccessToken();
      removeUserEmail();
      removeUserDisplayName();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export { apiClient };