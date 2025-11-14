"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../lib/config"));
const dashboardController = async (req, res, next) => {
    try {
        //classes stats
        const classes = await config_1.default.class.findMany({
            include: {
                students: true,
            },
        });
        // 🎯 Handle dashboardController logic here neger 😎
        const totalStudents = await config_1.default.student.count();
        const totalClasses = await config_1.default.class.count();
        const totalGuardians = await config_1.default.guardian.count();
        const newlyAdmittedStudents = await config_1.default.student.count({
            orderBy: {
                admission_date: "desc",
            },
            take: 5,
        });
        //fees stats
        const allFees = await config_1.default.feePayment.findMany();
        const collectedFees = allFees.filter((fee) => fee.status !== "Unpaid");
        const totalFeesCollected = collectedFees.reduce((acc, fee) => acc + fee.paidAmount, 0);
        const totalFeesDueAmount = allFees
            .filter((fee) => fee.status !== "Paid")
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
    }
    catch (err) {
        next(err);
    }
};
exports.default = dashboardController;
//# sourceMappingURL=dashboard.controller.js.map