"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllClassesController = exports.classController = void 0;
const classes_1 = require("../helpers/classes");
const classController = async (req, res, next) => {
    const data = req.body;
    try {
        const result = await (0, classes_1.createClass)(data);
        res
            .status(201)
            .json({ message: "Class created successfully", class: result });
    }
    catch (err) {
        next(err);
    }
};
exports.classController = classController;
const getAllClassesController = async (req, res, next) => {
    const result = await (0, classes_1.getAllClasses)();
    res.status(200).json({ success: true, classes: result });
};
exports.getAllClassesController = getAllClassesController;
//# sourceMappingURL=class.controller.js.map