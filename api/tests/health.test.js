import request from "supertest";

jest.unstable_mockModule("../src/config/session.js", () => {
  const session = (req, _res, next) => {
    req.session = {};
    next();
  };
  return { sessionMiddleware: session };
});

const { app } = await import("../src/app.js");

describe("GET /health", () => {
  test("returns ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("ok");
  });
});
