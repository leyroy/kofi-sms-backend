"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = __importDefault(require("zod"));
const enums_1 = require("./generated/prisma/enums");
const StudentSchema = zod_1.default.object({
    first_name: zod_1.default.string().min(1, "First name is required"),
    last_name: zod_1.default.string().min(1, "Last name is required"),
    other_names: zod_1.default.string().optional(),
    age: zod_1.default.enum(enums_1.Gender),
    dob: zod_1.default.string().min(1, "Date of Birth is required"),
    gender: zod_1.default.string().min(1, "Gender is required"),
    class_id: zod_1.default.string().nullable(),
    phone: zod_1.default.string().min(1, "Phone number is required"),
    address: zod_1.default.string().min(1, "Address is required"),
    admission_date: zod_1.default.string().min(1, "Admission Date is required"),
});
//# sourceMappingURL=types.js.map