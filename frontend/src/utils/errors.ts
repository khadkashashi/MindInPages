export function apiError(err: any, fallback = "Something went wrong.") {
  const data = err?.response?.data;
  if (!data || typeof data === "string") return fallback;
  if (data.detail) return String(data.detail);
  const first = Object.values(data)[0];
  if (Array.isArray(first)) return String(first[0]);
  return typeof first === "string" ? first : fallback;
}