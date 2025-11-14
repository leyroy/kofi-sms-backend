"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logIn = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logIn = async ({ userName, password, }) => {
    // const user = await prisma.user.findFirst({ where: { userName: userName } });
    // if (!user) {
    //   throw ErrorHandler.unauthorized("Invalide user credientials");
    // }
    // if (password !== user.password) {
    //   throw ErrorHandler.unauthorized("Invalid user credentials");
    // }
    const accessToken = jsonwebtoken_1.default.sign({ userId: "userIdgenerted", userName: "Ley Roy" }, process.env.JWT_SECRET, { expiresIn: "8h" });
    return accessToken;
};
exports.logIn = logIn;
//# sourceMappingURL=users.js.map