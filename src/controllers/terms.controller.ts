import { Request, Response, NextFunction } from "express";
import { Terms, termStatus } from "../generated/prisma/client";
import prisma from "../lib/config";
import { ErrorHandler } from "../middleware/errorHandler";
import { HTTPSTATUS } from "../lib/http-status";

const createTermController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { endDate, startDate, name, accademicYear } =
    req.body as unknown as Pick<
      Terms,
      "endDate" | "startDate" | "name" | "accademicYear"
    >;
  try {
    await prisma.terms.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        accademicYear,
      },
    });
    res
      .status(200)
      .json({ message: "Term created succesfully", success: true });
  } catch (err) {
    next(err);
  }
};
const editTermController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { endDate, startDate, name, accademicYear } =
    req.body as unknown as Pick<
      Terms,
      "endDate" | "startDate" | "name" | "accademicYear"
    >;
  const { termId } = req.params;
  try {
    await prisma.terms.update({
      where: { id: termId },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        accademicYear,
      },
    });
    res
      .status(HTTPSTATUS.CREATED)
      .json({ message: "Term editted succesfully", success: true });
  } catch (err) {
    next(err);
  }
};

const deleteTemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { termId } = req.params;
  if (!termId) {
    throw ErrorHandler.badRequest("Term id is required");
  }
  await prisma.terms.delete({ where: { id: termId } });
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: "Term created successfully",
  });
};
const getAllTemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = await prisma.terms.findMany();
  res.status(HTTPSTATUS.OK).json({
    success: true,
    terms: data,
  });
};
const updateTermStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { termId, status } = req.body;
  if (!termId || !status) {
    throw ErrorHandler.badRequest("term Id or Status is missing.");
  }
  await prisma.terms.update({
    where: { id: termId },
    data: {
      status: status as termStatus,
    },
  });
  res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: `Status updated to ${status}`,
  });
};

export default {
  createTermController,
  editTermController,
  deleteTemController,
  getAllTemController,
  updateTermStatusController,
};
