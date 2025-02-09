import { MatPaginatorIntl } from '@angular/material/paginator';

export class MatPaginatorIntlPolish extends MatPaginatorIntl {
  itemsPerPageLabel = 'Ofert na stronę';
  nextPageLabel = 'Następna strona';
  previousPageLabel = 'Poprzednia strona';
  firstPageLabel = 'Pierwsza strona';
  lastPageLabel = 'Ostatnia strona';

  getRangeLabel = (page: number, pageSize: number, length: number) => {
    const of = 'z';
    return `${page * pageSize + 1} - ${Math.min((page + 1) * pageSize, length)} ${of} ${length}`;
  };
}
