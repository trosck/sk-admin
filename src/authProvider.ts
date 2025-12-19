import type { AuthProvider } from "@refinedev/core";

export const TOKEN_KEY = "refine-auth";

export const authProvider: AuthProvider = {
  login: async ({ password }) => {
    return {
      success: true,
      redirectTo: "/",
    };
  },
  logout: async () => {
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    if (error.response?.status === 401) {
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
