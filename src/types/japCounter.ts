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
  { id: 'samba-sadashiva', name: 'साम्ब सदाशिव', deity: 'Lord Shiva & Maa Parvati', transliteration: 'Sāmba Sadāśiva', meaning: 'A devotional name of Shiva with the Divine Mother.', category: 'Shiva' },
  { id: 'om-namah-shivaya', name: 'ॐ नमः शिवाय', deity: 'Lord Shiva', transliteration: 'Oṁ Namaḥ Śivāya', meaning: 'Salutation to the auspicious divine consciousness.', category: 'Shiva' },
  { id: 'maha-mrityunjaya', name: 'ॐ त्र्यम्बकं यजामहे', deity: 'Lord Shiva', transliteration: 'Oṁ Tryambakaṁ Yajāmahe', meaning: 'The opening of the Maha Mrityunjaya prayer.', category: 'Shiva' },
  { id: 'krishna', name: 'श्री कृष्ण', deity: 'Lord Krishna', transliteration: 'Śrī Kṛṣṇa', meaning: 'Devotional remembrance of Lord Krishna.', category: 'Vishnu' },
  { id: 'krishna-sharanam', name: 'श्री कृष्ण शरणं मम', deity: 'Lord Krishna', transliteration: 'Śrī Kṛṣṇa Śaraṇaṁ Mama', meaning: 'Lord Krishna is my refuge.', category: 'Vishnu' },
  { id: 'radha-radha', name: 'राधा राधा', deity: 'Sri Radha', transliteration: 'Rādhā Rādhā', meaning: 'Loving remembrance of Sri Radha.', category: 'Vishnu' },
  { id: 'radhe-radhe', name: 'राधे राधे', deity: 'Sri Radha', transliteration: 'Rādhe Rādhe', meaning: 'Devotional remembrance of Sri Radha.', category: 'Vishnu' },
  { id: 'radha-krishna', name: 'राधा कृष्ण', deity: 'Sri Radha & Lord Krishna', transliteration: 'Rādhā Kṛṣṇa', meaning: 'Devotional remembrance of Radha and Krishna.', category: 'Vishnu' },
  { id: 'hare-krishna', name: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे', deity: 'Sri Krishna', transliteration: 'Hare Kṛṣṇa Hare Kṛṣṇa Kṛṣṇa Kṛṣṇa Hare Hare', meaning: 'A traditional chanting of the divine names.', category: 'Universal' },
  { id: 'om-namo-bhagavate', name: 'ॐ नमो भगवते वासुदेवाय', deity: 'Lord Vishnu / Krishna', transliteration: 'Oṁ Namo Bhagavate Vāsudevāya', meaning: 'Salutations to the Supreme Lord Vasudeva.', category: 'Vishnu' },
  { id: 'sri-rama', name: 'श्री राम जय राम जय जय राम', deity: 'Bhagwan Shri Ram', transliteration: 'Śrī Rāma Jaya Rāma Jaya Jaya Rāma', meaning: 'Glory to Bhagwan Shri Ram.', category: 'Vishnu' },
  { id: 'sita-rama', name: 'सीता राम', deity: 'Sita & Lord Rama', transliteration: 'Sītā Rāma', meaning: 'Devotional remembrance of Sita and Rama.', category: 'Vishnu' },
  { id: 'om-hanumate', name: 'ॐ हनुमते नमः', deity: 'Lord Hanuman', transliteration: 'Oṁ Hanumate Namaḥ', meaning: 'Salutation to Lord Hanuman.', category: 'Universal' },
  { id: 'ganesh', name: 'ॐ गं गणपतये नमः', deity: 'Lord Ganesha', transliteration: 'Oṁ Gaṁ Gaṇapataye Namaḥ', meaning: 'Salutation to Lord Ganesha.', category: 'Universal' },
  { id: 'gayatri-mantra', name: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यम्', deity: 'Gayatri Devi', transliteration: 'Oṁ Bhūr Bhuvaḥ Svaḥ Tat Savitur Vareṇyam', meaning: 'Prayer for divine light and wisdom.', category: 'Universal' },
  { id: 'chamunda-devi', name: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे', deity: 'Maa Chamunda', transliteration: 'Oṁ Aiṁ Hrīṁ Klīṁ Cāmuṇḍāyai Vicce', meaning: 'A traditional Navarna Shakti mantra.', category: 'Devi' },
];
