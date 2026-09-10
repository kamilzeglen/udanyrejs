import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject, takeUntil } from 'rxjs';
import { DeviceInfoService } from '@shared/device-info/device-info.service';
import { AllDeviceInfo } from '@interfaces';
import { CommonFacade } from '@state/common';

@Component({
  selector: 'app-admin-logs-list',
  templateUrl: './admin-logs-list.component.html',
  styleUrl: './admin-logs-list.component.scss',
})
export class AdminLogsListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public deviceInfo: AllDeviceInfo;

  public logs = this.commonFacade.logs$;
  public loading$ = this.commonFacade.loading$;

  public allColumns: string[] = ['id', 'message', 'createdBy', 'createdAt'];

  public columnsToDisplay: string[];

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly deviceInfoService: DeviceInfoService,
  ) {}

  public ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe((info) => {
      this.deviceInfo = info;
    });

    this.columnsToDisplay = this.getColumnsToDisplay();

    this.commonFacade.getLogs();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public getColumnsToDisplay(): string[] {
    if (this.deviceInfo.deviceTypeDetected === 'DESKTOP') {
      return this.allColumns;
    }
    if (this.deviceInfo.deviceTypeDetected === 'TABLET') {
      return ['id', 'message', 'createdBy', 'createdAt'];
    }
    if (this.deviceInfo.deviceTypeDetected === 'PHONE') {
      return ['id', 'message', 'createdBy', 'createdAt'];
    }
    return [];
  }
}
