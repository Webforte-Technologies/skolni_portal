import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui';
import TeacherForm from './TeacherForm';
import { teacherService, CreateTeacherRequest } from '../../services/teacherService';
import { errorToMessage } from '../../services/apiClient';

interface TeacherCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TeacherCreateModal: React.FC<TeacherCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateTeacherRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      await teacherService.createTeacher(data);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create teacher:', err);
      setError(errorToMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Přidat nového učitele
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Modal content */}
          <div className="px-6 py-4">
            <TeacherForm
              onSubmit={handleSubmit}
              onCancel={handleClose}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCreateModal;
