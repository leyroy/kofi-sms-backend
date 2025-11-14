"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentStatus = exports.uploadFileController = exports.createStudnetsController = exports.getAllStudentController = exports.deleteStudentController = void 0;
const config_1 = __importDefault(require("../lib/config"));
const students_1 = require("../helpers/students");
const cloudnary_config_1 = __importDefault(require("../lib/config/cloudnary.config"));
const errorHandler_1 = require("../middleware/errorHandler");
const http_status_1 = require("../lib/http-status");
const getAllStudentController = async (req, res, next) => {
    try {
        const students = await config_1.default.student.findMany({
            include: {
                class: true,
                guardian: true,
            },
        });
        res.status(200).json({
            success: true,
            students,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllStudentController = getAllStudentController;
const createStudnetsController = async (req, res, next) => {
    try {
        const { student, guardian } = req.body;
        const newStudnet = await (0, students_1.createStudentHelper)({ ...student }, guardian);
        res.status(200).json({
            ...newStudnet,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createStudnetsController = createStudnetsController;
const uploadFileController = async (req, res, next) => {
    const file = req.file?.path;
    if (!file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded",
        });
    }
    try {
        const uploadKeys = await cloudnary_config_1.default.uploader.upload(file);
        const photoKey = uploadKeys.public_id;
        const photoUrl = uploadKeys.secure_url;
        res.status(200).json({
            success: true,
            photoKey,
            photoUrl,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.uploadFileController = uploadFileController;
const deleteStudentController = async (req, res, next) => {
    try {
        const { id } = req.params;
        await config_1.default.student.delete({
            where: {
                id: id,
            },
        });
        res.status(200).json({
            success: true,
            message: "Student deleted successfully",
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteStudentController = deleteStudentController;
const updateStudentStatus = async (req, res, next) => {
    try {
        const { studentId, status } = req.body;
        if (!studentId || !status) {
            throw errorHandler_1.ErrorHandler.badRequest("Student Id or status is missing.");
        }
        await config_1.default.student.update({
            where: { id: studentId },
            data: {
                status: status,
            },
        });
        res
            .status(http_status_1.HTTPSTATUS.ACCEPTED)
            .json({ success: true, message: "Student status updated status" });
    }
    catch (error) {
        next(error);
    }
};
exports.updateStudentStatus = updateStudentStatus;
//# sourceMappingURL=students.controller.js.map