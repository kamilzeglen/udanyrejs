import {Injectable} from '@angular/core';
import {Actions, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {AppState} from '@state';
import * as emailActions from './email.actions';
import * as emailSelectors from './email.selectors';
import {Email} from '../../_interfaces/email';


@Injectable()
export class EmailFacade {
  public loading$ = this.store.select(emailSelectors.selectSending);

  public sendEmailSuccess$ = this.actions.pipe(ofType(emailActions.sendEmailSuccess));
  public sendEmailError$ = this.actions.pipe(ofType(emailActions.sendEmailError));

  constructor(
    private store: Store<AppState>,
    private actions: Actions
  ) {
  }

  public sendEmail(payload: Email): void {
    this.store.dispatch(emailActions.sendEmail({payload}));
  }
}
