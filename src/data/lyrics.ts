import type { Song } from './types';

/**
 * Original demo lyrics written for the prototype. They are not transcriptions of
 * any existing song; each block is assigned to demo tracks deterministically.
 */
export interface LyricLine {
  time: number;
  native?: string;
  latin: string;
}

interface LyricBlock {
  native?: string[];
  latin: string[];
}

const BLOCKS: Record<string, LyricBlock[]> = {
  te: [
    {
      native: [
        'వెన్నెల రాగం వీచే రాతిరి',
        'నా మనసులో నీ పాట',
        'గాలి తీరం దాటి వెళ్తే',
        'నీ చిరునవ్వే నా దారి',
        'మళ్ళీ మళ్ళీ ఆ పాటే',
        'గుండెలో మోగే రాగం',
      ],
      latin: [
        'Vennela raagam veeche raathiri',
        'Naa manasulo nee paata',
        'Gaali teeram daati velthe',
        'Nee chirunavve naa daari',
        'Malli malli aa paate',
        'Gundelo moge raagam',
      ],
    },
    {
      native: [
        'గుండెలో గూడు కట్టిన కల',
        'కన్నె కళ్ళలో వెలుగు',
        'మౌనం మాటలు చెప్పే వేళ',
        'నీవే నా హృదయ రాగం',
        'చీకటిలోన వెలుగు నీవే',
        'నా పాటలో నీ స్వరం',
      ],
      latin: [
        'Gundelo goodu kattina kala',
        'Kanne kallalo velugu',
        'Mounam maatalu cheppe vela',
        'Neeye naa hrudaya raagam',
        'Cheekatilona velugu neeve',
        'Naa paatalo nee swaram',
      ],
    },
    {
      native: [
        'దీపం లాగా వెలిగే ఆశ',
        'వాన చినుకుల సవ్వడి',
        'తీయని గాలి తాకిన వేళ',
        'నా పాట నీకే ఇచ్చా',
        'జాబిలి రాలే రాతిరిలో',
        'మనసు పాడే పాటే',
      ],
      latin: [
        'Deepam laaga velige aasha',
        'Vaana chinukula savvadi',
        'Teeyani gaali taakina vela',
        'Naa paata neeke ichhaa',
        'Jaabili raale raathirilo',
        'Manasu paade paate',
      ],
    },
  ],
  hi: [
    {
      native: [
        'चाँद की रोशनी में तेरा नाम',
        'दिल की धड़कन में तेरी धुन',
        'बारिश की बूँदों में तेरी याद',
        'सपनों का सफ़र तुझ तक',
        'धुन कोई पुरानी फिर छेड़ी',
        'रात भर चले ये गीत',
      ],
      latin: [
        'Chaand ki roshni mein tera naam',
        'Dil ki dhadkan mein teri dhun',
        'Baarish ki boondon mein teri yaad',
        'Sapnon ka safar tujh tak',
        'Dhun koi puraani phir chhedi',
        'Raat bhar chale ye geet',
      ],
    },
    {
      native: [
        'रात की चादर ओढ़े सितारे',
        'ख्वाबों में तेरा चेहरा',
        'धुन कोई पुरानी छेड़े',
        'यादों का जादू फिर से',
        'सफ़र लंबा है, रास्ता अपना',
        'गीत चलता रहे',
      ],
      latin: [
        'Raat ki chaadar odhe sitaare',
        'Khwaabon mein tera chehra',
        'Dhun koi puraani chhede',
        'Yaadon ka jaadu phir se',
        'Safar lamba hai, raasta apna',
        'Geet chalta rahe',
      ],
    },
  ],
  default: [
    {
      latin: [
        'A lantern on the water, a song in the lane',
        'Every monsoon evening hums your name',
        'We keep the old melodies close to the heart',
        'Sing it slow, let the whole town start',
        'Demo lyrics for the Mana Music prototype',
        'Original words, written for this catalogue',
      ],
    },
  ],
};

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) % 100000;
  }
  return result;
}

/** Timed, original demo lyrics for a track (empty when the catalogue has none). */
export function lyricsForSong(song: Song): LyricLine[] {
  const blocks = BLOCKS[song.language] ?? BLOCKS.default;
  const block = blocks[hash(song.id) % blocks.length];
  const step = song.durationSec / (block.latin.length + 1);
  return block.latin.map((latin, index) => ({
    time: Math.round((index + 1) * step * 10) / 10,
    native: block.native?.[index],
    latin,
  }));
}

export function songHasLyrics(song: Song): boolean {
  return song.language === 'te' || song.language === 'hi' || song.language === 'en';
}
