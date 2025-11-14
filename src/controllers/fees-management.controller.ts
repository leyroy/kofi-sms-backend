import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../middleware/errorHandler";
import prisma from "../lib/config";
import { HTTPSTATUS } from "../lib/http-status";
import { FeePlans, PaymentStatus } from "../generated/prisma/client";

const createFees = async (req: Request, res: Response, next: NextFunction) => {
  const { termFeesPlans } = req.body as { termFeesPlans: FeePlans[] };
  const { termId } = req.params;
  try {
    if (!termFeesPlans || termFeesPlans.length === 0) {
      throw ErrorHandler.badRequest("Fee plans are required");
    }
    if (!termId) {
      throw ErrorHandler.badRequest("Term id is required");
    }
    const term = await prisma.terms.findUnique({
      where: { id: termId },
    });
    if (term?.isPlansCreated) {
      throw ErrorHandler.conflict("Pleans are already generated for this term");
    }
    await prisma.feePlans.createMany({
      data: termFeesPlans.map((plan) => ({
        ...plan,
        termId,
      })),
      skipDuplicates: true,
    });
    await prisma.terms.update({
      where: { id: termId },
      data: {
        isPlansCreated: true,
      },
    });
    res.status(201).json({ success: true, message: "Created successfully." });
  } catch (err) {
    next(err);
  }
};

export const generateStudentsFees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { termId } = req.params;
  try {
    const students = await prisma.student.findMany({
      where: { status: "Active" },
      include: { class: true },
    });
    if (students.length === 0) {
      throw ErrorHandler.notFound("No students found");
    }
    const term = await prisma.terms.findUnique({
      where: { id: termId },
    });
    if (!term?.isPlansCreated) {
      throw ErrorHandler.conflict("Create pland for this term first");
    }
    if (term?.isFeesGenerated) {
      throw ErrorHandler.conflict("Fees are already generated for this term");
    }
    const feePlans = await prisma.feePlans.findMany({
      where: {
        termId,
      },
    });
    if (feePlans.length === 0) {
      throw ErrorHandler.notFound("No fee plans found");
    }
    // Generate fees for each student based on the fee plans and level
    const studentFees = students.map((student) => {
      const studentFeePlans = feePlans.filter((plan) =>
        plan.level.includes(student.class.level)
      );
      return {
        studentId: student.id,
        amount: studentFeePlans[0]?.amount || 0,
        termId,
        paidAmount: 0,
        status: PaymentStatus.Unpaid,
      };
    });
    await prisma.feePayment.createMany({
      data: studentFees,
      skipDuplicates: true,
    });
    await prisma.terms.update({
      where: { id: termId },
      data: {
        isFeesGenerated: true,
      },
    });
    res.status(HTTPSTATUS.OK).json({ success: true, data: studentFees });
  } catch (error) {
    next(error);
  }
};

export const getAllFees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { termId } = req.body;
  const data = await prisma.feePayment.findMany({
    where: { termId: termId },
    include: { student: { include: { class: true } }, term: true },
  });
  if (!data) {
    throw ErrorHandler.notFound("No fee records found");
  }
  res.status(HTTPSTATUS.OK).json({ success: true, feesPlan: data });
};

export const payFees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { feeId, amount } = req.body;
  try {
    const feeRecord = await prisma.feePayment.findUnique({
      where: { id: feeId },
    });
    if (!feeRecord) {
      throw ErrorHandler.notFound("Fee record not found");
    }
    const newPaidAmount = feeRecord.paidAmount + amount;
    if (newPaidAmount > feeRecord.amount) {
      throw ErrorHandler.badRequest("Payment exceeds the total fee amount");
    }
    const status =
      newPaidAmount === feeRecord.amount
        ? PaymentStatus.Paid
        : PaymentStatus.Partial;
    const feePayment = await prisma.feePayment.update({
      where: { id: feeId },
      data: {
        paidAmount: newPaidAmount,
        status: status,
      },
    });
    //add to history
    await prisma.feePaymentHistory.create({
      data: {
        newAmount: newPaidAmount,
        oldAmount: feeRecord.amount,
        feePaymentId: feeRecord.id,
        studentId: feeRecord.studentId,
        paidAmount: amount,
      },
    });
    res.status(201).json({ success: true, data: feePayment });
  } catch (error) {
    next(error);
  }
};

const getFeesByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { studentId } = req.params;
  if (!studentId) {
    throw ErrorHandler.badRequest("Student id is required");
  }
  const results = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      FeePayment: true,
      class: true,
    },
  });
  res.status(HTTPSTATUS.OK).json({ success: true, results: results });
};

const getFeeHistorybyFeeId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { feeId } = req.params;
  if (!feeId) {
    throw ErrorHandler.badRequest("Fee ID is missing.");
  }
  const results = await prisma.feePayment.findFirst({
    where: { id: feeId },
    include: {
      feePaymentHistories: true,
      student: true,
      term: true,
    },
  });

  res.status(HTTPSTATUS.OK).json({ success: true, history: results });
};

export default {
  createFees,
  getFeesByStudentId,
  getFeeHistorybyFeeId,
  generateStudentsFees,
  getAllFees,
  payFees,
};
