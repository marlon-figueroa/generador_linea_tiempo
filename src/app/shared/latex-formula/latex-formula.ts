import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LatexService } from '../../core/services/latex.service';

@Component({
  selector: 'app-latex-formula',
  templateUrl: './latex-formula.html',
  styleUrl: './latex-formula.scss',
})
export class LatexFormula {
  readonly latex = input.required<string>();
  readonly caption = input('');
  readonly display = input<'block' | 'inline'>('block');
  readonly framed = input(true);
  private readonly latexService = inject(LatexService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly parts = computed(() =>
    this.latexService.split(this.latex()).filter((part) => this.latexService.isRenderable(part)),
  );

  readonly htmlParts = computed(() =>
    this.parts().map((part) =>
      this.sanitizer.bypassSecurityTrustHtml(
        this.display() === 'inline'
          ? this.latexService.renderInline(part)
          : this.latexService.renderBlock(part),
      ),
    ),
  );

  readonly fallback = computed(() => {
    const text = this.latex().trim();
    return text && !this.parts().length ? text : '';
  });
}
