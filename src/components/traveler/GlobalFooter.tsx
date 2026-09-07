import React from 'react';
import { Footer } from './Footer';

interface GlobalFooterProps {
  onSelectDestination?: (slug: string) => void;
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({ onSelectDestination }) => {
  return <Footer onSelectDestination={onSelectDestination} />;
};
