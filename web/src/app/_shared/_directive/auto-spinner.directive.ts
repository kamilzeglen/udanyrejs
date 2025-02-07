import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAutoSpinner]'
})
export class AutoSpinnerDirective implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const parent = this.el.nativeElement.parentElement;

    if (parent) {
      this.renderer.setStyle(this.el.nativeElement, 'position', 'absolute');
      this.renderer.setStyle(this.el.nativeElement, 'top', '50%');
      this.renderer.setStyle(this.el.nativeElement, 'left', '50%');
      this.renderer.setStyle(this.el.nativeElement, 'border-radius', '50%');
      this.renderer.setStyle(this.el.nativeElement, 'display', 'flex');
      this.renderer.setStyle(this.el.nativeElement, 'align-items', 'center');
      this.renderer.setStyle(this.el.nativeElement, 'justify-content', 'center');
      this.renderer.setStyle(this.el.nativeElement, 'z-index', '10');
      this.renderer.setStyle(this.el.nativeElement, 'transform', 'translate(-50%, -50%)');
    }
  }
}
