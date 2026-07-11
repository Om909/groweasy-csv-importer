const Anthropic = require("@anthropic-ai/sdk");
const { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } = require("../config/crm.config");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const MAX_RETRIES = Number(process.env.AI_MAX_RETRIES || 2);

const EXTRACT_TOOL_NAME = "submit_crm_records";

const EXTRACT_TOOL = {
  name: EXTRACT_TOOL_NAME,
  description:
    "Submit the extracted GrowEasy CRM records for a batch of raw CSV rows. Return exactly one entry per input row, in the same order, matched by row_index.",
  input_schema: {
    type: "object",
    properties: {
      results: {
        type: "array",
        description: "One entry per input row - must exactly match the number of input rows.",
        items: {
          type: "object",
          properties: {
            row_index: {
              type: "integer",
              description: "0-based index of the row within this batch (matches the input order).",
            },
            status: {
              type: "string",
              enum: ["parsed", "skipped"],
              description:
                "'skipped' only when the row has neither a usable email nor a usable mobile number.",
            },
            skip_reason: {
              type: "string",
              description: "Short reason, required when status is 'skipped', omit otherwise.",
            },
            record: {
              type: "object",
              description: "Required when status is 'parsed'. The mapped CRM record.",
              properties: {
                created_at: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                country_code: { type: "string" },
                mobile_without_country_code: { type: "string" },
                company: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                country: { type: "string" },
                lead_owner: { type: "string" },
                crm_status: { type: "string", enum: CRM_STATUS_VALUES },
                crm_note: { type: "string" },
                data_source: { type: "string", enum: DATA_SOURCE_VALUES },
                possession_time: { type: "string" },
                description: { type: "string" },
              },
            },
          },
          required: ["row_index", "status"],
        },
      },
    },
    required: ["results"],
  },
};

function buildSystemPrompt() {
  return `You are a data-mapping engine for GrowEasy CRM. You receive raw CSV rows exported from
arbitrary sources (Facebook Lead Ads, Google Ads, Excel sheets, real-estate CRMs, sales reports,
manually built spreadsheets, etc.) with unpredictable column names and layouts. Your job is to map
each row's fields onto the fixed GrowEasy CRM schema, using judgement about what each source column
most likely represents (e.g. "Phone", "Mobile No.", "Contact Number", "whatsapp" all mean the same
thing; "Full Name", "Lead Name", "Client" all mean name).

CRM fields you may populate: created_at, name, email, country_code, mobile_without_country_code,
company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time,
description.

Rules you must follow exactly:
1. crm_status: only use one of ${CRM_STATUS_VALUES.join(", ")}. If nothing in the row maps confidently, leave it blank.
2. data_source: only use one of ${DATA_SOURCE_VALUES.join(", ")}. If nothing matches confidently, leave it blank - never invent a value.
3. created_at must be a string parseable by JavaScript's "new Date(...)" (e.g. "2026-05-13 14:20:48" or an ISO date). If the source has no date, leave it blank rather than guessing.
4. crm_note is a catch-all: put remarks, follow-up notes, extra comments, extra phone numbers, and extra email addresses here. Never drop useful information - if it doesn't fit a dedicated field, put it in crm_note.
5. If a row has multiple emails, use the first as "email" and append the rest into crm_note. Same rule for multiple mobile numbers: first one becomes mobile_without_country_code, the rest go into crm_note.
6. mobile_without_country_code must exclude the country code / dialing prefix; put the dialing code (e.g. "+91") in country_code separately when it's identifiable.
7. Keep every value a single line - no raw line breaks inside a field. If you must represent a break, use the literal characters \\n instead of an actual newline.
8. Skip a row (status "skipped") only when it has neither a usable email address nor a usable mobile number anywhere in its columns. Otherwise mark it "parsed", even if many other fields are missing - partial data is fine.
9. Do not fabricate data. Leave a field as an empty string when the source genuinely has nothing for it.
10. Return your answer only by calling the ${EXTRACT_TOOL_NAME} tool - one results entry per input row, matched by row_index, same order as given.`;
}

function buildBatchUserMessage(batch) {
  const rows = batch.map((row, idx) => ({ row_index: idx, raw: row }));
  return `Map the following ${batch.length} raw CSV row(s) to GrowEasy CRM records.\n\nRows (JSON):\n${JSON.stringify(
    rows,
    null,
    2
  )}`;
}

/** Calls Claude once for a single batch and returns the parsed tool input, or throws. */
async function callModelForBatch(batch) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: buildSystemPrompt(),
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: EXTRACT_TOOL_NAME },
    messages: [{ role: "user", content: buildBatchUserMessage(batch) }],
  });

  const toolUse = response.content.find(
    (block) => block.type === "tool_use" && block.name === EXTRACT_TOOL_NAME
  );

  if (!toolUse) {
    throw new Error("Model did not return a tool_use block.");
  }

  const { results } = toolUse.input;
  if (!Array.isArray(results) || results.length !== batch.length) {
    throw new Error(
      `Model returned ${results?.length ?? 0} result(s) for a batch of ${batch.length}.`
    );
  }

  return results;
}

/**
 * Runs one batch through the model with retries. If every attempt fails,
 * every row in the batch is marked skipped so the caller still gets a
 * complete, well-formed response instead of a hard failure.
 */
async function processBatchWithRetries(batch, batchIndex) {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const results = await callModelForBatch(batch);
      return results.map((r) => ({ ...r, _batchIndex: batchIndex }));
    } catch (err) {
      lastError = err;
      // simple backoff before retrying a failed batch
      if (attempt < MAX_RETRIES) {
        await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
      }
    }
  }

  console.error(`Batch ${batchIndex} failed after ${MAX_RETRIES + 1} attempt(s):`, lastError?.message);
  return batch.map((_, idx) => ({
    row_index: idx,
    status: "skipped",
    skip_reason: "AI extraction failed for this batch after retries.",
    _batchIndex: batchIndex,
  }));
}

/**
 * Extracts CRM records from all rows, batch by batch, sequentially.
 * (Sequential keeps things simple and avoids bursting the API rate limit;
 * swap to a bounded Promise.all pool if higher throughput is needed.)
 */
async function extractCrmRecords(batches, onBatchComplete) {
  const parsed = [];
  const skipped = [];

  for (let b = 0; b < batches.length; b++) {
    const results = await processBatchWithRetries(batches[b], b);

    for (const result of results) {
      const sourceRow = batches[b][result.row_index];
      if (result.status === "parsed" && result.record) {
        parsed.push({ ...result.record, _source: sourceRow });
      } else {
        skipped.push({
          reason: result.skip_reason || "Skipped by AI (no email or mobile number found).",
          source: sourceRow,
        });
      }
    }

    if (typeof onBatchComplete === "function") {
      onBatchComplete(b + 1, batches.length);
    }
  }

  return { parsed, skipped };
}

module.exports = { extractCrmRecords };
