export type RawCsvRow = Record<string, string>;

export interface CrmRecord {
  created_at?: string;
  name?: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status?: string;
  crm_note?: string;
  data_source?: string;
  possession_time?: string;
  description?: string;
}

export interface SkippedRecord {
  reason: string;
  source: RawCsvRow;
}

export interface ImportResponse {
  totalRows: number;
  totalImported: number;
  totalSkipped: number;
  records: CrmRecord[];
  skippedRecords: SkippedRecord[];
}

export type Step = "upload" | "preview" | "results";
