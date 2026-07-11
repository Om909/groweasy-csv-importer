"use client";

import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { X, UploadCloud, FileSpreadsheet, Download } from "lucide-react";
import type { RawCsvRow } from "@/lib/types";

const REQUIRED_HEADERS_HINT =
  "created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note";

const PREVIEW_COLUMN_CAP = 6; // keep the in-modal preview compact, like the reference UI

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void;
  isUploading: boolean;
}

function downloadSampleCsv() {
  const header =
    "created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description";
  const sampleRow =
    '2026-05-13 14:20:48,John Doe,john.doe@example.com,+91,9876543210,GrowEasy,Mumbai,Maharashtra,India,test@gmail.com,GOOD_LEAD_FOLLOW_UP,Client is asking to reschedule demo,,,';
  const blob = new Blob([`${header}\n${sampleRow}\n`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "groweasy_sample_leads.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ImportCsvModal({ open, onClose, onConfirm, isUploading }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<RawCsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((incoming: File | undefined) => {
    setError(null);
    if (!incoming) return;

    if (!incoming.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }
    if (incoming.size > 5 * 1024 * 1024) {
      setError("File is larger than the 5MB limit.");
      return;
    }

    Papa.parse<RawCsvRow>(incoming, {
      header: true,
      skipEmptyLines: true,
      preview: 8, // only need enough rows for the compact in-modal preview
      complete: (result) => {
        if (!result.data.length) {
          setError("That CSV doesn't have any data rows.");
          return;
        }
        setFile(incoming);
        setRows(result.data);
        setHeaders((result.meta.fields ?? []).slice(0, PREVIEW_COLUMN_CAP));
      },
      error: (err) => setError(`Couldn't read that file: ${err.message}`),
    });
  }, []);

  function removeFile() {
    setFile(null);
    setRows([]);
    setHeaders([]);
    setError(null);
  }

  function handleModalClose() {
    if (isUploading) return;
    removeFile();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Import Leads via CSV</h2>
            <p className="mt-0.5 text-sm text-ink/50">Upload a CSV file to bulk import leads into your system.</p>
          </div>
          <button
            onClick={handleModalClose}
            className="rounded-md p-1 text-ink/40 hover:bg-ink/5 hover:text-ink/70"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border px-6 py-10 text-center transition-colors
              ${isDragging ? "border-grow-500 bg-grow-50" : "border-ink/12 hover:border-grow-400/50"}`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-grow-50 text-grow-600">
              <UploadCloud size={20} />
            </div>
            <p className="text-sm font-semibold text-ink">Drop your CSV file here</p>
            <p className="text-xs text-ink/45">or click to browse files</p>
            <span className="mt-1 rounded-full bg-ink/5 px-2.5 py-1 text-[0.68rem] font-medium text-ink/50">
              Supported file: .csv (max 5MB)
            </span>
            <p className="mt-2 max-w-sm text-[0.7rem] leading-relaxed text-ink/40">
              Required headers: {REQUIRED_HEADERS_HINT}. Template includes default + custom CRM fields to reduce
              upload errors.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadSampleCsv();
              }}
              className="mt-2 flex items-center gap-1.5 rounded-lg border border-grow-500/40 px-3 py-1.5 text-xs font-medium text-grow-600 hover:bg-grow-50"
            >
              <Download size={13} />
              Download Sample CSV Template
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-ink/[0.03] px-3 py-2.5">
              <FileSpreadsheet size={20} className="shrink-0 text-grow-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                <p className="text-xs text-ink/40">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button
                onClick={removeFile}
                className="rounded-md p-1 text-ink/35 hover:bg-ink/10 hover:text-ink/70"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </div>

            <div className="data-table-wrap max-h-56">
              <table className="data-table font-mono text-[0.72rem]">
                <thead>
                  <tr>
                    {headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      {headers.map((h) => (
                        <td key={h} className="max-w-[140px] truncate">
                          {row[h] || <span className="text-ink/25">-</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            onClick={handleModalClose}
            disabled={isUploading}
            className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => file && onConfirm(file)}
            disabled={!file || isUploading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors
              ${!file ? "cursor-not-allowed bg-cta-300" : "bg-cta-500 hover:bg-cta-600"}
              ${isUploading ? "cursor-wait opacity-80" : ""}`}
          >
            {isUploading ? "Mapping leads…" : "Upload File"}
          </button>
        </div>
      </div>
    </div>
  );
}
