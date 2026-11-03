type CsvCell = string | number | boolean | null | undefined;

function csvEscape(value: CsvCell) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function downloadCsv(filename: string, headers: string[], rows: CsvCell[][]) {
  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function pdfEscape(value: CsvCell) {
  return (value === null || value === undefined ? "" : String(value))
    .replace(/[₹–—]/g, (match) => (match === "₹" ? "INR " : "-"))
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

function splitPdfText(text: string, maxLength = 88) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export function downloadPdfReport(
  title: string,
  sections: Array<{ heading: string; rows: CsvCell[][]; headers?: string[] }>,
  filename: string
) {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 42;
  const lineHeight = 14;
  const contentLines: Array<{ text: string; size?: number; bold?: boolean }> = [
    { text: "MTWO GROUPS - OFFICIAL ORDER REPORT", size: 16, bold: true },
    { text: title, size: 12, bold: true },
    { text: `Generated: ${new Date().toLocaleString("en-IN")}`, size: 9 },
    { text: "--------------------------------------------------------------------------------" },
  ];

  sections.forEach((section) => {
    contentLines.push({ text: section.heading, size: 12, bold: true });
    if (section.headers?.length) {
      contentLines.push({ text: section.headers.join(" | "), size: 8.5, bold: true });
    }
    section.rows.forEach((row) => {
      splitPdfText(row.map((cell) => (cell === null || cell === undefined ? "" : String(cell))).join(" | ")).forEach(
        (line) => {
          contentLines.push({ text: line, size: 8.5 });
        }
      );
    });
    contentLines.push({ text: " " });
  });

  const pages: (typeof contentLines)[] = [];
  let currentPage: typeof contentLines = [];
  let y = pageHeight - margin;

  contentLines.forEach((line) => {
    const size = line.size || 10;
    const needed = Math.max(lineHeight, size + 4);
    if (y - needed < margin && currentPage.length) {
      pages.push(currentPage);
      currentPage = [];
      y = pageHeight - margin;
    }
    currentPage.push(line);
    y -= needed;
  });
  if (currentPage.length) pages.push(currentPage);

  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const fontRegular = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBold = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageObjectIds: number[] = [];

  pages.forEach((page) => {
    let cursorY = pageHeight - margin;
    const commands = ["BT"];
    page.forEach((line) => {
      const size = line.size || 10;
      const fontId = line.bold ? "F2" : "F1";
      commands.push(`/${fontId} ${size} Tf`);
      commands.push(`1 0 0 1 ${margin} ${cursorY} Tm`);
      commands.push(`(${pdfEscape(line.text)}) Tj`);
      cursorY -= Math.max(lineHeight, size + 4);
    });
    commands.push("ET");
    const stream = commands.join("\n");
    const streamObject = addObject(`<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`);
    const pageObject = addObject(
      `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${streamObject} 0 R >>`
    );
    pageObjectIds.push(pageObject);
  });

  const pagesObject = addObject(
    `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`
  );
  pageObjectIds.forEach((id) => {
    objects[id - 1] = objects[id - 1].replace("/Parent 0 0 R", `/Parent ${pagesObject} 0 R`);
  });
  const catalogObject = addObject(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObject} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export interface PurchaseOrderPdfData {
  orderId: string;
  createdAt: string;
  deliveryDate: string | null;
  customerName: string;
  customerEmail: string;
  vendorName: string;
  deliveryAddress: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    materialCode?: string | null;
    description: string;
    quantity: number;
    unit?: string | null;
    unitPrice: number;
  }>;
}

/** Reads a JPEG's real dimensions; a PDF image object must declare them exactly or the image distorts. */
function readJpegSize(bytes: Uint8Array) {
  let offset = 2;
  while (offset + 9 < bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    const isFrameHeader = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrameHeader) {
      return {
        height: (bytes[offset + 5] << 8) | bytes[offset + 6],
        width: (bytes[offset + 7] << 8) | bytes[offset + 8],
        components: bytes[offset + 9],
      };
    }
    offset += 2 + ((bytes[offset + 2] << 8) | bytes[offset + 3]);
  }
  return null;
}

/** Creates a structured purchase order modeled on the client's PO document. */
export async function downloadPurchaseOrderPdf(data: PurchaseOrderPdfData) {
  const pageWidth = 595;
  const pageHeight = 842;
  const left = 36;
  const right = 559;
  const width = right - left;
  const poNumber = `PO-${data.orderId.slice(0, 8).toUpperCase()}`;
  const date = new Date(data.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const deliveryDate = data.deliveryDate
    ? new Date(data.deliveryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Awaiting delivery";
  const money = (amount: number) => `INR ${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const rgb = (hex: string) => {
    const value = hex.replace("#", "");
    return [0, 2, 4].map((index) => (parseInt(value.slice(index, index + 2), 16) / 255).toFixed(3)).join(" ");
  };
  const pages: string[][] = [];
  let commands: string[] = [];
  let y = 0;
  let logoHex = "";
  let logoInfo = { width: 0, height: 0, components: 3 };
  try {
    const logoResponse = await fetch("/logo.jpeg");
    if (logoResponse.ok) {
      const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
      const size = readJpegSize(logoBytes);
      if (size) {
        logoInfo = size;
        logoHex = `${Array.from(logoBytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}>`;
      }
    }
  } catch {
    // Keep the document usable if the optional logo asset cannot be loaded.
  }
  const text = (x: number, top: number, value: unknown, options: { size?: number; bold?: boolean; color?: string } = {}) => {
    const size = options.size || 9;
    commands.push(`BT ${rgb(options.color || "#1f2937")} rg /${options.bold ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${(pageHeight - top - size).toFixed(2)} Tm (${pdfEscape(value as CsvCell)}) Tj ET`);
  };
  const rect = (x: number, top: number, w: number, h: number, fill?: string, stroke = "#d1d5db") => {
    if (fill) commands.push(`${rgb(fill)} rg ${x} ${pageHeight - top - h} ${w} ${h} re f`);
    commands.push(`${rgb(stroke)} RG 0.7 w ${x} ${pageHeight - top - h} ${w} ${h} re S`);
  };
  const line = (x1: number, top1: number, x2: number, top2: number, color = "#cbd5e1") => {
    commands.push(`${rgb(color)} RG 0.7 w ${x1} ${pageHeight - top1} m ${x2} ${pageHeight - top2} l S`);
  };
  const wrap = (value: unknown, chars: number) => splitPdfText(String(value ?? "-").replace(/\s+/g, " "), chars);
  const heading = (title: string) => {
    commands = [];
    pages.push(commands);
    rect(left, 28, width, 58, "#f8fafc", "#cbd5e1");
    if (logoHex) commands.push(`q 38 0 0 38 ${left + 9} ${pageHeight - 76} cm /Logo Do Q`);
    text(left + 54, 40, "MTWO GROUPS", { size: 17, bold: true, color: "#123b72" });
    text(left + 54, 64, "B2B PROCUREMENT", { size: 7, color: "#64748b" });
    text(365, 42, title, { size: 15, bold: true, color: "#123b72" });
    text(365, 65, `${poNumber}  |  ${date}`, { size: 8, color: "#475569" });
    line(left, 98, right, 98, "#1e3a5f");
    y = 112;
  };
  const sectionTitle = (title: string, x: number, top: number) => {
    rect(x, top, 250, 19, "#eef2f7", "#cbd5e1");
    text(x + 8, top + 5, title.toUpperCase(), { size: 8, bold: true, color: "#334155" });
  };
  const itemsHeader = (top: number) => {
    const xs = [left, left + 30, left + 200, left + 284, left + 322, left + 366, left + 444, right];
    const labels = ["#", "DESCRIPTION", "MATERIAL CODE", "QTY", "UOM", "RATE (INR)", "TOTAL (INR)"];
    rect(left, top, width, 27, "#e8edf4", "#aeb9c8");
    labels.forEach((label, index) => text(xs[index] + 4, top + 9, label, { size: 6.2, bold: true, color: "#26364a" }));
    for (let index = 1; index < xs.length - 1; index++) line(xs[index], top, xs[index], top + 27, "#cbd5e1");
    return xs;
  };

  heading("PURCHASE ORDER");
  const half = (width - 12) / 2;
  sectionTitle("Buyer / Bill To", left, y);
  sectionTitle("Supplier", left + half + 12, y);
  rect(left, y + 19, half, 75, undefined);
  rect(left + half + 12, y + 19, half, 75, undefined);
  text(left + 10, y + 31, data.customerName || "Customer", { size: 10, bold: true });
  text(left + 10, y + 49, data.customerEmail || "-", { size: 8 });
  wrap(data.deliveryAddress || "Delivery address not provided", 62).slice(0, 2).forEach((part, index) => text(left + 10, y + 64 + index * 11, part, { size: 7.5 }));
  text(left + half + 22, y + 31, data.vendorName || "Vendor", { size: 10, bold: true });
  y += 108;

  const infoTop = y;
  const infoCells = [
    ["PO NUMBER", poNumber], ["PO DATE", date], ["DELIVERY DATE", deliveryDate], ["ORDER STATUS", data.orderStatus], ["PAYMENT STATUS", data.paymentStatus],
  ];
  const cellWidth = width / infoCells.length;
  infoCells.forEach(([label, value], index) => {
    const x = left + index * cellWidth;
    rect(x, infoTop, cellWidth, 42, index % 2 ? "#ffffff" : "#f8fafc", "#cbd5e1");
    text(x + 8, infoTop + 8, label, { size: 6.5, bold: true, color: "#64748b" });
    text(x + 8, infoTop + 23, value, { size: 8, bold: true });
  });
  y += 54;
  text(left, y, "Please supply the items listed below against this purchase order.", { size: 8, color: "#475569" });
  y += 13;
  let xs = itemsHeader(y);
  y += 27;

  const itemList = data.items.length ? data.items : [{ productId: "-", materialCode: null, description: "No item details", quantity: 0, unit: null, unitPrice: 0 }];
  itemList.forEach((item, index) => {
    const descLines = wrap(item.description, 36);
    const codeLines = wrap(item.materialCode || "-", 13);
    const rowHeight = Math.max(31, Math.max(descLines.length, codeLines.length) * 10 + 12);
    if (y + rowHeight > 700) {
      heading("PURCHASE ORDER — CONTINUED");
      xs = itemsHeader(y);
      y += 27;
    }
    rect(left, y, width, rowHeight, index % 2 ? "#ffffff" : "#fbfcfe", "#d7dde5");
    for (let column = 1; column < xs.length - 1; column++) line(xs[column], y, xs[column], y + rowHeight, "#d7dde5");
    text(xs[0] + 7, y + 11, index + 1, { size: 8 });
    descLines.slice(0, 3).forEach((part, lineIndex) => text(xs[1] + 6, y + 8 + lineIndex * 10, part, { size: 7.5, bold: lineIndex === 0 }));
    codeLines.slice(0, 3).forEach((part, lineIndex) => text(xs[2] + 5, y + 8 + lineIndex * 10, part, { size: 6.5 }));
    text(xs[3] + 7, y + 11, item.quantity, { size: 8 });
    text(xs[4] + 7, y + 11, item.unit || "-", { size: 7.5 });
    text(xs[5] + 5, y + 11, money(item.unitPrice), { size: 7 });
    text(xs[6] + 5, y + 11, money(Number(item.unitPrice || 0) * Number(item.quantity || 0)), { size: 7, bold: true });
    y += rowHeight;
  });

  y += 14;
  const subtotal = data.items.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0), 0);
  const summaryX = 330;
  const summaryWidth = right - summaryX;
  rect(summaryX, y, summaryWidth, 26, "#f8fafc", "#cbd5e1");
  text(summaryX + 10, y + 8, "Items subtotal", { size: 8 });
  text(summaryX + 125, y + 8, money(subtotal), { size: 8, bold: true });
  rect(summaryX, y + 26, summaryWidth, 30, "#e8edf4", "#aeb9c8");
  text(summaryX + 10, y + 36, "PURCHASE ORDER TOTAL", { size: 8, bold: true, color: "#123b72" });
  text(summaryX + 125, y + 35, money(data.totalAmount), { size: 9, bold: true, color: "#123b72" });
  y += 72;
  if (y > 735) {
    heading("PURCHASE ORDER — CONTINUED");
  }
  line(left, y, right, y, "#cbd5e1");
  text(left, y + 10, "Digitally generated purchase order", { size: 7, color: "#64748b" });
  text(right - 150, y + 10, "MTWO Groups", { size: 7, bold: true, color: "#123b72" });

  const objects: string[] = [];
  const addObject = (body: string) => (objects.push(body), objects.length);
  const fontRegular = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBold = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const logoObject = logoHex
    ? addObject(`<< /Type /XObject /Subtype /Image /Width ${logoInfo.width} /Height ${logoInfo.height} /ColorSpace ${logoInfo.components === 1 ? "/DeviceGray" : "/DeviceRGB"} /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${logoHex.length} >>\nstream\n${logoHex}\nendstream`)
    : null;
  const pageObjectIds: number[] = [];
  pages.forEach((page) => {
    const stream = page.join("\n");
    const streamObject = addObject(`<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`);
    const xObjects = logoObject ? `/XObject << /Logo ${logoObject} 0 R >>` : "";
    pageObjectIds.push(addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> ${xObjects} >> /Contents ${streamObject} 0 R >>`));
  });
  const pagesObject = addObject(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`);
  pageObjectIds.forEach((id) => { objects[id - 1] = objects[id - 1].replace("/Parent 0 0 R", `/Parent ${pagesObject} 0 R`); });
  const catalogObject = addObject(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => { offsets.push(byteLength(pdf)); pdf += `${index + 1} 0 obj\n${body}\nendobj\n`; });
  const xrefOffset = byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObject} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `PO_${data.orderId.slice(0, 8).toUpperCase()}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
