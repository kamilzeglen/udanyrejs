import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ErrorComponent } from './error.component';
import { ConnectivityService } from '@core/connectivity/connectivity.service';

describe('ErrorComponent', () => {
  let fixture: ComponentFixture<ErrorComponent>;
  let connectivityService: jasmine.SpyObj<ConnectivityService>;
  let checking: BehaviorSubject<boolean>;

  beforeEach(() => {
    checking = new BehaviorSubject<boolean>(false);
    connectivityService = jasmine.createSpyObj('ConnectivityService', ['retryNow'], { checking$: checking });

    TestBed.configureTestingModule({
      declarations: [ErrorComponent],
      providers: [{ provide: ConnectivityService, useValue: connectivityService }],
    });

    fixture = TestBed.createComponent(ErrorComponent);
    fixture.detectChanges();
  });

  it('triggers a manual health check when the button is clicked', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    button.click();

    expect(connectivityService.retryNow).toHaveBeenCalled();
  });

  it('disables the button while a check is in flight', () => {
    checking.next(true);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    expect(button.disabled).toBeTrue();
  });
});
