import { Request, Response, NextFunction } from "express";
import { Fee } from "../generated/prisma/client";
import { ErrorHandler } from "../middleware/errorHandler";
import prisma from "../lib/config";
import { HTTPSTATUS } from "../lib/http-status";

const createFees = async (req: Request, res: Response, next: NextFunction) => {
  const { amount, feeName } = req.body as Fee;
  try {
    if (!amount || !feeName) {
      throw ErrorHandler.badRequest();
    }
    await prisma.fee.create({
      data: {
        feeName,
        amount,
      },
    });
    res.status(201).json({ success: true, message: "Created successfully." });
  } catch (err) {
    next(err);
  }
};

export const deletFees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { feeId } = req.params;
  if (!feeId) {
    throw ErrorHandler.badRequest("Feed id not found");
  }
  await prisma.fee.delete({ where: { id: feeId } });
  res
    .status(HTTPSTATUS.OK)
    .json({ success: true, message: "Deleted successfully" });
};
export const getAllFees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = await prisma.fee.findMany();
  if (!data) {
    throw ErrorHandler.notFound("No fee records found");
  }
  res.status(HTTPSTATUS.OK).json({ success: true, feesPlan: data });
};

export default { createFees, deletFees, getAllFees };
