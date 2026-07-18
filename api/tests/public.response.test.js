import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/repositories/public.repository.js", () => ({
  publicRepository: {
    listSeasons: jest.fn(),
    listDivisions: jest.fn(),
    listTeams: jest.fn(),
    listMatches: jest.fn(),
    findMatch: jest.fn(),
    listRoster: jest.fn()
  }
}));

jest.unstable_mockModule("../src/services/standings.service.js", () => ({
  standingsService: {
    seasonTables: jest.fn(),
    playerStatistics: jest.fn()
  }
}));

const { publicRepository } = await import(
  "../src/repositories/public.repository.js"
);
const { publicService } = await import(
  "../src/services/public.service.js"
);

describe("public response privacy", () => {
  test("does not expose team contact details", async () => {
    publicRepository.listTeams.mockResolvedValue([
      {
        id: "season-team-1",
        status: "APPROVED",
        seed: 1,
        division: { id: "division-1", name: "Premier", position: 1 },
        team: {
          id: "team-1",
          name: "Alpha",
          shortName: "A",
          slug: "alpha",
          venueName: "Club",
          venueAddress: "Private address",
          contactEmail: "private@example.com",
          contactPhone: "07000000000"
        }
      }
    ]);

    const result = await publicService.teams(
      { id: "season-1" },
      { publicVenueAddresses: false }
    );

    expect(result.teams[0].team.contactEmail).toBeUndefined();
    expect(result.teams[0].team.contactPhone).toBeUndefined();
    expect(result.teams[0].team.venueAddress).toBeUndefined();
  });
});
