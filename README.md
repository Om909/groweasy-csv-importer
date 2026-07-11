# GrowEasy CSV Importer

Upload a lead CSV in any layout — Facebook Lead Ads, Google Ads, Excel exports, a real-estate
CRM dump, a hand-built spreadsheet — and get back clean, validated **GrowEasy CRM** records.
Column names don't need to match anything; an AI mapping step figures out what each column means.

## How it works

1. **Upload** — drag & drop or pick a `.csv` file. Nothing leaves the browser yet.
2. **Preview** — the raw rows render in a sticky-header, scrollable table exactly as uploaded.
3. **Confirm** — only on confirm does the file get sent to the backend.
4. **Import** — the backend batches the rows and sends each batch to Claude with a forced tool
   call, so the model can only respond with a well-formed CRM record per row (or a `skipped`
   status with a reason). Results come back as imported vs. skipped, with counts.

```
groweasy-csv-importer/
├── backend/     Express API — CSV parsing, batching, AI extraction
├── frontend/    Next.js app — upload, preview, results UI
└── docker-compose.yml
```

## Backend setup

```bash
cd backend
cp .env.example .env     # add your ANTHROPIC_API_KEY
npm install
npm run dev               # http://localhost:5000
```

| Env var | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key used for field extraction |
| `ANTHROPIC_MODEL` | Model name (defaults to `claude-sonnet-4-6`) |
| `PORT` | Backend port (default `5000`) |
| `CLIENT_ORIGIN` | Allowed CORS origin for the frontend |
| `AI_BATCH_SIZE` | Rows sent to the model per request (default `15`) |
| `AI_MAX_RETRIES` | Retries for a failed batch before it's marked skipped (default `2`) |

## Frontend setup

```bash
cd frontend
cp .env.local.example .env.local   # point at your backend URL
npm install
npm run dev                # http://localhost:3000
```

## API

### `POST /api/import`
`multipart/form-data`, field name `file` — a `.csv` file.

```json
{
  "totalRows": 40,
  "totalImported": 37,
  "totalSkipped": 3,
  "records": [ { "name": "...", "email": "...", "crm_status": "GOOD_LEAD_FOLLOW_UP", "...": "..." } ],
  "skippedRecords": [ { "reason": "No email or mobile number found.", "source": { "...": "..." } } ]
}
```

## AI mapping rules

Enforced through a strict tool schema (`crm_status` and `data_source` are constrained enums, so
the model literally cannot return an invalid value) plus prompt rules for: multiple
emails/mobiles (first one wins, rest go to `crm_note`), missing dates left blank rather than
guessed, and rows with neither an email nor a mobile number skipped outright. See
`backend/src/services/ai.service.js` for the full prompt and `backend/src/config/crm.config.js`
for the single source of truth on allowed enum values.

## Docker

```bash
docker compose up --build
```

## Design notes

- Batches are processed sequentially with retries + graceful degradation: if a batch fails every
  retry, its rows are marked `skipped` with a clear reason instead of failing the whole import.
- CSV parsing happens twice by design: client-side (`papaparse`) for the instant, no-cost preview,
  and again server-side (`csv-parse`) as the authoritative parse before anything touches the AI.
- The results screen splits imported vs. skipped into tabs so a bad batch doesn't bury the good
  records.

## Possible next steps

- Swap the sequential batch loop for a bounded worker pool for large files.
- Persist import runs (Mongo/Postgres) instead of staying stateless.
- Add streaming progress (SSE/WebSocket) so the frontend can show live "batch 4/12" updates
  instead of a single loading state.
