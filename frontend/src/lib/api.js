const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${path}`);
  }
  return response.json();
}

export const api = {
  summary: () => request("/summary"),
  topHubs: () => request("/top-hubs"),
  talukSummary: () => request("/taluk-summary"),
  categorySummary: () => request("/category-summary"),
  metrics: () => request("/metrics"),
  networkPreview: () => request("/network-preview?limit=70"),
  places: () => request("/places?limit=200"),
  placeDetail: (nodeId) => request(`/places/${nodeId}`),
  recommendations: (nodeId, transport) =>
    request(`/places/${nodeId}/recommendations?transport=${transport}&limit=6`),
};

export function proxiedImageUrl(photoUrl) {
  if (!photoUrl) {
    return "";
  }
  return `${API_BASE}/media?url=${encodeURIComponent(photoUrl)}`;
}
