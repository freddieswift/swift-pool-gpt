import {
  createSanctionSchema,
  resolveAppealSchema
} from "../src/validators/sanction.validator.js";

describe("sanction validation", () => {
  test("accepts a date suspension", () => {
    const result = createSanctionSchema.validate({
      type: "DATE_SUSPENSION",
      reason: "Repeated unsporting conduct",
      startsOn: "2026-09-01",
      endsOn: "2026-09-30"
    });

    expect(result.error).toBeUndefined();
    expect(result.value.preventsMatchPlay).toBe(true);
  });

  test("requires an end date for a date suspension", () => {
    const result = createSanctionSchema.validate({
      type: "DATE_SUSPENSION",
      reason: "Repeated unsporting conduct",
      startsOn: "2026-09-01"
    });

    expect(result.error).toBeDefined();
  });

  test("requires a revised date for reduced appeals at service level", () => {
    const result = resolveAppealSchema.validate({
      status: "REDUCED",
      resolution: "Penalty reduced after review"
    });

    expect(result.error).toBeUndefined();
  });
});
