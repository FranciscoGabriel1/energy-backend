import { Invoice } from "../models/Invoice";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class InvoiceRepository {
  async deleteAllInvoices() {
    try {
      await prisma.invoice.deleteMany({});
    } catch (error) {
      console.error("Error ao delete invoices:", error);
      throw error;
    }
  }

  async createInvoice(invoice: Invoice) {
    try {
      const newInvoice = await prisma.invoice.create({
        data: invoice,
      });
      return newInvoice;
    } catch (error) {
      console.error("Failed to create new invoice:", error);
      throw error;
    }
  }

  async getInvoices() {
    try {
      const invoices = await prisma.invoice.findMany();
      return invoices;
    } catch (error) {
      console.error("Error retrieving invoices:", error);
      throw error;
    }
  }

  async getInvoiceByCustomerNumber(customerNumber: string) {
    try {
      const invoice = await prisma.invoice.findMany({
        where: {
          customerNumber: customerNumber,
        },
      });
      return invoice;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = InvoiceRepository;
