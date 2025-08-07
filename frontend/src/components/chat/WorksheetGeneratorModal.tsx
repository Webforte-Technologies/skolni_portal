import React, { useState } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import InputField from '../ui/InputField';

interface WorksheetGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (topic: string) => Promise<void>;
  isLoading: boolean;
}

const WorksheetGeneratorModal: React.FC<WorksheetGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isLoading
}) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      await onGenerate(topic.trim());
      setTopic('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-floating max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Vygenerovat cvičení
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <InputField
              label="Téma cvičení"
              name="topic"
              placeholder="Např. Kvadratické rovnice, Derivace, Integrály..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              disabled={isLoading}
            />
            <p className="text-sm text-neutral-500 mt-2">
              Zadejte téma, na které chcete vygenerovat cvičení. AI vytvoří 10 různých otázek s odpověďmi.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              <span className="font-medium">Cena:</span> 2 kredity
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Zrušit
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generuji...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>Vygenerovat</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorksheetGeneratorModal; 