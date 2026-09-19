export type AppTheme = 'yoga-purple' | 'earth-cream' | 'sea-nls';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  subtitle: string;
  badge: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'yoga-purple',
    name: 'The Yoga Purple',
    subtitle: 'Meditative Purple & Soft Cream',
    badge: '🧘‍♀️ Purple',
    primaryColor: '#d8b4fe',
    secondaryColor: '#faedd9',
    accentColor: '#a855f7',
  },
  {
    id: 'earth-cream',
    name: 'Earth Theme',
    subtitle: 'Warm Sand, Linen & Ivory Cream',
    badge: '🌾 Earth Cream',
    primaryColor: '#c4884d',
    secondaryColor: '#faedd9',
    accentColor: '#b87333',
  },
  {
    id: 'sea-nls',
    name: 'Sea Theme',
    subtitle: 'Official NLS Navy & Ocean Azure Cyan',
    badge: '🌊 Sea NLS',
    primaryColor: '#00A3E0',
    secondaryColor: '#003B73',
    accentColor: '#38bdf8',
  },
];
