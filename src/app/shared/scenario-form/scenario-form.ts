import { Component, output, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FREQUENCIES,
  Scenario,
  SeriesType,
  InterestType,
  PaymentTiming,
  FrequencyKey,
} from '../../core/models/engineering.models';

@Component({
  selector: 'app-scenario-form',
  imports: [FormsModule],
  templateUrl: './scenario-form.html',
})
export class ScenarioForm {
  readonly scenario = input.required<Scenario>();
  readonly compact = input(false);
  readonly changed = output<Partial<Scenario>>();

  readonly frequencies = FREQUENCIES;
  readonly series: { key: SeriesType; label: string }[] = [
    { key: 'single', label: 'Pago único' },
    { key: 'uniform', label: 'Serie uniforme' },
    { key: 'arithmetic', label: 'Gradiente aritmético' },
    { key: 'geometric', label: 'Gradiente geométrico' },
    { key: 'deferred', label: 'Anualidad diferida' },
    { key: 'perpetuity', label: 'Perpetuidad' },
  ];
  readonly interests: { key: InterestType; label: string }[] = [
    { key: 'simple', label: 'Simple' },
    { key: 'compound', label: 'Compuesto' },
    { key: 'continuous', label: 'Continuo' },
  ];
  readonly timings: { key: PaymentTiming; label: string }[] = [
    { key: 'ordinary', label: 'Ordinaria (vencida)' },
    { key: 'due', label: 'Anticipada' },
  ];

  emit<K extends keyof Scenario>(key: K, value: Scenario[K]): void {
    this.changed.emit({ [key]: value } as Partial<Scenario>);
  }

  onNumber(key: keyof Scenario, raw: string): void {
    const value = raw === '' ? 0 : Number(raw);
    this.changed.emit({ [key]: value } as Partial<Scenario>);
  }

  onOptionalPeriods(raw: string | number | null): void {
    this.changed.emit({
      periodsOverride: raw === '' || raw === null ? null : Number(raw),
    });
  }

  onFrequency(key: 'capitalization' | 'paymentFrequency', value: string): void {
    this.changed.emit({ [key]: value as FrequencyKey });
  }
}
