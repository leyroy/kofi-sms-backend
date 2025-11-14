import z from "zod";
import { Gender } from "./generated/prisma/enums";

const StudentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  other_names: z.string().optional(),
  age: z.enum(Gender),
  dob: z.string().min(1, "Date of Birth is required"),
  gender: z.string().min(1, "Gender is required"),
  class_id: z.string().nullable(),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  admission_date: z.string().min(1, "Admission Date is required"),
});

export type StudentFormData = z.infer<typeof StudentSchema>;
