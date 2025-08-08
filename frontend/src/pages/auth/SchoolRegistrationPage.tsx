import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
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
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card title="Registrace školy">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-neutral-600">Název školy</label>
                <input className="w-full border rounded px-3 py-2" {...register('school_name')} />
                {errors.school_name && <p className="text-sm text-red-600">{errors.school_name.message}</p>}
              </div>
              <div>
                <label className="text-sm text-neutral-600">Město</label>
                <input className="w-full border rounded px-3 py-2" {...register('city')} />
              </div>
              <div>
                <label className="text-sm text-neutral-600">Adresa</label>
                <input className="w-full border rounded px-3 py-2" {...register('address')} />
              </div>
              <div>
                <label className="text-sm text-neutral-600">PSČ</label>
                <input className="w-full border rounded px-3 py-2" {...register('postal_code')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-neutral-600">Email administrátora</label>
                <input className="w-full border rounded px-3 py-2" {...register('admin_email')} />
                {errors.admin_email && <p className="text-sm text-red-600">{errors.admin_email.message}</p>}
              </div>
              <div>
                <label className="text-sm text-neutral-600">Heslo administrátora</label>
                <input type="password" className="w-full border rounded px-3 py-2" {...register('admin_password')} />
                {errors.admin_password && <p className="text-sm text-red-600">{errors.admin_password.message}</p>}
              </div>
              <div>
                <label className="text-sm text-neutral-600">Jméno administrátora</label>
                <input className="w-full border rounded px-3 py-2" {...register('admin_first_name')} />
              </div>
              <div>
                <label className="text-sm text-neutral-600">Příjmení administrátora</label>
                <input className="w-full border rounded px-3 py-2" {...register('admin_last_name')} />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>{isLoading ? 'Vytváření…' : 'Založit školu'}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SchoolRegistrationPage;



