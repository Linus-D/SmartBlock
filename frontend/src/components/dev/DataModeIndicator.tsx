// src/components/dev/DataModeIndicator.tsx
import React, { useState, useEffect } from 'react';
import { useContract } from '../../hooks/useContract';
import { DataMode } from '../../lib/dataService';

interface DataModeIndicatorProps {
  className?: string;
  show?: boolean; // Only show in development mode by default
}

export const DataModeIndicator: React.FC<DataModeIndicatorProps> = ({
  className = '',
  show = import.meta.env.DEV
}) => {
  const { getCurrentDataMode, setDataMode } = useContract();
  const [currentMode, setCurrentMode] = useState<{mode: DataMode; usingMock: boolean}>({
    mode: DataMode.MOCK,
    usingMock: false
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateMode = () => {
      const mode = getCurrentDataMode();
      setCurrentMode(mode);
    };

    updateMode();
    // Update every 2 seconds to reflect any changes
    const interval = setInterval(updateMode, 2000);

    return () => clearInterval(interval);
  }, [getCurrentDataMode]);

  const handleModeChange = (newMode: DataMode) => {
    setDataMode(newMode);
    // Immediately update the display
    setTimeout(() => {
      const mode = getCurrentDataMode();
      setCurrentMode(mode);
    }, 100);
  };

  if (!show) return null;

  const modeDisplay = currentMode.usingMock ? 'MOCK' : 'REAL';
  const modeColor = currentMode.usingMock ? 'bg-yellow-500' : 'bg-green-500';
  const modeBorder = currentMode.usingMock ? 'border-yellow-400' : 'border-green-400';

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div
        className={`${modeColor} ${modeBorder} border-2 rounded-lg px-3 py-2 text-white text-sm font-mono cursor-pointer transition-all duration-200 ${
          isExpanded ? 'rounded-b-none' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Click to change data mode (Dev only)"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>DATA: {modeDisplay}</span>
          <span className="text-xs opacity-75">({currentMode.mode})</span>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-gray-800 border-2 border-gray-600 rounded-b-lg p-3 text-white text-sm font-mono">
          <div className="mb-2 text-xs text-gray-300">Switch Data Mode:</div>
          <div className="space-y-1">
            {Object.values(DataMode).map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  currentMode.mode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {mode.toUpperCase()}
                {mode === DataMode.MOCK && currentMode.usingMock && (
                  <span className="text-xs opacity-75 ml-1">
                    (active)
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
            <div>Auto: Switches based on environment</div>
            <div>Mock: Always use sample data</div>
            <div>Real: Always use blockchain data</div>
          </div>
        </div>
      )}
    </div>
  );
};