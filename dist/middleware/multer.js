"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({}),
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            ".jpeg",
            ".png",
            ".jpg",
            ".webp",
            ".avif",
            ".gif",
        ];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedMimeTypes.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error("Please upload a valid image file (JPEG, PNG, or JPG)"));
        }
    },
});
exports.default = upload;
//# sourceMappingURL=multer.js.map