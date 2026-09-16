import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonFacade } from '@state/common';
import { SeoService } from '@core/seo/seo.service';
import { environment } from '@environment';
import { map, Observable, of } from 'rxjs';
import { Company, Destination } from '@interfaces';

type DirectoryEntityType = 'company' | 'destination';

interface DirectoryEntity {
  name: string;
  slug: string;
  description: string | undefined;
  imageUrl: string | undefined;
}

@Component({
  selector: 'app-seo-directory',
  templateUrl: './seo-directory.component.html',
  styleUrl: './seo-directory.component.scss',
})
export class SeoDirectoryComponent implements OnInit {
  public entities$: Observable<DirectoryEntity[]> = of([]);
  public entityType: DirectoryEntityType;
  public basePath = '';
  public pageTitle = '';
  public pageDescription = '';

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly commonFacade: CommonFacade,
    private readonly seoService: SeoService,
  ) {}

  public ngOnInit(): void {
    this.entityType = this.activatedRoute.snapshot.data['entityType'];
    const isDestination = this.entityType === 'destination';
    this.basePath = isDestination ? '/destinations' : '/cruise-lines';
    this.pageTitle = isDestination ? 'Wszystkie kierunki rejsów' : 'Wszyscy armatorzy rejsowi';
    this.pageDescription = isDestination
      ? 'Odkryj kierunki rejsów wycieczkowych i wybierz trasę dopasowaną do swojego stylu podróżowania.'
      : 'Poznaj armatorów rejsowych i znajdź rejs organizowany przez wybraną linię.';

    this.seoService.setPageMeta({
      title: `${this.pageTitle} | UdanyRejs`,
      description: this.pageDescription,
      path: this.basePath,
    });
    this.seoService.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: this.pageTitle,
      description: this.pageDescription,
      url: this.seoService.createCanonicalUrl(this.basePath),
    });

    if (isDestination) {
      this.commonFacade.getDestinations();
      this.entities$ = this.commonFacade.destinations$.pipe(
        map((destinations) => this.createDirectoryEntities(destinations, 'destinations')),
      );
      return;
    }

    this.commonFacade.getCompanies();
    this.entities$ = this.commonFacade.companies$.pipe(
      map((companies) => this.createDirectoryEntities(companies, 'companies')),
    );
  }

  private createDirectoryEntities(
    entities: (Company | Destination)[] | null,
    imageFolder: 'companies' | 'destinations',
  ): DirectoryEntity[] {
    return (entities ?? [])
      .filter((entity) => entity.isActive && Boolean(entity.slug))
      .sort((first, second) => first.name.localeCompare(second.name, 'pl'))
      .map((entity) => ({
        name: entity.name,
        slug: entity.slug as string,
        description: entity.description,
        imageUrl: entity.imageFile?.name
          ? `${environment.API_URL}/${imageFolder}/images/${encodeURIComponent(entity.imageFile.name)}`
          : undefined,
      }));
  }
}
