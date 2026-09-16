import { of } from 'rxjs';
import { AdminCompanyListComponent } from './admin-company-list.component';
import { DeviceType } from '@interfaces';

describe('AdminCompanyListComponent', () => {
  it('shows completeness columns before active status and actions on desktop', () => {
    const component = new AdminCompanyListComponent(
      { companies$: of([]), ships$: of([]), loading$: of(false) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    component.deviceInfo = { deviceTypeDetected: DeviceType.DESKTOP, deviceInfo: {} as never };

    expect(component.getColumnsToDisplay()).toEqual([
      'select',
      'id',
      'name',
      'key',
      'seoTitle',
      'seoDescription',
      'description',
      'image',
      'isActive',
      'actions',
      'updatedAt',
      'createdAt',
    ]);
  });
});
