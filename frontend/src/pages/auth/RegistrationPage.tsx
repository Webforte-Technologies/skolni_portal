import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { AlertCircle, Loader2, BookOpen, UserPlus, Building2 } from 'lucide-react';
import { cn } from '../../utils/cn';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              EduAI-Asistent
            </h1>
            <p className="text-gray-600 mt-2">
              Vytvořte si nový účet
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <Card title="Registrace" className="shadow-lg border-0">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold">Registrace</h2>
            <p className="text-gray-600 mt-2">Vyplňte údaje pro vytvoření účtu</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
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
              <div className="space-y-2">
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Jméno</label>
                <input
                  id="first_name"
                  placeholder="Vaše jméno"
                  className={cn(
                    "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                    errors.first_name && "border-red-300 focus:ring-red-500 focus:border-red-500"
                  )}
                  {...register('first_name')}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <InputField
                label="Příjmení"
                placeholder="Vaše příjmení"
                required
                error={errors.last_name?.message}
                {...register('last_name')}
              />
              <div className="space-y-2">
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Příjmení</label>
                <input
                  id="last_name"
                  placeholder="Vaše příjmení"
                  className={cn(
                    "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                    errors.last_name && "border-red-300 focus:ring-red-500 focus:border-red-500"
                  )}
                  {...register('last_name')}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <InputField
              label="Email"
              type="email"
              placeholder="vas@email.cz"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                placeholder="vas@email.cz"
                className={cn(
                  "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
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
              placeholder="Minimálně 8 znaků"
              required
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Heslo</label>
              <input
                id="password"
                type="password"
                placeholder="Minimálně 8 znaků"
                className={cn(
                  "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                  errors.password && "border-red-300 focus:ring-red-500 focus:border-red-500"
                )}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <InputField
              label="Potvrzení hesla"
              type="password"
              placeholder="Zopakujte heslo"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Potvrzení hesla</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Zopakujte heslo"
                className={cn(
                  "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                  errors.confirmPassword && "border-red-300 focus:ring-red-500 focus:border-red-500"
                )}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
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
                  Vytváření účtu...
                </>
              ) : (
                'Vytvořit účet'
              )}
            </Button>
          </form>

          <div className="mt-6">
            <hr className="my-4 border-gray-200" />
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Už máte účet?
              </p>
              <Button variant="outline" className="w-full">
                <Link to="/login">
                  Přihlásit se
                </Link>
              </Button>
              <div className="mt-6 space-y-3">
                <p className="text-sm text-gray-500">Jste škola? Založte školní účet:</p>
                <Button variant="secondary" className="w-full">
                  <Link to="/register-school" className="inline-flex items-center">
                    <Building2 className="h-4 w-4 mr-2" /> Registrovat školu
                  </Link>
                </Button>
                <p className="text-xs text-gray-500">Vyzkoušet demo bez registrace: přihlaste se jako <span className="font-mono">admin@eduai.cz</span> / <span className="font-mono">admin123</span> (školní admin) nebo <span className="font-mono">teacher@eduai.cz</span> / <span className="font-mono">teacher123</span> (učitel).</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 EduAI-Asistent. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage; 