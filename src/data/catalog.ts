import audioIndex from './audio-index.json';
import { LANGUAGES } from './languages';
import { FIRST_NAMES, GENRE_BY_LANGUAGE, MOVIE_SUFFIX, PODCAST_SEEDS, SURNAME_POOL, titleWords } from './pools';
import { ERAS, eraForYear } from './types';
import type {
  Album,
  AlbumKind,
  Artist,
  ArtistRole,
  Catalog,
  Era,
  Playlist,
  Podcast,
  RadioStation,
  Song,
} from './types';

interface AudioLoop {
  id: string;
  file: string;
  durationSec: number;
}

const AUDIO = audioIndex as AudioLoop[];

/** How many demo tracks each language gets. Telugu is by far the deepest. */
const SONG_TARGETS: Record<string, number> = {
  te: 84,
  hi: 30,
  ta: 10,
  ml: 10,
  kn: 10,
  bn: 10,
  mr: 10,
  pa: 10,
  gu: 10,
  or: 8,
  as: 8,
  ur: 8,
  sa: 6,
  ks: 6,
  kok: 6,
  mni: 6,
  ne: 6,
  sd: 6,
  doi: 6,
  brx: 6,
  mai: 6,
  sat: 6,
  bho: 10,
  tcy: 6,
};

const ERA_YEARS: Record<Era, [number, number]> = {
  'Golden era': [1954, 1969],
  '1970s': [1970, 1979],
  '1980s': [1980, 1989],
  '1990s': [1990, 1999],
  '2000s': [2000, 2009],
  '2010s': [2010, 2019],
  '2020s': [2020, 2026],
};

/** Deliberate era spread so every Telugu era shelf has content. */
const TELUGU_ERA_PATTERN: Era[] = [
  '2020s', '2010s', '1990s', '1980s', 'Golden era', '2000s', '1970s', '2020s',
  '2010s', '1990s', '2020s', '2010s', '1980s', '2000s', '2020s', '2010s',
];

const MOOD_BY_GENRE: Record<string, string[]> = {
  Melody: ['Calm', 'Romantic', 'Nostalgic'],
  Romantic: ['Romantic', 'Calm', 'Melancholy'],
  Mass: ['Energetic', 'Party', 'Uplifting'],
  Dance: ['Party', 'Energetic'],
  Devotional: ['Devotional', 'Calm'],
  Folk: ['Uplifting', 'Nostalgic', 'Energetic'],
  Indie: ['Calm', 'Melancholy', 'Focus'],
  Classical: ['Calm', 'Focus', 'Devotional'],
  Filmi: ['Romantic', 'Nostalgic', 'Uplifting'],
  Ghazal: ['Melancholy', 'Calm'],
  Qawwali: ['Devotional', 'Energetic'],
  Sufi: ['Devotional', 'Calm'],
  Rap: ['Energetic', 'Party'],
  Lullaby: ['Calm', 'Devotional'],
  Fusion: ['Focus', 'Calm'],
};

const AUDIO_BY_GENRE: Record<string, string[]> = {
  Devotional: ['deepam', 'lullaby'],
  Classical: ['deepam', 'raatri'],
  Folk: ['jaanapada', 'gaali'],
  Mass: ['mass', 'jaanapada'],
  Dance: ['mass', 'gaali'],
  Rap: ['mass', 'jaanapada'],
  Melody: ['vennela', 'raatri', 'varsham'],
  Romantic: ['vennela', 'varsham'],
  Lullaby: ['lullaby', 'raatri'],
  Ghazal: ['raatri', 'deepam'],
  Qawwali: ['jaanapada', 'deepam'],
  Sufi: ['raatri', 'deepam'],
  Indie: ['varsham', 'raatri', 'vennela'],
  Filmi: ['vennela', 'gaali', 'varsham'],
  Fusion: ['gaali', 'vennela'],
};

function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const rng = createRng(20260214);

function pick<T>(list: T[]): T {
  return list[Math.floor(rng() * list.length) % list.length];
}

function yearFromEra(era: Era): number {
  const [start, end] = ERA_YEARS[era];
  return start + Math.floor(rng() * (end - start + 1));
}

