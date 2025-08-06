import React from 'react';
import { FileText, Printer, X, CheckCircle } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
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
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div id="worksheet-print" className="space-y-6">
            {/* Header */}
            <div className="text-center border-b border-gray-200 pb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {worksheet.title}
              </h1>
              <p className="text-lg text-gray-600">
                {worksheet.instructions}
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Datum: {new Date().toLocaleDateString('cs-CZ')}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {worksheet.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Zadání:
                        </h3>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {question.problem}
                        </p>
                      </div>
                      <div className="border-t border-gray-100 pt-3">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Řešení:
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {question.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
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