import { Router } from "express";
import { loginController } from "./controllers/users.controller";
import { getAllClassesController } from "./controllers/class.controller";
import {
  createStudnetsController,
  deleteStudentController,
  getAllStudentController,
  uploadFileController,
} from "./controllers/students.controller";
import upload from "./middleware/multer";
import dashboardController from "./controllers/dashboard.controller";
import feesManagementController from "./controllers/fees-management.controller";
import TermsManagementController from "./controllers/terms.controller";

const appRouter: Router = Router();
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

//fees managements
appRouter.post("/fee/create", feesManagementController.createFees);
appRouter.get("/fee/get-all", feesManagementController.getAllFees);
appRouter.delete("/fee/delete/:feeId", feesManagementController.getAllFees);

//terms management
appRouter.post("/terms/new", TermsManagementController.createTermController);
appRouter.get("/terms/all", TermsManagementController.getAllTemController);
appRouter.delete(
  "/terms/delete/:termId",
  TermsManagementController.deleteTemController
);
appRouter.patch(
  "/terms/edit/:termId",
  TermsManagementController.editTermController
);

export default appRouter;