const usedArtistNames = new Set<string>();

function makeArtistName(language: string): string {
  const surnames = SURNAME_POOL[language] ?? SURNAME_POOL.hi;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const name = `${pick(FIRST_NAMES)} ${pick(surnames)}`;
    if (!usedArtistNames.has(name)) {
      usedArtistNames.add(name);
      return name;
    }
  }
  const fallback = `${pick(FIRST_NAMES)} ${pick(surnames)} ${usedArtistNames.size}`;
  usedArtistNames.add(fallback);
  return fallback;
}

const ROLE_BLURB: Record<ArtistRole, string> = {
  singer: 'playback singer',
  composer: 'music director and composer',
  lyricist: 'lyricist',
};

function makeArtist(language: string, languageLabel: string, role: ArtistRole): Artist {
  const name = makeArtistName(language);
  const era = pick(ERAS);
  const id = `ar-${language}-${usedArtistNames.size}`;
  const followers = Math.round(12000 + rng() * 1_850_000);
  return {
    id,
    name,
    roles: [role],
    language,
    era,
    followers,
    verified: followers > 250000,
    bio: `${name} is a fictional ${languageLabel} ${ROLE_BLURB[role]} created for the Mana Music prototype, styled around ${era} recordings. This profile is demo metadata, not a real artist.`,
  };
}

interface LanguageBundle {
  language: string;
  artists: Artist[];
  singers: Artist[];
  composers: Artist[];
  lyricists: Artist[];
}

function buildArtistsForLanguage(language: string): LanguageBundle {
  const info = LANGUAGES.find((entry) => entry.code === language);
  const label = info?.name ?? language;
  const target = SONG_TARGETS[language] ?? 6;
  const singerCount = target >= 30 ? 6 : target >= 10 ? 4 : 2;
  const composerCount = target >= 30 ? 4 : 2;
  const lyricistCount = target >= 30 ? 3 : 1;

  const singers = Array.from({ length: singerCount }, () => makeArtist(language, label, 'singer'));
  const composers = Array.from({ length: composerCount }, () => makeArtist(language, label, 'composer'));
  const lyricists = Array.from({ length: lyricistCount }, () => makeArtist(language, label, 'lyricist'));

  return {
    language,
    singers,
    composers,
    lyricists,
    artists: [...singers, ...composers, ...lyricists],
  };
}

const LABELS = ['Mana Demo Records', 'Godavari Sound Lab', 'Deccan Demo Music', 'Penna Audio', 'Kaveri Demo Tapes'];

function pickKind(language: string, year: number): AlbumKind {
  const roll = rng();
  if (language === 'sa') return roll < 0.55 ? 'devotional' : 'classical';
  if (year < 1985) return roll < 0.75 ? 'soundtrack' : 'album';
  if (roll < 0.56) return 'soundtrack';
  if (roll < 0.7) return 'album';
  if (roll < 0.8) return 'single';
  if (roll < 0.88) return 'indie';
  if (roll < 0.95) return 'folk';
  return 'devotional';
}

