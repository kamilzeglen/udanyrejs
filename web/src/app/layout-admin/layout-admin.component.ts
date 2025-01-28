import {Component} from '@angular/core';

@Component({
  selector: 'layout-admin',
  templateUrl: './layout-admin.component.html',
  styleUrl: './layout-admin.component.scss'
})
export class LayoutAdminComponent {

  public subMenuItems = [
    {name: 'Edytuj oferty', url: '/admin/offers'},
    {name: 'Edytuj firmy', url: '/admin/companies'},
    {name: 'Edytuj statki', url: '/admin/ships'},
  ];



}
