import { toCsv } from "../src/utils/csv.js";

describe("CSV utility", () => {
  test("escapes commas and quotes", () => {
    const csv = toCsv(
      [
        { key: "name", label: "Name" },
        { key: "notes", label: "Notes" }
      ],
      [{ name: "Alpha, Club", notes: 'Said "hello"' }]
    );

    expect(csv).toContain('"Alpha, Club"');
    expect(csv).toContain('"Said ""hello"""');
  });
});
