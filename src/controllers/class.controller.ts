import type { Request, Response, NextFunction } from "express";
import { createClass, getAllClasses } from "../helpers/classes";

const classController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = req.body;
  try {
    const result = await createClass(data);
    res
      .status(201)
      .json({ message: "Class created successfully", class: result });
  } catch (err) {
    next(err);
  }
};

const getAllClassesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await getAllClasses();
  res.status(200).json({ success: true, classes: result });
};

export { classController, getAllClassesController };
