export interface AndroidVersion {
  id: string;
  label: string;
  color: string;
  hoverColor: string;
}

export interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'command' | 'success' | 'error';
  deviceId?: string;
}

export interface Device {
  id: string;
  version: string;
  isSupported: boolean;
  status: 'Connected' | 'Unauthorized' | 'Offline';
  model: string;
  apVersion: string;
  cpVersion: string;
  cscVersion: string;
  fingerprint: string;
  baseOS: string;
  securityPatch: string;
}