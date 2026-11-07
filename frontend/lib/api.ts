const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) });
  } catch {
    throw new Error("Could not reach the simulation API. Check that the backend is running on port 8000, then retry.");
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(typeof data?.detail === "string" ? data.detail : `Simulation rejected (${response.status}). Check parameter ranges and configuration.`);
  }
  return response.json() as Promise<T>;
}
export function download(name: string, value: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
