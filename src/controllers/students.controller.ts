import { Request, Response, NextFunction } from "express";
import prisma from "../lib/config";
import { createStudentHelper } from "../helpers/students";
import cloudinary from "../lib/config/cloudnary.config";
import { Guardian, Student } from "../generated/prisma/client";

const getAllStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const students = await prisma.subject.findMany();
    res.status(200).json({
      message: "getAllStudentController controller is live 🧨",
      students,
    });
  } catch (err) {
    next(err);
  }
};
const createStudnetsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { student, guardian } = req.body;
    const newStudnet = await createStudentHelper({ ...student }, guardian);
    res.status(200).json({
      ...newStudnet,
    });
  } catch (err) {
    next(err);
  }
};
const uploadFileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const file = req.file?.path;
  if (!file) {
    console.log("file", file);
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }
  try {
    const uploadKeys = await cloudinary.uploader.upload(file as string);
    const photoKey = uploadKeys.public_id;
    const photoUrl = uploadKeys.secure_url;
    res.status(200).json({
      success: true,
      photoKey,
      photoUrl,
    });
  } catch (err) {
    next(err);
  }
};

export {
  getAllStudentController,
  createStudnetsController,
  uploadFileController,
};
