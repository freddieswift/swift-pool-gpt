import { reportService } from "../services/report.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function sendReport(res, report) {
  if (report?.contentType && report?.body !== undefined) {
    res.setHeader("Content-Type", report.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report.filename}"`
    );
    return res.send(report.body);
  }
  return res.json({ data: report });
}

export const getLeagueDashboard = asyncHandler(async (req, res) => {
  const data = await reportService.leagueDashboard(req.league);
  res.json({ data });
});

export const getSeasonDashboard = asyncHandler(async (req, res) => {
  const data = await reportService.seasonDashboard(req.season, req.query);
  res.json({ data });
});

export const getFixturesReport = asyncHandler(async (req, res) => {
  const report = await reportService.fixturesReport(req.season, req.query);
  sendReport(res, report);
});

export const getResultsReport = asyncHandler(async (req, res) => {
  const report = await reportService.resultsReport(req.season, req.query);
  sendReport(res, report);
});

export const getStandingsReport = asyncHandler(async (req, res) => {
  const report = await reportService.standingsReport(req.season, req.query);
  sendReport(res, report);
});

export const getLeagueActivity = asyncHandler(async (req, res) => {
  const data = await reportService.activityReport(req.league);
  res.json({ data });
});
