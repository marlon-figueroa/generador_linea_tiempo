import { Injectable } from '@angular/core';
import katex from 'katex';

/** Renders engineering-economy formulas from LaTeX source. */

@Injectable({ providedIn: 'root' })
export class LatexService {
  renderBlock(latex: string): string {
    const source = latex.trim();
    try {
      return katex.renderToString(source, {
        displayMode: true,
        throwOnError: false,
        strict: 'ignore',
        output: 'html',
      });
    } catch {
      return `<code class="latex-fallback">${this.escape(source)}</code>`;
    }
  }

  private escape(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
}
