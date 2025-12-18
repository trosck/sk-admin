const isProduction = import.meta.env.MODE === "production";

export const API_BASE_URL = isProduction
  ? "https://loremo.dpdns.org/api"
  : "http://localhost:3000/api";