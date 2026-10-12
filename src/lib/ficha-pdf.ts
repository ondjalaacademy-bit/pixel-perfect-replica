// Ficha de inscrição em PDF (provisória ou oficial). jsPDF é browser-only: importar só em handlers.
import { formatDate, formatKz } from "@/lib/format";

export type FichaData = {
  registrationNumber: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  province: string;
  municipality: string;
  courseTitle: string;
  className?: string | null;
  classStart?: string | null;
  registrationFee: number | string;
  coursePrice: number | string;
  paymentStatus: string; // pendente | pago | falhado
  registrationStatus: string;
};

const clean = (s: string) => s.replace(/[\u202F\u00A0\u2009]/g, " ").replace(/[–—]/g, "-");

export function isOfficial(d: Pick<FichaData, "paymentStatus" | "registrationStatus">) {
  return d.paymentStatus === "pago" && d.registrationStatus === "confirmada";
}

export async function downloadFicha(d: FichaData) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const official = isOfficial(d);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const navy: [number, number, number] = [16, 32, 64];
  const orange: [number, number, number] = [240, 120, 30];

  doc.setFillColor(...navy);
  doc.rect(0, 0, w, 78, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("ONDJALA ACADEMY", 40, 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Aprende. Inova. Transforma. Lidera o Futuro.", 40, 54);
  doc.setFillColor(...orange);
  doc.rect(0, 78, w, 3, "F");

  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(official ? "FICHA DE INSCRIÇÃO OFICIAL" : "FICHA DE INSCRIÇÃO PROVISÓRIA", 40, 118);

  // Selo de estado
  const label = official ? "CONFIRMADA" : d.paymentStatus === "falhado" ? "PAGAMENTO REJEITADO" : "PAGAMENTO EM ANÁLISE";
  doc.setFontSize(9);
  const lw = doc.getTextWidth(label) + 20;
  if (official) doc.setFillColor(22, 140, 80);
  else doc.setFillColor(...orange);
  doc.roundedRect(w - 40 - lw, 104, lw, 20, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(label, w - 40 - lw / 2, 117, { align: "center" });

  doc.setTextColor(100, 100, 110);
  doc.setFont("helvetica", "normal");
  doc.text(clean(`N.º ${d.registrationNumber} · Inscrito em ${formatDate(d.createdAt)} · Emitida em ${new Date().toLocaleString("pt-PT")}`), 40, 136);

  const section = (y: number, title: string, rows: [string, string][]) => {
    autoTable(doc, {
      startY: y,
      head: [[clean(title), ""]],
      body: rows.map(([a, b]) => [clean(a), clean(b || "—")]),
      theme: "grid",
      styles: { font: "helvetica", fontSize: 9.5, cellPadding: 6, lineColor: [225, 228, 235] },
      headStyles: { fillColor: navy, textColor: 255, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 170, textColor: [100, 100, 110] }, 1: { textColor: navy, fontStyle: "bold" } },
      margin: { left: 40, right: 40 },
    });
    return (doc as any).lastAutoTable.finalY + 16;
  };

  let y = section(156, "Dados do formando", [
    ["Nome completo", d.fullName],
    ["Email", d.email],
    ["Telefone", d.phone],
    ["WhatsApp", d.whatsapp],
    ["Província / Município", [d.province, d.municipality].filter(Boolean).join(" / ")],
  ]);
  y = section(y, "Formação", [
    ["Curso", d.courseTitle],
    ["Turma", d.className ? `${d.className}${d.classStart ? ` · início ${formatDate(d.classStart)}` : ""}` : ""],
    ["Investimento do curso", formatKz(d.coursePrice)],
  ]);
  y = section(y, "Pagamento da inscrição", [
    ["Valor da inscrição", formatKz(d.registrationFee)],
    ["Estado do pagamento", official ? "Pago" : d.paymentStatus === "falhado" ? "Rejeitado" : "Pendente de confirmação"],
    ["Valor pendente", official ? formatKz(0) : formatKz(d.registrationFee)],
    ["Estado da inscrição", official ? "Confirmada" : "Provisória"],
  ]);

  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 110);
  const note = official
    ? "Esta ficha confirma oficialmente a inscrição após validação do pagamento pela equipa da Ondjala Academy."
    : "Documento provisório. A inscrição só fica oficial depois de a equipa validar o comprovativo de pagamento.";
  doc.text(doc.splitTextToSize(clean(note), w - 80), 40, y + 4);

  doc.save(`ficha-${official ? "oficial" : "provisoria"}-${d.registrationNumber}.pdf`);
}

export function whatsappOfficialLink(d: FichaData) {
  const num = (d.whatsapp || d.phone).replace(/\D/g, "");
  const phone = num.length === 9 ? `244${num}` : num;
  const official = isOfficial(d);
  const text = [
    `Olá ${d.fullName.split(" ")[0]}, aqui é a Ondjala Academy.`,
    "",
    official
      ? `A tua inscrição n.º ${d.registrationNumber} no curso *${d.courseTitle}* está *CONFIRMADA* ✅`
      : `A tua inscrição n.º ${d.registrationNumber} no curso *${d.courseTitle}* está com o pagamento *${d.paymentStatus === "falhado" ? "REJEITADO" : "PENDENTE"}*.`,
    d.className ? `Turma: ${d.className}${d.classStart ? ` (início ${formatDate(d.classStart)})` : ""}` : "",
    `Valor da inscrição: ${formatKz(d.registrationFee)} — ${official ? "pago" : "pendente"}`,
    "",
    official ? "Segue em anexo a tua ficha de inscrição oficial." : "Por favor envia um novo comprovativo na tua conta.",
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");
  return `https://wa.me/${phone}?text=${encodeURIComponent(clean(text))}`;
}
