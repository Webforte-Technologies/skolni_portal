import React from 'react';
import { FileText, Printer, X, CheckCircle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Button from '../ui/Button';

interface Question {
  problem: string;
  answer: string;
}

interface Worksheet {
  title: string;
  instructions: string;
  questions: Question[];
}

interface WorksheetDisplayProps {
  worksheet: Worksheet;
  onClose: () => void;
}

const WorksheetDisplay: React.FC<WorksheetDisplayProps> = ({ worksheet, onClose }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('worksheet-print');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const worksheetElement = document.getElementById('worksheet-print');
      if (!worksheetElement) {
        console.error('Worksheet element not found');
        return;
      }

      // Create a clone of the element to avoid modifying the original
      const clonedElement = worksheetElement.cloneNode(true) as HTMLElement;
      
      // Style the cloned element for PDF generation
      clonedElement.style.backgroundColor = 'white';
      clonedElement.style.padding = '20px';
      clonedElement.style.margin = '0';
      clonedElement.style.width = '800px';
      clonedElement.style.fontFamily = 'Arial, sans-serif';
      clonedElement.style.fontSize = '12px';
      clonedElement.style.lineHeight = '1.4';
      
      // Temporarily add to document
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';
      document.body.appendChild(clonedElement);

      // Convert to canvas
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: clonedElement.scrollHeight
      });

      // Remove the cloned element
      document.body.removeChild(clonedElement);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `${worksheet.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Chyba při generování PDF. Zkuste to znovu.');
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-floating max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-neutral-900">
              Vygenerované cvičení
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              className="flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Tisk</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2"
              data-pdf-download
            >
              <Download className="h-4 w-4" />
              <span>PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div id="worksheet-print" className="space-y-6">
            {/* Header */}
            <div className="text-center border-b border-neutral-200 pb-4">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {worksheet.title}
              </h1>
              <p className="text-lg text-neutral-600">
                {worksheet.instructions}
              </p>
              <div className="mt-4 text-sm text-neutral-500">
                Datum: {new Date().toLocaleDateString('cs-CZ')}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {worksheet.questions.map((question, index) => (
                <div key={index} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-medium text-neutral-900 mb-2">
                          Zadání:
                        </h3>
                        <p className="text-neutral-700 whitespace-pre-wrap">
                          {question.problem}
                        </p>
                      </div>
                      <div className="border-t border-neutral-100 pt-3">
                        <h4 className="font-medium text-neutral-900 mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                          Řešení:
                        </h4>
                        <p className="text-neutral-700 whitespace-pre-wrap">
                          {question.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-200 pt-4 text-center text-sm text-neutral-500">
              <p>Vygenerováno pomocí EduAI-Asistent</p>
              <p>© 2025 EduAI-Asistent. Všechna práva vyhrazena.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetDisplay; 