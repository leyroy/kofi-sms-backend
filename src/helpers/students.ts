import { Gender, Guardian, Student } from "../generated/prisma/client";
import prisma from "../lib/config";
import { StudentFormData } from "../types";

export const createStudentHelper = async (
  data: StudentFormData,
  guardian: Guardian[]
) => {
  //TODO: upload picture here if any
  const newStudnet = await prisma.student.create({
    data: {
      ...data,
      passport_url: "",
      age: Number(data.age),
      gender: data.gender as Gender,
      class_id: Number(data.class_id),
    },
  });
  await prisma.guardian.createMany({
    data: guardian.map((gud) => ({
      ...gud,
      studentId: newStudnet.id,
    })),
  });
  return {
    success: true,
    message: "Student created succefully",
  };
};
