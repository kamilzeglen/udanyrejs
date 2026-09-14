import { FormBuilder } from '@angular/forms';
import { convertToParamMap } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { AdminCityAddEditComponent } from './admin-city-add-edit.component';

describe('AdminCityAddEditComponent coordinates', () => {
  let component: AdminCityAddEditComponent;
  let commonFacade: any;

  beforeEach(() => {
    commonFacade = {
      destinations$: of([]),
      getCitySuccess$: NEVER,
      createCitySuccess$: NEVER,
      createCityError$: NEVER,
      updateCityError$: NEVER,
      updateCitySuccess$: NEVER,
      deleteCitySuccess$: NEVER,
      getDestinations: jasmine.createSpy(),
      createCity: jasmine.createSpy(),
      updateCity: jasmine.createSpy(),
    };
    component = new AdminCityAddEditComponent(
      commonFacade,
      new FormBuilder(),
      {} as any,
      {} as any,
      { paramMap: of(convertToParamMap({})) } as any,
      {} as any,
    );

    component.ngOnInit();
  });

  it('requires both coordinates when either one is provided', () => {
    component.cityForm.patchValue({
      name: 'Gdynia',
      latitude: 54.5189,
    });

    expect(component.cityForm.invalid).toBeTrue();

    component.cityForm.patchValue({ longitude: 18.5305 });

    expect(component.cityForm.valid).toBeTrue();
  });

  it('submits a complete coordinate pair', () => {
    component.cityForm.patchValue({
      name: 'Gdynia',
      latitude: 54.5189,
      longitude: 18.5305,
    });

    component.submitForm();

    expect(commonFacade.createCity).toHaveBeenCalledWith({
      formData: {
        name: 'Gdynia',
        latitude: 54.5189,
        longitude: 18.5305,
      },
    });
  });

  it('submits null coordinates when both fields are cleared during editing', () => {
    component.mode = 'EDIT';
    component.editingCity = { id: 'city-1' } as any;
    component.cityForm.patchValue({
      name: 'Gdynia',
      latitude: '',
      longitude: '',
    });

    component.submitForm();

    expect(commonFacade.updateCity).toHaveBeenCalledWith({
      id: 'city-1',
      formData: {
        name: 'Gdynia',
        latitude: null,
        longitude: null,
      },
    });
  });
});
