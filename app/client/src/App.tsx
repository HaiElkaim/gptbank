import React from 'react';
import Chat from '@/components/Chat';

function App() {
  return (
    <div className="app-container">
      <div className="info-banner">
        Infos générales — aucune opération bancaire. Aucune donnée sensible.
      </div>
      <Chat />
    </div>
  );
}

export default App;
