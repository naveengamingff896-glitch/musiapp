/**
 * Fictional name and title pools used to build the demo catalogue.
 * Every artist, movie and song title here is invented for the prototype; the
 * app states this clearly wherever the catalogue is presented.
 */

export interface TitleWord {
  native?: string;
  latin: string;
}

export const FIRST_NAMES = [
  'Sruthi', 'Vamsi', 'Harini', 'Pavan', 'Meghana', 'Rithvik', 'Lakshmi', 'Kiran',
  'Nandini', 'Sai Charan', 'Deepthi', 'Bhargav', 'Aparna', 'Yasaswi', 'Aarav',
  'Ira', 'Kabir', 'Naina', 'Rudra', 'Tara', 'Vihaan', 'Sanya', 'Ananya', 'Devraj',
  'Ishita', 'Manav', 'Neel', 'Riya', 'Sahil', 'Trisha', 'Uday', 'Vidya', 'Zoya',
  'Aditya', 'Bhavya', 'Chetan', 'Divya', 'Eshan', 'Farhan', 'Gauri', 'Jahnavi',
  'Karthik', 'Lavanya', 'Madhav', 'Nithya', 'Omkar', 'Pranav', 'Rekha', 'Sameera',
  'Tanvi', 'Varun', 'Yamini', 'Arjun', 'Bindu', 'Chaitanya', 'Dhruv', 'Gayatri',
];

export const SURNAME_POOL: Record<string, string[]> = {
  te: ['Keerthi', 'Vardhan', 'Chowdary', 'Sastry', 'Vemuri', 'Kondapalli'],
  hi: ['Mehta', 'Bansal', 'Rathore', 'Kapoor', 'Sinha'],
  ta: ['Selvan', 'Kannan', 'Iyer', 'Murugan'],
  ml: ['Menon', 'Nambiar', 'Kurup', 'Pillai'],
  kn: ['Hegde', 'Gowda', 'Bhat', 'Achar'],
  bn: ['Chatterjee', 'Das', 'Ghosh', 'Bose'],
  mr: ['Deshmukh', 'Joshi', 'Patil', 'Kulkarni'],
  pa: ['Gill', 'Sandhu', 'Bajwa', 'Dhillon'],
  gu: ['Pandya', 'Vyas', 'Trivedi', 'Solanki'],
  or: ['Mohapatra', 'Nayak', 'Patnaik', 'Behera'],
  as: ['Bora', 'Hazarika', 'Barua', 'Saikia'],
  ur: ['Rizvi', 'Siddiqui', 'Ansari', 'Qureshi'],
  sa: ['Shastri', 'Dikshit', 'Upadhyay', 'Chakravarti'],
  ks: ['Wani', 'Dar', 'Mir', 'Lone'],
  kok: ['Naik', 'Kamat', 'Sardesai', 'Prabhu'],
  mni: ['Ngangom', 'Meitei', 'Khuman', 'Yumnam'],
  ne: ['Gurung', 'Thapa', 'Rai', 'Shrestha'],
  sd: ['Memon', 'Advani', 'Chhabria', 'Lalwani'],
  doi: ['Dogra', 'Pathania', 'Sharma', 'Verma'],
  brx: ['Brahma', 'Narzary', 'Basumatary', 'Daimary'],
  mai: ['Jha', 'Mishra', 'Thakur', 'Choudhary'],
  sat: ['Murmu', 'Hembrom', 'Tudu', 'Soren'],
  bho: ['Yadav', 'Tiwari', 'Pandey', 'Chauhan'],
  tcy: ['Shetty', 'Poojary', 'Karkera', 'Salian'],
};

