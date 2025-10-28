import { Router } from "express";
import { loginController } from "./controllers/users.controller";
import { getAllClassesController } from "./controllers/class.controller";
import {
  createStudnetsController,
  getAllStudentController,
  uploadFileController,
} from "./controllers/students.controller";
import upload from "./middleware/multer";

const appRouter: Router = Router();
//users
appRouter.post("/users/login", loginController);

//class
appRouter.get("/class/get-all-classes", getAllClassesController);

//studnets
appRouter.post("/students/new", createStudnetsController);
appRouter.post("/upload", upload.single("file"), uploadFileController);
appRouter.get("/students/get-all", getAllStudentController);
export default appRouter;
