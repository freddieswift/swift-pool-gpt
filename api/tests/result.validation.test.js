import {
  reopenMatchSchema,
  submitMatchResultSchema
} from "../src/validators/result.validator.js";

describe("match result validation", () => {
  const home = "3f49a5cb-3855-4b83-86c7-44c578705817";
  const away = "c86a4628-b07d-4702-a978-f5648cc14f4a";

  test("accepts a normal completed frame", () => {
    const result = submitMatchResultSchema.validate({
      frames: [
        {
          frameNumber: 1,
          homePlayerId: home,
          awayPlayerId: away,
          winnerPlayerId: home,
          winnerSide: "HOME",
          resultType: "NORMAL"
        }
      ]
    });

    expect(result.error).toBeUndefined();
  });

  test("rejects duplicate frame numbers", () => {
    const frame = {
      frameNumber: 1,
      homePlayerId: home,
      awayPlayerId: away,
      winnerSide: "HOME"
    };

    const result = submitMatchResultSchema.validate({
      frames: [frame, frame]
    });

    expect(result.error).toBeDefined();
  });

  test("requires both players for a normal frame", () => {
    const result = submitMatchResultSchema.validate({
      frames: [
        {
          frameNumber: 1,
          homePlayerId: home,
          winnerSide: "HOME",
          resultType: "NORMAL"
        }
      ]
    });

    expect(result.error).toBeDefined();
  });

  test("requires a reason to reopen", () => {
    const result = reopenMatchSchema.validate({ reason: "" });
    expect(result.error).toBeDefined();
  });
});