const TELUGU_FIRST: TitleWord[] = [
  { native: 'వెన్నెల', latin: 'Vennela' },
  { native: 'గాలి', latin: 'Gaali' },
  { native: 'గుండెలో', latin: 'Gundelo' },
  { native: 'ప్రేమ', latin: 'Prema' },
  { native: 'కలలు', latin: 'Kalalu' },
  { native: 'మౌనం', latin: 'Mounam' },
  { native: 'చిరునవ్వు', latin: 'Chirunavvu' },
  { native: 'నింగి', latin: 'Ningi' },
  { native: 'పువ్వు', latin: 'Puvvu' },
  { native: 'మనసు', latin: 'Manasu' },
  { native: 'అందం', latin: 'Andam' },
  { native: 'దీపం', latin: 'Deepam' },
  { native: 'రాగం', latin: 'Raagam' },
  { native: 'వాన', latin: 'Vaana' },
  { native: 'తీయని', latin: 'Teeyani' },
  { native: 'కన్నె', latin: 'Kanne' },
  { native: 'జాబిలి', latin: 'Jaabili' },
  { native: 'ఊసులు', latin: 'Oosulu' },
  { native: 'ఆశ', latin: 'Asha' },
  { native: 'హృదయం', latin: 'Hrudayam' },
];

const TELUGU_SECOND: TitleWord[] = [
  { native: 'గాలి', latin: 'Gaali' },
  { native: 'రాగం', latin: 'Raagam' },
  { native: 'పాట', latin: 'Paata' },
  { native: 'కలలు', latin: 'Kalalu' },
  { native: 'ప్రేమ', latin: 'Prema' },
  { native: 'వెలుగు', latin: 'Velugu' },
  { native: 'తీరం', latin: 'Teeram' },
  { native: 'బాట', latin: 'Baata' },
  { native: 'స్వరం', latin: 'Swaram' },
  { native: 'నవ్వు', latin: 'Navvu' },
  { native: 'కథ', latin: 'Katha' },
  { native: 'దారి', latin: 'Daari' },
  { native: 'లోకం', latin: 'Lokam' },
  { native: 'తోట', latin: 'Thota' },
  { native: 'సిరి', latin: 'Siri' },
];

const HINDI_FIRST: TitleWord[] = [
  { native: 'चाँद', latin: 'Chaand' },
  { native: 'मोहब्बत', latin: 'Mohabbat' },
  { native: 'बारिश', latin: 'Baarish' },
  { native: 'दिल', latin: 'Dil' },
  { native: 'सपने', latin: 'Sapne' },
  { native: 'यादें', latin: 'Yaadein' },
  { native: 'रात', latin: 'Raat' },
  { native: 'सितारे', latin: 'Sitaare' },
  { native: 'धुन', latin: 'Dhun' },
  { native: 'ख्वाब', latin: 'Khwaab' },
  { native: 'सफ़र', latin: 'Safar' },
  { native: 'रोशनी', latin: 'Roshni' },
];

const HINDI_SECOND: TitleWord[] = [
  { native: 'की धुन', latin: 'Ki Dhun' },
  { native: 'का सफ़र', latin: 'Ka Safar' },
  { native: 'की रात', latin: 'Ki Raat' },
  { native: 'में खोया', latin: 'Mein Khoya' },
  { native: 'का इशारा', latin: 'Ka Ishaara' },
  { native: 'की बारिश', latin: 'Ki Baarish' },
  { native: 'का नशा', latin: 'Ka Nasha' },
  { native: 'से दूर', latin: 'Se Door' },
  { native: 'की आवाज़', latin: 'Ki Awaaz' },
  { native: 'का जादू', latin: 'Ka Jaadu' },
];

