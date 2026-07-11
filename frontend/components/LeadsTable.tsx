"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CrmRecord } from "@/lib/types";

function StatusPill({ status }: { status?: string }) {
  if (!status) return <span className="text-ink/25">—</span>;
  const styles: Record<string, string> = {
    GOOD_LEAD_FOLLOW_UP: "bg-status-goodBg text-status-goodText",
    SALE_DONE: "bg-status-saleBg text-status-saleText",
    DID_NOT_CONNECT: "bg-status-neutralBg text-status-neutralText",
    BAD_LEAD: "bg-status-badBg text-status-badText",
  };
  const display: Record<string, string> = {
    GOOD_LEAD_FOLLOW_UP: "Good Lead",
    SALE_DONE: "Sale Done",
    DID_NOT_CONNECT: "Not Dialed",
    BAD_LEAD: "Bad Lead",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? "bg-ink/5 text-ink/50"}`}>
      {display[status] ?? status}
    </span>
  );
}

export default function LeadsTable({ records }: { records: CrmRecord[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.mobile_without_country_code ?? "").includes(q)
    );
  }, [records, query]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Your Leads</h3>
        <div className="flex items-center gap-2 rounded-lg border border-ink/12 bg-white pl-3 pr-1 py-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter email or phone number..."
            className="w-56 bg-transparent text-sm text-ink outline-none placeholder:text-ink/35"
          />
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-grow-600 text-white">
            <Search size={13} />
          </span>
        </div>
      </div>

      <div className="data-table-wrap max-h-[28rem] rounded-xl border border-ink/10 bg-white">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Date Created</th>
              <th>Company</th>
              <th>Status</th>
              <th>Source</th>
              <th>Lead Owner</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td className="font-medium text-ink">{r.name || "—"}</td>
                <td className="max-w-[200px] truncate text-ink/70">{r.email || "—"}</td>
                <td className="text-ink/70">
                  {r.country_code || r.mobile_without_country_code
                    ? `${r.country_code ?? ""} ${r.mobile_without_country_code ?? ""}`.trim()
                    : "—"}
                </td>
                <td className="text-ink/60">{r.created_at || "—"}</td>
                <td className="text-ink/70">{r.company || "—"}</td>
                <td>
                  <StatusPill status={r.crm_status} />
                </td>
                <td className="text-ink/50">{r.data_source || "—"}</td>
                <td className="text-ink/50">{r.lead_owner || "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-ink/40">
                  No leads match that search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
