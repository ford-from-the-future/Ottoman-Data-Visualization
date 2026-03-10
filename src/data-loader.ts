/**
 * Data-loading utility for the Ottoman Data Visualization framework.
 *
 * Accepts raw JSON or CSV strings and produces a normalised {@link DataSet}.
 * This is the single entry-point for "sliding" user-supplied values into the
 * pre-built geometric containers.
 */

import type { DataSet, DataRecord } from './types.js';

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

/**
 * Parse a single CSV line, respecting quoted fields that may contain commas
 * or newlines.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Attempt to coerce a raw string value into a native JS type.
 * Returns a number when the value is numeric, boolean for "true"/"false",
 * null for empty strings, or the original string otherwise.
 */
function coerceValue(raw: string): string | number | boolean | null {
  if (raw === '') return null;
  if (raw.toLowerCase() === 'true') return true;
  if (raw.toLowerCase() === 'false') return false;
  const num = Number(raw);
  if (!Number.isNaN(num) && raw !== '') return num;
  return raw;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load a dataset from a raw CSV string.
 *
 * The first row is treated as a header that defines field names.
 *
 * @param csv - The raw CSV text.
 * @returns A normalised {@link DataSet}.
 */
export function loadCsv(csv: string): DataSet {
  const lines = csv
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '');

  if (lines.length === 0) {
    return { fields: [], records: [] };
  }

  const fields = parseCsvLine(lines[0]);
  const records: DataRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const record: DataRecord = {};
    for (let j = 0; j < fields.length; j++) {
      record[fields[j]] = coerceValue(values[j] ?? '');
    }
    records.push(record);
  }

  return { fields, records };
}

/**
 * Load a dataset from a raw JSON string.
 *
 * Expects either:
 * - An array of objects (`[{…}, {…}, …]`), or
 * - An object with a single array-valued property (`{ "rows": [{…}, …] }`).
 *
 * @param json - The raw JSON text.
 * @returns A normalised {@link DataSet}.
 */
export function loadJson(json: string): DataSet {
  const parsed: unknown = JSON.parse(json);

  let rows: DataRecord[];

  if (Array.isArray(parsed)) {
    rows = parsed as DataRecord[];
  } else if (typeof parsed === 'object' && parsed !== null) {
    const values = Object.values(parsed as Record<string, unknown>);
    const arrayProp = values.find(Array.isArray) as DataRecord[] | undefined;
    if (!arrayProp) {
      throw new Error(
        'JSON input must be an array or an object containing an array property.',
      );
    }
    rows = arrayProp;
  } else {
    throw new Error(
      'JSON input must be an array or an object containing an array property.',
    );
  }

  if (rows.length === 0) {
    return { fields: [], records: [] };
  }

  const fields = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r))),
  );

  return { fields, records: rows };
}

/**
 * Auto-detect format (JSON vs CSV) and load accordingly.
 *
 * Detection heuristic: if the trimmed input starts with `[` or `{` it is
 * treated as JSON; otherwise CSV.
 *
 * @param raw - The raw text payload (CSV or JSON).
 * @returns A normalised {@link DataSet}.
 */
export function loadData(raw: string): DataSet {
  const trimmed = raw.trimStart();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return loadJson(trimmed);
  }
  return loadCsv(trimmed);
}
