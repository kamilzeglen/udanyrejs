import { commonReducer } from './common.reducer';
import { initialState } from './common.state';
import * as commonActions from './common.actions';
import { CabinType } from '@interfaces';

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
