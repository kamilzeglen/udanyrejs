import {Component, OnInit} from '@angular/core';
import {DeviceInfoService} from '@shared/device-info/device-info.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private readonly deviceInfoService: DeviceInfoService) {
  }

  ngOnInit() {
    this.deviceInfoService.startObservingDevice();

    this.adjustBodyMargin();

    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }

  private adjustBodyMargin(): void {
    const html = document.documentElement;
    const body = document.body;

    const isScrollbarVisible = html.scrollHeight > html.clientHeight || body.scrollHeight > body.clientHeight;

    if (!isScrollbarVisible) {
      body.style.marginRight = '8px';
    } else {
      body.style.marginRight = '0';
    }
  }
}
