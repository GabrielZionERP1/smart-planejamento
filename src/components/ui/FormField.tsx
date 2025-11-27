import * as React from 'react';
import { cn } from '@/lib/ui/ui.helpers';
import { Label } from '@/components/ui/label';
import { Input, InputProps } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps extends InputProps {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
}

/**
 * FormField - Input com label e mensagens de erro/ajuda
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, helper, error, required, containerClassName, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || `field-${generatedId}`;

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <Label htmlFor={fieldId} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
            {label}
          </Label>
        )}
        <Input
          id={fieldId}
          ref={ref}
          error={error}
          className={className}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${fieldId}-error` : helper ? `${fieldId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <div
            id={`${fieldId}-error`}
            className="flex items-center gap-1.5 text-xs text-destructive"
            role="alert"
          >
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
        {helper && !error && (
          <p id={`${fieldId}-helper`} className="text-xs text-muted-foreground">
            {helper}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

interface TextareaFieldProps extends React.ComponentProps<typeof Textarea> {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
}

/**
 * TextareaField - Textarea com label e mensagens de erro/ajuda
 */
export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, helper, error, required, containerClassName, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || `field-${generatedId}`;

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <Label htmlFor={fieldId} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
            {label}
          </Label>
        )}
        <Textarea
          id={fieldId}
          ref={ref}
          className={className}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${fieldId}-error` : helper ? `${fieldId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <div
            id={`${fieldId}-error`}
            className="flex items-center gap-1.5 text-xs text-destructive"
            role="alert"
          >
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
        {helper && !error && (
          <p id={`${fieldId}-helper`} className="text-xs text-muted-foreground">
            {helper}
          </p>
        )}
      </div>
    );
  }
);
TextareaField.displayName = 'TextareaField';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
  options: Array<{ value: string; label: string }>;
}

/**
 * SelectField - Select com label e mensagens de erro/ajuda
 */
export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, helper, error, required, containerClassName, className, id, options, ...props }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || `field-${generatedId}`;

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <Label htmlFor={fieldId} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
            {label}
          </Label>
        )}
        <select
          id={fieldId}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${fieldId}-error` : helper ? `${fieldId}-helper` : undefined
          }
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <div
            id={`${fieldId}-error`}
            className="flex items-center gap-1.5 text-xs text-destructive"
            role="alert"
          >
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
        {helper && !error && (
          <p id={`${fieldId}-helper`} className="text-xs text-muted-foreground">
            {helper}
          </p>
        )}
      </div>
    );
  }
);
SelectField.displayName = 'SelectField';
