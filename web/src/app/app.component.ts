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
  }

  private adjustBodyMargin(): void {
    const html = document.documentElement;
    const body = document.body;

    // Sprawdzenie, czy pasek przewijania jest obecny
    const isScrollbarVisible = html.scrollHeight > html.clientHeight || body.scrollHeight > body.clientHeight;

    // Dodanie marginesu, jeśli pasek przewijania nie jest widoczny
    if (!isScrollbarVisible) {
      body.style.marginRight = '8px';
    } else {
      body.style.marginRight = '0';
    }
  }
}
