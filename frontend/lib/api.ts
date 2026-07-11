import type { ImportResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://groweasy-csv-importer-3-usth.onrender.com";

export async function importCsvFile(file: File): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/import`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Import failed with status ${res.status}`);
  }

  return res.json();
}
