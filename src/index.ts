import express from "express";
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 3000;

const {
  getInvoices,
  getInvoiceByCustomerNumber,
  createInvoices,
} = require("./services/Invoice");

app.use(express.json());

app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:5173"];
  const origin = req.headers.origin;

  if (typeof origin === "string" && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.get("/get-invoice/:customerNumber", async (req, res) => {
  console.log("/get-invoice/:customerNumber");
  const { customerNumber } = req.params;

  try {
    const result = await getInvoiceByCustomerNumber(customerNumber);
    res.json(result);

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send("Invoice not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/create-invoices", async (req, res) => {
  console.log("/create-invoices");
  try {
    const result = await createInvoices();
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao recuperar os dados", error: error.message });
  }
});

app.get("/get-invoice", async (req, res) => {
  console.log("/get-invoice/");
  try {
    const result = await getInvoices();
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

process.on("SIGINT", () => {
  gracefulShutdown();
});
