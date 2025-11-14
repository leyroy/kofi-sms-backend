"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./controllers/users.controller");
const class_controller_1 = require("./controllers/class.controller");
const students_controller_1 = require("./controllers/students.controller");
const multer_1 = __importDefault(require("./middleware/multer"));
const dashboard_controller_1 = __importDefault(require("./controllers/dashboard.controller"));
const fees_management_controller_1 = __importDefault(require("./controllers/fees-management.controller"));
const terms_controller_1 = __importDefault(require("./controllers/terms.controller"));
const errorHandler_1 = require("./middleware/errorHandler");
const appRouter = (0, express_1.Router)();
const { catchAsync } = new errorHandler_1.ErrorHandler();
//users
appRouter.post("/users/login", users_controller_1.loginController);
//class
appRouter.get("/class/get-all-classes", class_controller_1.getAllClassesController);
//dashboard
appRouter.get("/dashboard", dashboard_controller_1.default);
//students
appRouter.post("/students/new", students_controller_1.createStudnetsController);
appRouter.delete("/student/delete/:id", students_controller_1.deleteStudentController);
appRouter.post("/upload", multer_1.default.single("file"), students_controller_1.uploadFileController);
appRouter.get("/students/get-all", students_controller_1.getAllStudentController);
appRouter.patch("/students/change-status", students_controller_1.updateStudentStatus);
//fees managements
appRouter.post("/fee/create/:termId", fees_management_controller_1.default.createFees);
appRouter.get("/fee/get-fee/:studentId", catchAsync(fees_management_controller_1.default.getFeesByStudentId));
appRouter.post("/fee/generate-fee/:termId", fees_management_controller_1.default.generateStudentsFees);
appRouter.post("/fees/all-fees", fees_management_controller_1.default.getAllFees);
appRouter.post("/fees/pay", fees_management_controller_1.default.payFees);
appRouter.get("/fee/get-fee-timeline/:feeId", fees_management_controller_1.default.getFeeHistorybyFeeId);
//terms management
appRouter.post("/terms/new", terms_controller_1.default.createTermController);
appRouter.get("/terms/all", terms_controller_1.default.getAllTemController);
appRouter.delete("/terms/delete/:termId", catchAsync(terms_controller_1.default.deleteTemController));
appRouter.patch("/terms/edit/:termId", catchAsync(terms_controller_1.default.editTermController));
appRouter.patch("/terms/change-status", catchAsync(terms_controller_1.default.updateTermStatusController));
exports.default = appRouter;
//# sourceMappingURL=routes.js.map