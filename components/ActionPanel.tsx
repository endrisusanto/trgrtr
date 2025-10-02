
import React from 'react';

interface ActionPanelProps {
    selectedDeviceCount: number;
    isInstalling: boolean;
    onInstall: () => void;
    onCancel: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ selectedDeviceCount, isInstalling, onInstall, onCancel }) => {
    const hasSelection = selectedDeviceCount > 0;

    return (
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">2. Execute Installation</h2>

            <div className="bg-slate-900/70 p-4 rounded-md mb-4 text-center">
                <p className="text-sm text-slate-400">Selected Devices</p>
                <p className="text-xl font-bold text-white mt-1">
                    {selectedDeviceCount}
                </p>
            </div>

            {isInstalling ? (
                 <button
                    onClick={onCancel}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Cancel Process</span>
                </button>
            ) : (
                <button
                    onClick={onInstall}
                    disabled={!hasSelection}
                    className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2
                    enabled:hover:bg-green-700
                    disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>
                        {hasSelection ? `Install on ${selectedDeviceCount} Device${selectedDeviceCount > 1 ? 's' : ''}` : 'Select a Device to Start'}
                    </span>
                </button>
            )}
        </div>
    );
};
