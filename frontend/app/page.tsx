"use client";

import { useState } from "react";
import {
  Globe,
  MessageSquare,
  PhoneCall as PhoneIcon,
  FileSpreadsheet,
  LayoutGrid,
  Sparkles,
  MessageCircle,
  UserCog,
  Megaphone,
  Phone as WhatsAppIcon,
  ListTree,
  Plug,
  Building2,
} from "lucide-react";
import Sidebar, { type View } from "@/components/Sidebar";
import ImportCsvModal from "@/components/ImportCsvModal";
import LeadsTable from "@/components/LeadsTable";
import StatCards from "@/components/StatCards";
import LeadSourceCard from "@/components/LeadSourceCard";
import SkippedDrawer from "@/components/SkippedDrawer";
import ComingSoon from "@/components/ComingSoon";
import { importCsvFile } from "@/lib/api";
import type { ImportResponse } from "@/lib/types";

export default function Home() {
  const [view, setView] = useState<View>("sources");
  const [modalOpen, setModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [skippedOpen, setSkippedOpen] = useState(false);

  async function handleConfirm(file: File) {
    setIsUploading(true);
    setError(null);
    try {
      const response = await importCsvFile(file);
      setResult(response);
      setModalOpen(false);
      setView("leads");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar active={view} onNavigate={setView} />

      <main className="flex-1 overflow-y-auto px-8 py-8">
        {view === "sources" && (
          <SourcesView error={error} onOpenModal={() => setModalOpen(true)} hasResult={!!result} onViewLeads={() => setView("leads")} />
        )}

        {view === "leads" && (
          <LeadsView
            result={result}
            onImportAnother={() => setModalOpen(true)}
            onShowSkipped={() => setSkippedOpen(true)}
          />
        )}

        {view === "dashboard" && <ComingSoon icon={LayoutGrid} title="Dashboard" />}
        {view === "generate" && <ComingSoon icon={Sparkles} title="Generate Leads" />}
        {view === "engage" && <ComingSoon icon={MessageCircle} title="Engage Leads" />}
        {view === "team" && <ComingSoon icon={UserCog} title="Team Members" />}
        {view === "ads" && <ComingSoon icon={Megaphone} title="Ad Accounts" />}
        {view === "whatsapp" && <ComingSoon icon={WhatsAppIcon} title="WhatsApp Account" />}
        {view === "telecalling" && <ComingSoon icon={PhoneIcon} title="Tele Calling" />}
        {view === "crmfields" && <ComingSoon icon={ListTree} title="CRM Fields" />}
        {view === "api" && <ComingSoon icon={Plug} title="API Center" />}
        {view === "business" && <ComingSoon icon={Building2} title="Business Center" />}
      </main>

      <ImportCsvModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        isUploading={isUploading}
      />

      <SkippedDrawer
        open={skippedOpen}
        onClose={() => setSkippedOpen(false)}
        records={result?.skippedRecords ?? []}
      />
    </div>
  );
}

function SourcesView({
  error,
  onOpenModal,
  hasResult,
  onViewLeads,
}: {
  error: string | null;
  onOpenModal: () => void;
  hasResult: boolean;
  onViewLeads: () => void;
}) {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-grow-600">GrowEasy</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Lead Sources</h1>
        <p className="mt-1 text-sm text-ink/50">Connect, manage, and control all your lead channels from one dashboard.</p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {hasResult && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-grow-100 bg-grow-50 px-4 py-3">
          <p className="text-sm text-grow-700">Your last import already added leads to your account.</p>
          <button onClick={onViewLeads} className="text-sm font-semibold text-grow-700 hover:underline">
            View Manage Leads →
          </button>
        </div>
      )}

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/35">Active Lead Sources</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <LeadSourceCard icon={FileSpreadsheet} name="CSV Import" status="Connected" primary onClick={onOpenModal} />
        <LeadSourceCard icon={Globe} name="Google Ads" status="Not Connected" />
        <LeadSourceCard icon={MessageSquare} name="WhatsApp Account" status="Not Connected" />
        <LeadSourceCard icon={PhoneIcon} name="Tele Calling" status="Not Connected" />
      </div>
    </div>
  );
}

function LeadsView({
  result,
  onImportAnother,
  onShowSkipped,
}: {
  result: ImportResponse | null;
  onImportAnother: () => void;
  onShowSkipped: () => void;
}) {
  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-sm text-ink/50">No leads yet - import a CSV to get started.</p>
        <button
          onClick={onImportAnother}
          className="mt-3 rounded-lg bg-grow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-grow-700"
        >
          Import Leads via CSV
        </button>
      </div>
    );
  }

  const successRate = result.totalRows
    ? `${Math.round((result.totalImported / result.totalRows) * 100)}%`
    : "—";

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Manage Your Leads</h1>
          <p className="mt-1 text-sm text-ink/50">Monitor lead status, assign tasks, and close deals faster.</p>
        </div>
        <button
          onClick={onImportAnother}
          className="rounded-lg border border-grow-500/40 px-3.5 py-2 text-sm font-medium text-grow-600 hover:bg-grow-50"
        >
          Import another CSV
        </button>
      </div>

      <StatCards
        stats={[
          { label: "Total rows", value: result.totalRows, tone: "ink" },
          { label: "Imported", value: result.totalImported, tone: "grow" },
          { label: "Skipped", value: result.totalSkipped, tone: "cta", onClick: onShowSkipped },
          { label: "Success rate", value: successRate, tone: "grow" },
        ]}
      />

      <LeadsTable records={result.records} />
    </div>
  );
}
