import { Eye, ShoppingCart, Smartphone, Target } from 'lucide-react';

export const BUILDER_OBJECTIVES = [
  {
    value: 'app_installs',
    label: 'App Installs',
    desc: 'Maximize app downloads.',
    icon: Smartphone,
    accentClassName: 'fg_blue_strong',
    surfaceClassName: 'border_blue bg_blue_subtle',
  },
  {
    value: 'sales',
    label: 'Sales',
    desc: 'Drive online purchases.',
    icon: ShoppingCart,
    accentClassName: 'fg_emerald_strong',
    surfaceClassName: 'border_emerald bg_emerald_subtle',
  },
  {
    value: 'awareness',
    label: 'Awareness',
    desc: 'Increase brand reach.',
    icon: Eye,
    accentClassName: 'fg_purple_strong',
    surfaceClassName: 'border_purple bg_purple_subtle',
  },
  {
    value: 'traffic',
    label: 'Traffic',
    desc: 'Drive site visitors.',
    icon: Target,
    accentClassName: 'fg_amber_strong',
    surfaceClassName: 'border_amber bg_amber_subtle',
  },
] as const;

export const BUILDER_PLATFORMS = [
  { value: 'Facebook', dot: 'bg_blue_subtle' },
  { value: 'Instagram', dot: 'bg_pink_subtle' },
  { value: 'Audience Network', dot: 'bg_indigo_subtle' },
  { value: 'Messenger', dot: 'bg_blue_subtle' },
  { value: 'Threads', dot: 'bg_secondary' },
] as const;
