import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { errorToMessage } from '../../services/apiClient';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { AlertCircle, Loader2, BookOpen } from 'lucide-react';
import InputField from '../../components/ui/InputField';
import ResponsiveForm from '../../components/ui/ResponsiveForm';
import { ResponsiveFormProvider } from '../../contexts/ResponsiveFormContext';

const loginSchema = z.object({
  email: z.string().email('Zadejte platný email'),
  password: z.string().min(1, 'Heslo je povinné'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const authResponse = await login(data.email, data.password);
      
      // Role-based redirection
      if (authResponse.user.role === 'platform_admin') {
        navigate('/admin/dashboard');
      } else if (authResponse.user.role === 'school_admin') {
        navigate('/school');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(errorToMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveFormProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              <div className="p-3 sm:p-4 bg-blue-100 dark:bg-neutral-800 rounded-full">
                <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
                EduAI-Asistent
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-300">
                Přihlaste se do svého účtu
              </p>
            </div>
          </div>

          {/* Login Form */}
          <Card title="Přihlášení" className="shadow-lg border-0 p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold dark:text-neutral-100">Přihlášení</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-neutral-300 mt-2">Zadejte své přihlašovací údaje</p>
            </div>
            
            <ResponsiveForm onSubmit={handleSubmit(onSubmit)} singleColumnOnMobile={true} forceSingleColumn={true}>
              {error && (
                <div className="flex items-start space-x-3 p-4 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 sm:h-4 sm:w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-sm sm:text-sm text-red-600 dark:text-red-400 leading-relaxed">{error}</span>
                </div>
              )}

              <InputField
                label="Email"
                type="email"
                placeholder="vas@email.cz"
                required
                error={errors.email?.message}
                touchOptimized={true}
                preventZoom={true}
                autoComplete="email"
                {...register('email')}
              />

              <InputField
                label="Heslo"
                type="password"
                placeholder="Vaše heslo"
                required
                error={errors.password?.message}
                touchOptimized={true}
                preventZoom={true}
                autoComplete="current-password"
                {...register('password')}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Přihlašování...
                  </>
                ) : (
                  'Přihlásit se'
                )}
              </Button>
            </ResponsiveForm>

            <div className="mt-6 sm:mt-8">
              <hr className="my-4 sm:my-6 border-gray-200 dark:border-neutral-700" />
              <div className="text-center space-y-4">
                <p className="text-sm sm:text-base text-gray-500 dark:text-neutral-400">
                  Nemáte účet?
                </p>
                <Button variant="outline" className="w-full" size="lg">
                  <Link to="/register" className="w-full">
                    Vytvořit nový účet
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center px-4">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400">
              © 2025 EduAI-Asistent. Všechna práva vyhrazena.
            </p>
          </div>
        </div>
      </div>
    </ResponsiveFormProvider>
  );
};

export default LoginPage; 