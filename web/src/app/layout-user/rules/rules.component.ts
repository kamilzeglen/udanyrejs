import {Component} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.scss'
})
export class RulesComponent {

  constructor(private readonly titleService: Title, private readonly metaService: Meta) {
    this.titleService.setTitle('UdanyRejs - Regulamin');
    this.metaService.updateTag({
      name: 'description',
      content: 'Sprawdź regulamin rejsów wycieczkowych UdanyRejs. Wszystkie warunki i zasady w jednym miejscu.'
    });
  }

}
