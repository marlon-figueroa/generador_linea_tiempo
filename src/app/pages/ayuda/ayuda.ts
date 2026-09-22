import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HELP_TOPICS } from '../../core/data/help.data';

@Component({
  selector: 'app-ayuda',
  imports: [FormsModule],
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
      return catOk && `${topic.term} ${topic.summary} ${topic.detail}`.toLowerCase().includes(q);
    });
  });

  toggle(id: string): void {
    this.openId.set(this.openId() === id ? null : id);
  }
}
