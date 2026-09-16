import { of } from 'rxjs';
import { AdminDestinationListComponent } from './admin-destination-list.component';
import { DeviceType } from '@interfaces';

describe('AdminDestinationListComponent', () => {
  it('shows completeness columns for SEO, description and image on desktop', () => {
    const component = new AdminDestinationListComponent(
      { destinations$: of([]), loading$: of(false) } as never,
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
      'offerCount',
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