function buildSongs(): { songs: Song[]; albums: Album[]; artists: Artist[] } {
  const songs: Song[] = [];
  const albums: Album[] = [];
  const artists: Artist[] = [];
  let songCounter = 0;

  for (const languageInfo of LANGUAGES) {
    const target = SONG_TARGETS[languageInfo.code];
    if (!target) continue;

    const bundle = buildArtistsForLanguage(languageInfo.code);
    artists.push(...bundle.artists);
    const words = titleWords(languageInfo.code);
    const usedTitles = new Set<string>();
    const usedMovies = new Set<string>();
    const genres = GENRE_BY_LANGUAGE[languageInfo.code] ?? GENRE_BY_LANGUAGE.hi;

    const makeSongTitle = (): { latin: string; native?: string } => {
      for (let attempt = 0; attempt < 240; attempt += 1) {
        const first = pick(words.first);
        const second = pick(words.second);
        const latin = `${first.latin} ${second.latin}`;
        if (usedTitles.has(latin.toLowerCase())) continue;
        usedTitles.add(latin.toLowerCase());
        return {
          latin,
          native: first.native && second.native ? `${first.native} ${second.native}` : undefined,
        };
      }
      const fallback = `${pick(words.first).latin} ${pick(words.second).latin} ${usedTitles.size}`;
      usedTitles.add(fallback.toLowerCase());
      return { latin: fallback };
    };

    const makeMovieTitle = (): { latin: string; native?: string } => {
      for (let attempt = 0; attempt < 120; attempt += 1) {
        const first = pick(words.first);
        const suffix = pick(MOVIE_SUFFIX);
        const latin = `${first.latin} ${suffix}`;
        if (usedMovies.has(latin.toLowerCase())) continue;
        usedMovies.add(latin.toLowerCase());
        return { latin, native: first.native ? `${first.native} ${suffix}` : undefined };
      }
      return { latin: `${pick(words.first).latin} ${pick(MOVIE_SUFFIX)}` };
    };

    let produced = 0;
    let albumIndex = 0;
    while (produced < target) {
      const size = Math.min(target - produced, 3 + Math.floor(rng() * 3));
      const year =
        languageInfo.code === 'te'
          ? yearFromEra(TELUGU_ERA_PATTERN[albumIndex % TELUGU_ERA_PATTERN.length])
          : 1972 + Math.floor(rng() * 55);
      const kind = pickKind(languageInfo.code, year);
      const composer = pick(bundle.composers);
      const movie = kind === 'soundtrack' || kind === 'album' ? makeMovieTitle() : undefined;
      const albumTitle = movie?.latin ?? makeSongTitle().latin;
      const albumId = `al-${languageInfo.code}-${albumIndex + 1}`;
      const albumSongIds: string[] = [];

      for (let track = 0; track < size; track += 1) {
        songCounter += 1;
        const title = makeSongTitle();
        const genre =
          kind === 'devotional'
            ? 'Devotional'
            : kind === 'folk'
              ? 'Folk'
              : kind === 'indie'
                ? 'Indie'
                : kind === 'classical'
                  ? 'Classical'
                  : pick(genres);
        const moodList = MOOD_BY_GENRE[genre] ?? ['Calm'];
        const audioId = pick(AUDIO_BY_GENRE[genre] ?? ['vennela', 'gaali']);
        const loop = AUDIO.find((entry) => entry.id === audioId) ?? AUDIO[0];
        const singers = [pick(bundle.singers)];
        if (rng() > 0.55) singers.push(pick(bundle.singers));
        const uniqueSingers = Array.from(new Set(singers.map((artist) => artist.id)));
        const modernBoost = year >= 2015 ? 3_400_000 : year >= 2000 ? 1_600_000 : 700_000;
        const id = `sg-${languageInfo.code}-${String(songCounter).padStart(3, '0')}`;
        songs.push({
          id,
          title: title.latin,
          nativeTitle: title.native,
          albumId,
          language: languageInfo.code,
          year,
          movie: movie?.latin,
          singerIds: uniqueSingers,
          composerId: composer.id,
          lyricistId: pick(bundle.lyricists).id,
          genre,
          mood: pick(moodList),
          durationSec: loop.durationSec,
          audioId: loop.id,
          plays: Math.round(80_000 + rng() * modernBoost),
          era: eraForYear(year),
        });
        albumSongIds.push(id);
        produced += 1;
      }

      albums.push({
        id: albumId,
        title: albumTitle,
        artistId: composer.id,
        language: languageInfo.code,
        year,
        movie: movie?.latin,
        songIds: albumSongIds,
        kind,
        label: pick(LABELS),
      });
      albumIndex += 1;
    }
  }

  return { songs, albums, artists };
}

const built = buildSongs();
const songs = built.songs;
const albums = built.albums;
const artists = built.artists;

interface PlaylistSeed {
  id: string;
  title: string;
  description: string;
  kind: Playlist['kind'];
  language?: string;
  limit?: number;
  curator?: string;
  match: (song: Song) => boolean;
}

