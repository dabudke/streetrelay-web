import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;

prisma
  .$connect()
  .catch((err) => console.error("Could not connect to MongoDB!", err));
