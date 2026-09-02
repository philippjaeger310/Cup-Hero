// Cup Hero brand palette — Inter Miami inspired CI
// Pink: Pantone 1895 C, verified hex #F7B5CD (RGB 245,186,206)
export const colors = {
  pink: '#F7B5CD',
  pinkDark: '#E88DAE',
  pinkMuted: '#FBD9E5',
  black: '#0A0A0A',
  charcoal: '#161616',
  charcoalLight: '#232323',
  white: '#FFFFFF',
  offWhite: '#F5F5F5',
  gray: '#8A8A8A',
  grayLight: '#C9C9C9',

  // semantic
  background: '#0A0A0A',
  surface: '#161616',
  surfaceAlt: '#232323',
  textPrimary: '#FFFFFF',
  textSecondary: '#C9C9C9',
  accent: '#F7B5CD',
  accentPressed: '#E88DAE',
  border: '#2A2A2A',

  success: '#3DDC84',
  warning: '#F5C542',
  danger: '#E5484D',

  // career table row tints (mirrors the copero.com.ar career history coloring)
  rowEarly: '#3A1E27', // red-tinted, early/breakthrough years
  rowPeak: '#3A3320', // yellow-tinted, peak years
  rowNeutral: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
