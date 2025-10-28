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
export default appRouter;
