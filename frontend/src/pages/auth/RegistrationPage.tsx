import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { errorToMessage } from '../../services/apiClient';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { AlertCircle, Loader2, UserPlus, Building2 } from 'lucide-react';
import InputField from '../../components/ui/InputField';
import ResponsiveForm from '../../components/ui/ResponsiveForm';
import ResponsiveFormGroup from '../../components/ui/ResponsiveFormGroup';
import { ResponsiveFormProvider } from '../../contexts/ResponsiveFormContext';

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
              <UserPlus className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              EduAI-Asistent
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-300">
              Vytvořte si nový účet
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <Card title="Registrace" className="shadow-lg border-0 p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold dark:text-neutral-100">Registrace</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-neutral-300 mt-2">Vyplňte údaje pro vytvoření účtu</p>
          </div>
          
          <ResponsiveForm onSubmit={handleSubmit(onSubmit)} singleColumnOnMobile={true} forceSingleColumn={true}>
            {error && (
              <div className="flex items-start space-x-3 p-4 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 sm:h-4 sm:w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-sm sm:text-sm text-red-600 dark:text-red-400 leading-relaxed">{error}</span>
              </div>
            )}

            <ResponsiveFormGroup 
              columns={1} 
              stackOnMobile={true}
              title="Osobní údaje"
            >
              <InputField
                label="Jméno"
                placeholder="Vaše jméno"
                required
                error={errors.first_name?.message}
                touchOptimized={true}
                preventZoom={true}
                autoComplete="given-name"
                {...register('first_name')}
              />

              <InputField
                label="Příjmení"
                placeholder="Vaše příjmení"
                required
                error={errors.last_name?.message}
                touchOptimized={true}
                preventZoom={true}
                autoComplete="family-name"
                {...register('last_name')}
              />
            </ResponsiveFormGroup>

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

            <ResponsiveFormGroup 
              columns={1} 
              title="Zabezpečení"
              description="Heslo musí mít alespoň 8 znaků"
            >
              <InputField
                label="Heslo"
                type="password"
                placeholder="Minimálně 8 znaků"
                required
                error={errors.password?.message}
                touchOptimized={true}
                preventZoom={true}
                autoComplete="new-password"
                {...register('password')}
              />

              <InputField
                label="Potvrzení hesla"
                type="password"
                placeholder="Zopakujte heslo"
                required
                error={errors.confirmPassword?.message}
                touchOptimized={true}
                preventZoom={true}
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
            </ResponsiveFormGroup>

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
          </ResponsiveForm>

          <div className="mt-6 sm:mt-8">
            <hr className="my-4 sm:my-6 border-gray-200 dark:border-neutral-700" />
            <div className="text-center space-y-4">
              <p className="text-sm sm:text-base text-gray-500 dark:text-neutral-400">
                Už máte účet?
              </p>
              <Button variant="outline" className="w-full" size="lg">
                <Link to="/login" className="w-full">
                  Přihlásit se
                </Link>
              </Button>
              <div className="mt-6 space-y-4">
                <p className="text-sm sm:text-base text-gray-500 dark:text-neutral-400">Jste škola? Založte školní účet:</p>
                <Button variant="secondary" className="w-full" size="lg">
                  <Link to="/register-school" className="inline-flex items-center justify-center w-full">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Registrovat školu
                  </Link>
                </Button>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
                    <span className="font-medium">Vyzkoušet demo bez registrace:</span><br />
                    Přihlaste se jako <span className="font-mono bg-white dark:bg-neutral-800 px-1 rounded">admin@eduai.cz</span> / <span className="font-mono bg-white dark:bg-neutral-800 px-1 rounded">admin123</span> (školní admin)<br />
                    nebo <span className="font-mono bg-white dark:bg-neutral-800 px-1 rounded">teacher@eduai.cz</span> / <span className="font-mono bg-white dark:bg-neutral-800 px-1 rounded">teacher123</span> (učitel)
                  </p>
                </div>
              </div>
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

export default RegistrationPage; 