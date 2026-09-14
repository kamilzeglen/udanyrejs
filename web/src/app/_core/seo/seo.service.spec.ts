import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';
import { environment } from '@environment';

describe('SeoService', () => {
  let service: SeoService;
  let document: Document;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
    document = TestBed.inject(DOCUMENT);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  afterEach(() => {
    document.querySelector('link[rel="canonical"]')?.remove();
    document.querySelector('script[type="application/ld+json"]')?.remove();
  });

  it('sets document title', () => {
    service.setPageMeta({ title: 'UdanyRejs - O nas', description: 'opis', path: '/about-us' });

    expect(titleService.getTitle()).toBe('UdanyRejs - O nas');
  });

  it('clears images and structured data when navigating away from an offer', () => {
    service.setPageMeta({
      title: 'Rejs',
      description: 'opis',
      path: '/offers/details/1',
      image: 'https://example.com/1.jpg',
    });
    service.setStructuredData({ '@type': 'TouristTrip', name: 'Rejs' });

    service.setPageMeta({ title: 'Kontakt', description: 'opis', path: '/contact' });

    expect(metaService.getTag('property="og:image"')).toBeNull();
    expect(metaService.getTag('name="twitter:image"')).toBeNull();
    expect(metaService.getTag('name="twitter:card"').content).toBe('summary');
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
  });

  it('canonicalizes offer variants without tracking parameters or fragments', () => {
    service.setPageMeta({
      title: 'Rejs',
      description: 'opis',
      path: '/offers/details/1?termId=2&utm_source=facebook#prices',
    });

    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(
      `${environment.WEB_URL}/offers/details/1`,
    );
    expect(metaService.getTag('property="og:url"').content).toBe(`${environment.WEB_URL}/offers/details/1`);
  });

  it('keeps distinct pagination URLs and canonicalizes the duplicate offers homepage', () => {
    service.setPageMeta({ title: 'Rejsy', description: 'opis', path: '/offers?page=2&utm_source=facebook' });
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${environment.WEB_URL}/?page=2`);

    service.setPageMeta({ title: 'Rejsy', description: 'opis', path: '/offers?page=1' });
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${environment.WEB_URL}/`);
  });

  it('keeps category pagination and removes invalid page numbers', () => {
    service.setPageMeta({ title: 'Rejsy', description: 'opis', path: '/offers/promotions?page=3' });
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(
      `${environment.WEB_URL}/offers/promotions?page=3`,
    );

    service.setPageMeta({ title: 'Rejsy', description: 'opis', path: '/offers/promotions?page=-1' });
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(
      `${environment.WEB_URL}/offers/promotions`,
    );
  });

  it('sets meta description', () => {
    service.setPageMeta({ title: 'UdanyRejs - O nas', description: 'opis firmy', path: '/about-us' });

    expect(metaService.getTag('name="description"').content).toBe('opis firmy');
  });

  it('sets canonical link to WEB_URL plus path', () => {
    service.setPageMeta({ title: 'x', description: 'y', path: '/about-us' });

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical.getAttribute('href')).toBe(`${environment.WEB_URL}/about-us`);
  });

  it('updates existing canonical link instead of duplicating it', () => {
    service.setPageMeta({ title: 'x', description: 'y', path: '/about-us' });
    service.setPageMeta({ title: 'x', description: 'y', path: '/contact' });

    const canonicalLinks = document.querySelectorAll('link[rel="canonical"]');
    expect(canonicalLinks.length).toBe(1);
    expect(canonicalLinks[0].getAttribute('href')).toBe(`${environment.WEB_URL}/contact`);
  });

  it('sets open graph title, description, url, type and site name', () => {
    service.setPageMeta({ title: 'UdanyRejs - O nas', description: 'opis firmy', path: '/about-us' });

    expect(metaService.getTag('property="og:title"').content).toBe('UdanyRejs - O nas');
    expect(metaService.getTag('property="og:description"').content).toBe('opis firmy');
    expect(metaService.getTag('property="og:url"').content).toBe(`${environment.WEB_URL}/about-us`);
    expect(metaService.getTag('property="og:type"').content).toBe('website');
    expect(metaService.getTag('property="og:site_name"').content).toBe('UdanyRejs');
  });

  it('sets open graph image when image is provided', () => {
    service.setPageMeta({
      title: 'x',
      description: 'y',
      path: '/offers/details/1',
      image: 'https://api.udanyrejs.pl/offers/images/1.jpg',
    });

    expect(metaService.getTag('property="og:image"').content).toBe('https://api.udanyrejs.pl/offers/images/1.jpg');
  });

  it('sets twitter card tags', () => {
    service.setPageMeta({
      title: 'UdanyRejs - O nas',
      description: 'opis firmy',
      path: '/about-us',
      image: 'https://api.udanyrejs.pl/offers/images/1.jpg',
    });

    expect(metaService.getTag('name="twitter:card"').content).toBe('summary_large_image');
    expect(metaService.getTag('name="twitter:title"').content).toBe('UdanyRejs - O nas');
    expect(metaService.getTag('name="twitter:description"').content).toBe('opis firmy');
    expect(metaService.getTag('name="twitter:image"').content).toBe('https://api.udanyrejs.pl/offers/images/1.jpg');
  });

  it('sets robots to index, follow by default', () => {
    service.setPageMeta({ title: 'x', description: 'y', path: '/about-us' });

    expect(metaService.getTag('name="robots"').content).toBe('index, follow');
  });

  it('sets robots to noindex, nofollow when noIndex is true', () => {
    service.setPageMeta({ title: 'x', description: 'y', path: '/login', noIndex: true });

    expect(metaService.getTag('name="robots"').content).toBe('noindex, nofollow');
  });

  it('injects structured data as a json-ld script tag', () => {
    service.setStructuredData({ '@context': 'https://schema.org', '@type': 'TouristTrip', name: 'Rejs testowy' });

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script.textContent)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: 'Rejs testowy',
    });
  });

  it('replaces existing structured data instead of duplicating the script tag', () => {
    service.setStructuredData({ '@context': 'https://schema.org', '@type': 'TouristTrip', name: 'Rejs 1' });
    service.setStructuredData({ '@context': 'https://schema.org', '@type': 'TouristTrip', name: 'Rejs 2' });

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(1);
    expect(JSON.parse(scripts[0].textContent).name).toBe('Rejs 2');
  });

  it('removes structured data when cleared', () => {
    service.setStructuredData({ '@context': 'https://schema.org', '@type': 'TouristTrip', name: 'Rejs 1' });
    service.clearStructuredData();

    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});
