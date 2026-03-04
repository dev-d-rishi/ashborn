const BASE_URL = process.env.NEXT_PUBLIC_PRIVATE_API_URL!;

export async function apiClient(
  endpoint: string,
  options?: RequestInit
) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "API error");
  }

  return data;
}
