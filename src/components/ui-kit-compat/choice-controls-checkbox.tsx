// Checkbox component for ui-kit-compat — custom impl to avoid UiCheckbox token gaps
import React from 'react';
import { cn } from '@frontend-team/ui-kit';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  value?: string;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onChange?: (event: { target: { checked: boolean; value?: string } }) => void;
}

// Custom checkbox: avoids UiCheckbox token gap (--ds-bg-accent-primary undefined) and supports React node children.
function CheckboxRoot({ checked, defaultChecked, value, onChange, children, className, disabled }: CheckboxProps) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internal;

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) setInternal(next);
    onChange?.({ target: { checked: next, value } });
  };

  return (
    <span
      role="checkbox"
      aria-checked={isChecked}
      tabIndex={disabled ? -1 : 0}
      className={cn('inline-flex items-center gap-2 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed', className)}
      onClick={toggle}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), toggle())}
    >
      <span className={cn(
        'flex-shrink-0 w-3.5 h-3.5 rounded border-[1.5px] flex items-center justify-center transition-colors duration-0',
        isChecked ? 'bg-[var(--status-info)] border-[var(--status-info)]' : 'bg_primary border_secondary',
      )}>
        {isChecked && (
          <svg viewBox="0 0 10 8" fill="none" className="w-2 h-2">
            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {children !== undefined && (
        typeof children === 'string'
          ? <span className="body_s text_primary leading-none">{children}</span>
          : children
      )}
    </span>
  );
}

interface CheckboxGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string[];
  onChange?: (values: string[]) => void;
}

const CheckboxGroup = ({ value = [], onChange, children, className }: CheckboxGroupProps) => (
  <div className={cn('flex flex-wrap gap-2', className)}>
    {React.Children.map(children, (child) => {
      if (!React.isValidElement<CheckboxProps>(child)) return child;
      const childValue = child.props.value ?? '';
      return React.cloneElement(child, {
        checked: value.includes(childValue),
        onChange: (event) => {
          const next = event.target.checked ? [...value, childValue] : value.filter((item) => item !== childValue);
          onChange?.(next);
        },
      });
    })}
  </div>
);

export const Checkbox = Object.assign(CheckboxRoot, { Group: CheckboxGroup });
