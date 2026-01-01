import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This sends cookies with requests
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// Navigation callback for handling logout redirects
let onUnauthenticated: (() => void) | null = null;

export const setUnauthenticatedCallback = (callback: () => void) => {
  onUnauthenticated = callback;
};

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Response interceptor to handle 401 errors and refresh tokens
apiClient.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept errors from the refresh endpoint itself to avoid infinite loops
    if (originalRequest.url === "/auth/refresh") {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        await apiClient.post("/auth/refresh");

        // Token refreshed successfully
        processQueue(null);
        isRefreshing = false;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear queue and redirect to login
        processQueue(refreshError);
        isRefreshing = false;

        // Clear any stored user data
        localStorage.removeItem("user");

        // Use callback for navigation (avoids full page refresh)
        if (onUnauthenticated) {
          onUnauthenticated();
        }

        return Promise.reject(refreshError);
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default apiClient;
