import {
  standingsQuerySchema,
  statisticsQuerySchema
} from "../src/validators/standings.validator.js";

describe("standings validation", () => {
  test("applies standings defaults", () => {
    const result = standingsQuerySchema.validate({});
    expect(result.error).toBeUndefined();
    expect(result.value.formSize).toBe(5);
    expect(result.value.includeWithdrawn).toBe(true);
  });

  test("rejects excessive statistics limits", () => {
    const result = statisticsQuerySchema.validate({ limit: 1000 });
    expect(result.error).toBeDefined();
  });
});
