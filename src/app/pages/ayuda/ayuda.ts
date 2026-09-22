import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HELP_TOPICS } from '../../core/data/help.data';
import { LatexFormula } from '../../shared/latex-formula/latex-formula';

@Component({
  selector: 'app-ayuda',
  imports: [FormsModule, LatexFormula],
  templateUrl: './ayuda.html',
})
export class Ayuda {
  readonly topics = HELP_TOPICS;
  readonly categories = ['Todas', ...new Set(HELP_TOPICS.map((item) => item.category))];
  query = signal('');
  category = signal('Todas');
  openId = signal<string | null>(HELP_TOPICS[0].id);

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    return this.topics.filter((topic) => {
      const catOk = this.category() === 'Todas' || topic.category === this.category();
      const formulas = (topic.formulas ?? []).map((item) => `${item.caption} ${item.latex}`).join(' ');
      return catOk && `${topic.term} ${topic.summary} ${topic.detail} ${formulas}`.toLowerCase().includes(q);
    });
  });

  toggle(id: string): void {
    this.openId.set(this.openId() === id ? null : id);
  }
}
