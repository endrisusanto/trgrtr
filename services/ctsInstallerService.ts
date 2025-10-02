import type { LogEntry, Device } from '../types';
import { ANDROID_VERSIONS } from '../constants';

const MOCK_DELAY = 250;
const SUPPORTED_VERSIONS = new Set(ANDROID_VERSIONS.map(v => v.id));

const MOCK_ADB_DEVICES_OUTPUT = `List of devices attached
emulator-5554          device product:sdk_phone_x86_64 model:sdk_gphone64_x86_64 device:generic_x86_64 transport_id:1
ABC123456789           device product:star2lte model:SM-G965F device:star2ltexx transport_id:2
DEF987654321           device product:dm1q model:SM-S921B device:dm1qxxx transport_id:3
GHI112233445           unauthorized transport_id:4
JKL556677889           offline transport_id:5
`;

const MOCK_DEVICE_PROPS: { [key: string]: { [prop: string]: string } } = {
  'emulator-5554': {
    'ro.build.version.release': '15',
    'ro.product.model': 'Pixel 8 Pro (Emulated)',
    'ro.build.fingerprint': 'google/sdk_gphone64_x86_64/generic_x86_64:15/UP1A.231005.007/1:userdebug/dev-keys',
    'ro.build.version.base_os': 'Android 15',
    'ro.build.version.security_patch': '2024-05-01',
    'ro.build.PDA': 'UP1A.231005.007',
    'ril.sw_ver': 'N/A',
    'ril.official_cscver': 'N/A'
  },
  'ABC123456789': {
    'ro.build.version.release': '14',
    'ro.product.model': 'Galaxy S23',
    'ro.build.fingerprint': 'samsung/star2ltexx/star2lte:14/TP1A.220624.014/G965FXXU1CRB7:user/release-keys',
    'ro.build.version.base_os': 'Android 14',
    'ro.build.version.security_patch': '2024-03-01',
    'ro.build.PDA': 'G965FXXU1CRB7',
    'ril.sw_ver': 'G965FXXU1CRB7',
    'ril.official_cscver': 'G965FOXM1CRB7'
  },
  'DEF987654321': {
    'ro.build.version.release': '13',
    'ro.product.model': 'Galaxy S24 Ultra',
    'ro.build.fingerprint': 'samsung/dm1qxxx/dm1q:13/TP1A.220624.014/S921BXXS1AXBG:user/release-keys',
    'ro.build.version.base_os': 'Android 13',
    'ro.build.version.security_patch': '2024-04-01',
    'ro.build.PDA': 'S921BXXS1AXBG',
    'ril.sw_ver': 'S921BXXS1AXBG',
    'ril.official_cscver': 'S921BDBT1AXBG'
  }
};


const parseAdbDevices = (output: string): {id: string, status: 'Connected' | 'Unauthorized' | 'Offline', model: string}[] => {
    return output.split('\n')
        .filter(line => line.trim() && !line.startsWith('List of'))
        .map(line => {
            const parts = line.split(/\s+/);
            const id = parts[0];
            const rawStatus = parts[1];
            let status: 'Connected' | 'Unauthorized' | 'Offline' = 'Offline';
            if (rawStatus === 'device') status = 'Connected';
            if (rawStatus === 'unauthorized') status = 'Unauthorized';

            const modelMatch = line.match(/model:(\S+)/);
            const model = modelMatch ? modelMatch[1] : 'Unknown';
            
            return { id, status, model };
        });
};


export const getConnectedDevices = async (): Promise<Device[]> => {
  console.log('Simulating "adb devices -l"...');
  await new Promise(resolve => setTimeout(resolve, 800));

  const parsedDevices = parseAdbDevices(MOCK_ADB_DEVICES_OUTPUT);
  
  const devices: Device[] = await Promise.all(parsedDevices.map(async (d) => {
    if (d.status === 'Connected') {
      console.log(`Simulating "adb -s ${d.id} shell getprop" for details...`);
      await new Promise(resolve => setTimeout(resolve, 150)); // Simulate latency per device
      const props = MOCK_DEVICE_PROPS[d.id] || {};
      const majorVersion = (props['ro.build.version.release'] || 'N/A').split('.')[0];
      
      return {
        id: d.id,
        status: d.status,
        version: majorVersion,
        isSupported: SUPPORTED_VERSIONS.has(majorVersion),
        model: props['ro.product.model'] || d.model,
        apVersion: props['ro.build.PDA'] || 'N/A',
        cpVersion: props['ril.sw_ver'] || 'N/A',
        cscVersion: props['ril.official_cscver'] || 'N/A',
        fingerprint: props['ro.build.fingerprint'] || 'N/A',
        baseOS: props['ro.build.version.base_os'] || 'N/A',
        securityPatch: props['ro.build.version.security_patch'] || 'N/A',
      };
    }

    // Handle non-connected devices
    return {
      id: d.id,
      status: d.status,
      version: 'N/A',
      isSupported: false,
      model: d.model,
      apVersion: 'N/A',
      cpVersion: 'N/A',
      cscVersion: 'N/A',
      fingerprint: 'N/A',
      baseOS: 'N/A',
      securityPatch: 'N/A',
    };
  }));

  return devices;
};


// --- CTS Installer Logic ---

async function* getCommands(versionId: string): AsyncGenerator<string> {
  const paths: { [key: string]: string } = {
    '15': '15',
    '14': '14',
    '13': '13',
  };

  const basePath = `C:\\android-cts-verifier\\${paths[versionId]}`;

  if (!paths[versionId]) {
    throw new Error(`Unsupported version ID for command generation: ${versionId}`);
  }

  yield `adb install ${basePath}\\CtsVerifier.apk`;
  yield `adb install ${basePath}\\CtsPermissionApp.apk`;
  yield `adb install -r -t ${basePath}\\CtsEmptyDeviceOwner.apk`;
  yield 'adb shell dpm set-device-owner --user 0 com.android.cts.emptydeviceowner/.EmptyDeviceAdmin';
  yield 'adb shell appops set com.android.cts.verifier android:read_device_identifiers allow';
  yield 'adb shell appops set com.android.cts.verifier MANAGE_EXTERNAL_STORAGE 0';
}


export async function* installForVersion(versionId: string, deviceId: string): AsyncGenerator<{message: string, type: LogEntry['type']}> {
  yield { message: 'Start Injecting the APP !', type: 'info' };
  
  for await (const command of getCommands(versionId)) {
    const deviceCommand = command.replace('adb', `adb -s ${deviceId}`);
    yield { message: `-------------------------------------------------------------`, type: 'info' };
    yield { message: `Running command: ${deviceCommand}`, type: 'command' };
    await new Promise(res => setTimeout(res, MOCK_DELAY));
    yield { message: 'Success', type: 'success' };
  }
    yield { message: `-------------------------------------------------------------`, type: 'info' };
}