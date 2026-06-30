// Select component + grouped-option conversion helpers for ui-kit-compat
import React from 'react';
import {
  Select as UiSelect,
  type SelectOption as UiSelectOption,
  type SelectGroup as UiSelectGroup,
} from '@frontend-team/ui-kit';
import type { AntSize } from './controls-basic';

export type SelectValue = string | number | string[] | number[] | undefined;
type OptionBase = { value: string | number; label: React.ReactNode; disabled?: boolean };
export type OptionInput = OptionBase | string | number;
// Grouped option format: { label: string; options: OptionInput[] } — no value field
type GroupedOption = { label: string; options: OptionInput[]; value?: never };
export type AnyOption = OptionInput | GroupedOption;

// Convert AntD-style grouped options ({ label, options: [] }) to ui-kit format.
// ui-kit Select uses flat options each with an optional `group` key + a separate `groups` array.
export const extractSelectData = (
  rawOptions: AnyOption[] = [],
  value?: SelectValue,
): { options: UiSelectOption[]; groups: UiSelectGroup[] } => {
  const hasGroups = rawOptions.some((opt) => typeof opt === 'object' && 'options' in opt);
  const flatOptions: UiSelectOption[] = [];
  const groups: UiSelectGroup[] = [];
  const existing = new Set<string>();

  for (const opt of rawOptions) {
    if (hasGroups && typeof opt === 'object' && 'options' in opt && Array.isArray(opt.options)) {
      const key = opt.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      groups.push({ key, label: opt.label });
      for (const sub of opt.options) {
        const item: UiSelectOption = typeof sub === 'object'
          ? { value: String(sub.value), label: String(sub.label), disabled: sub.disabled, group: key }
          : { value: String(sub), label: String(sub), group: key };
        flatOptions.push(item);
        existing.add(item.value);
      }
    } else if (typeof opt === 'object' && !('options' in opt)) {
      const item: UiSelectOption = { value: String(opt.value), label: String(opt.label), disabled: opt.disabled };
      flatOptions.push(item);
      existing.add(item.value);
    } else if (typeof opt !== 'object') {
      const item: UiSelectOption = { value: String(opt), label: String(opt) };
      flatOptions.push(item);
      existing.add(item.value);
    }
  }

  const fromValue = Array.isArray(value) ? value : value === undefined ? [] : [value];
  for (const v of fromValue) {
    if (!existing.has(String(v))) flatOptions.push({ value: String(v), label: String(v) });
  }

  return { options: flatOptions, groups };
};

const antSizeToSelectSize = (size?: AntSize): 'xs' | 's' | 'm' | 'l' | 'xl' => {
  if (size === 'small') return 's';
  if (size === 'large') return 'l';
  return 'm';
};

const toStringValue = (v: SelectValue): string | string[] | undefined => {
  if (v === undefined) return undefined;
  if (Array.isArray(v)) return v.map(String);
  return String(v);
};

interface SelectProps {
  value?: SelectValue;
  defaultValue?: SelectValue;
  options?: AnyOption[];
  onChange?(value: string): void;
  onMultiChange?(value: string[]): void;
  mode?: 'multiple' | 'tags';
  allowClear?: boolean;
  placeholder?: string;
  className?: string;
  size?: AntSize;
  disabled?: boolean;
  tokenSeparators?: string[];
  /** @deprecated ui-kit Select does not support inline styles */
  style?: React.CSSProperties;
}

export function Select({ value, defaultValue, options, onChange, onMultiChange, mode, allowClear, placeholder, className, size, disabled }: SelectProps) {
  const isMulti = mode === 'multiple' || mode === 'tags';
  const { options: flatOptions, groups } = extractSelectData(options, value ?? defaultValue);
  return (
    <UiSelect
      options={flatOptions}
      groups={groups.length > 0 ? groups : undefined}
      value={toStringValue(value)}
      defaultValue={toStringValue(defaultValue)}
      onValueChange={(v) => {
        if (isMulti) {
          onMultiChange?.(Array.isArray(v) ? v : v ? [v] : []);
        } else {
          onChange?.(Array.isArray(v) ? (v[0] ?? '') : v);
        }
      }}
      multiple={isMulti}
      clearable={allowClear}
      placeholder={placeholder}
      disabled={disabled}
      size={antSizeToSelectSize(size)}
      className={className}
    />
  );
}
