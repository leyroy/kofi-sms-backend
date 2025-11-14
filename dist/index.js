"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const errorHandler = new errorHandler_1.ErrorHandler();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Routes
app.get("/", (req, res) => {
    res.send("Fofi SMS Backend is running!");
});
app.use("/api", routes_1.default);
// Error handler (must be last)
app.use(errorHandler.handleError);
// Global error handlers (if needed for unhandled rejections)
errorHandler.setupGlobalHandlers();
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`✅ Server started on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map