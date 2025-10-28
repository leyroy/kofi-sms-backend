import express from "express";
import dotenv from "dotenv";
import appRouter from "./routes";
import cors from "cors";
import { ErrorHandler } from "./middleware/errorHandler";

dotenv.config();
const app = express();
const errorHandler = new ErrorHandler();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Fofi SMS Backend is running!");
});

app.use("/api", appRouter);

// Error handler (must be last)
app.use(errorHandler.handleError);

// Global error handlers (if needed for unhandled rejections)
errorHandler.setupGlobalHandlers();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
