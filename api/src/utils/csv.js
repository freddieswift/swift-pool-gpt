function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

export function toCsv(headers, rows) {
  const headerLine = headers.map((header) => escapeCsv(header.label)).join(",");
  const body = rows.map((row) =>
    headers.map((header) => escapeCsv(row[header.key])).join(",")
  );
  return [headerLine, ...body].join("\r\n");
}
