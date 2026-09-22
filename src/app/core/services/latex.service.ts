import { Injectable } from '@angular/core';
import katex from 'katex';

@Injectable({ providedIn: 'root' })
export class LatexService {
  split(source: string): string[] {
    return source
      .split(/\s*(?:\\qquad|·|\\\\|;)\s*/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  isRenderable(source: string): boolean {
    const text = source.trim();
    if (!text) {
      return false;
    }
    if (/^seleccione|^datos insuficientes/i.test(text)) {
      return false;
    }
    return /[=\\^_{]|Σ|·|−|\(P\/|[A-Z]\s*=/.test(text);
  }

  toLatex(source: string): string {
    let s = source.trim();
    if (/\\[a-zA-Z]/.test(s)) {
      return s;
    }
    s = s.replaceAll('·', '\\cdot ');
    s = s.replaceAll('−', '-');
    s = s.replaceAll('×', '\\times ');
    s = s.replaceAll('≈', '\\approx ');
    s = s.replaceAll('≠', '\\neq ');
    s = s.replaceAll('≥', '\\ge ');
    s = s.replaceAll('≤', '\\le ');
    s = s.replaceAll('Σ', '\\sum ');
    s = s.replaceAll('⁺', '^{+}');
    s = s.replaceAll('⁻', '^{-}');
    s = s.replaceAll('′', "'");
    s = s.replace(/([A-Za-zΑ-ω]+)_\{([^}]+)\}/g, '$1_{$2}');
    s = s.replace(/([A-Za-z]+)_([A-Za-z0-9]+)/g, '$1_{$2}');
    s = s.replace(/\^(\{[^}]+\})/g, '^$1');
    s = s.replace(/\^([A-Za-z0-9]+)/g, '^{$1}');
    s = s.replace(/e\^\{([^}]+)\}/g, 'e^{$1}');
    return s;
  }

  renderBlock(latex: string): string {
    return this.render(latex, true);
  }

  renderInline(latex: string): string {
    return this.render(latex, false);
  }

  private render(source: string, displayMode: boolean): string {
    const latex = this.toLatex(source);
    if (!latex) {
      return '';
    }
    try {
      return katex.renderToString(latex, {
        displayMode,
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
