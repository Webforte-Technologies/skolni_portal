import React from 'react';
import { useForm } from 'react-hook-form';
import InputField from './InputField';
import ResponsiveForm from './ResponsiveForm';
import ResponsiveFormGroup from './ResponsiveFormGroup';
import Button from './Button';
import { ResponsiveFormProvider } from '../../contexts/ResponsiveFormContext';
import { useResponsive } from '../../hooks/useViewport';

interface TestFormData {
  firstName: string;
  lastName: string;
  email: string;
}

const ResponsiveFormTest: React.FC = () => {
  const { isMobile, isTablet, breakpoint } = useResponsive();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestFormData>();

  const onSubmit = (data: TestFormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <ResponsiveFormProvider>
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Responsive Form Test</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current breakpoint: <span className="font-mono">{breakpoint}</span>
            {isMobile && ' (Mobile)'}
            {isTablet && ' (Tablet)'}
          </p>
        </div>

        <ResponsiveForm onSubmit={handleSubmit(onSubmit)}>
          <ResponsiveFormGroup 
            title="Personal Information"
            columns={2}
            stackOnMobile={true}
          >
            <InputField
              label="First Name"
              placeholder="Your first name"
              required
              error={errors.firstName?.message}
              touchOptimized={true}
              preventZoom={true}
              {...register('firstName', { required: 'First name is required' })}
            />

            <InputField
              label="Last Name"
              placeholder="Your last name"
              required
              error={errors.lastName?.message}
              touchOptimized={true}
              preventZoom={true}
              {...register('lastName', { required: 'Last name is required' })}
            />
          </ResponsiveFormGroup>

          <InputField
            label="Email"
            type="email"
            placeholder="your@email.com"
            required
            error={errors.email?.message}
            touchOptimized={true}
            preventZoom={true}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />

          <Button type="submit" className="w-full">
            Submit Test Form
          </Button>
        </ResponsiveForm>
      </div>
    </ResponsiveFormProvider>
  );
};

export default ResponsiveFormTest;