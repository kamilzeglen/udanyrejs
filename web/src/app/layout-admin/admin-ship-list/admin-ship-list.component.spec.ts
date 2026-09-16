import { of } from 'rxjs';
import { AdminShipListComponent } from './admin-ship-list.component';
import { DeviceType } from '@interfaces';

describe('AdminShipListComponent', () => {
  it('shows description completeness before active status and actions on desktop', () => {
    const component = new AdminShipListComponent(
      { companies$: of([]), ships$: of([]), loading$: of(false) } as never,
      {} as never,
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
      'image',
      'description',
      'isActive',
      'actions',
      'updatedAt',
      'createdAt',
    ]);
  });
});
