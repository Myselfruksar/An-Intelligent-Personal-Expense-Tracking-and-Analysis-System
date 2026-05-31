const BASE_URL = import.meta.env.VITE_BASE_URL;

// AUTH ENDPOINTS
export const authEndpoints = {
  REGISTER_API: BASE_URL + "/auth/register",

  LOGIN_API: BASE_URL + "/auth/login",

  SEND_OTP: BASE_URL + "/auth/send-otp",

  RESET_PASSWORD: BASE_URL + "/auth/reset-password",
};

export const transactionEndpoints = {
  ADD_EXPENSE: BASE_URL + "/transaction/add-expense",

  RECENT_TRANSACTIONS: BASE_URL + "/transaction/recent-transactions",

  ALL_TRANSACTIONS: BASE_URL + "/transaction/all-transactions",

  UPDATE_EXPENSE: BASE_URL + "/transaction/update-expense",

  DELETE_EXPENSE: BASE_URL + "/transaction/delete-expense",
};

export const userEndpoints = {
  GET_PROFILE: BASE_URL + "/user/profile",

  UPDATE_PROFILE: BASE_URL + "/user/update-profile",

  CHANGE_PASSWORD: BASE_URL + "/user/change-password",
};

export const dashboardEndpoints = {
  DASHBOARD_ANALYTICS: BASE_URL + "/dashboard/analytics",

  AI_INSIGHTS: BASE_URL + "/dashboard/ai-insights",

  GRAPH_ANALYTICS: BASE_URL + "/dashboard/graph-analytics",
  
  ADVANCED_ANALYTICS: BASE_URL + "/dashboard/advanced-analytics",
};
