import { API_ERROR_CODES } from "../../../shared/constants.js";

export default function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  console.error(error);
  return response.status(500).json({
    success: false,
    error: {
      code: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred.",
      details: [],
    },
  });
}
