import { Request, Response, NextFunction } from "express";
import prisma from "../lib/config";
import { createStudentHelper } from "../helpers/students";
import cloudinary from "../lib/config/cloudnary.config";
import { ErrorHandler } from "../middleware/errorHandler";
import { HTTPSTATUS } from "../lib/http-status";

const getAllStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        class: true,
        guardian: true,
      },
    });
    res.status(200).json({
      success: true,
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

const deleteStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await prisma.student.delete({
      where: {
        id: id,
      },
    });
    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

const updateStudentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId, status } = req.body;
    if (!studentId || !status) {
      throw ErrorHandler.badRequest("Student Id or status is missing.");
    }
    await prisma.student.update({
      where: { id: studentId },
      data: {
        status: status,
      },
    });
    res
      .status(HTTPSTATUS.ACCEPTED)
      .json({ success: true, message: "Student status updated status" });
  } catch (error) {
    next(error);
  }
};

export {
  deleteStudentController,
  getAllStudentController,
  createStudnetsController,
  uploadFileController,
  updateStudentStatus,
};
