// Geração de PDF no navegador. Importar só dentro de handlers (jsPDF é browser-only).
export async function downloadPdfReport(opts: {
  title: string;
  subtitle?: string;
  head: string[];
  rows: (string | number)[][];
  foot?: (string | number)[];
  fileName: string;
}) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: opts.head.length > 5 ? "landscape" : "portrait", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const navy: [number, number, number] = [16, 32, 64];
  const orange: [number, number, number] = [240, 120, 30];

  doc.setFillColor(...navy);
  doc.rect(0, 0, w, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ONDJALA ACADEMY", 40, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Aprende. Inova. Transforma. Lidera o Futuro.", 40, 50);
  doc.setFillColor(...orange);
  doc.rect(0, 70, w, 3, "F");

  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(clean(opts.title), 40, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  const gen = `Gerado em ${new Date().toLocaleString("pt-PT")}`;
  doc.text(clean(opts.subtitle ? `${opts.subtitle} · ${gen}` : gen), 40, 121);

  autoTable(doc, {
    startY: 138,
    head: [opts.head.map(clean)],
    body: opts.rows.map((r) => r.map((c) => clean(String(c)))),
    ...(opts.foot ? { foot: [opts.foot.map((c) => clean(String(c)))] } : {}),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 5, lineColor: [225, 228, 235] },
    headStyles: { fillColor: navy, textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [245, 246, 250], textColor: navy, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 251, 253] },
    margin: { left: 40, right: 40 },
    didDrawPage: () => {
      const h = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 150);
      doc.text(`Página ${doc.getNumberOfPages()}`, w - 40, h - 20, { align: "right" });
    },
  });

  doc.save(opts.fileName);
}

// jsPDF (fonte padrão) não suporta espaços estreitos usados pelo Intl.
function clean(s: string) {
  return s.replace(/[\u202F\u00A0\u2009]/g, " ").replace(/[–—]/g, "-");
}
