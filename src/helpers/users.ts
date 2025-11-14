import prisma from "../lib/config";
import { ErrorHandler } from "../middleware/errorHandler";
import jwt from "jsonwebtoken";

export const logIn = async ({
  userName,
  password,
}: {
  userName: string;
  password: string;
}) => {
  // const user = await prisma.user.findFirst({ where: { userName: userName } });
  // if (!user) {
  //   throw ErrorHandler.unauthorized("Invalide user credientials");
  // }
  // if (password !== user.password) {
  //   throw ErrorHandler.unauthorized("Invalid user credentials");
  // }

  const accessToken = jwt.sign(
    { userId: "userIdgenerted", userName: "Ley Roy" },
    process.env.JWT_SECRET as string,
    { expiresIn: "8h" }
  );

  return accessToken;
};