const LATIN_WORDS: Record<string, string[]> = {
  ta: ['Nilavu', 'Kadal', 'Ithaya', 'Thendral', 'Kadhal', 'Vaanam', 'Isai', 'Malai', 'Mazhai', 'Sol'],
  ml: ['Nilavu', 'Kadal', 'Hridayam', 'Thendral', 'Pranayam', 'Aakasham', 'Raagam', 'Mazha', 'Paattu', 'Mounam'],
  kn: ['Belaku', 'Kadalu', 'Hrudaya', 'Gaali', 'Preeti', 'Aakasha', 'Raaga', 'Maleya', 'Haadu', 'Nenapu'],
  bn: ['Chand', 'Bhalobasha', 'Brishti', 'Hridoy', 'Shopno', 'Raat', 'Gaan', 'Alo', 'Poth', 'Nodir'],
  mr: ['Chand', 'Prem', 'Paus', 'Hriday', 'Swapna', 'Raat', 'Gaani', 'Ujal', 'Vaat', 'Nadi'],
  pa: ['Chann', 'Pyaar', 'Baarish', 'Dil', 'Sapne', 'Raat', 'Geet', 'Roshni', 'Raah', 'Dariya'],
  gu: ['Chand', 'Prem', 'Varsaad', 'Hriday', 'Sapna', 'Raat', 'Geet', 'Ajwaal', 'Marg', 'Sarita'],
  or: ['Chandra', 'Prema', 'Barsha', 'Hrudaya', 'Sapana', 'Rati', 'Geeta', 'Aloka', 'Patha', 'Nadi'],
  as: ['Jun', 'Prem', 'Borsha', 'Hridoy', 'Sopun', 'Rati', 'Geet', 'Pohor', 'Baat', 'Nodi'],
  ur: ['Chaand', 'Mohabbat', 'Baarish', 'Dil', 'Khwaab', 'Raat', 'Dhun', 'Roshni', 'Safar', 'Dariya'],
  sa: ['Chandra', 'Prema', 'Varsha', 'Hridaya', 'Svapna', 'Ratri', 'Geeta', 'Aloka', 'Patha', 'Nadi'],
  ks: ['Tshandur', 'Mohabbat', 'Sheen', 'Dil', 'Khwaab', 'Raat', 'Raag', 'Noor', 'Safar', 'Darya'],
  kok: ['Chandn', 'Mog', 'Pavs', 'Kalliz', 'Sopon', 'Raat', 'Gitan', 'Uzvadd', 'Vatt', 'Nodi'],
  mni: ['Tha', 'Nungshi', 'Nong', 'Mit', 'Mangal', 'Ahing', 'Ishei', 'Nongthrei', 'Lambi', 'Turel'],
  ne: ['Chandrama', 'Maya', 'Pani', 'Hridaya', 'Sapana', 'Raat', 'Geet', 'Ujyalo', 'Bato', 'Khola'],
  sd: ['Chand', 'Muhabbat', 'Meenh', 'Dil', 'Khwaab', 'Raat', 'Sur', 'Roshni', 'Safar', 'Daryah'],
  doi: ['Chann', 'Pyar', 'Baarish', 'Hirda', 'Supne', 'Raat', 'Geet', 'Chanan', 'Raah', 'Nadi'],
  brx: ['Daan', 'Mwnthai', 'Pwrwi', 'Bwswm', 'Sana', 'Hwrwi', 'Zou', 'Kwrwi', 'Lwm', 'Dwisa'],
  mai: ['Chand', 'Preet', 'Barsaat', 'Hriday', 'Sapan', 'Raat', 'Geet', 'Ujala', 'Baat', 'Nadi'],
  sat: ['Chando', 'Marang', 'Dariya', 'Rahum', 'Sapna', 'Rati', 'Sereng', 'Jhilmil', 'Ponthi', 'Gada'],
  bho: ['Chand', 'Pyar', 'Barkha', 'Dil', 'Sapna', 'Raat', 'Geet', 'Ujala', 'Rasta', 'Nadiya'],
  tcy: ['Tingolu', 'Preeti', 'Barsa', 'Hridaya', 'Kanake', 'Raatri', 'Paad', 'Belaku', 'Baata', 'Sooda'],
};

