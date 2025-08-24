import jsPDF from 'jspdf';
import { registerCzechFonts } from './registerPdfFonts';
import html2canvas from 'html2canvas';

export interface ConversationExportData {
  title: string;
  messages: Array<{
    content: string;
    isUser: boolean;
    timestamp: string;
  }>;
  date: string;
}

export interface WorksheetExportData {
  title: string;
  instructions: string;
  questions: Array<{
    problem: string;
    answer: string;
  }>;
  date: string;
}

export class PDFExporter {
  private static formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private static formatTimestamp(timestamp: string): string {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static async exportConversation(data: ConversationExportData): Promise<void> {
    const doc = new jsPDF({ compress: true, putOnlyUsedFonts: true });
    const registered = await registerCzechFonts(doc as any);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Header
    doc.setFontSize(20);
    doc.setFont(registered ? 'Inter' : 'helvetica', registered ? 'bold' : 'bold');
    doc.text('Konverzace s AI Asistentem', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont(registered ? 'Inter' : 'helvetica', 'normal');
    doc.text(`Téma: ${data.title}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Datum: ${this.formatDate(data.date)}`, margin, yPosition);
    yPosition += 20;

    // Messages
    doc.setFontSize(14);
    doc.setFont(registered ? 'Inter' : 'helvetica', registered ? 'bold' : 'bold');
    doc.text('Průběh konverzace:', margin, yPosition);
    yPosition += 15;

    for (const message of data.messages) {
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        yPosition = margin;
      }

      // Message header
      doc.setFontSize(10);
      doc.setFont(registered ? 'Inter' : 'helvetica', 'bold');
      const sender = message.isUser ? 'Uživatel' : 'AI Asistent';
      const time = this.formatTimestamp(message.timestamp);
      doc.text(`${sender} - ${time}`, margin, yPosition);
      yPosition += 5;

      // Message content
      doc.setFontSize(10);
      doc.setFont(registered ? 'Inter' : 'helvetica', 'normal');
      
      // Split content into lines that fit the page width
      const lines = doc.splitTextToSize(message.content, contentWidth);
      
      for (const line of lines) {
        if (yPosition > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
      }
      
      yPosition += 10;
    }

    // Footer
    const pageCount = doc.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`Stránka ${i} z ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    // Save the PDF
    doc.save(`konverzace-${data.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportWorksheet(data: WorksheetExportData): Promise<void> {
    const doc = new jsPDF({ compress: true, putOnlyUsedFonts: true });
    const registered = await registerCzechFonts(doc as any);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Header
    doc.setFontSize(20);
    doc.setFont(registered ? 'Inter' : 'helvetica', 'bold');
    doc.text('Matematické cvičení', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(16);
    doc.text(data.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Instructions
    doc.setFontSize(12);
    doc.setFont(registered ? 'Inter' : 'helvetica', 'bold');
    doc.text('Instrukce:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(registered ? 'Inter' : 'helvetica', 'normal');
    const instructionLines = doc.splitTextToSize(data.instructions, contentWidth);
    for (const line of instructionLines) {
      doc.text(line, margin, yPosition, { baseline: 'alphabetic' });
      yPosition += 5;
    }
    yPosition += 15;

    // Questions
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Otázky:', margin, yPosition);
    yPosition += 15;

    for (let i = 0; i < data.questions.length; i++) {
      const question = data.questions[i];
      
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPosition = margin;
      }

      // Question number and problem
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Otázka ${i + 1}:`, margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const problemLines = doc.splitTextToSize(question.problem, contentWidth);
      for (const line of problemLines) {
        doc.text(line, margin, yPosition);
        yPosition += 5;
      }
      yPosition += 5;

      // Answer space
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Odpověď: _________________________________', margin, yPosition);
      yPosition += 15;

      // Add a line for the answer
      doc.line(margin, yPosition - 5, margin + 150, yPosition - 5);
      yPosition += 10;
    }

    // Footer with date
    yPosition += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Vytvořeno: ${this.formatDate(data.date)}`, margin, yPosition);

    // Page numbers
    const pageCount = doc.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`Stránka ${i} z ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    // Save the PDF
    doc.save(`cviceni-${data.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportElementAsPDF(element: HTMLElement, filename: string): Promise<void> {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF();
      await registerCzechFonts(doc as any);
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit the image on the page
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If image is taller than page, split into multiple pages
      if (imgHeight <= pageHeight - 20) {
        doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;
        let position = 10;
        
        while (heightLeft > 0) {
          doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= (pageHeight - 20);
          
          if (heightLeft > 0) {
            doc.addPage();
            position = heightLeft - imgHeight;
          }
        }
      }
      
      doc.save(filename);
    } catch (error) {
      console.error('Error exporting element as PDF:', error);
      throw new Error('Nepodařilo se exportovat do PDF');
    }
  }
}