const TELUGU = (song: Song) => song.language === 'te';
const byPlays = (a: Song, b: Song) => b.plays - a.plays;

const PLAYLIST_SEEDS: PlaylistSeed[] = [
  {
    id: 'pl-te-melody',
    title: 'Telugu Melody Essentials',
    description: 'The melodies Telugu listeners keep coming back to, from golden-era hums to today’s soft hits.',
    kind: 'editorial',
    language: 'te',
    limit: 28,
    match: (song) => TELUGU(song) && (song.genre === 'Melody' || song.genre === 'Romantic'),
  },
  {
    id: 'pl-te-mass',
    title: 'Telugu Mass Beat',
    description: 'Dhol, brass and whistle-ready choruses — the Telugu mass sound built for the big screen.',
    kind: 'editorial',
    language: 'te',
    limit: 24,
    match: (song) => TELUGU(song) && (song.genre === 'Mass' || song.mood === 'Energetic'),
  },
  {
    id: 'pl-te-romance',
    title: 'Telugu Romance',
    description: 'Duets, rain songs and everything in between for the Telugu romantic at heart.',
    kind: 'mood',
    language: 'te',
    limit: 26,
    match: (song) => TELUGU(song) && (song.genre === 'Romantic' || song.mood === 'Romantic'),
  },
  {
    id: 'pl-te-devotional',
    title: 'Telugu Devotional',
    description: 'Bhajans, keerthanalu and film devotional songs for pooja mornings and temple visits.',
    kind: 'genre',
    language: 'te',
    limit: 22,
    match: (song) => TELUGU(song) && song.genre === 'Devotional',
  },
  {
    id: 'pl-te-folk',
    title: 'Telugu Folk Roots',
    description: 'Jaanapada rhythms, Bathukamma beats and village-fair energy from Telangana and Andhra.',
    kind: 'genre',
    language: 'te',
    limit: 22,
    match: (song) => TELUGU(song) && song.genre === 'Folk',
  },
  {
    id: 'pl-te-indie',
    title: 'Telugu Indie Spotlight',
    description: 'Independent Telugu voices recording outside the film system.',
    kind: 'genre',
    language: 'te',
    limit: 18,
    match: (song) => TELUGU(song) && song.genre === 'Indie',
  },
  {
    id: 'pl-te-golden',
    title: 'Golden Era Telugu',
    description: 'Black-and-white classics and the voices that defined Telugu cinema music.',
    kind: 'era',
    language: 'te',
    limit: 24,
    match: (song) => TELUGU(song) && song.era === 'Golden era',
  },
  {
    id: 'pl-te-70s',
    title: 'Telugu 1970s',
    description: 'Acoustic orchestras, veena interludes and evergreen 1970s Telugu melodies.',
    kind: 'era',
    language: 'te',
    limit: 20,
    match: (song) => TELUGU(song) && song.era === '1970s',
  },
  {
    id: 'pl-te-80s',
    title: 'Telugu 1980s',
    description: 'Cassette-era Telugu music: big strings, bigger choruses.',
    kind: 'era',
    language: 'te',
    limit: 20,
    match: (song) => TELUGU(song) && song.era === '1980s',
  },
  {
    id: 'pl-te-90s',
    title: 'Telugu 1990s',
    description: 'The decade the Telugu soundtrack went mass — and melody stayed king.',
    kind: 'era',
    language: 'te',
    limit: 22,
    match: (song) => TELUGU(song) && song.era === '1990s',
  },
  {
    id: 'pl-te-00s',
    title: 'Telugu 2000s',
    description: 'Remix boom, new-gen melody and the rise of the Telugu romantic anthem.',
    kind: 'era',
    language: 'te',
    limit: 22,
    match: (song) => TELUGU(song) && song.era === '2000s',
  },
  {
    id: 'pl-te-10s',
    title: 'Telugu 2010s',
    description: 'Streaming-era Telugu pop, from EDM-flavoured mass to acoustic heartbreak.',
    kind: 'era',
    language: 'te',
    limit: 24,
    match: (song) => TELUGU(song) && song.era === '2010s',
  },
  {
    id: 'pl-te-20s',
    title: 'Telugu 2020s',
    description: 'The current Telugu sound — fresh releases from the demo catalogue.',
    kind: 'era',
    language: 'te',
    limit: 26,
    match: (song) => TELUGU(song) && song.era === '2020s',
  },
  {
    id: 'pl-te-latest',
    title: 'Latest Telugu Releases',
    description: 'Everything new in the Telugu demo catalogue, refreshed as the catalogue grows.',
    kind: 'editorial',
    language: 'te',
    limit: 30,
    match: (song) => TELUGU(song) && song.year >= 2024,
  },
  {
    id: 'pl-hi-trending',
    title: 'Trending Hindi Songs',
    description: 'Hindi film, indie and dance tracks leading the demo charts this week.',
    kind: 'editorial',
    language: 'hi',
    limit: 30,
    match: (song) => song.language === 'hi',
  },
  {
    id: 'pl-tamil-melody',
    title: 'Tamil Melody',
    description: 'Soft Tamil melodies from the demo catalogue.',
    kind: 'language',
    language: 'ta',
    limit: 20,
    match: (song) => song.language === 'ta',
  },
  {
    id: 'pl-kannada-hits',
    title: 'Kannada Hits',
    description: 'Kannada film and indie picks.',
    kind: 'language',
    language: 'kn',
    limit: 20,
    match: (song) => song.language === 'kn',
  },
  {
    id: 'pl-malayalam-waves',
    title: 'Malayalam Waves',
    description: 'Malayalam melodies for a slow afternoon.',
    kind: 'language',
    language: 'ml',
    limit: 20,
    match: (song) => song.language === 'ml',
  },
  {
    id: 'pl-bengali-gold',
    title: 'Bengali Gold',
    description: 'Bengali modern songs and folk-leaning picks.',
    kind: 'language',
    language: 'bn',
    limit: 20,
    match: (song) => song.language === 'bn',
  },
  {
    id: 'pl-punjabi-beat',
    title: 'Punjabi Beat',
    description: 'Dhol-driven Punjabi energy from the demo catalogue.',
    kind: 'language',
    language: 'pa',
    limit: 20,
    match: (song) => song.language === 'pa',
  },
  {
    id: 'pl-morning-raag',
    title: 'Morning Raag',
    description: 'Calm, unhurried music to start the day — ideal with filter coffee.',
    kind: 'mood',
    limit: 26,
    match: (song) => song.mood === 'Calm' || song.genre === 'Classical',
  },
  {
    id: 'pl-late-night',
    title: 'Late Night Nostalgia',
    description: 'Nostalgic, slightly melancholic songs for after midnight.',
    kind: 'mood',
    limit: 26,
    match: (song) => song.mood === 'Nostalgic' || song.mood === 'Melancholy',
  },
  {
    id: 'pl-focus',
    title: 'Focus & Study',
    description: 'Instrumental-leaning, low-distraction tracks for deep work.',
    kind: 'mood',
    limit: 24,
    match: (song) => song.mood === 'Focus' || song.genre === 'Classical' || song.genre === 'Fusion',
  },
  {
    id: 'pl-party',
    title: 'Indian Party Starters',
    description: 'Mass beats, dance numbers and wedding-floor anthems across languages.',
    kind: 'mood',
    limit: 30,
    match: (song) => song.mood === 'Party' || song.mood === 'Energetic' || song.genre === 'Dance',
  },
  {
    id: 'pl-festival',
    title: 'Festival Devotion',
    description: 'Devotional songs across Indian languages for festival days.',
    kind: 'genre',
    limit: 28,
    match: (song) => song.genre === 'Devotional',
  },
  {
    id: 'pl-classical',
    title: 'Carnatic & Classical',
    description: 'Classical and fusion picks from the demo catalogue.',
    kind: 'genre',
    limit: 22,
    match: (song) => song.genre === 'Classical' || song.genre === 'Fusion',
  },
  {
    id: 'pl-indie-rising',
    title: 'Indian Indie Rising',
    description: 'Independent releases across Indian languages.',
    kind: 'genre',
    limit: 26,
    match: (song) => song.genre === 'Indie',
  },
  {
    id: 'pl-top50-india',
    title: 'Top 50 India',
    description: 'The 50 most-played tracks in the Mana Music demo catalogue right now.',
    kind: 'chart',
    limit: 50,
    match: () => true,
  },
  {
    id: 'pl-top50-telugu',
    title: 'Top 50 Telugu',
    description: 'The Telugu top 50, refreshed weekly in the demo catalogue.',
    kind: 'chart',
    language: 'te',
    limit: 50,
    match: TELUGU,
  },
  {
    id: 'pl-top50-hindi',
    title: 'Top 50 Hindi',
    description: 'The Hindi top 50 in the demo catalogue.',
    kind: 'chart',
    language: 'hi',
    limit: 50,
    match: (song) => song.language === 'hi',
  },
];

