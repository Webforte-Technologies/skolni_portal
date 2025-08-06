import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import { AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Zadejte platný email'),
  password: z.string().min(8, 'Heslo musí mít alespoň 8 znaků'),
  confirmPassword: z.string(),
  first_name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  last_name: z.string().min(2, 'Příjmení musí mít alespoň 2 znaky'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hesla se neshodují",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegistrationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registrace se nezdařila');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            EduAI-Asistent
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Vytvořte si nový účet
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Jméno"
                placeholder="Vaše jméno"
                required
                error={errors.first_name?.message}
                {...register('first_name')}
              />

              <InputField
                label="Příjmení"
                placeholder="Vaše příjmení"
                required
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <InputField
              label="Email"
              type="email"
              placeholder="vas@email.cz"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <InputField
              label="Heslo"
              type="password"
              placeholder="Minimálně 8 znaků"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            <InputField
              label="Potvrzení hesla"
              type="password"
              placeholder="Zopakujte heslo"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Vytváření účtu...' : 'Vytvořit účet'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Už máte účet?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Přihlásit se
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage; 