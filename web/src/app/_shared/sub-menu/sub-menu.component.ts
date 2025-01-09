import {Component, Input} from '@angular/core';
import {SubMenuItem} from '@interfaces';

@Component({
  selector: 'app-sub-menu',
  templateUrl: './sub-menu.component.html',
  styleUrl: './sub-menu.component.scss'
})

export class SubMenuComponent {

  @Input() subMenuItems: SubMenuItem[] = []

}