const LATIN_SECOND: Record<string, string[]> = {
  ta: ['Nilavu', 'Kadal', 'Isai', 'Thendral', 'Mazhai', 'Sol', 'Ragam', 'Vaanam'],
  ml: ['Nilavu', 'Kadal', 'Raagam', 'Mazha', 'Paattu', 'Mounam', 'Thendral', 'Vaanam'],
  kn: ['Belaku', 'Kadalu', 'Raaga', 'Haadu', 'Gaali', 'Nenapu', 'Maleya', 'Aakasha'],
  bn: ['Alo', 'Gaan', 'Brishti', 'Shopno', 'Raat', 'Nodir', 'Poth', 'Hridoy'],
  mr: ['Gaani', 'Paus', 'Raat', 'Swapna', 'Nadi', 'Ujal', 'Vaat', 'Prem'],
  pa: ['Geet', 'Baarish', 'Dil', 'Raat', 'Raah', 'Dariya', 'Sapne', 'Chann'],
  gu: ['Geet', 'Varsaad', 'Raat', 'Sarita', 'Sapna', 'Ajwaal', 'Prem', 'Chand'],
  or: ['Geeta', 'Barsha', 'Rati', 'Nadi', 'Aloka', 'Sapana', 'Prema', 'Patha'],
  as: ['Geet', 'Borsha', 'Rati', 'Nodi', 'Sopun', 'Prem', 'Jun', 'Baat'],
  ur: ['Dhun', 'Baarish', 'Raat', 'Safar', 'Dariya', 'Khwaab', 'Noor', 'Dil'],
  sa: ['Geeta', 'Varsha', 'Ratri', 'Nadi', 'Aloka', 'Svapna', 'Prema', 'Patha'],
  ks: ['Raag', 'Sheen', 'Raat', 'Darya', 'Khwaab', 'Noor', 'Safar', 'Dil'],
  kok: ['Gitan', 'Pavs', 'Raat', 'Nodi', 'Sopon', 'Uzvadd', 'Mog', 'Kalliz'],
  mni: ['Ishei', 'Nong', 'Ahing', 'Turel', 'Mangal', 'Mit', 'Tha', 'Lambi'],
  ne: ['Geet', 'Pani', 'Raat', 'Khola', 'Sapana', 'Ujyalo', 'Maya', 'Bato'],
  sd: ['Sur', 'Meenh', 'Raat', 'Daryah', 'Khwaab', 'Roshni', 'Muhabbat', 'Dil'],
  doi: ['Geet', 'Baarish', 'Raat', 'Nadi', 'Supne', 'Chanan', 'Pyar', 'Hirda'],
  brx: ['Zou', 'Pwrwi', 'Hwrwi', 'Dwisa', 'Sana', 'Lwm', 'Mwnthai', 'Kwrwi'],
  mai: ['Geet', 'Barsaat', 'Raat', 'Nadi', 'Sapan', 'Ujala', 'Preet', 'Hriday'],
  sat: ['Sereng', 'Dariya', 'Rati', 'Gada', 'Sapna', 'Jhilmil', 'Marang', 'Ponthi'],
  bho: ['Geet', 'Barkha', 'Raat', 'Nadiya', 'Sapna', 'Ujala', 'Pyar', 'Dil'],
  tcy: ['Paad', 'Barsa', 'Raatri', 'Sooda', 'Kanake', 'Belaku', 'Preeti', 'Baata'],
};

export function titleWords(language: string): { first: TitleWord[]; second: TitleWord[] } {
  if (language === 'te') return { first: TELUGU_FIRST, second: TELUGU_SECOND };
  if (language === 'hi') return { first: HINDI_FIRST, second: HINDI_SECOND };
  const first = LATIN_WORDS[language] ?? LATIN_WORDS.hi;
  const second = LATIN_SECOND[language] ?? LATIN_SECOND.hi;
  return {
    first: first.map((word) => ({ latin: word })),
    second: second.map((word) => ({ latin: word })),
  };
}

export const MOVIE_SUFFIX = ['Katha', 'Yatra', 'Nestam', 'Lokam', 'Gaana', 'Vaibhavam', 'Diary', 'Express'];

