import React from 'react';
import { MessageCircle } from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../../constants';

export const WhatsAppFloat: React.FC = () => {
  const number = DEFAULT_SITE_SETTINGS.whatsappNumber;
  const url = `https://wa.me/91${number}?text=${encodeURIComponent(
    'Hi Anu Atelier! I would like to inquire about handcrafted products.'
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 sm:bottom-6 right-5 z-40 flex items-center gap-2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg-soft hover:shadow-xl transition-all duration-300 hover:scale-105 group"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-semibold px-0 group-hover:px-1">
        WhatsApp Support
      </span>
    </a>
  );
};
