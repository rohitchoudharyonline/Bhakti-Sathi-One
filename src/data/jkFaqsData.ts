import { PILGRIMAGE_FAQS_REGISTRY, DestinationFaqs, CityFaq } from './pilgrimageFaqsData';

export type { CityFaq, DestinationFaqs };

export const jkFaqsDestinations: DestinationFaqs[] = PILGRIMAGE_FAQS_REGISTRY.filter(
  (d) => d.id === 'vaishnodevi' || d.id === 'amarnath' || d.id === 'kashi-varanasi' || d.id === 'ayodhya'
);
