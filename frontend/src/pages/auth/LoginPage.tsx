import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { cn } from '../../utils/cn';
import InputField from '../../components/ui/InputField';

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
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Přihlášení se nezdařilo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 dark:bg-neutral-800 rounded-full">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              EduAI-Asistent
            </h1>
            <p className="text-gray-600 dark:text-neutral-300 mt-2">
              Přihlaste se do svého účtu
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card title="Přihlášení" className="shadow-lg border-0">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold dark:text-neutral-100">Přihlášení</h2>
            <p className="text-gray-600 dark:text-neutral-300 mt-2">Zadejte své přihlašovací údaje</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            <InputField
              label="Email"
              type="email"
              placeholder="vas@email.cz"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-neutral-200">Email</label>
              <input
                id="email"
                type="email"
                placeholder="vas@email.cz"
                className={cn(
                  "block w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm placeholder-gray-400 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                  errors.email && "border-red-300 focus:ring-red-500 focus:border-red-500"
                )}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <InputField
              label="Heslo"
              type="password"
              placeholder="Vaše heslo"
              required
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-neutral-200">Heslo</label>
              <input
                id="password"
                type="password"
                placeholder="Vaše heslo"
                className={cn(
                  "block w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm placeholder-gray-400 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                  errors.password && "border-red-300 focus:ring-red-500 focus:border-red-500"
                )}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

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
          </form>

          <div className="mt-6">
            <hr className="my-4 border-gray-200" />
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Nemáte účet?
              </p>
              <Button variant="outline" className="w-full">
                <Link to="/register">
                  Vytvořit nový účet
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-neutral-400">
            © 2024 EduAI-Asistent. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 