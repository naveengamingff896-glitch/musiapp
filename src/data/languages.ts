import type { LanguageInfo } from './types';

/** The 22 scheduled languages of India plus Bhojpuri and Tulu. */
export const LANGUAGES: LanguageInfo[] = [
  { code: 'te', name: 'Telugu', native: 'తెలుగు', primary: true, speakers: '96 million' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', speakers: '615 million' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', speakers: '86 million' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', speakers: '38 million' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', speakers: '56 million' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', speakers: '107 million' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', speakers: '83 million' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', speakers: '33 million' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', speakers: '56 million' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', speakers: '38 million' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', speakers: '15 million' },
  { code: 'ur', name: 'Urdu', native: 'اردو', speakers: '70 million' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', speakers: '25 thousand' },
  { code: 'ks', name: 'Kashmiri', native: 'کٲشُر', speakers: '7 million' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', speakers: '2.3 million' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্', speakers: '1.8 million' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', speakers: '2.9 million' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي', speakers: '2.8 million' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', speakers: '1.6 million' },
  { code: 'brx', name: 'Bodo', native: "बर'", speakers: '1.5 million' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', speakers: '13 million' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', speakers: '7.6 million' },
  { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी', regional: true, speakers: '52 million' },
  { code: 'tcy', name: 'Tulu', native: 'ತುಳು', regional: true, speakers: '1.8 million' },
];

export const LANGUAGE_BY_CODE: Record<string, LanguageInfo> = Object.fromEntries(
  LANGUAGES.map((language) => [language.code, language])
);

export function languageName(code: string): string {
  return LANGUAGE_BY_CODE[code]?.name ?? code.toUpperCase();
}

export function languageNative(code: string): string {
  return LANGUAGE_BY_CODE[code]?.native ?? code;
}

export const GENRES = [
  'Filmi',
  'Melody',
  'Mass',
  'Romantic',
  'Devotional',
  'Folk',
  'Indie',
  'Classical',
  'Dance',
  'Ghazal',
  'Qawwali',
  'Sufi',
  'Rap',
  'Lullaby',
  'Fusion',
];

export const MOODS = [
  'Romantic',
  'Energetic',
  'Calm',
  'Nostalgic',
  'Devotional',
  'Party',
  'Focus',
  'Melancholy',
  'Uplifting',
];

export const AUDIO_QUALITIES = ['auto', 'low', 'normal', 'high'] as const;
export type AudioQuality = (typeof AUDIO_QUALITIES)[number];

export const QUALITY_LABELS: Record<AudioQuality, string> = {
  auto: 'Auto (recommended for mobile data)',
  low: 'Low — 64 kbps demo',
  normal: 'Normal — 128 kbps (when licensed audio is connected)',
  high: 'High — 320 kbps (when licensed audio is connected)',
};

export const ERA_BLURBS: Record<string, string> = {
  'Golden era': '1950s–1960s · black-and-white classics and stage-era voices',
  '1970s': '1970s · acoustic orchestras and evergreen melodies',
  '1980s': '1980s · Ilaiyaraaja-era arrangements and cassette culture',
  '1990s': '1990s · the rise of the massy soundtrack',
  '2000s': '2000s · remix boom and new-gen melody',
  '2010s': '2010s · streaming-era Telugu pop and indie',
  '2020s': '2020s · today’s Telugu releases',
};
