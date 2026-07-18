import { ApiError } from "../utils/ApiError.js";

export function validate(schema, property = "body") {
  return (req, _res, next) => {
    const { value, error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      return next(
        new ApiError(
          422,
          "Validation failed",
          error.details.map(({ message, path, type }) => ({ message, path, type }))
        )
      );
    }

    req[property] = value;
    next();
  };
}
