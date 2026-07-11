"use client";

import { X } from "lucide-react";
import type { SkippedRecord } from "@/lib/types";

export default function SkippedDrawer({
  open,
  onClose,
  records,
}: {
  open: boolean;
  onClose: () => void;
  records: SkippedRecord[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-[1px]">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-ink/8 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Skipped rows</h3>
            <p className="text-xs text-ink/45">No usable email or mobile number was found.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-ink/40 hover:bg-ink/5">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {records.length === 0 ? (
            <p className="text-sm text-ink/40">Nothing was skipped on this import.</p>
          ) : (
            <ul className="space-y-3">
              {records.map((r, i) => (
                <li key={i} className="rounded-lg border border-ink/8 p-3">
                  <p className="text-xs font-medium text-status-badText">{r.reason}</p>
                  <p className="mt-1.5 break-all font-mono text-[0.68rem] text-ink/45">
                    {JSON.stringify(r.source)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
