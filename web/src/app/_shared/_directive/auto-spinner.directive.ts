import {AfterViewInit, Directive, ElementRef, Renderer2} from '@angular/core';

@Directive({
  selector: '[appAutoSpinner]'
})
export class AutoSpinnerDirective implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const parent = this.el.nativeElement.parentElement;

    if (parent) {
      // Ustawienie spinnera na pełny rozmiar rodzica
      this.renderer.setStyle(this.el.nativeElement, 'position', 'absolute');
      this.renderer.setStyle(this.el.nativeElement, 'top', '0');
      this.renderer.setStyle(this.el.nativeElement, 'left', '0');
      this.renderer.setStyle(this.el.nativeElement, 'width', '100%');
      this.renderer.setStyle(this.el.nativeElement, 'height', '100%');
      this.renderer.setStyle(this.el.nativeElement, 'display', 'flex');
      this.renderer.setStyle(this.el.nativeElement, 'align-items', 'center');
      this.renderer.setStyle(this.el.nativeElement, 'justify-content', 'center');
      this.renderer.setStyle(this.el.nativeElement, 'z-index', '10'); // Spinner nad elementem
    }
  }
}
