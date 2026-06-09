import type { ThemeMode } from '../types/models';

export interface Theme {
  mode: ThemeMode;
  colors: Record<string, string>;
}

const night: Record<string, string> = {
  bg: '#050810', bgAlt: '#0a0e1a',
  surface: '#0f1629', surfaceHover: '#182040', surfaceActive: '#1e2850',
  primary: '#00ffff', primaryHover: '#00e5e5',
  secondary: '#0099cc', accent: '#22d3ee', accentHover: '#06b6d4',
  text: '#e0f0ff', textSec: '#8899bb', textMuted: '#556688',
  border: '#152040', borderStrong: '#1e3060',
  success: '#00ff88', warning: '#ffbb00', error: '#ff0055',
  neon: '#00ffff', neonDim: '#006688', neonGlow: 'rgba(0,255,255,0.35)',
  gradPrimary: 'linear-gradient(135deg,#00ffff 0%,#0099cc 100%)',
  gradAccent: 'linear-gradient(135deg,#00ffff 0%,#22d3ee 50%,#0099cc 100%)',
};

const day: Record<string, string> = {
  bg: '#e8f0f8', bgAlt: '#f0f5fa',
  surface: '#ffffff', surfaceHover: '#eef3f9', surfaceActive: '#dde8f2',
  primary: '#0099bb', primaryHover: '#008899',
  secondary: '#006688', accent: '#00bbcc', accentHover: '#009daa',
  text: '#0a1628', textSec: '#4a6080', textMuted: '#8095aa',
  border: '#c8d8e8', borderStrong: '#a0b8d0',
  success: '#00aa66', warning: '#dd9900', error: '#cc0044',
  neon: '#0099bb', neonDim: '#006688', neonGlow: 'rgba(0,153,187,0.25)',
  gradPrimary: 'linear-gradient(135deg,#0099bb 0%,#00bbcc 100%)',
  gradAccent: 'linear-gradient(135deg,#0099bb 0%,#00bbcc 50%,#00ddaa 100%)',
};

export const themes: Record<ThemeMode, Theme> = {
  night: { mode: 'night', colors: night },
  day: { mode: 'day', colors: day },
};

const CSS_MAP: Record<string, string> = {
  bg: '--bg', bgAlt: '--bg-alt', surface: '--surface', surfaceHover: '--surface-hover',
  surfaceActive: '--surface-active', primary: '--primary', primaryHover: '--primary-hover',
  secondary: '--secondary', accent: '--accent', accentHover: '--accent-hover',
  text: '--text', textSec: '--text-sec', textMuted: '--text-muted',
  border: '--border', borderStrong: '--border-strong',
  success: '--success', warning: '--warning', error: '--error',
  neon: '--neon', neonDim: '--neon-dim', neonGlow: '--neon-glow',
  gradPrimary: '--grad-primary', gradAccent: '--grad-accent',
};

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  for (const [key, cssVar] of Object.entries(CSS_MAP)) {
    root.style.setProperty(cssVar, theme.colors[key] ?? '');
  }
  root.setAttribute('data-theme', theme.mode);
}
