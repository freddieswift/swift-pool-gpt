import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/repositories/standings.repository.js", () => ({
  standingsRepository: {
    listDivisionTeams: jest.fn(),
    listCompletedMatches: jest.fn(),
    listSeasonDivisions: jest.fn(),
    listSeasonTeams: jest.fn(),
    listSeasonCompletedMatches: jest.fn(),
    listSeasonFrames: jest.fn()
  }
}));

const { standingsRepository } = await import(
  "../src/repositories/standings.repository.js"
);
const { standingsService } = await import(
  "../src/services/standings.service.js"
);

describe("standings service", () => {
  test("calculates and ranks a division table", async () => {
    const season = { id: "season-1", name: "2026", status: "ACTIVE" };
    const division = {
      id: "division-1",
      seasonId: "season-1",
      name: "Premier",
      position: 1
    };

    standingsRepository.listDivisionTeams.mockResolvedValue([
      {
        id: "st-a",
        teamId: "a",
        divisionId: "division-1",
        status: "APPROVED",
        pointsAdjustment: 0,
        team: { name: "Alpha", shortName: "A" }
      },
      {
        id: "st-b",
        teamId: "b",
        divisionId: "division-1",
        status: "APPROVED",
        pointsAdjustment: -1,
        team: { name: "Beta", shortName: "B" }
      }
    ]);

    standingsRepository.listCompletedMatches.mockResolvedValue([
      {
        homeSeasonTeamId: "st-a",
        awaySeasonTeamId: "st-b",
        homeFramesWon: 6,
        awayFramesWon: 4,
        homeMatchPoints: 2,
        awayMatchPoints: 0
      }
    ]);

    const result = await standingsService.divisionTable(
      season,
      division,
      { formSize: 5, includeWithdrawn: true }
    );

    expect(result.standings[0].teamName).toBe("Alpha");
    expect(result.standings[0].totalPoints).toBe(2);
    expect(result.standings[0].frameDifference).toBe(2);
    expect(result.standings[1].totalPoints).toBe(-1);
  });

  test("uses shared positions for fully tied teams", async () => {
    const season = { id: "season-1", name: "2026", status: "ACTIVE" };
    const division = {
      id: "division-1",
      seasonId: "season-1",
      name: "Premier",
      position: 1
    };

    standingsRepository.listDivisionTeams.mockResolvedValue([
      {
        id: "st-a",
        teamId: "a",
        divisionId: "division-1",
        status: "APPROVED",
        pointsAdjustment: 0,
        team: { name: "Alpha" }
      },
      {
        id: "st-b",
        teamId: "b",
        divisionId: "division-1",
        status: "APPROVED",
        pointsAdjustment: 0,
        team: { name: "Beta" }
      }
    ]);
    standingsRepository.listCompletedMatches.mockResolvedValue([]);

    const result = await standingsService.divisionTable(
      season,
      division,
      { formSize: 5, includeWithdrawn: true }
    );

    expect(result.standings[0].position).toBe(1);
    expect(result.standings[1].position).toBe(1);
  });
});
