import {
  createDivisionSchema,
  reorderDivisionsSchema
} from "../src/validators/division.validator.js";

describe("division validation", () => {
  test("accepts promotion and relegation settings", () => {
    const result = createDivisionSchema.validate({
      name: "Premier Division",
      position: 1,
      promotionPlaces: 0,
      relegationPlaces: 2
    });

    expect(result.error).toBeUndefined();
    expect(result.value.relegationPlaces).toBe(2);
  });

  test("rejects duplicate ids in an order request", () => {
    const divisionId = "3f49a5cb-3855-4b83-86c7-44c578705817";

    const result = reorderDivisionsSchema.validate({
      divisionIds: [divisionId, divisionId]
    });

    expect(result.error).toBeDefined();
  });

  test("rejects negative promotion places", () => {
    const result = createDivisionSchema.validate({
      name: "Division One",
      promotionPlaces: -1
    });

    expect(result.error).toBeDefined();
  });
});
