import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubMenuItem} from '@interfaces';
import {SubMenuService} from './sub-menu.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-sub-menu',
  templateUrl: './sub-menu.component.html',
  styleUrl: './sub-menu.component.scss'
})

export class SubMenuComponent implements OnInit, OnDestroy {
  subMenuItems: SubMenuItem[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private subMenuService: SubMenuService) {}

  ngOnInit() {
    this.subscription = this.subMenuService.subMenuItems$.subscribe((items) => {
      this.subMenuItems = items;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
