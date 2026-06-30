import React, { createContext, useContext, useMemo, useState } from 'react';
import { cn } from '@frontend-team/ui-kit';

type FormValues = Record<string, unknown>;
type FieldElement = React.ReactElement<Record<string, unknown>>;

export interface CompatFormInstance {
  setFieldsValue: (values: object) => void;
  getFieldsValue: <T extends object = Record<string, never>>() => T;
  resetFields: () => void;
  validateFields: <T extends object = Record<string, never>>() => Promise<T>;
  setFieldValue: (name: string, value: unknown) => void;
  submit: () => void;
  subscribe: (listener: () => void) => () => void;
}

const createForm = (): CompatFormInstance => {
  let values: FormValues = {};
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  return {
    setFieldsValue: (next) => { values = { ...values, ...next }; notify(); },
    getFieldsValue: <T extends object = Record<string, never>>() => values as T,
    resetFields: () => { values = {}; notify(); },
    validateFields: <T extends object = Record<string, never>>() => Promise.resolve(values as T),
    setFieldValue: (name, value) => { values = { ...values, [name]: value }; notify(); },
    submit: () => undefined,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
  };
};

const FormContext = createContext<CompatFormInstance | null>(null);

interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onFinish'> {
  form?: CompatFormInstance;
  layout?: 'vertical' | 'horizontal';
  initialValues?: FormValues;
  onFinish?: (values: FormValues) => void;
  size?: string;
}

function FormRoot({ form, initialValues, onFinish, className, children, ...props }: FormProps) {
  const baseForm = useMemo(() => form ?? createForm(), [form]);
  React.useEffect(() => {
    if (initialValues) baseForm.setFieldsValue(initialValues);
  }, [initialValues, baseForm]);
  const localForm = useMemo<CompatFormInstance>(() => ({
    ...baseForm,
    submit: () => onFinish?.(baseForm.getFieldsValue()),
  }), [baseForm, onFinish]);

  return (
    <FormContext.Provider value={localForm}>
      <form
        className={cn('space-y-4', className)}
        onSubmit={(event) => {
          event.preventDefault();
          onFinish?.(localForm.getFieldsValue());
        }}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  label?: React.ReactNode;
  required?: boolean;
  rules?: { required?: boolean; message?: string; type?: string; min?: number; max?: number }[];
  initialValue?: unknown;
}

function FormItem({ name, label, required, rules, children, className, ...props }: FormItemProps) {
  const form = useContext(FormContext);
  const [, forceRender] = useState(0);
  React.useEffect(() => form?.subscribe(() => forceRender((value) => value + 1)), [form]);
  const isRequired = required || rules?.some((rule) => rule.required);

  const child = React.isValidElement(children) && name && form
    ? React.cloneElement(children as FieldElement, {
        value: form.getFieldsValue()[name],
        onChange: (eventOrValue: unknown) => {
          const nextValue = eventOrValue && typeof eventOrValue === 'object' && 'target' in eventOrValue
            ? (eventOrValue as { target: { value?: unknown; checked?: unknown } }).target.value ?? (eventOrValue as { target: { checked?: unknown } }).target.checked
            : eventOrValue;
          form.setFieldValue(name, nextValue);
          const original = (children as FieldElement).props.onChange;
          if (typeof original === 'function') original(eventOrValue);
        },
      })
    : children;

  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      {label && <label className="body_s font-semibold text_secondary">{label}{isRequired && <span className="fg_error"> *</span>}</label>}
      {child}
    </div>
  );
}

export const Form = Object.assign(FormRoot, {
  Item: FormItem,
  useForm: () => [useMemo(() => createForm(), [])] as [CompatFormInstance],
});
