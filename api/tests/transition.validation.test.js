import {
  createTransitionPlanSchema,
  replaceTransitionEntriesSchema
} from "../src/validators/transition.validator.js";

describe("season transition validation", () => {
  const id = "3f49a5cb-3855-4b83-86c7-44c578705817";
  const id2 = "c86a4628-b07d-4702-a978-f5648cc14f4a";

  test("accepts a target season", () => {
    const result = createTransitionPlanSchema.validate({ targetSeasonId: id });
    expect(result.error).toBeUndefined();
  });

  test("rejects duplicate teams", () => {
    const entry = {
      teamId: id,
      sourceSeasonTeamId: id2,
      sourceDivisionId: null,
      targetDivisionId: id2,
      sourcePosition: 1,
      action: "RETAIN"
    };
    const result = replaceTransitionEntriesSchema.validate({
      entries: [entry, entry]
    });
    expect(result.error).toBeDefined();
  });
});
