import axios from 'axios';

const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/** Extract a human-friendly message from an axios error. */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default api;
