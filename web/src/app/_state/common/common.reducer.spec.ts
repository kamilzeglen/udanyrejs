import { commonReducer } from './common.reducer';
import { initialState } from './common.state';
import * as commonActions from './common.actions';
import { CabinType, City } from '@interfaces';

describe('commonReducer - cabin types', () => {
  const cabinType: CabinType = {
    id: 'cabin-1',
    name: 'Balkonowa',
    companyId: 'company-1',
  } as CabinType;

  it('sets loading and clears cabinTypes on getCabinTypes', () => {
    const state = commonReducer(initialState, commonActions.getCabinTypes({ companyId: 'company-1' }));

    expect(state.loading).toBe(true);
    expect(state.cabinTypes).toEqual([]);
  });

  it('stores cabin types on getCabinTypesSuccess', () => {
    const state = commonReducer(initialState, commonActions.getCabinTypesSuccess({ cabinTypes: [cabinType] }));

    expect(state.loading).toBe(false);
    expect(state.cabinTypes).toEqual([cabinType]);
  });

  it('clears cabinTypes and sets errorMessage on getCabinTypesError', () => {
    const state = commonReducer(initialState, commonActions.getCabinTypesError({ errorMessage: 'boom' }));

    expect(state.loading).toBe(false);
    expect(state.errorMessage).toBe('boom');
    expect(state.cabinTypes).toEqual([]);
  });
});

describe('commonReducer - cities', () => {
  const city: City = {
    id: 'city-1',
    name: 'Barcelona',
    destinations: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  } as City;

  it('sets loading and clears cities on getCities', () => {
    const state = commonReducer(initialState, commonActions.getCities());

    expect(state.loading).toBe(true);
    expect(state.cities).toEqual([]);
  });

  it('stores cities on getCitiesSuccess', () => {
    const state = commonReducer(initialState, commonActions.getCitiesSuccess({ cities: [city] }));

    expect(state.loading).toBe(false);
    expect(state.cities).toEqual([city]);
  });

  it('clears cities and sets errorMessage on getCitiesError', () => {
    const state = commonReducer(initialState, commonActions.getCitiesError({ errorMessage: 'boom' }));

    expect(state.loading).toBe(false);
    expect(state.errorMessage).toBe('boom');
    expect(state.cities).toEqual([]);
  });
});
