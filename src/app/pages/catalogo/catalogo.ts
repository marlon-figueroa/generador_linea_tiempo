import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EngineeringService } from '../../core/services/engineering.service';
import { copyText, factorFmt, tableToTsv } from '../../core/utils/format';

@Component({
  selector: 'app-catalogo',
  imports: [FormsModule],
  templateUrl: './catalogo.html',
})
export class Catalogo {
  private readonly engineering = inject(EngineeringService);

  ratePercent = signal(10);
  nMax = signal(25);
  copied = signal(false);

  readonly headers = ['n', 'F/P', 'P/F', 'F/A', 'A/F', 'P/A', 'A/P', 'P/G', 'A/G', 'F/G'];

  readonly rows = computed(() => {
    const i = this.ratePercent() / 100;
    return this.engineering.factorTable(i, Math.min(80, Math.max(1, this.nMax()))).map((row) => [
      row.n,
      factorFmt(row.fp),
      factorFmt(row.pf),
      factorFmt(row.fa),
      factorFmt(row.af),
      factorFmt(row.pa),
      factorFmt(row.ap),
      factorFmt(row.pg),
      factorFmt(row.ag),
      factorFmt(row.fg),
    ]);
  });

  async copy(): Promise<void> {
    await copyText(`i = ${this.ratePercent()}%\n${tableToTsv(this.headers, this.rows())}`);
    this.copied.set(true);
    window.setTimeout(() => this.copied.set(false), 1600);
  }
}
