import { Gender, Guardian, Student } from "../generated/prisma/client";
import prisma from "../lib/config";
import { StudentFormData } from "../types";

export const createStudentHelper = async (
  data: StudentFormData,
  guardian: Guardian[]
) => {
  //TODO: upload picture here if any
  const studentCount = await prisma.student.count();
  const indexNumber = `STU-${String(studentCount + 1).padStart(5, "0")}`;
  const newStudent = await prisma.student.create({
    data: {
      ...data,
      age: data.age,
      gender: data.gender as Gender,
      indexNumber,
      class_id: data.class_id as string,
    },
  });
  await prisma.guardian.createMany({
    data: guardian.map((gud) => ({
      ...gud,
      studentId: newStudent.id,
    })),
  });
  return {
    success: true,
    message: "Student created succefully",
  };
};
