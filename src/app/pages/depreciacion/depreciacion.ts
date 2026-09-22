import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalcOutput } from '../../core/models/engineering.models';
import { EngineeringService } from '../../core/services/engineering.service';
import { moneyFmt } from '../../core/utils/format';
import { ResultPanel } from '../../shared/result-panel/result-panel';

type Method = 'sl' | 'soyd' | 'ddb' | 'uop';

@Component({
  selector: 'app-depreciacion',
  imports: [FormsModule, ResultPanel],
  templateUrl: './depreciacion.html',
})
export class Depreciacion {
  private readonly engineering = inject(EngineeringService);

  method = signal<Method>('sl');
  cost = signal(80_000);
  salvage = signal(8_000);
  life = signal(5);
  multiplier = signal(2);
  unitsText = signal('1800, 2200, 2000, 1500, 1500');
  readonly output = signal<CalcOutput | null>(null);

  calculate(): void {
    const C = this.cost();
    const S = this.salvage();
    const N = Math.max(1, Math.round(this.life()));
    const method = this.method();
    let rows: { year: number; depreciation: number; accumulated: number; book: number; extra?: string }[] = [];
    let formula = '';
    let title = '';

    if (method === 'sl') {
      title = 'Línea recta';
      formula = 'D = \\dfrac{C-S}{N}';
      rows = this.engineering.straightLine(C, S, N);
    } else if (method === 'soyd') {
      title = 'Suma de dígitos de los años';
      formula = 'D_{t} = (C-S)\\dfrac{N-t+1}{N(N+1)/2}';
      rows = this.engineering.sumOfYears(C, S, N);
    } else if (method === 'ddb') {
      title = 'Saldo decreciente (con cambio a línea recta)';
      formula = 'D_{t} = \\min\\left(VL_{t-1}\\dfrac{\\alpha}{N},\\,\\dfrac{VL_{t-1}-S}{N-t+1}\\right)';
      rows = this.engineering.decliningBalance(C, S, N, this.multiplier());
    } else {
      title = 'Unidades de producción';
      formula = 'D_{t} = (C-S)\\dfrac{u_{t}}{U}';
      const units = this.unitsText()
        .split(/[,\s]+/)
        .map(Number)
        .filter((n) => Number.isFinite(n));
      const total = units.reduce((a, b) => a + b, 0);
      rows = this.engineering.unitsOfProduction(C, S, total, units);
    }

    this.output.set({
      title,
      formula,
      steps: [
        `Costo C = ${moneyFmt(C)}, valor de salvamento S = ${moneyFmt(S)}, vida N = ${N}.`,
        `Base depreciable = ${moneyFmt(C - S)}.`,
      ],
      highlights: [
        { label: 'Cargo año 1', value: moneyFmt(rows[0]?.depreciation ?? 0), tone: 'primary' },
        { label: 'Valor en libros final', value: moneyFmt(rows.at(-1)?.book ?? 0), tone: 'success' },
        { label: 'Depreciación acumulada', value: moneyFmt(rows.at(-1)?.accumulated ?? 0) },
      ],
      tables: [
        {
          title: 'Programa de depreciación',
          headers: ['Año', 'Depreciación', 'Acumulada', 'Valor en libros'],
          rows: rows.map((row) => [row.year, moneyFmt(row.depreciation), moneyFmt(row.accumulated), moneyFmt(row.book)]),
        },
      ],
      conclusion: `Con el método de ${title.toLowerCase()}, el activo de ${moneyFmt(C)} llega a un valor en libros de ${moneyFmt(rows.at(-1)?.book ?? 0)} al cabo de ${rows.length} períodos. La depreciación no es flujo de efectivo, pero reduce la base gravable y debe incorporarse al análisis después de impuestos.`,
      points: [],
    });
  }
}
