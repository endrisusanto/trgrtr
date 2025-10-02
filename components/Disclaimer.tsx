
import React from 'react';

export const Disclaimer: React.FC = () => {
  return (
    <div className="bg-yellow-900/20 border border-yellow-700/50 text-yellow-200 text-xs rounded-lg p-4">
      <p className="font-bold mb-1">Desktop Application Required</p>
      <p>
        This is a user interface prototype. To execute ADB commands, this application
        must be packaged in a desktop environment like Tauri or Electron which can
        interact with your local system.
      </p>
    </div>
  );
};
