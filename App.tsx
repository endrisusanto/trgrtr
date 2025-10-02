import React, { useState, useCallback, useRef, useEffect } from 'react';
import { installForVersion, getConnectedDevices } from './services/ctsInstallerService';
import type { LogEntry, Device } from './types';
import { Header } from './components/Header';
import { DeviceManager } from './components/VersionSelector';
import { LogViewer } from './components/LogViewer';
import { Disclaimer } from './components/Disclaimer';
import { ActionPanel } from './components/ActionPanel';

const App: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  
  const isCancelledRef = useRef(false);

  const logUpdater = useCallback((message: string, type: LogEntry['type'], deviceId?: string) => {
      if(isCancelledRef.current && type !== 'error') return;
      setLogs(prevLogs => [
        ...prevLogs,
        {
          id: Date.now() + Math.random(),
          message,
          type,
          deviceId
        }
      ]);
  }, []);

  const fetchDevices = useCallback(async () => {
    setIsScanning(true);
    setLogs([]);
    setDevices([]);
    setSelectedDeviceIds([]);
    try {
        const foundDevices = await getConnectedDevices();
        setDevices(foundDevices);
    } catch (error) {
        logUpdater(`Failed to scan for devices: ${error instanceof Error ? error.message : String(error)}`, 'error')
    } finally {
        setIsScanning(false);
    }
  }, [logUpdater]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleDeviceSelectionChange = (deviceId: string, isSelected: boolean) => {
    setSelectedDeviceIds(prev => {
        const newSelection = new Set(prev);
        if (isSelected) {
            newSelection.add(deviceId);
        } else {
            newSelection.delete(deviceId);
        }
        return Array.from(newSelection);
    });
  };

  const handleSelectAllChange = (selectAll: boolean) => {
    if (selectAll) {
      const allSupportedIds = devices
        .filter(d => d.isSupported && d.status === 'Connected')
        .map(d => d.id);
      setSelectedDeviceIds(allSupportedIds);
    } else {
      setSelectedDeviceIds([]);
    }
  };
  
  const handleInstall = useCallback(async () => {
    const selectedDevices = devices.filter(d => selectedDeviceIds.includes(d.id));
    if (selectedDevices.length === 0) return;

    setIsInstalling(true);
    isCancelledRef.current = false;
    setLogs([]);

    logUpdater(`Starting installation for ${selectedDevices.length} device(s)...`, 'info');

    const installationPromises = selectedDevices.map(async (device) => {
        try {
            logUpdater(`Starting process for device ${device.id} (Android ${device.version})`, 'info', device.id);

            for await (const log of installForVersion(device.version, device.id)) {
                if (isCancelledRef.current) {
                    logUpdater('Process cancelled by user.', 'error', device.id);
                    return;
                }
                logUpdater(log.message, log.type, device.id);
            }
            if(!isCancelledRef.current) {
                logUpdater('Installation complete.', 'success', device.id);
            }
        } catch (error) {
            logUpdater(`An error occurred: ${error instanceof Error ? error.message : String(error)}`, 'error', device.id);
        }
    });

    await Promise.all(installationPromises);

    if(!isCancelledRef.current) {
        logUpdater('ALL DONE, Bye bye !!!', 'success');
    }
    setIsInstalling(false);

  }, [selectedDeviceIds, devices, logUpdater]);
  
  const handleCancel = useCallback(() => {
    isCancelledRef.current = true;
    setIsInstalling(false);
    logUpdater('Cancellation request received. Finishing current operations...', 'info');
  }, [logUpdater]);

  return (
    <div className="h-screen bg-slate-900 text-slate-300 flex flex-col items-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
          <div className="lg:col-span-1 flex flex-col space-y-6 overflow-y-auto pr-2">
            <DeviceManager 
                devices={devices}
                selectedDeviceIds={selectedDeviceIds}
                onSelectionChange={handleDeviceSelectionChange}
                onSelectAllChange={handleSelectAllChange}
                onRefresh={fetchDevices}
                isLoading={isScanning}
                isInstalling={isInstalling}
            />
            <ActionPanel
                selectedDeviceCount={selectedDeviceIds.length}
                isInstalling={isInstalling}
                onInstall={handleInstall}
                onCancel={handleCancel}
            />
            <Disclaimer />
          </div>
          <div className="lg:col-span-2 h-full">
            <LogViewer logs={logs} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;