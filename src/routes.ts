import { Router } from "express";
import { loginController } from "./controllers/users.controller";
import { getAllClassesController } from "./controllers/class.controller";
import {
  createStudnetsController,
  deleteStudentController,
  getAllStudentController,
  updateStudentStatus,
  uploadFileController,
} from "./controllers/students.controller";
import upload from "./middleware/multer";
import dashboardController from "./controllers/dashboard.controller";
import feesManagementController from "./controllers/fees-management.controller";
import TermsManagementController from "./controllers/terms.controller";
import { ErrorHandler } from "./middleware/errorHandler";

const appRouter: Router = Router();
const { catchAsync } = new ErrorHandler();
//users
appRouter.post("/users/login", loginController);

//class
appRouter.get("/class/get-all-classes", getAllClassesController);

//dashboard
appRouter.get("/dashboard", dashboardController);

//students
appRouter.post("/students/new", createStudnetsController);
appRouter.delete("/student/delete/:id", deleteStudentController);
appRouter.post("/upload", upload.single("file"), uploadFileController);
appRouter.get("/students/get-all", getAllStudentController);
appRouter.patch("/students/change-status", updateStudentStatus);

//fees managements
appRouter.post("/fee/create/:termId", feesManagementController.createFees);
appRouter.get(
  "/fee/get-fee/:studentId",
  catchAsync(feesManagementController.getFeesByStudentId)
);
appRouter.post(
  "/fee/generate-fee/:termId",
  feesManagementController.generateStudentsFees
);
appRouter.post("/fees/all-fees", feesManagementController.getAllFees);
appRouter.post("/fees/pay", feesManagementController.payFees);
appRouter.get(
  "/fee/get-fee-timeline/:feeId",
  feesManagementController.getFeeHistorybyFeeId
);

//terms management
appRouter.post("/terms/new", TermsManagementController.createTermController);
appRouter.get("/terms/all", TermsManagementController.getAllTemController);
appRouter.delete(
  "/terms/delete/:termId",
  catchAsync(TermsManagementController.deleteTemController)
);
appRouter.patch(
  "/terms/edit/:termId",
  catchAsync(TermsManagementController.editTermController)
);
appRouter.patch(
  "/terms/change-status",
  catchAsync(TermsManagementController.updateTermStatusController)
);

export default appRouter;
