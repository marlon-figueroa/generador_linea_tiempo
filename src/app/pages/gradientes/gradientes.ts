import { Component, inject, signal } from '@angular/core';
import { CalcOutput } from '../../core/models/engineering.models';
import { EngineeringService } from '../../core/services/engineering.service';
import { SessionService } from '../../core/services/session.service';
import { ResultPanel } from '../../shared/result-panel/result-panel';
import { ScenarioForm } from '../../shared/scenario-form/scenario-form';
import { TimelineBoard } from '../../shared/timeline-board/timeline-board';

@Component({
  selector: 'app-gradientes',
  imports: [ScenarioForm, ResultPanel, TimelineBoard],
  templateUrl: './gradientes.html',
})
export class Gradientes {
  private readonly engineering = inject(EngineeringService);
  readonly session = inject(SessionService);
  readonly output = signal<CalcOutput | null>(null);

  useArithmetic(): void {
    this.session.update({
      seriesType: 'arithmetic',
      presentValue: 0,
      annuity: 4000,
      gradient: 500,
      geometricRatePercent: 0,
    });
    this.calculate();
  }

  useGeometric(): void {
    this.session.update({
      seriesType: 'geometric',
      presentValue: 0,
      annuity: 4000,
      gradient: 0,
      geometricRatePercent: 8,
    });
    this.calculate();
  }

  calculate(): void {
    const result = this.engineering.evaluateEquivalence(this.session.scenario());
    this.output.set(result);
    this.session.store(result);
  }
}
