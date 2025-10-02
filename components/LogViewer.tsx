import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
}

const getLogColor = (type: LogEntry['type']): string => {
    switch (type) {
        case 'command':
            return 'text-sky-400';
        case 'success':
            return 'text-green-400';
        case 'error':
            return 'text-red-400';
        case 'info':
        default:
            return 'text-slate-400';
    }
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black/50 rounded-lg h-full flex flex-col border border-slate-700">
      <div className="flex items-center justify-between p-3 bg-slate-800/70 rounded-t-lg border-b border-slate-700">
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-sm font-medium text-slate-300">ADB Output</span>
        <div className="w-16"></div>
      </div>
      <div className="p-4 flex-grow overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
                <p>Waiting for device scan or installation to begin...</p>
            </div>
        ) : (
            logs.map(log => (
                <div key={log.id} className={`${getLogColor(log.type)} flex`}>
                    <div className="flex-shrink-0 w-32 mr-2 text-slate-500 truncate">
                      {log.deviceId ? `[${log.deviceId}]` : ''}
                    </div>
                    <p className="flex-grow whitespace-pre-wrap break-words">
                        <span className="mr-2 select-none">{log.type === 'command' ? '$' : '>'}</span>
                        {log.message}
                    </p>
                </div>
            ))
        )}
        <div ref={endOfLogsRef} />
      </div>
    </div>
  );
};