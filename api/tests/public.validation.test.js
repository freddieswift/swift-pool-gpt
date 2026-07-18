import {
  publicMatchesQuerySchema,
  publicSeasonParamsSchema
} from "../src/validators/public.validator.js";

describe("public API validation", () => {
  test("accepts slug-based season parameters", () => {
    const result = publicSeasonParamsSchema.validate({
      leagueSlug: "city-pool-league",
      seasonSlug: "2026-27"
    });

    expect(result.error).toBeUndefined();
  });

  test("applies safe match listing defaults", () => {
    const result = publicMatchesQuerySchema.validate({});

    expect(result.error).toBeUndefined();
    expect(result.value.limit).toBe(50);
    expect(result.value.order).toBe("asc");
  });

  test("rejects excessive public result limits", () => {
    const result = publicMatchesQuerySchema.validate({ limit: 1000 });
    expect(result.error).toBeDefined();
  });
});
