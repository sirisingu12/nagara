import express from "express";
import { API_ERROR_CODES } from "../../shared/constants.js";
import errorHandler from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";

const app = express();

app.use("/api", healthRouter);

app.use((request, response) => {
  response.status(404).json({
    success: false,
    error: {
      code: API_ERROR_CODES.NOT_FOUND,
      message: "The requested resource was not found.",
      details: [],
    },
  });
});

app.use(errorHandler);

export default app;
