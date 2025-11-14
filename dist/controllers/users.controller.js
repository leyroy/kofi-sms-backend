"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const users_1 = require("../helpers/users");
const loginController = async (req, res, next) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        throw errorHandler_1.ErrorHandler.badRequest("Username and password are required");
    }
    const accessToken = await (0, users_1.logIn)({ userName, password });
    // 🎯 Handle login logic here
    if (!accessToken) {
        throw errorHandler_1.ErrorHandler.unauthorized("Invalid user credentials");
    }
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
    res.status(200).json({ message: "Login successful", accessToken });
};
exports.loginController = loginController;
//# sourceMappingURL=users.controller.js.map