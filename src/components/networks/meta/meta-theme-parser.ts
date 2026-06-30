// meta-theme-parser.ts — filename → theme name parser + mock seed data
import type { MediaFile } from './meta-media-library-modal';
import type { BatchTheme, BatchAccount, BatchCombination } from './meta-batch-types';
import { DEFAULT_NAME_PATTERN } from './meta-batch-types';

// Pattern: {AppCode}_{ThemeName}_Ver{version}_{dims}.{ext}
// e.g. N3_Sexy_Phone_Ver1.3_25-55_916.mp4 → "Sexy_Phone"
const THEME_REGEX = /^[A-Z0-9]+_(.+?)_Ver\d/;

export function parseThemeName(filename: string): string {
  const match = THEME_REGEX.exec(filename);
  return match?.[1] ?? 'Uncategorized';
}

export function groupFilesByTheme(files: MediaFile[]): Record<string, MediaFile[]> {
  return files.reduce<Record<string, MediaFile[]>>((acc, file) => {
    const theme = parseThemeName(file.name);
    acc[theme] = [...(acc[theme] ?? []), file];
    return acc;
  }, {});
}

export function toThemeList(files: MediaFile[]): BatchTheme[] {
  const grouped = groupFilesByTheme(files);
  return Object.entries(grouped).map(([name, themeFiles]) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    files: themeFiles,
  }));
}

export function resolveNamePattern(
  pattern: string,
  combo: Pick<BatchCombination, 'template' | 'theme' | 'account'>
): string {
  const date = new Date().toISOString().slice(0, 10);
  return pattern
    .replaceAll('{template}', combo.template.name)
    .replaceAll('{theme}', combo.theme.name)
    .replaceAll('{account}', combo.account.name)
    .replaceAll('{date}', date);
}

export { DEFAULT_NAME_PATTERN };

// Mock media library — replace with RTK Query when API available
export const MOCK_MEDIA_FILES: MediaFile[] = [
  { id: 'mf1', name: 'N3_Sexy_Phone_Ver1.3_25-55_916.mp4', type: 'video', duration: '0:30', size: '12MB', modified: '2026-06-01' },
  { id: 'mf2', name: 'N3_Sexy_Phone_Ver2.0_9-16.mp4',      type: 'video', duration: '0:15', size: '8MB',  modified: '2026-06-02' },
  { id: 'mf3', name: 'N3_Mistakes_Phone_Ver1.0_25-55.mp4', type: 'video', duration: '0:45', size: '18MB', modified: '2026-06-03' },
  { id: 'mf4', name: 'N3_Mistakes_Phone_Ver2.1_9-16.mp4',  type: 'video', duration: '0:20', size: '9MB',  modified: '2026-06-04' },
  { id: 'mf5', name: 'N3_Clean_IOS_Ver1.0_9-16.mp4',       type: 'video', duration: '0:30', size: '10MB', modified: '2026-06-05' },
  { id: 'mf6', name: 'FOCUS_Clean_IOS_Ver2.0_9-16.mp4',    type: 'video', duration: '0:20', size: '9MB',  modified: '2026-06-06' },
  { id: 'mf7', name: 'banner_no_pattern.jpg',               type: 'image', size: '400KB',                  modified: '2026-06-07' },
];

export const MOCK_BATCH_ACCOUNTS: BatchAccount[] = [
  { id: 'acc1', name: 'FOCUS PT' },
  { id: 'acc2', name: 'FOCUS ES' },
  { id: 'acc3', name: 'Focus EN' },
  { id: 'acc4', name: 'Focus ASIA' },
];
