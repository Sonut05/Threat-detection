/**
 * Centralized API Base URL configuration.
 * - Uses `NEXT_PUBLIC_API_URL` if explicitly defined and non-empty (stripping any trailing slash).
 * - Defaults to `http://localhost:8000` during local dev (when run on localhost).
 * - Defaults to relative paths `""` otherwise.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== ""
    ? process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/+$/, "")
    : typeof window !== "undefined" &&
      window.location.hostname === "localhost" &&
      window.location.port === "3000"
    ? "http://localhost:8000"
    : "";

