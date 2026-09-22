import { Component, input, signal } from '@angular/core';
import { CalcOutput } from '../../core/models/engineering.models';
import { copyText, tableToTsv } from '../../core/utils/format';
import { LatexFormula } from '../latex-formula/latex-formula';

@Component({
  selector: 'app-result-panel',
  imports: [LatexFormula],
  templateUrl: './result-panel.html',
  styleUrl: './result-panel.scss',
})
export class ResultPanel {
  readonly result = input<CalcOutput | null>(null);
  readonly copied = signal('');

  async copyConclusion(): Promise<void> {
    const output = this.result();
    if (!output) {
      return;
    }
    await copyText(output.conclusion);
    this.flash('conclusión');
  }

  async copyAll(): Promise<void> {
    const output = this.result();
    if (!output) {
      return;
    }
    const tables = output.tables
      .map((table) => `${table.title}\n${tableToTsv(table.headers, table.rows)}`)
      .join('\n\n');
    const text = [
      output.title,
      `Fórmula: ${output.formula}`,
      '',
      'Pasos:',
      ...output.steps.map((step, idx) => `${idx + 1}. ${step}`),
      '',
      tables,
      '',
      'Conclusión:',
      output.conclusion,
    ].join('\n');
    await copyText(text);
    this.flash('resultado completo');
  }

  async copyTable(title: string, headers: string[], rows: (string | number)[][]): Promise<void> {
    await copyText(`${title}\n${tableToTsv(headers, rows)}`);
    this.flash(title);
  }

  private flash(label: string): void {
    this.copied.set(label);
    window.setTimeout(() => this.copied.set(''), 1800);
  }
}
