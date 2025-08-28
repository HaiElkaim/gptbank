import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageProps } from '@/components/Message';
import Toolbar from '@/components/Toolbar';
import { askQuestion } from '@/lib/api';
import { streamResponse } from '@/lib/stream';

const QUICK_ACTIONS = [
  'Frais SEPA ?',
  'Éligibilité Compte ?',
  'Délais d’ouverture ?',
  'Sécurité carte ?',
];

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question: string) => {
    if (isLoading || !question.trim()) return;

    const userMessage: MessageProps = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    const assistantMessage: MessageProps = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const stream = await askQuestion(question, messages.slice(0, -1));
      
      const updateFn = (chunk: string) => {
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      };

      await streamResponse(stream, updateFn);

    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage: MessageProps = {
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleQuickAction = (action: string) => {
    handleSend(action);
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleExport = () => {
    const content = messages
      .map(msg => `${msg.role.toUpperCase()}:\n${msg.content}`)
      .join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gpt-bank-chat-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="chat-container flex-1 flex flex-col">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <Message key={index} {...msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="quick-actions">
        {QUICK_ACTIONS.map((action) => (
          <button key={action} onClick={() => handleQuickAction(action)} disabled={isLoading}>
            {action}
          </button>
        ))}
      </div>

      <div className="input-area">
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Envoyer
          </button>
        </form>
      </div>
      <Toolbar onClear={handleClear} onExport={handleExport} />
    </div>
  );
};

export default Chat;
