import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FREQUENCIES, FrequencyKey } from '../../core/models/engineering.models';
import { EngineeringService } from '../../core/services/engineering.service';
import { factorFmt, pctFmt } from '../../core/utils/format';
import { ResultPanel } from '../../shared/result-panel/result-panel';

@Component({
  selector: 'app-tasas',
  imports: [FormsModule, ResultPanel],
  templateUrl: './tasas.html',
})
export class Tasas {
  private readonly engineering = inject(EngineeringService);
  readonly frequencies = FREQUENCIES.filter((item) => item.key !== 'continuous');

  nominal = signal(18);
  inflation = signal(5);
  capitalization = signal<FrequencyKey>('monthly');
  interestType = signal<'simple' | 'compound' | 'continuous'>('compound');

  readonly matrix = computed(() =>
    this.engineering.equivalentRateMatrix(this.nominal() / 100, this.interestType()),
  );

  readonly result = computed(() => {
    const j = this.nominal() / 100;
    const f = this.inflation() / 100;
    const ie = this.engineering.effectiveAnnual(j, this.capitalization(), this.interestType());
    const real = this.engineering.inflationReal(ie, f);
    const rows = this.matrix().map((row) => [row.frequency, pctFmt(row.periodic), pctFmt(row.effective)]);
    return {
      title: 'Catálogo de tasas equivalentes',
      formula:
        this.interestType() === 'continuous'
          ? 'i_e = e^r − 1'
          : this.interestType() === 'simple'
            ? 'i = j  (sin capitalización)'
            : 'i_e = (1 + j/m)^m − 1',
      steps: [
        `Nominal j = ${pctFmt(j)} capitalizable ${this.capitalization()}.`,
        `Tasa efectiva anual = ${pctFmt(ie)}.`,
        `Tasa real de Fisher con inflación ${pctFmt(f)}: i' = ${pctFmt(real)}.`,
      ],
      highlights: [
        { label: 'Efectiva anual', value: pctFmt(ie), tone: 'primary' as const },
        { label: 'Tasa real', value: pctFmt(real), tone: 'success' as const },
        { label: 'Inflación', value: pctFmt(f), tone: 'warning' as const },
      ],
      tables: [
        {
          title: 'Equivalencias por frecuencia',
          headers: ['Frecuencia', 'Tasa del período', 'Efectiva anual'],
          rows,
        },
      ],
      conclusion: `Una tasa nominal de ${pctFmt(j)} con capitalización ${this.capitalization()} equivale a ${pctFmt(ie)} efectiva anual. Descontando inflación de ${pctFmt(f)}, el poder adquisitivo crece a ${pctFmt(real)}. Use esta efectiva para comparar alternativas con distinta frecuencia de capitalización.`,
      points: [],
    };
  });

  protected readonly pctFmt = pctFmt;
  protected readonly factorFmt = factorFmt;
}
