const { parse } = require("csv-parse/sync");

/**
 * Parses a raw CSV buffer into an array of plain objects.
 * Makes no assumption about column names - whatever headers the file
 * has become the object keys, and the AI extraction step figures out
 * what each one means.
 */
function parseCsvBuffer(buffer) {
  const raw = buffer.toString("utf-8");

  let rows;
  try {
    rows = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true, // messy real-world exports sometimes have ragged rows
      bom: true,
    });
  } catch (err) {
    const parseError = new Error(`Could not parse CSV: ${err.message}`);
    parseError.status = 400;
    throw parseError;
  }

  if (!rows.length) {
    const emptyError = new Error("CSV file has no data rows.");
    emptyError.status = 400;
    throw emptyError;
  }

  // Drop rows that are entirely blank (common with trailing empty lines / merged cells)
  return rows.filter((row) =>
    Object.values(row).some((value) => String(value ?? "").trim() !== "")
  );
}

/** Splits an array into fixed-size chunks for batch AI processing. */
function chunkRows(rows, batchSize) {
  const batches = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    batches.push(rows.slice(i, i + batchSize));
  }
  return batches;
}

module.exports = { parseCsvBuffer, chunkRows };
