// choice-controls.tsx — Radio, Switch, Segmented, Slider + re-exports from sub-modules
import React, { createContext, useContext } from 'react';
import {
  RadioGroup as UiRadioGroup,
  SegmentedControl,
  Slider as UiSlider,
  Switch as UiSwitch,
  cn,
} from '@frontend-team/ui-kit';
import type { AntSize } from './controls-basic';
import type { OptionInput } from './choice-controls-select';

export { Select, extractSelectData } from './choice-controls-select';
export { Checkbox } from './choice-controls-checkbox';
export type { AnyOption, SelectValue, OptionInput } from './choice-controls-select';
export type { CheckboxProps } from './choice-controls-checkbox';

type SliderTooltip = { formatter?: (value?: number) => React.ReactNode };

const normalizeOptions = (options: OptionInput[] = []): { value: string; label: React.ReactNode }[] =>
  options.map((opt) => typeof opt === 'object' ? { value: String(opt.value), label: opt.label } : { value: String(opt), label: String(opt) });

type RadioContextValue = {
  value?: unknown;
  onChange?: (event: { target: { value: never } }) => void;
};

const RadioContext = createContext<RadioContextValue>({});

interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: unknown;
  defaultValue?: unknown;
  onChange?: (event: { target: { value: never } }) => void;
  buttonStyle?: string;
  size?: string;
}

const RadioGroup = ({ value, defaultValue, onChange, className, children }: RadioGroupProps) => (
  <RadioContext.Provider value={{ value: value ?? defaultValue, onChange }}>
    <UiRadioGroup
      value={String(value ?? defaultValue ?? '')}
      onValueChange={(next) => onChange?.({ target: { value: next as never } })}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {children}
    </UiRadioGroup>
  </RadioContext.Provider>
);

interface RadioButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: unknown;
}

const RadioButton = ({ value, className, children, ...props }: RadioButtonProps) => {
  const context = useContext(RadioContext);
  const isSelected = context.value === value;
  return (
    <button
      type="button"
      className={cn(
        'rounded-md border px-3 py-1.5 body_s',
        isSelected ? 'border_primary bg_tertiary text_primary' : 'border_secondary bg_primary text_secondary',
        className,
      )}
      onClick={() => context.onChange?.({ target: { value: value as never } })}
      {...props}
    >
      {children}
    </button>
  );
};

export const Radio = Object.assign(RadioButton, { Group: RadioGroup, Button: RadioButton });

export function Switch({
  checked, defaultChecked, onChange, size,
  checkedChildren: _c, unCheckedChildren: _u,
  ...props
}: {
  checked?: boolean; defaultChecked?: boolean; onChange?: (checked: boolean) => void;
  size?: AntSize; disabled?: boolean; checkedChildren?: React.ReactNode; unCheckedChildren?: React.ReactNode;
}) {
  return (
    <UiSwitch
      checked={checked ?? defaultChecked}
      onCheckedChange={(next) => onChange?.(next === true)}
      size={size === 'small' ? 'sm' : 'md'}
      {...props}
    />
  );
}

export function Segmented({ options = [], value, defaultValue, onChange, className }: { options?: OptionInput[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; className?: string; size?: string }) {
  return (
    <SegmentedControl
      options={normalizeOptions(options).map((o) => ({ value: String(o.value), label: o.label }))}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange}
      className={className}
    />
  );
}

export function Slider({ value, onChange, tooltip: _tooltip, ...props }: { value?: number; min?: number; max?: number; step?: number; onChange?: (value: number) => void; className?: string; tooltip?: SliderTooltip }) {
  return <UiSlider value={[value ?? 0]} onValueChange={(next) => onChange?.(next[0] ?? 0)} {...props} />;
}
