export interface MantraPreset {
  id: string;
  name: string;
  deity: string;
  transliteration: string;
  meaning: string;
  category: 'Shiva' | 'Devi' | 'Vishnu' | 'Universal';
}

export interface JapSessionRecord {
  id: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  mantra: string;
  beadCount: number;
  malasCompleted: number;
  durationSeconds: number;
}

export interface JapCounterState {
  currentBead: number;
  currentMalaRound: number;
  activeMantra: string;
  targetMalaGoal: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  history: JapSessionRecord[];
}

export type JapTimeframe = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime';

export const DEFAULT_MANTRAS: MantraPreset[] = [
  { id: 'samba-sadashiva', name: 'Samba Sadashiva', deity: 'Lord Shiva & Maa Parvati', transliteration: 'Sāmba Sadāśiva', meaning: 'A devotional name of Shiva with the Divine Mother.', category: 'Shiva' },
  { id: 'om-namah-shivaya', name: 'Om Namah Shivaya', deity: 'Lord Shiva', transliteration: 'Oṁ Namaḥ Śivāya', meaning: 'Salutation to the auspicious divine consciousness.', category: 'Shiva' },
  { id: 'maha-mrityunjaya', name: 'Om Tryambakam Yajamahe', deity: 'Lord Shiva', transliteration: 'Oṁ Tryambakaṁ Yajāmahe', meaning: 'The opening of the Maha Mrityunjaya prayer.', category: 'Shiva' },
  { id: 'krishna', name: 'Shri Krishna', deity: 'Lord Krishna', transliteration: 'Śrī Kṛṣṇa', meaning: 'Devotional remembrance of Lord Krishna.', category: 'Vishnu' },
  { id: 'krishna-sharanam', name: 'Shri Krishna Sharanam Mama', deity: 'Lord Krishna', transliteration: 'Śrī Kṛṣṇa Śaraṇaṁ Mama', meaning: 'Lord Krishna is my refuge.', category: 'Vishnu' },
  { id: 'radha-radha', name: 'Radha Radha', deity: 'Sri Radha', transliteration: 'Rādhā Rādhā', meaning: 'Loving remembrance of Sri Radha.', category: 'Vishnu' },
  { id: 'radhe-radhe', name: 'Radhe Radhe', deity: 'Sri Radha', transliteration: 'Rādhe Rādhe', meaning: 'Devotional remembrance of Sri Radha.', category: 'Vishnu' },
  { id: 'radha-krishna', name: 'Radha Krishna', deity: 'Sri Radha & Lord Krishna', transliteration: 'Rādhā Kṛṣṇa', meaning: 'Devotional remembrance of Radha and Krishna.', category: 'Vishnu' },
  { id: 'hare-krishna', name: 'Hare Krishna Mahamantra', deity: 'Sri Krishna', transliteration: 'Hare Kṛṣṇa Hare Kṛṣṇa Kṛṣṇa Kṛṣṇa Hare Hare', meaning: 'A traditional chanting of the divine names.', category: 'Universal' },
  { id: 'om-namo-bhagavate', name: 'Om Namo Bhagavate Vasudevaya', deity: 'Lord Vishnu / Krishna', transliteration: 'Oṁ Namo Bhagavate Vāsudevāya', meaning: 'Salutations to the Supreme Lord Vasudeva.', category: 'Vishnu' },
  { id: 'sri-rama', name: 'Shri Rama Jaya Rama Jaya Jaya Rama', deity: 'Bhagwan Shri Ram', transliteration: 'Śrī Rāma Jaya Rāma Jaya Jaya Rāma', meaning: 'Glory to Bhagwan Shri Ram.', category: 'Vishnu' },
  { id: 'sita-rama', name: 'Sita Rama', deity: 'Sita & Lord Rama', transliteration: 'Sītā Rāma', meaning: 'Devotional remembrance of Sita and Rama.', category: 'Vishnu' },
  { id: 'om-hanumate', name: 'Om Hanumate Namah', deity: 'Lord Hanuman', transliteration: 'Oṁ Hanumate Namaḥ', meaning: 'Salutation to Lord Hanuman.', category: 'Universal' },
  { id: 'ganesh', name: 'Om Gam Ganapataye Namah', deity: 'Lord Ganesha', transliteration: 'Oṁ Gaṁ Gaṇapataye Namaḥ', meaning: 'Salutation to Lord Ganesha.', category: 'Universal' },
  { id: 'gayatri-mantra', name: 'Gayatri Mantra', deity: 'Gayatri Devi', transliteration: 'Oṁ Bhūr Bhuvaḥ Svaḥ Tat Savitur Vareṇyam', meaning: 'Prayer for divine light and wisdom.', category: 'Universal' },
  { id: 'chamunda-devi', name: 'Chamunda Devi Mantra', deity: 'Maa Chamunda', transliteration: 'Oṁ Aiṁ Hrīṁ Klīṁ Cāmuṇḍāyai Vicce', meaning: 'A traditional Navarna Shakti mantra.', category: 'Devi' },
];
