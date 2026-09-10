import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CommonState } from './common.state';
import { CabinType } from '@interfaces';

export interface CabinTypesGroup {
  companyId: string;
  companyName: string;
  cabinTypes: CabinType[];
}

export const selectCommonState = createFeatureSelector<CommonState>('common');

export const selectLoading = createSelector(selectCommonState, (state) => state.loading);

export const selectCompanies = createSelector(selectCommonState, (state) => state.companies);
export const selectShips = createSelector(selectCommonState, (state) => state.ships);
export const selectCategories = createSelector(selectCommonState, (state) => state.categories);
export const selectLogs = createSelector(selectCommonState, (state) => state.logs);
export const selectDestinations = createSelector(selectCommonState, (state) => state.destinations);
export const selectCabinTypes = createSelector(selectCommonState, (state) => state.cabinTypes);
export const selectAllCabinTypes = createSelector(selectCommonState, (state) => state.allCabinTypes);

export const selectCabinTypesGroupedByCompany = createSelector(selectAllCabinTypes, (cabinTypes): CabinTypesGroup[] => {
  if (!cabinTypes) {
    return null;
  }

  const groupsByCompanyId = new Map<string, CabinTypesGroup>();

  cabinTypes.forEach((cabinType) => {
    const companyId = cabinType.company?.id ?? cabinType.companyId;
    const companyName = cabinType.company?.name ?? 'Nieznana firma';
    const existingGroup = groupsByCompanyId.get(companyId);

    if (existingGroup) {
      existingGroup.cabinTypes.push(cabinType);
      return;
    }

    groupsByCompanyId.set(companyId, { companyId, companyName, cabinTypes: [cabinType] });
  });

  return Array.from(groupsByCompanyId.values()).sort((a, b) => a.companyName.localeCompare(b.companyName));
});
