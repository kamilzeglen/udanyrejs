import {Injectable} from '@angular/core';
import {Actions, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {AppState} from '@state';
import * as scrapperActions from './scrapper.actions';
import * as scrapperSelectors from './scrapper.selectors';


@Injectable()
export class ScrapperFacade {
  public loading$ = this.store.select(scrapperSelectors.selectLoading);
  public scrappedData$ = this.store.select(scrapperSelectors.selectScrappedData);

  public scrapOfferFileSuccess$ = this.actions.pipe(ofType(scrapperActions.scrapOfferFileSuccess));
  public scrapOfferFileError$ = this.actions.pipe(ofType(scrapperActions.scrapOfferFileError));

  constructor(
    private store: Store<AppState>,
    private actions: Actions
  ) {
  }

  public scrapOffer(payload: { url: string }): void {
    this.store.dispatch(scrapperActions.scrapOfferFile({payload}));
  }
}