const playlists: Playlist[] = PLAYLIST_SEEDS.map((seed) => ({
  id: seed.id,
  title: seed.title,
  description: seed.description,
  kind: seed.kind,
  language: seed.language,
  curator: seed.curator ?? 'Mana Music Editorial',
  isPublic: true,
  songIds: songs.filter(seed.match).sort(byPlays).slice(0, seed.limit ?? 25).map((song) => song.id),
}));

const MIX_SEEDS = [
  { id: 'mix-1', title: 'Daily Mix 1', description: 'Telugu melody, romance and the soft stuff.', match: (song: Song) => song.language === 'te' && (song.genre === 'Melody' || song.genre === 'Romantic') },
  { id: 'mix-2', title: 'Daily Mix 2', description: 'Telugu mass, folk and festival energy.', match: (song: Song) => song.language === 'te' && (song.genre === 'Mass' || song.genre === 'Folk' || song.genre === 'Devotional') },
  { id: 'mix-3', title: 'Daily Mix 3', description: 'Hindi film, indie and dance.', match: (song: Song) => song.language === 'hi' },
  { id: 'mix-4', title: 'Daily Mix 4', description: 'South Indian melodies across four languages.', match: (song: Song) => ['ta', 'ml', 'kn', 'tcy'].includes(song.language) },
  { id: 'mix-5', title: 'Daily Mix 5', description: 'Classical, fusion and focus-friendly picks.', match: (song: Song) => song.genre === 'Classical' || song.genre === 'Fusion' || song.mood === 'Focus' },
  { id: 'mix-6', title: 'Daily Mix 6', description: 'Golden-era and 1970s nostalgia.', match: (song: Song) => song.era === 'Golden era' || song.era === '1970s' || song.era === '1980s' },
];

