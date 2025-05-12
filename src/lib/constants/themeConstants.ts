// Color palette type for consistent theming
export type ColorPalette = {
  primary: string;
  secondary: string;
  tertiary: string;
  neutral: string;
  accent1: string;
  accent2: string;
  background: string;
  surface: string;
};

// Palette 1 - Earth Tones
export const palette1: ColorPalette = {
  primary: '#2B3F4E',    // Dark Blue-Gray
  secondary: '#3E8C75',  // Teal
  tertiary: '#D66853',   // Terracotta
  neutral: '#8294A5',    // Light Blue-Gray
  accent1: '#E9C37C',    // Gold
  accent2: '#475B4F',    // Dark Green
  background: '#F8F6F2', // Off-White
  surface: '#F4E5D7',    // Beige
};

// Palette 2 - Modern Tech
export const palette2: ColorPalette = {
  primary: '#2B3F4E',    // Dark Navy
  secondary: '#3A6EA5',  // Blue
  tertiary: '#FFC107',   // Yellow
  neutral: '#D3D3D3',    // Light Gray
  accent1: '#333333',    // Dark Gray
  accent2: '#6B8E23',    // Olive Green
  background: '#F7F4ED', // Off-White
  surface: '#FFFFFF',    // White
};

// Palette 3 - Ocean Breeze
export const palette3: ColorPalette = {
  primary: '#334AFF',    // Bright Blue
  secondary: '#B8E5EB',  // Light Blue
  tertiary: '#3344FF',   // Royal Blue
  neutral: '#F2C699',    // Peach
  accent1: '#45B8D9',    // Turquoise
  accent2: '#FF9B7D',    // Coral
  background: '#F7F4ED', // White
  surface: '#092442',    // Dark Navy
};

// Export as a map for easy dynamic selection
export const palettes = {
  earthTones: palette1,
  modernTech: palette2,
  oceanBreeze: palette3,
}; 