interface Stat {
  label: string;
  value: string | number;
  tone?: "grow" | "cta" | "ink";
  onClick?: () => void;
}

export default function StatCards({ stats }: { stats: Stat[] }) {
  const toneClass: Record<string, string> = {
    grow: "text-grow-600",
    cta: "text-cta-500",
    ink: "text-ink",
  };
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <button
          key={s.label}
          onClick={s.onClick}
          disabled={!s.onClick}
          className={`rounded-xl border border-ink/8 bg-white px-4 py-3 text-left transition-shadow ${
            s.onClick ? "cursor-pointer hover:shadow-sm" : "cursor-default"
          }`}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink/40">{s.label}</p>
          <p className={`mt-1 text-2xl font-semibold ${toneClass[s.tone ?? "ink"]}`}>{s.value}</p>
        </button>
      ))}
    </div>
  );
}