for (const mix of MIX_SEEDS) {
  playlists.push({
    id: mix.id,
    title: mix.title,
    description: mix.description,
    kind: 'mix',
    curator: 'Made for you',
    isPublic: true,
    songIds: songs.filter(mix.match).sort(byPlays).slice(0, 24).map((song) => song.id),
  });
}

interface StationSeed {
  id: string;
  title: string;
  description: string;
  language: string;
  match: (song: Song) => boolean;
}

const STATION_SEEDS: StationSeed[] = [
  { id: 'rd-te-melody', title: 'Telugu Melody Radio', description: 'Non-stop Telugu melody, older classics mixed with today.', language: 'te', match: (song) => song.language === 'te' && (song.genre === 'Melody' || song.genre === 'Romantic') },
  { id: 'rd-te-mass', title: 'Telugu Mass Radio', description: 'High-energy Telugu beats for the commute.', language: 'te', match: (song) => song.language === 'te' && (song.genre === 'Mass' || song.mood === 'Energetic') },
  { id: 'rd-te-golden', title: 'Telugu Golden Era Radio', description: 'Golden-era and 1970s Telugu classics only.', language: 'te', match: (song) => song.language === 'te' && (song.era === 'Golden era' || song.era === '1970s' || song.era === '1980s') },
  { id: 'rd-te-folk', title: 'Telugu Folk Radio', description: 'Jaanapada and folk-fusion from the Telugu states.', language: 'te', match: (song) => song.language === 'te' && song.genre === 'Folk' },
  { id: 'rd-te-devotional', title: 'Telugu Devotional Radio', description: 'Bhajans and devotional songs around the clock.', language: 'te', match: (song) => song.language === 'te' && song.genre === 'Devotional' },
  { id: 'rd-te-indie', title: 'Telugu Indie Radio', description: 'Independent Telugu artists, uninterrupted.', language: 'te', match: (song) => song.language === 'te' && song.genre === 'Indie' },
  { id: 'rd-hi-hits', title: 'Hindi Hits Radio', description: 'Hindi film and indie hits from the demo catalogue.', language: 'hi', match: (song) => song.language === 'hi' },
  { id: 'rd-ta-melody', title: 'Tamil Melody Radio', description: 'Tamil melodies, softly rotating.', language: 'ta', match: (song) => song.language === 'ta' },
  { id: 'rd-kn-hits', title: 'Kannada Hits Radio', description: 'Kannada picks from every era.', language: 'kn', match: (song) => song.language === 'kn' },
  { id: 'rd-party', title: 'Pan-India Party Radio', description: 'Dance and mass tracks across Indian languages.', language: 'te', match: (song) => song.mood === 'Party' || song.mood === 'Energetic' },
  { id: 'rd-night', title: 'Late Night Telugu Radio', description: 'Slow, nostalgic Telugu songs for late hours.', language: 'te', match: (song) => song.language === 'te' && (song.mood === 'Nostalgic' || song.mood === 'Melancholy' || song.mood === 'Calm') },
  { id: 'rd-all-india', title: 'All India Discoveries', description: 'A rotating tour of all 24 demo languages.', language: 'te', match: () => true },
];

