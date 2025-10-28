import type { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../middleware/errorHandler";
import { logIn } from "../helpers/users";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userName, password } = req.body;
  console.log(req.body, "this is the request body");

  if (!userName || !password) {
    throw ErrorHandler.badRequest("Username and password are required");
  }

  const accessToken = await logIn({ userName, password });

  // 🎯 Handle login logic here

  if (!accessToken) {
    throw ErrorHandler.unauthorized("Invalid user credentials");
  }
  res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
  res.status(200).json({ message: "Login successful", accessToken });
};
