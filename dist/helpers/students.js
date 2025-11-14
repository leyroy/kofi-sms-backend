"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudentHelper = void 0;
const config_1 = __importDefault(require("../lib/config"));
const createStudentHelper = async (data, guardian) => {
    //TODO: upload picture here if any
    const studentCount = await config_1.default.student.count();
    const indexNumber = `STU-${String(studentCount + 1).padStart(5, "0")}`;
    const newStudent = await config_1.default.student.create({
        data: {
            ...data,
            age: data.age,
            gender: data.gender,
            indexNumber,
            class_id: data.class_id,
        },
    });
    await config_1.default.guardian.createMany({
        data: guardian.map((gud) => ({
            ...gud,
            studentId: newStudent.id,
        })),
    });
    return {
        success: true,
        message: "Student created succefully",
    };
};
exports.createStudentHelper = createStudentHelper;
//# sourceMappingURL=students.js.map