const stations: RadioStation[] = STATION_SEEDS.map((seed) => ({
  id: seed.id,
  title: seed.title,
  description: seed.description,
  language: seed.language,
  songIds: songs.filter(seed.match).sort(byPlays).slice(0, 40).map((song) => song.id),
}));

const podcasts: Podcast[] = PODCAST_SEEDS.map((seed, podcastIndex) => ({
  id: seed.id,
  title: seed.title,
  host: seed.host,
  description: seed.description,
  language: seed.language,
  episodes: seed.episodes.map((episodeTitle, episodeIndex) => {
    const loop = AUDIO[(podcastIndex + episodeIndex) % AUDIO.length];
    const day = 2 + podcastIndex * 3 + episodeIndex * 7;
    return {
      id: `${seed.id}-ep-${episodeIndex + 1}`,
      title: `Ep. ${episodeIndex + 1} · ${episodeTitle}`,
      description: `${seed.title} episode ${episodeIndex + 1}. Demo audio: an original instrumental loop stands in for the real episode recording.`,
      durationSec: loop.durationSec,
      audioId: loop.id,
      publishedAt: new Date(Date.UTC(2026, 8, Math.min(28, day))).toISOString().slice(0, 10),
    };
  }),
}));

export const catalog: Catalog = {
  languages: LANGUAGES,
  artists,
  albums,
  songs,
  playlists,
  stations,
  podcasts,
};

export const AUDIO_LOOPS = AUDIO;

export function audioFileFor(audioId: string): string {
  return AUDIO.find((loop) => loop.id === audioId)?.file ?? AUDIO[0].file;
}

/** Fictional demo movies present in the catalogue, with their track counts. */
export const demoMovies = (() => {
  const map = new Map<string, { title: string; language: string; year: number; songIds: string[] }>();
  for (const song of songs) {
    if (!song.movie) continue;
    const existing = map.get(`${song.language}:${song.movie}`);
    if (existing) {
      existing.songIds.push(song.id);
    } else {
      map.set(`${song.language}:${song.movie}`, {
        title: song.movie,
        language: song.language,
        year: song.year,
        songIds: [song.id],
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.songIds.length - a.songIds.length);
})();

export const topSongs = (limit: number, language?: string): Song[] =>
  songs
    .filter((song) => !language || song.language === language)
    .slice()
    .sort(byPlays)
    .slice(0, limit);
