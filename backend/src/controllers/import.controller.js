const { parseCsvBuffer, chunkRows } = require("../services/csv.service");
const { extractCrmRecords } = require("../services/ai.service");

const BATCH_SIZE = Number(process.env.AI_BATCH_SIZE || 15);

async function importCsv(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file was uploaded (field name must be 'file')." });
    }

    const rows = parseCsvBuffer(req.file.buffer);
    const batches = chunkRows(rows, BATCH_SIZE);

    const { parsed, skipped } = await extractCrmRecords(batches);

    return res.status(200).json({
      totalRows: rows.length,
      totalImported: parsed.length,
      totalSkipped: skipped.length,
      records: parsed.map(({ _source, ...record }) => record),
      skippedRecords: skipped,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { importCsv };
