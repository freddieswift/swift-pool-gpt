import {
  dashboardQuerySchema,
  reportQuerySchema
} from "../src/validators/report.validator.js";

describe("report validation", () => {
  test("applies dashboard defaults", () => {
    const result = dashboardQuerySchema.validate({});
    expect(result.error).toBeUndefined();
    expect(result.value.upcomingLimit).toBe(10);
    expect(result.value.recentLimit).toBe(10);
  });

  test("accepts CSV format", () => {
    const result = reportQuerySchema.validate({ format: "csv" });
    expect(result.error).toBeUndefined();
    expect(result.value.format).toBe("csv");
  });

  test("rejects unsupported format", () => {
    const result = reportQuerySchema.validate({ format: "xlsx" });
    expect(result.error).toBeDefined();
  });
});
