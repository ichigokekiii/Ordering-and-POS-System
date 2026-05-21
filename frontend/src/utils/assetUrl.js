export const getApiOrigin = () =>
  (
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000"
  )
    .replace(/\/api\/?$/, "")
    .replace(/\/+$/, "");

export function getAssetUrl(value) {
  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  return `${getApiOrigin()}${value.startsWith("/") ? value : `/${value}`}`;
}
