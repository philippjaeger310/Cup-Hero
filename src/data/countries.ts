import { Country } from '../types';

// A representative starter set of footballing nations.
// Expand freely — structure is deliberately flat for easy additions.
export const COUNTRIES: Country[] = [
  { code: 'AR', name: { en: 'Argentina', de: 'Argentinien' }, flagEmoji: '🇦🇷' },
  { code: 'BR', name: { en: 'Brazil', de: 'Brasilien' }, flagEmoji: '🇧🇷' },
  { code: 'UY', name: { en: 'Uruguay', de: 'Uruguay' }, flagEmoji: '🇺🇾' },
  { code: 'ES', name: { en: 'Spain', de: 'Spanien' }, flagEmoji: '🇪🇸' },
  { code: 'PT', name: { en: 'Portugal', de: 'Portugal' }, flagEmoji: '🇵🇹' },
  { code: 'FR', name: { en: 'France', de: 'Frankreich' }, flagEmoji: '🇫🇷' },
  { code: 'DE', name: { en: 'Germany', de: 'Deutschland' }, flagEmoji: '🇩🇪' },
  { code: 'IT', name: { en: 'Italy', de: 'Italien' }, flagEmoji: '🇮🇹' },
  { code: 'EN', name: { en: 'England', de: 'England' }, flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'NL', name: { en: 'Netherlands', de: 'Niederlande' }, flagEmoji: '🇳🇱' },
  { code: 'BE', name: { en: 'Belgium', de: 'Belgien' }, flagEmoji: '🇧🇪' },
  { code: 'US', name: { en: 'United States', de: 'USA' }, flagEmoji: '🇺🇸' },
  { code: 'MX', name: { en: 'Mexico', de: 'Mexiko' }, flagEmoji: '🇲🇽' },
  { code: 'JP', name: { en: 'Japan', de: 'Japan' }, flagEmoji: '🇯🇵' },
  { code: 'MA', name: { en: 'Morocco', de: 'Marokko' }, flagEmoji: '🇲🇦' },
  { code: 'SN', name: { en: 'Senegal', de: 'Senegal' }, flagEmoji: '🇸🇳' },
  { code: 'HR', name: { en: 'Croatia', de: 'Kroatien' }, flagEmoji: '🇭🇷' },
  { code: 'RS', name: { en: 'Serbia', de: 'Serbien' }, flagEmoji: '🇷🇸' },
  { code: 'NO', name: { en: 'Norway', de: 'Norwegen' }, flagEmoji: '🇳🇴' },
  { code: 'CO', name: { en: 'Colombia', de: 'Kolumbien' }, flagEmoji: '🇨🇴' },
];

export function getCountry(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}
