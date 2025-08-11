import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import { AlertCircle, Loader2, Building2, UserPlus } from 'lucide-react';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  school_name: z.string().min(2),
  city: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  admin_email: z.string().email(),
  admin_first_name: z.string().min(2),
  admin_last_name: z.string().min(2),
  admin_password: z.string().min(8)
});

type FormData = z.infer<typeof schema>;

const SchoolRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      await authService.registerSchool({
        school: {
          name: data.school_name,
          city: data.city,
          address: data.address,
          postal_code: data.postal_code,
          contact_email: data.admin_email
        },
        admin: {
          email: data.admin_email,
          first_name: data.admin_first_name,
          last_name: data.admin_last_name,
          password: data.admin_password
        }
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registrace školy se nezdařila');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 dark:bg-neutral-800 rounded-full">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              EduAI-Asistent
            </h1>
            <p className="text-gray-600 dark:text-neutral-300 mt-2">
              Registrace školy
            </p>
          </div>
        </div>

        {/* School Registration Form */}
        <Card title="Registrace školy" className="shadow-lg border-0">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold dark:text-neutral-100">Registrace školy</h2>
            <p className="text-gray-600 dark:text-neutral-300 mt-2">Vyplňte údaje školy a administrátora</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
              </div>
            )}

            {/* School Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 border-b border-gray-200 dark:border-neutral-700 pb-2">
                Informace o škole
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Název školy"
                  placeholder="Základní škola..."
                  required
                  error={errors.school_name?.message}
                  {...register('school_name')}
                />

                <InputField
                  label="Město"
                  placeholder="Praha"
                  error={errors.city?.message}
                  {...register('city')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Adresa"
                  placeholder="Náměstí Republiky 1"
                  error={errors.address?.message}
                  {...register('address')}
                />

                <InputField
                  label="PSČ"
                  placeholder="110 00"
                  error={errors.postal_code?.message}
                  {...register('postal_code')}
                />
              </div>
            </div>

            {/* Administrator Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 border-b border-gray-200 dark:border-neutral-700 pb-2">
                Údaje administrátora
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Jméno"
                  placeholder="Jan"
                  required
                  error={errors.admin_first_name?.message}
                  {...register('admin_first_name')}
                />

                <InputField
                  label="Příjmení"
                  placeholder="Novák"
                  required
                  error={errors.admin_last_name?.message}
                  {...register('admin_last_name')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Email"
                  type="email"
                  placeholder="admin@skola.cz"
                  required
                  error={errors.admin_email?.message}
                  {...register('admin_email')}
                />

                <InputField
                  label="Heslo"
                  type="password"
                  placeholder="Minimálně 8 znaků"
                  required
                  error={errors.admin_password?.message}
                  {...register('admin_password')}
                />
              </div>
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
                  Vytváření školy...
                </>
              ) : (
                'Založit školu'
              )}
            </Button>
          </form>

          <div className="mt-6">
            <hr className="my-4 border-gray-200 dark:border-neutral-700" />
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
                Už máte účet?
              </p>
              <Button variant="outline" className="w-full">
                <Link to="/login">
                  Přihlásit se
                </Link>
              </Button>
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-neutral-400 mb-2">
                  Nebo se zaregistrujte jako jednotlivec:
                </p>
                <Button variant="secondary" className="w-full">
                  <Link to="/register" className="inline-flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" /> Registrovat jako učitel
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            © 2025 EduAI-Asistent. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchoolRegistrationPage;



