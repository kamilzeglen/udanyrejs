import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AppComponent } from './app.component';
import { DeviceInfoService } from '@shared/device-info/device-info.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    const deviceInfoServiceStub = jasmine.createSpyObj('DeviceInfoService', ['startObservingDevice']);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: DeviceInfoService, useValue: deviceInfoServiceStub }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
