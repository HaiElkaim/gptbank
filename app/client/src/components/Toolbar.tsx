import React from 'react';

interface ToolbarProps {
  onClear: () => void;
  onExport: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onClear, onExport }) => {
  return (
    <div className="toolbar">
      <button onClick={onClear} className="toolbar-button">
        Effacer
      </button>
      <button onClick={onExport} className="toolbar-button">
        Exporter
      </button>
    </div>
  );
};

export default Toolbar;
