import React from 'react';
import type { Device } from '../types';
import { ANDROID_VERSIONS } from '../constants';

interface DeviceManagerProps {
  devices: Device[];
  selectedDeviceIds: string[];
  onSelectionChange: (deviceId: string, isSelected: boolean) => void;
  onSelectAllChange: (selectAll: boolean) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isInstalling: boolean;
}

const getVersionInfo = (version: string) => {
    return ANDROID_VERSIONS.find(v => v.id === version);
};

const StatusIndicator: React.FC<{ status: Device['status'] }> = ({ status }) => {
    const baseClasses = "w-2.5 h-2.5 rounded-full mr-2";
    if (status === 'Connected') {
        return <div className={`${baseClasses} bg-green-500`} title="Connected"></div>;
    }
    if (status === 'Unauthorized') {
        return <div className={`${baseClasses} bg-yellow-500`} title="Unauthorized"></div>;
    }
    return <div className={`${baseClasses} bg-red-500`} title="Offline"></div>;
};

// Note: This component is now DeviceManager, but the filename is VersionSelector.tsx to avoid adding new files to the project structure.
export const DeviceManager: React.FC<DeviceManagerProps> = ({ devices, selectedDeviceIds, onSelectionChange, onSelectAllChange, onRefresh, isLoading, isInstalling }) => {
  const supportedDevices = devices.filter(d => d.isSupported && d.status === 'Connected');
  const allSelected = supportedDevices.length > 0 && selectedDeviceIds.length === supportedDevices.length;
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
            <input
                type="checkbox"
                id="select-all"
                checked={allSelected}
                onChange={(e) => onSelectAllChange(e.target.checked)}
                disabled={isLoading || isInstalling || supportedDevices.length === 0}
                className="h-5 w-5 rounded bg-slate-700 border-slate-500 text-sky-500 focus:ring-sky-500 disabled:opacity-50"
                title={supportedDevices.length > 0 ? "Select/Deselect All Supported" : "No supported devices to select"}
            />
            <label htmlFor="select-all" className="text-lg font-semibold text-white">1. Select Devices</label>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading || isInstalling}
          className="flex items-center space-x-2 text-sm bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold px-3 py-1.5 rounded-md transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 4h-5v5M4 20h5v-5" />
          </svg>
          <span>{isLoading ? 'Scanning...' : 'Refresh'}</span>
        </button>
      </div>

      <div className="space-y-3 min-h-[120px]">
        {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-400 py-8">Scanning for ADB devices...</div>
        ) : devices.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 py-8">No devices found. Ensure ADB is configured and devices are connected.</div>
        ) : (
            devices.map(device => {
                const versionInfo = getVersionInfo(device.version);
                const isSelected = selectedDeviceIds.includes(device.id);
                const isSelectable = device.isSupported && device.status === 'Connected';

                return (
                    <label key={device.id} htmlFor={`device-${device.id}`} className={`flex items-center p-3 rounded-md transition-colors border-2 ${isSelected ? 'bg-slate-700 border-sky-500' : 'bg-slate-900/50 border-transparent hover:bg-slate-800'} ${isInstalling || !isSelectable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input
                            type="checkbox"
                            id={`device-${device.id}`}
                            checked={isSelected}
                            disabled={!isSelectable || isInstalling}
                            onChange={(e) => onSelectionChange(device.id, e.target.checked)}
                            className="h-5 w-5 rounded bg-slate-700 border-slate-500 text-sky-500 focus:ring-sky-500 disabled:opacity-50 flex-shrink-0"
                        />
                        <div className="ml-4 flex-grow">
                            <div className="flex items-baseline space-x-2">
                                <p className="font-bold text-white text-base">{device.model}</p>
                                <p className="text-slate-400 text-xs font-mono">{device.id}</p>
                            </div>
                            <div className="flex items-center text-xs mt-2 space-x-2">
                                <span className="flex items-center px-2 py-0.5 rounded-full bg-slate-700 text-white font-medium">
                                    <StatusIndicator status={device.status} /> {device.status}
                                </span>
                                {device.isSupported && versionInfo ? (
                                    <span className={`px-2 py-0.5 rounded-full text-white font-medium ${versionInfo.color}`}>
                                        Android {device.version}
                                    </span>
                                ) : (
                                   <span className="px-2 py-0.5 rounded-full bg-slate-600 text-white font-medium">
                                        Android {device.version}
                                    </span>
                                )}
                                <span className={`${isSelectable ? 'text-green-400' : 'text-yellow-400'} font-medium`}>{isSelectable ? 'Supported' : 'Unsupported'}</span>
                            </div>
                             {isSelectable && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs mt-3 text-slate-400 font-mono pt-2 border-t border-slate-700/50">
                                    <div>AP: <span className="text-slate-300 font-semibold">{device.apVersion}</span></div>
                                    <div>CP: <span className="text-slate-300 font-semibold">{device.cpVersion}</span></div>
                                    <div>CSC: <span className="text-slate-300 font-semibold">{device.cscVersion}</span></div>
                                </div>
                            )}
                        </div>
                    </label>
                )
            })
        )}
      </div>
    </div>
  );
};