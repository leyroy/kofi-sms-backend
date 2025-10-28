import { Class } from "../generated/prisma/client";
import prisma from "../lib/config";

export const createClass = async (data: Class) => {
  const result = await prisma.class.create({
    data,
  });
  return result;
};

export const getAllClasses = async () => {
  const result = await prisma.class.findMany();
  return result;
};
