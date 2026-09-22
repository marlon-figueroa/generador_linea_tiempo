import { Injectable, computed, signal } from '@angular/core';
import { CalcOutput, DEFAULT_SCENARIO, Scenario } from '../models/engineering.models';

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly scenario = signal<Scenario>({ ...DEFAULT_SCENARIO });
  readonly lastOutput = signal<CalcOutput | null>(null);
  readonly hasOutput = computed(() => this.lastOutput() !== null);

  update(partial: Partial<Scenario>): void {
    this.scenario.update((current) => ({ ...current, ...partial }));
  }

  replace(scenario: Scenario): void {
    this.scenario.set({ ...scenario, extraFlows: [...scenario.extraFlows] });
  }

  store(output: CalcOutput): void {
    this.lastOutput.set(output);
    if (output.scenario) {
      this.replace(output.scenario);
    }
  }

  reset(): void {
    this.scenario.set({ ...DEFAULT_SCENARIO, extraFlows: [] });
    this.lastOutput.set(null);
  }
}
