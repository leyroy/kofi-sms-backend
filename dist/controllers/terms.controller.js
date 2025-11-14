"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../lib/config"));
const errorHandler_1 = require("../middleware/errorHandler");
const http_status_1 = require("../lib/http-status");
const createTermController = async (req, res, next) => {
    const { endDate, startDate, name, accademicYear } = req.body;
    try {
        await config_1.default.terms.create({
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
    }
    catch (err) {
        next(err);
    }
};
const editTermController = async (req, res, next) => {
    const { endDate, startDate, name, accademicYear } = req.body;
    const { termId } = req.params;
    try {
        await config_1.default.terms.update({
            where: { id: termId },
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                accademicYear,
            },
        });
        res
            .status(http_status_1.HTTPSTATUS.CREATED)
            .json({ message: "Term editted succesfully", success: true });
    }
    catch (err) {
        next(err);
    }
};
const deleteTemController = async (req, res, next) => {
    const { termId } = req.params;
    if (!termId) {
        throw errorHandler_1.ErrorHandler.badRequest("Term id is required");
    }
    await config_1.default.terms.delete({ where: { id: termId } });
    res.status(http_status_1.HTTPSTATUS.OK).json({
        success: true,
        message: "Term created successfully",
    });
};
const getAllTemController = async (req, res, next) => {
    const data = await config_1.default.terms.findMany();
    res.status(http_status_1.HTTPSTATUS.OK).json({
        success: true,
        terms: data,
    });
};
const updateTermStatusController = async (req, res, next) => {
    const { termId, status } = req.body;
    if (!termId || !status) {
        throw errorHandler_1.ErrorHandler.badRequest("term Id or Status is missing.");
    }
    await config_1.default.terms.update({
        where: { id: termId },
        data: {
            status: status,
        },
    });
    res.status(http_status_1.HTTPSTATUS.CREATED).json({
        success: true,
        message: `Status updated to ${status}`,
    });
};
exports.default = {
    createTermController,
    editTermController,
    deleteTemController,
    getAllTemController,
    updateTermStatusController,
};
//# sourceMappingURL=terms.controller.js.map