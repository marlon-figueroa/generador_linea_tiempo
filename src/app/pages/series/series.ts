import { Component, inject, signal } from '@angular/core';
import { CalcOutput, SeriesType } from '../../core/models/engineering.models';
import { EngineeringService } from '../../core/services/engineering.service';
import { SessionService } from '../../core/services/session.service';
import { ResultPanel } from '../../shared/result-panel/result-panel';
import { ScenarioForm } from '../../shared/scenario-form/scenario-form';
import { TimelineBoard } from '../../shared/timeline-board/timeline-board';

@Component({
  selector: 'app-series',
  imports: [ScenarioForm, ResultPanel, TimelineBoard],
  templateUrl: './series.html',
})
export class Series {
  private readonly engineering = inject(EngineeringService);
  readonly session = inject(SessionService);
  readonly output = signal<CalcOutput | null>(null);

  applyKind(kind: SeriesType): void {
    this.session.update({
      seriesType: kind,
      presentValue: 0,
      futureValue: 0,
      annuity: this.session.scenario().annuity || 2500,
    });
    this.calculate();
  }

  calculate(): void {
    const result = this.engineering.evaluateEquivalence(this.session.scenario());
    this.output.set(result);
    this.session.store(result);
  }
}
