import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;

prisma
  .$connect()
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.error("Could not connect to MongoDB!"));
