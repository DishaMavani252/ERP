import { PrismaClient } from "@prisma/client";

// Singleton pattern — reuse one connection in production
// Prevents "too many connections" and SSL errors on Railway
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

export default prisma;
