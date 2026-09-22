import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalcOutput } from '../../core/models/engineering.models';
import { EngineeringService } from '../../core/services/engineering.service';
import { SessionService } from '../../core/services/session.service';
import { ResultPanel } from '../../shared/result-panel/result-panel';
import { ScenarioForm } from '../../shared/scenario-form/scenario-form';
import { TimelineBoard } from '../../shared/timeline-board/timeline-board';

@Component({
  selector: 'app-equivalencias',
  imports: [ScenarioForm, ResultPanel, TimelineBoard, RouterLink],
  templateUrl: './equivalencias.html',
})
export class Equivalencias {
  private readonly engineering = inject(EngineeringService);
  readonly session = inject(SessionService);
  readonly output = signal<CalcOutput | null>(null);

  calculate(): void {
    const result = this.engineering.evaluateEquivalence(this.session.scenario());
    this.output.set(result);
    this.session.store(result);
  }
}
