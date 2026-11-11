import { ColorTheme } from '../types';

export interface ThemeStyles {
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  lightBg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  gradient: string;
  accentHex: string;
}

export const THEMES: Record<ColorTheme, ThemeStyles> = {
  green: {
    primaryBg: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-700',
    primaryText: 'text-emerald-700',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    gradient: 'from-emerald-700 to-teal-800',
    accentHex: '#059669',
  },
  red: {
    primaryBg: 'bg-rose-600',
    primaryHover: 'hover:bg-rose-700',
    primaryText: 'text-rose-700',
    lightBg: 'bg-rose-50',
    border: 'border-rose-200',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    gradient: 'from-rose-700 to-red-800',
    accentHex: '#e11d48',
  },
  blue: {
    primaryBg: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryText: 'text-blue-700',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    gradient: 'from-blue-700 to-indigo-900',
    accentHex: '#2563eb',
  },
  yellow: {
    primaryBg: 'bg-amber-500',
    primaryHover: 'hover:bg-amber-600',
    primaryText: 'text-amber-700',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    gradient: 'from-amber-600 to-yellow-700',
    accentHex: '#d97706',
  },
  orange: {
    primaryBg: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-700',
    primaryText: 'text-orange-700',
    lightBg: 'bg-orange-50',
    border: 'border-orange-200',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    gradient: 'from-orange-600 to-amber-700',
    accentHex: '#ea580c',
  },
};

export const THEME_NAMES: Record<ColorTheme, { name: string; colorClass: string }> = {
  green: { name: 'Hijau Zamrud', colorClass: 'bg-emerald-500' },
  red: { name: 'Merah Delima', colorClass: 'bg-rose-500' },
  blue: { name: 'Biru Samudera', colorClass: 'bg-blue-600' },
  yellow: { name: 'Kuning Diraja', colorClass: 'bg-amber-500' },
  orange: { name: 'Oren Terbit', colorClass: 'bg-orange-500' },
};
