import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InputField from './InputField';
import ResponsiveTextArea from './ResponsiveTextArea';
import ResponsiveForm from './ResponsiveForm';
import ResponsiveFormGroup from './ResponsiveFormGroup';
import Button from './Button';
import Card from './Card';
import { ResponsiveFormProvider } from '../../contexts/ResponsiveFormContext';
import { useResponsive } from '../../hooks/useViewport';
import { Mail, Phone, User, MapPin } from 'lucide-react';

const showcaseSchema = z.object({
  firstName: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  lastName: z.string().min(2, 'Příjmení musí mít alespoň 2 znaky'),
  email: z.string().email('Zadejte platný email'),
  phone: z.string().min(9, 'Zadejte platné telefonní číslo'),
  address: z.string().min(5, 'Zadejte platnou adresu'),
  city: z.string().min(2, 'Zadejte město'),
  postalCode: z.string().min(5, 'Zadejte PSČ'),
  message: z.string().min(10, 'Zpráva musí mít alespoň 10 znaků'),
});

type ShowcaseFormData = z.infer<typeof showcaseSchema>;

const ResponsiveFormShowcase: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const { isMobile, isTablet, breakpoint } = useResponsive();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ShowcaseFormData>({
    resolver: zodResolver(showcaseSchema),
  });

  const onSubmit = async (data: ShowcaseFormData) => {
    setIsSubmitting(true);
    setSubmitMessage('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Form data:', data);
    setSubmitMessage('Formulář byl úspěšně odeslán!');
    setIsSubmitting(false);
    
    // Reset form after successful submission
    setTimeout(() => {
      reset();
      setSubmitMessage('');
    }, 3000);
  };

  return (
    <ResponsiveFormProvider>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Viewport Info */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Responsive Form Showcase
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              Aktuální breakpoint: <span className="font-mono font-bold">{breakpoint}</span>
              {isMobile && ' (Mobilní zobrazení)'}
              {isTablet && ' (Tabletové zobrazení)'}
            </p>
          </div>
        </Card>

        {/* Main Form */}
        <Card title="Kontaktní formulář" className="shadow-lg">
          <ResponsiveForm onSubmit={handleSubmit(onSubmit)} singleColumnOnMobile={true}>
            {submitMessage && (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-green-800 dark:text-green-200 text-center font-medium">
                  {submitMessage}
                </p>
              </div>
            )}

            {/* Personal Information */}
            <ResponsiveFormGroup 
              title="Osobní údaje" 
              description="Základní informace o vás"
              columns={2}
              stackOnMobile={true}
            >
              <InputField
                label="Jméno"
                placeholder="Vaše jméno"
                required
                error={errors.firstName?.message}
                leadingIcon={<User className="w-4 h-4" />}
                touchOptimized={true}
                preventZoom={true}
                autoComplete="given-name"
                {...register('firstName')}
              />

              <InputField
                label="Příjmení"
                placeholder="Vaše příjmení"
                required
                error={errors.lastName?.message}
                leadingIcon={<User className="w-4 h-4" />}
                touchOptimized={true}
                preventZoom={true}
                autoComplete="family-name"
                {...register('lastName')}
              />
            </ResponsiveFormGroup>

            {/* Contact Information */}
            <ResponsiveFormGroup 
              title="Kontaktní údaje" 
              description="Jak vás můžeme kontaktovat"
              columns={2}
              stackOnMobile={true}
            >
              <InputField
                label="Email"
                type="email"
                placeholder="vas@email.cz"
                required
                error={errors.email?.message}
                leadingIcon={<Mail className="w-4 h-4" />}
                touchOptimized={true}
                preventZoom={true}
                autoComplete="email"
                {...register('email')}
              />

              <InputField
                label="Telefon"
                type="tel"
                placeholder="+420 123 456 789"
                required
                error={errors.phone?.message}
                leadingIcon={<Phone className="w-4 h-4" />}
                touchOptimized={true}
                preventZoom={true}
                autoComplete="tel"
                {...register('phone')}
              />
            </ResponsiveFormGroup>

            {/* Address Information */}
            <ResponsiveFormGroup 
              title="Adresa" 
              description="Vaše kontaktní adresa"
              columns={3}
              stackOnMobile={true}
            >
              <div className="col-span-2">
                <InputField
                  label="Ulice a číslo popisné"
                  placeholder="Václavské náměstí 1"
                  required
                  error={errors.address?.message}
                  leadingIcon={<MapPin className="w-4 h-4" />}
                  touchOptimized={true}
                  preventZoom={true}
                  autoComplete="street-address"
                  {...register('address')}
                />
              </div>

              <InputField
                label="Město"
                placeholder="Praha"
                required
                error={errors.city?.message}
                touchOptimized={true}
                preventZoom={true}
                autoComplete="address-level2"
                {...register('city')}
              />

              <InputField
                label="PSČ"
                placeholder="110 00"
                required
                error={errors.postalCode?.message}
                touchOptimized={true}
                preventZoom={true}
                autoComplete="postal-code"
                {...register('postalCode')}
              />
            </ResponsiveFormGroup>

            {/* Message */}
            <ResponsiveFormGroup title="Zpráva">
              <ResponsiveTextArea
                label="Vaše zpráva"
                placeholder="Napište nám, jak vám můžeme pomoci..."
                required
                error={errors.message?.message}
                rows={isMobile ? 4 : 6}
                autoResize={true}
                preventZoom={true}
                {...register('message')}
              />
            </ResponsiveFormGroup>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Odesílání...' : 'Odeslat formulář'}
              </Button>
            </div>
          </ResponsiveForm>
        </Card>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold">Touch Optimized</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Minimální velikost 44px pro všechny dotykové prvky
              </p>
            </div>
          </Card>

          <Card className="text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold">Responsive Layout</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatické přepínání mezi jednosloupcovým a vícesloupcovým layoutem
              </p>
            </div>
          </Card>

          <Card className="text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold">Keyboard Handling</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Prevence zoomování a optimalizace pro mobilní klávesnice
              </p>
            </div>
          </Card>
        </div>
      </div>
    </ResponsiveFormProvider>
  );
};

export default ResponsiveFormShowcase;