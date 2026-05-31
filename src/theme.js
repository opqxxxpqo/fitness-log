// Design tokens extracted from Figma exports (ACN1~ACN4)
// Aesthetic: paper-warm brutalist / Swiss with red-orange accent, zero corner radius.

export const C = {
  bg: '#F2F0EC',
  surface: '#E7E4DE',
  ink: '#0A0A0A',
  ink2: '#1A1A1A',
  ink3: '#222222',
  ink55: 'rgba(10,10,10,0.55)',
  ink35: 'rgba(10,10,10,0.35)',
  ink18: 'rgba(10,10,10,0.18)',
  ink12: 'rgba(10,10,10,0.12)',
  ink06: 'rgba(10,10,10,0.06)',
  accent: '#FF3B1F',
  accentDim: 'rgba(255,59,31,0.12)',
  white: '#FFFFFF',
};

export const F = {
  // Font family stacks. The body font is whatever the platform considers a clean sans;
  // mono and doto are loaded explicitly via expo-font.
  body: undefined, // system default
  mono: 'JetBrainsMono',
  doto: 'Doto',
  vt: 'VT323',
};

export const FS = {
  micro: 9,
  tiny: 10,
  xs: 11,
  sm: 13,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 26,
  hero: 44,
};

export const SP = (n) => n * 4; // 4-pt spacing scale

export const RAD = 0; // brutalist — no radius
