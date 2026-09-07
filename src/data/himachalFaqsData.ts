import { PILGRIMAGE_FAQS_REGISTRY, DestinationFaqs, CityFaq } from './pilgrimageFaqsData';

export type { CityFaq, DestinationFaqs };

export const himachalFaqsDestinations: DestinationFaqs[] = PILGRIMAGE_FAQS_REGISTRY.filter(
  (d) => d.id === 'himachal-devis' || d.id === 'chardham' || d.id === 'haridwar-rishikesh' || d.id === 'mathura-vrindavan'
);
