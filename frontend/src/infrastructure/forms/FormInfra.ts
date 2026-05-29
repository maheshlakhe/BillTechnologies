import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType } from 'zod';

/**
 * Infrastructure layer for Frontend Forms
 * Standardizes form handling, validation, and submission logic
 */
export interface FormInfraConfig<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => Promise<void>;
}

export const useFormInfra = <T extends FieldValues>(config: FormInfraConfig<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(config.schema as any),
    defaultValues: config.defaultValues,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await config.onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle error via infrastructure (e.g., toast notification)
    }
  });

  return {
    form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
};
