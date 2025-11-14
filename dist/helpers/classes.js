"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllClasses = exports.createClass = void 0;
const config_1 = __importDefault(require("../lib/config"));
const createClass = async (data) => {
    const result = await config_1.default.class.create({
        data,
    });
    return result;
};
exports.createClass = createClass;
const getAllClasses = async () => {
    const result = await config_1.default.class.findMany();
    return result;
};
exports.getAllClasses = getAllClasses;
//# sourceMappingURL=classes.js.map