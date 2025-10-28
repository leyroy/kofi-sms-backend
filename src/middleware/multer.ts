import { Request } from "express";
import multer from "multer";
import path from "path";

const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
    const allowedMimeTypes = [
      ".jpeg",
      ".png",
      ".jpg",
      ".webp",
      ".avif",
      ".gif",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Please upload a valid image file (JPEG, PNG, or JPG)"));
    }
  },
});

export default upload;
