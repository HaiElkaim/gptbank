import React from 'react';

export interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const Message: React.FC<MessageProps> = ({ role, content }) => {
  const renderContent = () => {
    // Simple regex to find citations like [source: fees.csv, 2023-06-01]
    const parts = content.split(/(\[source: [^\],]+, [^\],]+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[source: ([^,]+), ([^,]+)\]/);
      if (match) {
        return (
          <cite key={index} className="source-citation">
            Source: {match[1].trim()}, {match[2].trim()}
          </cite>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`message ${role}`}>
      <div className="message-content">
        <pre>{renderContent()}</pre>
      </div>
    </div>
  );
};
