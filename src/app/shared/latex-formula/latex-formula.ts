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
  private readonly latexService = inject(LatexService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly html = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.latexService.renderBlock(this.latex())),
  );
}
