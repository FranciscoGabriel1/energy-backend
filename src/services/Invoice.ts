const fs = require("fs");
const pdf = require("pdf-parse");
const path = require("path");

async function getInvoices() {
  const InvoiceRepository = require("../repositories/Invoice");
  const invoiceRepository = new InvoiceRepository();
  const result = await invoiceRepository.getInvoices();
  result.sort((x, y) =>
    tempConvertDate(x.referenceMonth).localeCompare(
      tempConvertDate(y.referenceMonth)
    )
  );
  return result;
}

async function getInvoiceByCustomerNumber(params: string) {
  const InvoiceRepository = require("../repositories/Invoice");
  const invoiceRepository = new InvoiceRepository();
  let result = await invoiceRepository.getInvoiceByCustomerNumber(params);
  result.sort((x, y) =>
    tempConvertDate(x.referenceMonth).localeCompare(
      tempConvertDate(y.referenceMonth)
    )
  );
  return result;
}

async function createInvoices() {
  const InvoiceRepository = require("../repositories/Invoice");
  const invoiceRepository = new InvoiceRepository();
  const pdfDirectory = path.join(__dirname, "../../invoices");
  const outputFilePath = path.join(
    __dirname,
    "..",
    "../output_invoices",
    "outputFile.txt"
  );
  let dataFound = null;
  let kWh = null;
  let price = null;
  let dataInvoiceList: readonly string[] = [
    "Nº\\sDO\\sCLIENTE",
    "Referente\\sa",
    "Energia\\sElétricakWh",
    "ICMSkWh",
    "Energia\\scompensada\\sGD\\sIkWh",
    "Contrib\\sIlum\\sPublica\\sMunicipal",
  ];
  let dataInvoiceFoundList: string[] = [];

  try {
    fs.readdir(pdfDirectory, async function (err, files) {
      if (err) {
        console.log("Unable to scan directory: " + err);
        throw err;
      }

      for (const file of files) {
        try {
          let filePath = path.join(pdfDirectory, file);
          let data = fs.readFileSync(filePath);
          let pdfData = await pdf(data);
          let text = pdfData.text;

          await fs.promises.writeFile(outputFilePath, text);
          let dataFile = await fs.promises.readFile(outputFilePath, "utf8");

          const contentInvoiceList = dataFile.split("\n");
          dataInvoiceList.forEach((item) => {
            const contentInvoiceFound = findContentInvoice(dataFile, item);

            if (contentInvoiceFound.length > 0) {
              contentInvoiceFound.forEach((row) => {
                if (item == "Energia\\sElétricakWh") {
                  const sourceRow = row.content;
                  kWh = sourceRow.trim().split(/\s+/)[2];
                  price = sourceRow.trim().split(/\s+/)[4];
                  dataInvoiceFoundList.push(kWh);
                  dataInvoiceFoundList.push(price);
                } else if (
                  item == "ICMSkWh" ||
                  item == "Energia\\scompensada\\sGD\\sIkWh"
                ) {
                  const sourceRow = row.content;
                  kWh = sourceRow.trim().split(/\s+/)[4];
                  price = sourceRow.trim().split(/\s+/)[6];
                  dataInvoiceFoundList.push(kWh);
                  dataInvoiceFoundList.push(price);
                } else if (item == "Contrib\\sIlum\\sPublica\\sMunicipal") {
                  const sourceRow = row.content;
                  price = sourceRow.trim().split(/\s+/)[4];
                  dataInvoiceFoundList.push(kWh);
                  dataInvoiceFoundList.push(price);
                } else {
                  const sourceRow = row.numberRow + 1;
                  const targetRow = contentInvoiceList[sourceRow - 1];
                  dataFound = targetRow.trim().split(/\s+/)[0];
                  dataInvoiceFoundList.push(dataFound);
                }
              });
            } else {
              dataInvoiceFoundList.push("");
              console.log("Texto específico não encontrado no arquivo." + item);
            }
          });
        } catch (error) {
          console.error("Error processing file:", file, error);
          throw error;
        }

        await invoiceRepository.createInvoice({
          customerNumber: dataInvoiceFoundList[0] || "",
          referenceMonth: dataInvoiceFoundList[1] || "",
          electricEnergyKWh: dataInvoiceFoundList[2] || "",
          electricEnergyValue: dataInvoiceFoundList[3] || "",
          compensatedEnergyKWh: dataInvoiceFoundList[4] || "",
          compensatedEnergyValue: dataInvoiceFoundList[5] || "",
          publicLightingCharge: dataInvoiceFoundList[6] || "",
        });
        dataInvoiceFoundList.splice(0, dataInvoiceFoundList.length);
      }
    });
  } catch (error) {
    console.error("Error to get invoices:", error);
    throw error;
  }
}

function findContentInvoice(text, regex) {
  const rows = text.split("\n");
  const contentRow = [];
  rows.forEach((content, index) => {
    if (content.match(new RegExp(regex))) {
      contentRow.push({ numberRow: index + 1, content });
    }
  });
  return contentRow;
}

function tempConvertDate(dateStr) {
  // console.log("**************");
  // console.log(dateStr);
  const months = {
    JAN: "01",
    FEV: "02",
    MAR: "03",
    ABR: "04",
    MAI: "05",
    JUN: "06",
    JUL: "07",
    AGO: "08",
    SET: "09",
    OUT: "10",
    NOV: "11",
    DEZ: "12",
  };
  const parts = dateStr.split("/");
  const month = months[parts[0]];
  const year = parts[1];
  return `${year}-${month}`;
}

module.exports = { getInvoices, createInvoices, getInvoiceByCustomerNumber };
