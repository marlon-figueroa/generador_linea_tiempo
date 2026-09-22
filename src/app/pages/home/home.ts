import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEFAULT_SCENARIO, Scenario } from '../../core/models/engineering.models';
import { EngineeringService } from '../../core/services/engineering.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class Home {
  private readonly engineering = inject(EngineeringService);
  private readonly session = inject(SessionService);

  readonly cards = [
    {
      title: 'Valor presente y futuro',
      text: 'Interés simple, compuesto y continuo con conversión de frecuencias.',
      route: '/equivalencias',
      icon: 'bi-cash-stack',
    },
    {
      title: 'Series y gradientes',
      text: 'Anualidades, gracia, perpetuidades, G aritmético y g geométrico.',
      route: '/series',
      icon: 'bi-repeat',
    },
    {
      title: 'VPN, TIR y CAUE',
      text: 'Evalúe proyectos con flujos libres, TIRM, B/C y payback.',
      route: '/evaluacion',
      icon: 'bi-clipboard-data',
    },
    {
      title: 'Línea de tiempo',
      text: 'Diagrama JointJS según la frecuencia, la capitalización y la serie.',
      route: '/linea-tiempo',
      icon: 'bi-bezier2',
    },
    {
      title: 'Catálogo de tablas',
      text: 'Factores (P/F), (F/P), (P/A), (A/P), (F/A), (A/F), (P/G) y (A/G).',
      route: '/catalogo',
      icon: 'bi-table',
    },
    {
      title: 'Generador de fórmulas',
      text: 'Elija la incógnita y obtenga la expresión, el cálculo y la conclusión.',
      route: '/formulas',
      icon: 'bi-sigma',
    },
  ];

  loadDemo(kind: 'single' | 'annuity' | 'gradient'): void {
    const base: Scenario = { ...DEFAULT_SCENARIO, extraFlows: [] };
    const demo: Record<typeof kind, Scenario> = {
      single: { ...base, title: 'Pago único a 5 años', presentValue: 25000, seriesType: 'single' },
      annuity: {
        ...base,
        title: 'Serie uniforme mensual',
        presentValue: 0,
        annuity: 4500,
        years: 3,
        paymentFrequency: 'monthly',
        capitalization: 'monthly',
        seriesType: 'uniform',
      },
      gradient: {
        ...base,
        title: 'Mantenimiento con gradiente',
        presentValue: 0,
        annuity: 8000,
        gradient: 1200,
        years: 6,
        seriesType: 'arithmetic',
        paymentFrequency: 'annual',
        capitalization: 'annual',
        nominalAnnualPercent: 10,
      },
    };
    const output = this.engineering.evaluateEquivalence(demo[kind]);
    this.session.store(output);
  }
}
