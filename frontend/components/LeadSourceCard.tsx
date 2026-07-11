import type { LucideIcon } from "lucide-react";

export default function LeadSourceCard({
  icon: Icon,
  name,
  status,
  onClick,
  primary,
}: {
  icon: LucideIcon;
  name: string;
  status: "Connected" | "Not Connected";
  onClick?: () => void;
  primary?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink/8 bg-white px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            primary ? "bg-grow-50 text-grow-600" : "bg-ink/5 text-ink/50"
          }`}
        >
          <Icon size={17} />
        </span>
        <div>
          <p className="text-sm font-medium text-ink">{name}</p>
          <p className={`text-xs ${status === "Connected" ? "text-grow-600" : "text-ink/40"}`}>{status}</p>
        </div>
      </div>
      {onClick ? (
        <button
          onClick={onClick}
          className="rounded-lg bg-grow-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-grow-700"
        >
          Upload CSV
        </button>
      ) : (
        <button className="rounded-lg border border-ink/12 px-3 py-1.5 text-xs font-medium text-ink/50">
          Connect
        </button>
      )}
    </div>
  );
}
