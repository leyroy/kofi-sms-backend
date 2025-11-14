import { Request, Response, NextFunction } from "express";
import prisma from "../lib/config";

const dashboardController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //classes stats
    const classes = await prisma.class.findMany({
      include: {
        students: true,
      },
    });
    // 🎯 Handle dashboardController logic here neger 😎
    const totalStudents = await prisma.student.count();
    const totalClasses = await prisma.class.count();
    const totalGuardians = await prisma.guardian.count();
    const newlyAdmittedStudents = await prisma.student.count({
      orderBy: {
        admission_date: "desc",
      },
      take: 5,
    });

    //fees stats
    const allFees = await prisma.feePayment.findMany();

    const collectedFees = allFees.filter((fee) => fee.status !== "Unpaid");
    console.log("collectedFees", collectedFees);
    const totalFeesCollected = collectedFees.reduce(
      (acc, fee) => acc + fee.paidAmount,
      0
    );
    const totalFeesDueAmount = allFees
      .filter((fee) => fee.status === "Unpaid")
      .reduce((acc, fee) => acc + (fee.amount - fee.paidAmount), 0);

    res.status(200).json({
      totalStudents,
      totalClasses,
      classes,
      totalGuardians,
      totalFeesCollected,
      totalFeesDueAmount,
      newlyAdmittedStudents,
    });
  } catch (err) {
    next(err);
  }
};

export default dashboardController;
