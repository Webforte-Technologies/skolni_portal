import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

export async function exportElementToPDF(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = canvas.height * (imgWidth / canvas.width);

  let position = 0;
  let heightLeft = imgHeight;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    pdf.addPage();
    position = heightLeft - imgHeight;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

// New: export element to PDF with optional filtering (e.g., hide answers)
export async function exportElementToPDFOptions(
  element: HTMLElement,
  filename: string,
  options?: { hideAnswers?: boolean }
) {
  // Clone the element so we can safely manipulate (hide answers)
  const clone = element.cloneNode(true) as HTMLElement;
  const holder = document.createElement('div');
  holder.style.position = 'fixed';
  holder.style.left = '-10000px';
  holder.style.top = '0';
  holder.style.width = `${element.offsetWidth}px`;
  holder.style.zIndex = '-1';
  holder.appendChild(clone);
  document.body.appendChild(holder);

  const hideAnswers = options?.hideAnswers === true;
  // Hide any nodes explicitly marked as answers
  if (hideAnswers) {
    holder.querySelectorAll('[data-answer="true"]').forEach((n) => (n as HTMLElement).style.display = 'none');
  }
  // For teacher version (answers visible), hide student-only placeholders
  if (!hideAnswers) {
    holder.querySelectorAll('[data-student-only="true"]').forEach((n) => (n as HTMLElement).style.display = 'none');
  }
  // Always hide export/toolbar elements
  holder.querySelectorAll('[data-export-hide="true"]').forEach((n) => (n as HTMLElement).style.display = 'none');

  try {
    await exportElementToPDF(clone, filename);
  } finally {
    document.body.removeChild(holder);
  }
}

export async function exportStructuredToDocx(content: any, filename: string) {
  const paragraphs: Paragraph[] = [];

  const pushHeading = (text: string, level?: any) => {
    const headingLevel = level ?? HeadingLevel.HEADING_2;
    paragraphs.push(new Paragraph({ text, heading: headingLevel as any }));
  };
  const pushText = (text: string) => {
    paragraphs.push(new Paragraph({ children: [new TextRun(text)] }));
  };

  if (content.title) {
    pushHeading(content.title, HeadingLevel.HEADING_1);
  }

  if (content.subject) pushText(`Předmět: ${content.subject}`);
  if (content.grade_level || content.gradeLevel) pushText(`Ročník: ${content.grade_level || content.gradeLevel}`);
  if (content.duration) pushText(`Délka: ${content.duration}`);

  if (content.instructions) {
    pushHeading('Instrukce');
    pushText(content.instructions);
  }

  if (Array.isArray(content.objectives)) {
    pushHeading('Cíle');
    content.objectives.forEach((o: string) => pushText(`• ${o}`));
  }

  if (Array.isArray(content.materials)) {
    pushHeading('Materiály');
    content.materials.forEach((m: string) => pushText(`• ${m}`));
  }

  if (Array.isArray(content.activities)) {
    pushHeading('Aktivity');
    content.activities.forEach((a: any, idx: number) => {
      pushText(`${idx + 1}. ${a.name}`);
      if (a.description) pushText(a.description);
      if (Array.isArray(a.steps)) a.steps.forEach((s: string, i: number) => pushText(`   ${i + 1}) ${s}`));
      if (a.time) pushText(`Čas: ${a.time}`);
    });
  }

  if (Array.isArray(content.questions)) {
    pushHeading('Otázky');
    content.questions.forEach((q: any, i: number) => {
      pushText(`${i + 1}. ${q.question || q.problem}`);
      if (Array.isArray(q.options)) q.options.forEach((opt: string) => pushText(`   - ${opt}`));
      if (q.answer !== undefined) pushText(`   Odpověď: ${String(q.answer)}`);
    });
  }

  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// New: DOCX export with optional inclusion of answers
export async function exportStructuredToDocxOptions(
  content: any,
  filename: string,
  options?: { includeAnswers?: boolean }
) {
  const includeAnswers = options?.includeAnswers !== false; // default true
  const paragraphs: Paragraph[] = [];

  const pushHeading = (text: string, level?: any) => {
    const headingLevel = level ?? HeadingLevel.HEADING_2;
    paragraphs.push(new Paragraph({ text, heading: headingLevel as any }));
  };
  const pushText = (text: string) => {
    paragraphs.push(new Paragraph({ children: [new TextRun(text)] }));
  };

  if (content.title) pushHeading(content.title, HeadingLevel.HEADING_1);
  if (content.subject) pushText(`Předmět: ${content.subject}`);
  if (content.grade_level || content.gradeLevel) pushText(`Ročník: ${content.grade_level || content.gradeLevel}`);
  if (content.duration) pushText(`Délka: ${content.duration}`);

  if (content.instructions) {
    pushHeading('Instrukce');
    pushText(content.instructions);
  }

  if (Array.isArray(content.objectives)) {
    pushHeading('Cíle');
    content.objectives.forEach((o: string) => pushText(`• ${o}`));
  }

  if (Array.isArray(content.materials)) {
    pushHeading('Materiály');
    content.materials.forEach((m: string) => pushText(`• ${m}`));
  }

  if (Array.isArray(content.activities)) {
    pushHeading('Aktivity');
    content.activities.forEach((a: any, idx: number) => {
      pushText(`${idx + 1}. ${a.name}`);
      if (a.description) pushText(a.description);
      if (Array.isArray(a.steps)) a.steps.forEach((s: string, i: number) => pushText(`   ${i + 1}) ${s}`));
      if (a.time) pushText(`Čas: ${a.time}`);
    });
  }

  const questions = Array.isArray(content.questions)
    ? content.questions
    : Array.isArray(content.problems)
    ? content.problems.map((p: any) => ({ question: p.question || p.problem, answer: p.answer }))
    : [];

  if (questions.length > 0) {
    pushHeading('Otázky');
    questions.forEach((q: any, i: number) => {
      pushText(`${i + 1}. ${q.question || q.problem}`);
      if (Array.isArray(q.options)) q.options.forEach((opt: string) => pushText(`   - ${opt}`));
      if (includeAnswers && q.answer !== undefined) pushText(`   Odpověď: ${String(q.answer)}`);
    });
  }

  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  link.click();
  URL.revokeObjectURL(link.href);
}


