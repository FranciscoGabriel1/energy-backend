import express from "express";
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const path = require("path");
const multer = require("multer");
const app = express();

// Use the PORT environment variable provided by Heroku
const PORT = process.env.PORT || 3000;

const { getInvoice } = require("./services/Invoice");

app.use(express.json());

app.get("/get-invoice", async (req, res) => {
  try {
    const result = await getInvoice();
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao recuperar os dados", error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const gracefulShutdown = () => {
  server.close(async () => {
    console.log("Server closed");
    await prisma.$disconnect();
    console.log("Prisma disconnected");
  });
};

// For app termination
process.on("SIGINT", () => {
  gracefulShutdown();
});
