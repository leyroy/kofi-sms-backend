"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payFees = exports.getAllFees = exports.generateStudentsFees = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const config_1 = __importDefault(require("../lib/config"));
const http_status_1 = require("../lib/http-status");
const client_1 = require("../generated/prisma/client");
const createFees = async (req, res, next) => {
    const { termFeesPlans } = req.body;
    const { termId } = req.params;
    try {
        if (!termFeesPlans || termFeesPlans.length === 0) {
            throw errorHandler_1.ErrorHandler.badRequest("Fee plans are required");
        }
        if (!termId) {
            throw errorHandler_1.ErrorHandler.badRequest("Term id is required");
        }
        const term = await config_1.default.terms.findUnique({
            where: { id: termId },
        });
        if (term?.isPlansCreated) {
            throw errorHandler_1.ErrorHandler.conflict("Pleans are already generated for this term");
        }
        await config_1.default.feePlans.createMany({
            data: termFeesPlans.map((plan) => ({
                ...plan,
                termId,
            })),
            skipDuplicates: true,
        });
        await config_1.default.terms.update({
            where: { id: termId },
            data: {
                isPlansCreated: true,
            },
        });
        res.status(201).json({ success: true, message: "Created successfully." });
    }
    catch (err) {
        next(err);
    }
};
const generateStudentsFees = async (req, res, next) => {
    const { termId } = req.params;
    try {
        const students = await config_1.default.student.findMany({
            where: { status: "Active" },
            include: { class: true },
        });
        if (students.length === 0) {
            throw errorHandler_1.ErrorHandler.notFound("No students found");
        }
        const term = await config_1.default.terms.findUnique({
            where: { id: termId },
        });
        if (!term?.isPlansCreated) {
            throw errorHandler_1.ErrorHandler.conflict("Create pland for this term first");
        }
        if (term?.isFeesGenerated) {
            throw errorHandler_1.ErrorHandler.conflict("Fees are already generated for this term");
        }
        const feePlans = await config_1.default.feePlans.findMany({
            where: {
                termId,
            },
        });
        if (feePlans.length === 0) {
            throw errorHandler_1.ErrorHandler.notFound("No fee plans found");
        }
        // Generate fees for each student based on the fee plans and level
        const studentFees = students.map((student) => {
            const studentFeePlans = feePlans.filter((plan) => plan.level.includes(student.class.level));
            return {
                studentId: student.id,
                amount: studentFeePlans[0]?.amount || 0,
                termId,
                paidAmount: 0,
                status: client_1.PaymentStatus.Unpaid,
            };
        });
        await config_1.default.feePayment.createMany({
            data: studentFees,
            skipDuplicates: true,
        });
        await config_1.default.terms.update({
            where: { id: termId },
            data: {
                isFeesGenerated: true,
            },
        });
        res.status(http_status_1.HTTPSTATUS.OK).json({ success: true, data: studentFees });
    }
    catch (error) {
        next(error);
    }
};
exports.generateStudentsFees = generateStudentsFees;
const getAllFees = async (req, res, next) => {
    const { termId } = req.body;
    const data = await config_1.default.feePayment.findMany({
        where: { termId: termId },
        include: { student: { include: { class: true } }, term: true },
    });
    if (!data) {
        throw errorHandler_1.ErrorHandler.notFound("No fee records found");
    }
    res.status(http_status_1.HTTPSTATUS.OK).json({ success: true, feesPlan: data });
};
exports.getAllFees = getAllFees;
const payFees = async (req, res, next) => {
    const { feeId, amount } = req.body;
    try {
        const feeRecord = await config_1.default.feePayment.findUnique({
            where: { id: feeId },
        });
        if (!feeRecord) {
            throw errorHandler_1.ErrorHandler.notFound("Fee record not found");
        }
        const newPaidAmount = feeRecord.paidAmount + amount;
        if (newPaidAmount > feeRecord.amount) {
            throw errorHandler_1.ErrorHandler.badRequest("Payment exceeds the total fee amount");
        }
        const status = newPaidAmount === feeRecord.amount
            ? client_1.PaymentStatus.Paid
            : client_1.PaymentStatus.Partial;
        const feePayment = await config_1.default.feePayment.update({
            where: { id: feeId },
            data: {
                paidAmount: newPaidAmount,
                status: status,
            },
        });
        //add to history
        await config_1.default.feePaymentHistory.create({
            data: {
                newAmount: newPaidAmount,
                oldAmount: feeRecord.amount,
                feePaymentId: feeRecord.id,
                studentId: feeRecord.studentId,
                paidAmount: amount,
            },
        });
        res.status(201).json({ success: true, data: feePayment });
    }
    catch (error) {
        next(error);
    }
};
exports.payFees = payFees;
const getFeesByStudentId = async (req, res, next) => {
    const { studentId } = req.params;
    if (!studentId) {
        throw errorHandler_1.ErrorHandler.badRequest("Student id is required");
    }
    const results = await config_1.default.student.findUnique({
        where: { id: studentId },
        include: {
            FeePayment: true,
            class: true,
        },
    });
    res.status(http_status_1.HTTPSTATUS.OK).json({ success: true, results: results });
};
const getFeeHistorybyFeeId = async (req, res, next) => {
    const { feeId } = req.params;
    if (!feeId) {
        throw errorHandler_1.ErrorHandler.badRequest("Fee ID is missing.");
    }
    const results = await config_1.default.feePayment.findFirst({
        where: { id: feeId },
        include: {
            feePaymentHistories: true,
            student: true,
            term: true,
        },
    });
    res.status(http_status_1.HTTPSTATUS.OK).json({ success: true, history: results });
};
exports.default = {
    createFees,
    getFeesByStudentId,
    getFeeHistorybyFeeId,
    generateStudentsFees: exports.generateStudentsFees,
    getAllFees: exports.getAllFees,
    payFees: exports.payFees,
};
//# sourceMappingURL=fees-management.controller.js.map