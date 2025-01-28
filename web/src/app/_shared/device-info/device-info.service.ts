import { EventEmitter, Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AllDeviceInfo, DeviceType } from '@interfaces';

@Injectable({
  providedIn: 'root',
})
export class DeviceInfoService {
  public infoEmitter = new EventEmitter<AllDeviceInfo>();

  constructor(
    private readonly deviceService: DeviceDetectorService,
    private readonly breakpointObserver: BreakpointObserver
  ) {}

  public startObservingDevice(): void {
    this.breakpointObserver.observe([Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small]).subscribe(() => {
      this.infoEmitter.emit(this.getInfo());
    });
  }

  public getDeviceType(): AllDeviceInfo['deviceTypeDetected'] {
    if (this.breakpointObserver.isMatched('(max-width: 576px)')) {
      return DeviceType.PHONE;
    }
    if (this.breakpointObserver.isMatched('(max-width: 992px)')) {
      return DeviceType.TABLET;
    }
    return DeviceType.DESKTOP;
  }

  public getInfo(): AllDeviceInfo {
    return {
      deviceTypeDetected: this.getDeviceType(),
      deviceInfo: this.deviceService.getDeviceInfo(),
    };
  }
}
