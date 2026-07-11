"use client";

import {
  LayoutGrid,
  Sparkles,
  Users,
  MessageCircle,
  UserCog,
  Rss,
  Megaphone,
  Phone as WhatsApp,
  PhoneCall,
  ListTree,
  Plug,
  Building2,
  ChevronRight,
} from "lucide-react";

const MAIN_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid, key: "dashboard" as const },
  { label: "Generate Leads", icon: Sparkles, key: "generate" as const },
  { label: "Manage Leads", icon: Users, key: "leads" as const },
  { label: "Engage Leads", icon: MessageCircle, key: "engage" as const },
];

const CONTROL_ITEMS = [
  { label: "Team Members", icon: UserCog, key: "team" as const },
  { label: "Lead Sources", icon: Rss, key: "sources" as const },
  { label: "Ad Accounts", icon: Megaphone, key: "ads" as const },
  { label: "WhatsApp Account", icon: WhatsApp, key: "whatsapp" as const },
  { label: "Tele Calling", icon: PhoneCall, key: "telecalling" as const },
  { label: "CRM Fields", icon: ListTree, key: "crmfields" as const },
  { label: "API Center", icon: Plug, key: "api" as const },
];

export type View =
  | "dashboard"
  | "generate"
  | "leads"
  | "engage"
  | "team"
  | "sources"
  | "ads"
  | "whatsapp"
  | "telecalling"
  | "crmfields"
  | "api"
  | "business";

export default function Sidebar({
  active,
  onNavigate,
}: {
  active: View;
  onNavigate: (view: View) => void;
}) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-ink/8 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-grow-600 text-white">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 14l6-6 4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[1.05rem] font-semibold tracking-tight text-ink">GrowEasy</span>
      </div>

      <button className="mx-3 mb-4 flex items-center justify-between rounded-xl bg-grow-50 px-3 py-2.5 text-left transition-colors hover:bg-grow-100">
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-grow-600 text-xs font-semibold text-white">
            T
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-medium text-ink">Test Corp</span>
            <span className="block text-[0.65rem] font-medium uppercase tracking-wide text-ink/40">Owner</span>
          </span>
        </span>
        <ChevronRight size={15} className="text-ink/30" />
      </button>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        <div>
          <p className="px-2.5 pb-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink/35">
            Main
          </p>
          <ul className="space-y-0.5">
            {MAIN_ITEMS.map((item) => (
              <NavRow key={item.label} item={item} active={active} onNavigate={onNavigate} />
            ))}
          </ul>
        </div>
        <div>
          <p className="px-2.5 pb-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink/35">
            Control Center
          </p>
          <ul className="space-y-0.5">
            {CONTROL_ITEMS.map((item) => (
              <NavRow key={item.label} item={item} active={active} onNavigate={onNavigate} />
            ))}
          </ul>
        </div>
      </nav>

      <div className="border-t border-ink/8 px-3 py-3">
        <NavRow
          item={{ label: "Business Center", icon: Building2, key: "business" }}
          active={active}
          onNavigate={onNavigate}
        />
      </div>
    </aside>
  );
}

function NavRow({
  item,
  active,
  onNavigate,
}: {
  item: { label: string; icon: typeof LayoutGrid; key?: View };
  active: View;
  onNavigate: (view: View) => void;
}) {
  const Icon = item.icon;
  const isActive = item.key === active;
  return (
    <li>
      <button
        onClick={() => item.key && onNavigate(item.key)}
        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors
          ${isActive ? "bg-grow-50 font-medium text-grow-700" : "text-ink/60 hover:bg-ink/5"}`}
      >
        <Icon size={16} className={isActive ? "text-grow-600" : "text-ink/40"} />
        {item.label}
      </button>
    </li>
  );
}