export const GENRE_BY_LANGUAGE: Record<string, string[]> = {
  te: ['Melody', 'Mass', 'Romantic', 'Devotional', 'Folk', 'Indie', 'Filmi', 'Classical'],
  hi: ['Filmi', 'Romantic', 'Dance', 'Ghazal', 'Qawwali', 'Sufi', 'Indie', 'Rap'],
  ta: ['Melody', 'Mass', 'Romantic', 'Devotional', 'Folk', 'Filmi'],
  ml: ['Melody', 'Romantic', 'Devotional', 'Indie', 'Filmi'],
  kn: ['Melody', 'Mass', 'Romantic', 'Devotional', 'Folk'],
  bn: ['Melody', 'Romantic', 'Folk', 'Devotional', 'Indie'],
  mr: ['Melody', 'Romantic', 'Folk', 'Devotional', 'Dance'],
  pa: ['Folk', 'Dance', 'Romantic', 'Sufi', 'Rap'],
  gu: ['Melody', 'Folk', 'Romantic', 'Devotional', 'Dance'],
  or: ['Melody', 'Folk', 'Devotional', 'Romantic'],
  as: ['Folk', 'Melody', 'Romantic', 'Devotional'],
  ur: ['Ghazal', 'Sufi', 'Romantic', 'Qawwali'],
  sa: ['Classical', 'Devotional', 'Fusion'],
  ks: ['Sufi', 'Folk', 'Romantic'],
  kok: ['Folk', 'Melody', 'Devotional'],
  mni: ['Folk', 'Melody', 'Devotional'],
  ne: ['Folk', 'Melody', 'Romantic'],
  sd: ['Sufi', 'Folk', 'Ghazal'],
  doi: ['Folk', 'Melody', 'Romantic'],
  brx: ['Folk', 'Devotional', 'Melody'],
  mai: ['Folk', 'Melody', 'Romantic'],
  sat: ['Folk', 'Devotional', 'Melody'],
  bho: ['Folk', 'Dance', 'Romantic', 'Devotional'],
  tcy: ['Folk', 'Melody', 'Devotional'],
};

export const PODCAST_SEEDS = [
  {
    id: 'pc-raga-roots',
    title: 'Raaga Roots',
    host: 'Sruthi Keerthi',
    language: 'te',
    description: 'A Telugu music history walkthrough — from gramophone-era classics to today’s indie scene.',
    episodes: [
      'The first Telugu film songs',
      'Why the 1970s still sounds modern',
      'Ilaiyaraaja and the Telugu cassette boom',
      'The rise of Telugu indie',
    ],
  },
  {
    id: 'pc-melody-lab',
    title: 'Melody Lab',
    host: 'Vamsi Vardhan',
    language: 'te',
    description: 'Composers break down how a Telugu melody is built — raaga, rhythm and lyrics.',
    episodes: [
      'Anatomy of a charanam',
      'Folk metres in film music',
      'Recording a live strings section',
      'The art of the background score',
    ],
  },
  {
    id: 'pc-lyric-room',
    title: 'The Lyric Room',
    host: 'Harini Rao',
    language: 'hi',
    description: 'Conversations with lyricists about writing for Indian cinema and independent releases.',
    episodes: [
      'Writing for a hero introduction',
      'Urdu poetry in film songs',
      'When a lyric becomes a trend',
      'Translating emotion, not words',
    ],
  },
  {
    id: 'pc-southbeat',
    title: 'South Beat Weekly',
    host: 'Pavan Teja',
    language: 'te',
    description: 'A weekly round-up of Telugu, Tamil and Kannada releases with chart context.',
    episodes: [
      'This week in Telugu releases',
      'The pan-India soundtrack race',
      'Debut composers to watch',
      'Festival release season',
    ],
  },
  {
    id: 'pc-indie-india',
    title: 'Indie India',
    host: 'Naina Bansal',
    language: 'hi',
    description: 'Independent artists across India talk about building an audience without a label.',
    episodes: [
      'Recording at home',
      'The economics of indie tours',
      'Regional-language indie',
      'Playlisting and discovery',
    ],
  },
  {
    id: 'pc-licensing-101',
    title: 'Licensing 101',
    host: 'Mana Music Team',
    language: 'en',
    description: 'How music licensing actually works in India — synchronisation, mechanical and public performance rights.',
    episodes: [
      'Why catalogues are licensed, not copied',
      'How royalties reach a songwriter',
      'What a streaming platform needs to launch',
      'Building a compliant catalogue',
    ],
  },
];
