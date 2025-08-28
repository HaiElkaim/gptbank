import React from 'react';

// This is a placeholder component as requested in the file structure.
// It can be used to display language or other badges in the UI.

interface LangBadgeProps {
  language: string;
}

const LangBadge: React.FC<LangBadgeProps> = ({ language }) => {
  return (
    <span style={{
      backgroundColor: '#e0e0e0',
      color: '#333',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500',
      marginLeft: '8px'
    }}>
      {language}
    </span>
  );
};

export default LangBadge;
