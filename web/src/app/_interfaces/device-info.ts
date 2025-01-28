import { DeviceInfo } from 'ngx-device-detector';

export interface AllDeviceInfo {
  deviceTypeDetected: DeviceType.DESKTOP | DeviceType.TABLET | DeviceType.PHONE;
  deviceInfo: DeviceInfo;
}

export enum DeviceType {
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
  PHONE = 'PHONE',
}
