import { Component, inject, signal } from '@angular/core';
import { CalcOutput } from '../../core/models/engineering.models';
import { EngineeringService } from '../../core/services/engineering.service';
import { SessionService } from '../../core/services/session.service';
import { ResultPanel } from '../../shared/result-panel/result-panel';
import { ScenarioForm } from '../../shared/scenario-form/scenario-form';
import { TimelineBoard } from '../../shared/timeline-board/timeline-board';

@Component({
  selector: 'app-linea-tiempo',
  imports: [ScenarioForm, ResultPanel, TimelineBoard],
  templateUrl: './linea-tiempo.html',
})
export class LineaTiempo {
  private readonly engineering = inject(EngineeringService);
  readonly session = inject(SessionService);
  readonly output = signal<CalcOutput | null>(this.session.lastOutput());

  render(): void {
    const result = this.engineering.evaluateEquivalence(this.session.scenario());
    this.output.set(result);
    this.session.store(result);
  }
}
