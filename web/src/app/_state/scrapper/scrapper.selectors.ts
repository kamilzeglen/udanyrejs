import {createFeatureSelector, createSelector} from '@ngrx/store';
import {ScrapperState} from './scrapper.state';


export const selectScrapperState = createFeatureSelector<ScrapperState>('scrapper');

export const selectScrappedData = createSelector(selectScrapperState, state => state.scrappedData);
export const selectLoading = createSelector(selectScrapperState, state => state.loading);
