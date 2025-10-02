
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center space-x-4">
       <div className="bg-sky-500 p-3 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
       </div>
      <div>
        <h1 className="text-3xl font-bold text-white">CTS Verifier Installer</h1>
        <p className="text-slate-400 mt-1">A GUI for the CTS Verifier installation script.</p>
      </div>
    </header>
  );
};
