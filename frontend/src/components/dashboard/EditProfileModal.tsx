import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { authService } from '../../services/authService';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import InputField from '../ui/InputField';

const profileSchema = z.object({
  first_name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  last_name: z.string().min(2, 'Příjmení musí mít alespoň 2 znaky'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Aktuální heslo je povinné'),
  new_password: z.string().min(8, 'Nové heslo musí mít alespoň 8 znaků'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Hesla se neshodují",
  path: ["confirm_password"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      await authService.updateProfile(data);
      updateUser(data);
      showToast({
        type: 'success',
        message: 'Profil byl úspěšně aktualizován',
        duration: 3000
      });
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      showToast({
        type: 'error',
        message: err.message || 'Nepodařilo se aktualizovat profil',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.changePassword(data.current_password, data.new_password);
      showToast({
        type: 'success',
        message: 'Heslo bylo úspěšně změněno',
        duration: 3000
      });
      passwordForm.reset();
    } catch (err: any) {
      showToast({
        type: 'error',
        message: err.message || 'Nepodařilo se změnit heslo',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upravit profil" size="lg">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Změnit heslo
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Jméno"
              placeholder="Vaše jméno"
              required
              error={profileForm.formState.errors.first_name?.message}
              {...profileForm.register('first_name')}
            />
            <InputField
              label="Příjmení"
              placeholder="Vaše příjmení"
              required
              error={profileForm.formState.errors.last_name?.message}
              {...profileForm.register('last_name')}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
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
              disabled={isLoading}
            >
              {isLoading ? 'Ukládání...' : 'Uložit změny'}
            </Button>
          </div>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <InputField
            label="Aktuální heslo"
            type="password"
            placeholder="Zadejte aktuální heslo"
            required
            error={passwordForm.formState.errors.current_password?.message}
            {...passwordForm.register('current_password')}
          />
          
          <InputField
            label="Nové heslo"
            type="password"
            placeholder="Minimálně 8 znaků"
            required
            error={passwordForm.formState.errors.new_password?.message}
            {...passwordForm.register('new_password')}
          />
          
          <InputField
            label="Potvrzení nového hesla"
            type="password"
            placeholder="Zopakujte nové heslo"
            required
            error={passwordForm.formState.errors.confirm_password?.message}
            {...passwordForm.register('confirm_password')}
          />
          
          <div className="flex justify-end space-x-3 pt-4">
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
              disabled={isLoading}
            >
              {isLoading ? 'Změna hesla...' : 'Změnit heslo'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditProfileModal; 