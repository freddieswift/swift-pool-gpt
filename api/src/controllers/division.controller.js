import { divisionService } from "../services/division.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listDivisions = asyncHandler(async (req, res) => {
  const divisions = await divisionService.list(req.params.seasonId);
  res.json({ data: { divisions } });
});

export const createDivision = asyncHandler(async (req, res) => {
  const division = await divisionService.create(req.season, req.body);
  res.status(201).json({ data: { division } });
});

export const getDivision = asyncHandler(async (req, res) => {
  const division = await divisionService.getById(req.params.divisionId);
  res.json({ data: { division } });
});

export const updateDivision = asyncHandler(async (req, res) => {
  const division = await divisionService.update(
    req.division,
    req.season,
    req.body
  );

  res.json({ data: { division } });
});

export const reorderDivisions = asyncHandler(async (req, res) => {
  const divisions = await divisionService.reorder(
    req.season,
    req.body.divisionIds
  );

  res.json({ data: { divisions } });
});

export const deleteDivision = asyncHandler(async (req, res) => {
  await divisionService.remove(req.division, req.season);
  res.status(204).send();
});
