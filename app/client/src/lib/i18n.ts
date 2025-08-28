// Placeholder for internationalization (i18n)
// For a real application, you would use a library like i18next or react-intl

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  fr: {
    'app.title': 'GPT BANK Assistant',
    'info.banner': 'Infos générales — aucune opération bancaire. Aucune donnée sensible.',
    'input.placeholder': 'Posez votre question...',
    'button.send': 'Envoyer',
    'toolbar.clear': 'Effacer',
    'toolbar.export': 'Exporter',
    'error.default': 'Désolé, une erreur est survenue. Veuillez réessayer.',
  },
  en: {
    'app.title': 'GPT BANK Assistant',
    'info.banner': 'General information - no banking operations. No sensitive data.',
    'input.placeholder': 'Ask your question...',
    'button.send': 'Send',
    'toolbar.clear': 'Clear',
    'toolbar.export': 'Export',
    'error.default': 'Sorry, an error occurred. Please try again.',
  },
};

// Simple t function
export const t = (key: string, lang = 'fr'): string => {
  return translations[lang]?.[key] || key;
};
