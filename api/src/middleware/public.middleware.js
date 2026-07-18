import { publicRepository } from "../repositories/public.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loadPublicLeague = asyncHandler(async (req, _res, next) => {
  const league = await publicRepository.findLeagueBySlug(
    req.params.leagueSlug
  );

  if (!league || !league.settings?.publicEnabled) {
    throw new ApiError(404, "Public league not found");
  }

  req.publicLeague = league;
  req.publicSettings = league.settings;
  next();
});

export const loadPublicSeason = asyncHandler(async (req, _res, next) => {
  const season = await publicRepository.findSeasonBySlug(
    req.publicLeague.id,
    req.params.seasonSlug
  );

  if (!season) {
    throw new ApiError(404, "Public season not found");
  }

  req.publicSeason = season;
  next();
});

export function publicCache(seconds = 60) {
  return (_req, res, next) => {
    res.setHeader(
      "Cache-Control",
      `public, max-age=${seconds}, stale-while-revalidate=${seconds * 2}`
    );
    next();
  };
}
