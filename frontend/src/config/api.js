/**
 * Centralized API Base URL configuration.
 * - Uses `NEXT_PUBLIC_API_URL` if explicitly defined.
 * - Defaults to `http://localhost:8000` during local dev (when run on localhost).
 * - Defaults to relative paths `""` in production on Netlify (proxied via netlify.toml).
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== "undefined" &&
      window.location.hostname === "localhost" &&
      window.location.port === "3000"
    ? "http://localhost:8000"
    : "";
