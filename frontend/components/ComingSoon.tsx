import type { LucideIcon } from "lucide-react";

export default function ComingSoon({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-grow-50 text-grow-600">
        <Icon size={22} />
      </span>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-ink/45">
        This section isn't part of the CSV importer build - only Lead Sources and Manage Leads are wired up.
      </p>
    </div>
  );
}
