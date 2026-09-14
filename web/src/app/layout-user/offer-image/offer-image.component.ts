import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '@environment';

interface OfferImageSource {
  name: string;
  updatedAt?: Date | string;
}

@Component({
  selector: 'app-offer-image',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './offer-image.component.html',
  styleUrl: './offer-image.component.scss',
  host: { '[attr.aria-busy]': 'imageLoading' },
})
export class OfferImageComponent implements OnChanges {
  @Input() public image: OfferImageSource | null = null;
  @Input() public alt = '';
  @Input() public priority = false;
  @Input() public sizes = '100vw';

  public source: string | null = null;
  public sourceSet: string | null = null;
  public imageLoading = false;
  public imageFailed = false;

  private originalSource: string | null = null;
  private usingOriginal = false;

  public ngOnChanges(): void {
    const fileName = this.image?.name;
    const updatedAt = this.image?.updatedAt;
    const version = updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt;
    const versionQuery = version ? `?v=${encodeURIComponent(version)}` : '';
    const originalSource = fileName
      ? `${environment.API_URL}/offers/images/${encodeURIComponent(fileName)}${versionQuery}`
      : null;

    if (originalSource === this.originalSource) {
      return;
    }

    this.originalSource = originalSource;
    this.source = null;
    this.sourceSet = null;
    this.imageLoading = false;
    this.imageFailed = false;
    this.usingOriginal = false;

    if (fileName === undefined || fileName === null || fileName === '') {
      return;
    }

    const previewUrl = `${environment.API_URL}/image-file/offer-preview/${encodeURIComponent(fileName)}`;
    const previewVersion = version ? `&v=${encodeURIComponent(version)}` : '';
    this.sourceSet = [480, 960, 1440]
      .map((width) => `${previewUrl}?width=${width}${previewVersion} ${width}w`)
      .join(', ');
    this.source = `${previewUrl}?width=960${previewVersion}`;
    this.imageLoading = true;
  }

  public onImageLoad(): void {
    this.imageLoading = false;
  }

  public onImageError(): void {
    if (this.usingOriginal) {
      this.imageLoading = false;
      this.imageFailed = true;
      return;
    }

    this.usingOriginal = true;
    this.sourceSet = null;
    this.source = this.originalSource;
  }
}
