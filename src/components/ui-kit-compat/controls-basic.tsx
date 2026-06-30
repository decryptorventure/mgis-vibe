import React from 'react';
import {
  Button as UiButton,
  Input as UiInput,
  Textarea as UiTextarea,
  cn,
} from '@frontend-team/ui-kit';

type AntSize = 'small' | 'middle' | 'large' | 'default';
type ButtonType = 'primary' | 'default' | 'dashed' | 'link' | 'text';

const mapSize = (size?: AntSize) => (size === 'small' ? 's' : size === 'large' ? 'l' : 'm');

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: ButtonType;
  htmlType?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  icon?: React.ReactNode;
  danger?: boolean;
  loading?: boolean;
  size?: AntSize;
  block?: boolean;
  shape?: 'circle' | 'round' | 'default';
}

export function Button({ type, htmlType = 'button', icon, danger, loading, size, block, shape, className, children, ...props }: ButtonProps) {
  const variant = danger ? 'danger' : type === 'primary' ? 'primary' : type === 'link' || type === 'text' ? 'subtle' : type === 'dashed' ? 'border' : 'dim';
  const isIconOnly = !children && icon;
  return (
    <UiButton
      type={htmlType}
      variant={variant}
      size={isIconOnly ? `icon-${mapSize(size)}` : mapSize(size)}
      loading={loading}
      className={cn(block && 'w-full', shape === 'circle' && 'radius_round', className)}
      {...props}
    >
      {icon}
      {children}
    </UiButton>
  );
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: AntSize;
  allowClear?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  onPressEnter?: () => void;
}

function InputRoot({ size, allowClear: _allowClear, prefix, suffix, addonBefore, onPressEnter, className, onKeyDown, ...props }: InputProps) {
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') onPressEnter?.();
    onKeyDown?.(event);
  };
  if (!prefix && !suffix && !addonBefore) return <UiInput size={mapSize(size)} variant="dim" className={className} onKeyDown={handleKeyDown} {...props} />;
  return (
    <span className={cn('flex items-center gap-2 rounded-md bg_input_fill_dim px-3', className)}>
      {addonBefore && <span className="body_xs text_tertiary">{addonBefore}</span>}
      {prefix}
      <UiInput size={mapSize(size)} variant="borderless" className="min-w-0 flex-1" onKeyDown={handleKeyDown} {...props} />
      {suffix}
    </span>
  );
}

function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <UiTextarea className={cn('min-h-20', className)} {...props} />;
}

function Password(props: InputProps) {
  return <InputRoot {...props} type="password" />;
}

export const Input = Object.assign(InputRoot, { TextArea, Password });

interface InputNumberProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'value'> {
  value?: number | null;
  size?: AntSize;
  min?: number;
  max?: number;
  step?: number;
  formatter?: (value: number | string | undefined) => string;
  parser?: (value: string | undefined) => number;
  onChange?: (value: number | null) => void;
  precision?: number;
  addonAfter?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function InputNumber({ value, onChange, formatter, parser, size, className, addonAfter, suffix, ...props }: InputNumberProps) {
  const displayValue = formatter ? formatter(value ?? undefined) : value ?? '';
  const input = (
    <UiInput
      type={formatter ? 'text' : 'number'}
      value={displayValue}
      size={mapSize(size)}
      variant="dim"
      className={className}
      onChange={(event) => {
        const rawValue = event.target.value;
        const parsed = parser ? parser(rawValue) : Number(rawValue);
        onChange?.(Number.isFinite(parsed) ? parsed : null);
      }}
      {...props}
    />
  );
  if (!addonAfter && !suffix) return input;
  return <span className="flex items-center gap-2">{input}<span className="body_xs text_tertiary">{addonAfter ?? suffix}</span></span>;
}

export type { AntSize };
