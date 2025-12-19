import type { AuthProvider } from "@refinedev/core";
import axios from "axios";
import { API_BASE_URL } from "./api/config";

export const TOKEN_KEY = "refine-auth";

export const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await axios.post<{ access_token: string }>(
      `${API_BASE_URL}/refresh`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const { access_token } = response.data;
    if (access_token) {
      localStorage.setItem(TOKEN_KEY, access_token);
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

export const authProvider: AuthProvider = {
  login: async ({ password }) => {
    try {
      const response = await axios.post<{ access_token: string }>(
        `${API_BASE_URL}/login`,
        { password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem(TOKEN_KEY, access_token);
        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
        error: {
          message: "Login failed",
          name: "Invalid response",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || "Login failed",
          name: error.response?.status === 401 ? "Unauthorized" : "Login error",
        },
      };
    }
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    if (error.response?.status === 401) {
      // Попытка обновить токен при 401 ошибке
      const refreshed = await refreshToken();
      if (refreshed) {
        return {};
      }
      return {
        logout: true,
      };
    }

    return { error };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      error: {
        message: "Check failed",
        name: "Token not found",
      },
      logout: true,
      redirectTo: "/login",
    };
  },
  getIdentity: async () => {
    return {
      name: "Admin",
      avatar:
        "https://i.pinimg.com/200x/ba/45/a7/ba45a7114bdc22df8f756868b69789fb.jpg",
    };
  },
};
