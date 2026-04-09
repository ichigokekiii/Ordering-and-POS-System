const apiOrigin =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

export function getAssetUrl(value) {
  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  return `${apiOrigin}${value.startsWith("/") ? value : `/${value}`}`;
}
