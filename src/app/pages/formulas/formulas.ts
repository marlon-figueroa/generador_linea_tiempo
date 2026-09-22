import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FORMULA_CATALOG, FormulaEntry } from '../../core/data/formulas.catalog';
import { EngineeringService } from '../../core/services/engineering.service';
import { moneyFmt, numFmt, pctFmt } from '../../core/utils/format';
import { ResultPanel } from '../../shared/result-panel/result-panel';
import { LatexFormula } from '../../shared/latex-formula/latex-formula';

@Component({
  selector: 'app-formulas',
  imports: [FormsModule, ResultPanel, LatexFormula],
  templateUrl: './formulas.html',
})
export class Formulas {
  private readonly engineering = inject(EngineeringService);
  readonly catalog = FORMULA_CATALOG;
  readonly categories = [...new Set(FORMULA_CATALOG.map((item) => item.category))];

  query = signal('');
  category = signal('Todas');
  selectedId = signal(FORMULA_CATALOG[3].id);
  P = signal(10000);
  F = signal(0);
  A = signal(2500);
  iPercent = signal(10);
  n = signal(5);
  gPercent = signal(4);
  G = signal(300);

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    return this.catalog.filter((item) => {
      const catOk = this.category() === 'Todas' || item.category === this.category();
      const text = `${item.name} ${item.expression} ${item.latex} ${item.unknown}`.toLowerCase();
      return catOk && text.includes(q);
    });
  });

  readonly selected = computed(
    () => this.catalog.find((item) => item.id === this.selectedId()) ?? this.catalog[0],
  );

  readonly output = computed(() => {
    const formula = this.selected();
    const solved = this.compute(formula);
    return {
      title: formula.name,
      formula: formula.latex,
      steps: [formula.notes, ...solved.steps],
      highlights: [
        { label: 'Incógnita', value: formula.unknown, tone: 'primary' as const },
        { label: 'Resultado', value: solved.display, tone: 'success' as const },
        { label: 'Requiere', value: formula.required.join(', ') },
      ],
      tables: [
        {
          title: 'Datos usados',
          headers: ['Símbolo', 'Valor'],
          rows: [
            ['P', moneyFmt(this.P())],
            ['F', moneyFmt(this.F())],
            ['A', moneyFmt(this.A())],
            ['G', moneyFmt(this.G())],
            ['i', pctFmt(this.iPercent() / 100)],
            ['n', String(this.n())],
            ['g', pctFmt(this.gPercent() / 100)],
          ],
        },
      ],
      conclusion: `Para encontrar ${formula.unknown} se aplica ${formula.expression}. ${solved.conclusion}`,
      points: [],
    };
  });

  pick(entry: FormulaEntry): void {
    this.selectedId.set(entry.id);
  }

  private compute(formula: FormulaEntry): { display: string; steps: string[]; conclusion: string } {
    const i = this.iPercent() / 100;
    const n = this.n();
    const g = this.gPercent() / 100;
    const unknown = formula.unknown.includes('P')
      ? 'P'
      : formula.unknown.includes('F')
        ? 'F'
        : formula.unknown.includes('A')
          ? 'A'
          : formula.unknown.includes('i') || formula.unknown.includes('TIR')
            ? 'i'
            : formula.unknown.includes('n')
              ? 'n'
              : 'P';
    const solved = this.engineering.solveUnknown(unknown as 'P' | 'F' | 'A' | 'i' | 'n', {
      P: this.P() || undefined,
      F: this.F() || undefined,
      A: this.A() || undefined,
      i,
      n,
    });

    if (formula.id === 'p-arith') {
      const value = this.A() * this.engineering.factorPA(i, n) + this.G() * this.engineering.factorPG(i, n);
      return {
        display: moneyFmt(value),
        steps: [`P = ${moneyFmt(value)}`],
        conclusion: `El presente combinado de la serie y el gradiente es ${moneyFmt(value)}.`,
      };
    }
    if (formula.id === 'p-geom') {
      const value = this.A() * this.engineering.factorPGeometric(i, g, n);
      return {
        display: moneyFmt(value),
        steps: [`Factor geométrico = ${numFmt(this.engineering.factorPGeometric(i, g, n))}`],
        conclusion: `El presente del gradiente geométrico es ${moneyFmt(value)}.`,
      };
    }
    if (formula.id === 'ie') {
      const ie = this.engineering.effectiveAnnual(i, 'monthly', 'compound');
      return { display: pctFmt(ie), steps: [], conclusion: `La efectiva de referencia mensual es ${pctFmt(ie)}.` };
    }
    if (solved.value == null) {
      return {
        display: 'Ajuste los datos',
        steps: solved.steps,
        conclusion: 'Complete P o F o A junto con i y n según la fórmula elegida.',
      };
    }
    const display = unknown === 'i' ? pctFmt(solved.value) : unknown === 'n' ? numFmt(solved.value, 4) : moneyFmt(solved.value);
    return {
      display,
      steps: solved.steps,
      conclusion: `El valor calculado de ${unknown} es ${display}.`,
    };
  }
}
