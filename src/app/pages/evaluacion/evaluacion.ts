import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalcOutput, CashFlow } from '../../core/models/engineering.models';
import { EngineeringService } from '../../core/services/engineering.service';
import { SessionService } from '../../core/services/session.service';
import { moneyFmt, pctFmt } from '../../core/utils/format';
import { ResultPanel } from '../../shared/result-panel/result-panel';
import { TimelineBoard } from '../../shared/timeline-board/timeline-board';

@Component({
  selector: 'app-evaluacion',
  imports: [FormsModule, ResultPanel, TimelineBoard],
  templateUrl: './evaluacion.html',
})
export class Evaluacion {
  private readonly engineering = inject(EngineeringService);
  private readonly session = inject(SessionService);

  tmarPercent = signal(12);
  financePercent = signal(10);
  reinvestPercent = signal(8);
  flowsText = signal('0, -50000\n1, 14000\n2, 16000\n3, 18000\n4, 20000\n5, 15000');
  readonly output = signal<CalcOutput | null>(null);

  calculate(): void {
    const flows = this.parseFlows(this.flowsText());
    const i = this.tmarPercent() / 100;
    const vpn = this.engineering.npv(i, flows);
    const irr = this.engineering.irr(flows);
    const tirm = this.engineering.mirr(flows, this.financePercent() / 100, this.reinvestPercent() / 100);
    const n = Math.max(...flows.map((f) => f.period), 1);
    const caue = vpn * this.engineering.factorAP(i, n);
    const benefits = flows.filter((f) => f.amount > 0);
    const costs = flows.filter((f) => f.amount < 0);
    const bc = this.engineering.benefitCost(benefits, costs, i);
    const pay = this.engineering.payback(flows);
    const dpay = this.engineering.discountedPayback(flows, i);
    const points = flows.map((f) => ({
      period: f.period,
      amount: f.amount,
      kind: 'custom' as const,
      label: f.period === 0 ? 'Inv' : `CF${f.period}`,
    }));

    const decision =
      vpn >= 0
        ? 'El proyecto crea valor a la TMAR indicada y se recomienda aceptarlo.'
        : 'El proyecto destruye valor a la TMAR indicada; se recomienda rechazarlo o renegociar flujos.';

    const result: CalcOutput = {
      title: 'Evaluación de proyecto',
      formula: 'VPN = Σ CF_t/(1+i)^t    0 = Σ CF_t/(1+TIR)^t    CAUE = VPN(A/P,i,n)',
      steps: [
        `TMAR i = ${pctFmt(i)}.`,
        `VPN = ${moneyFmt(vpn)}.`,
        irr.rate == null ? 'No se encontró TIR real.' : `TIR = ${pctFmt(irr.rate)} (${irr.iterations} iteraciones).`,
        tirm == null ? 'TIRM no calculable con los signos actuales.' : `TIRM = ${pctFmt(tirm)}.`,
        `CAUE = ${moneyFmt(caue)}. B/C = ${bc.toFixed(4)}.`,
        pay.periods == null
          ? 'El capital no se recupera en el horizonte.'
          : `Payback simple ≈ ${pay.periods.toFixed(2)} períodos; descontado ≈ ${dpay?.toFixed(2) ?? 'n/d'}.`,
        irr.warning ?? '',
      ].filter(Boolean),
      highlights: [
        { label: 'VPN', value: moneyFmt(vpn), tone: vpn >= 0 ? 'success' : 'danger' },
        { label: 'TIR', value: irr.rate == null ? 'n/d' : pctFmt(irr.rate), tone: 'primary' },
        { label: 'TIRM', value: tirm == null ? 'n/d' : pctFmt(tirm) },
        { label: 'CAUE', value: moneyFmt(caue) },
        { label: 'B/C', value: bc.toFixed(4), tone: bc >= 1 ? 'success' : 'warning' },
        { label: 'Payback', value: pay.periods == null ? 'no recupera' : `${pay.periods.toFixed(2)} per.` },
      ],
      tables: [
        {
          title: 'Flujos',
          headers: ['Período', 'Flujo', 'Descontado'],
          rows: flows.map((f) => [f.period, moneyFmt(f.amount), moneyFmt(f.amount / (1 + i) ** f.period)]),
        },
      ],
      conclusion: `${decision} VPN ${moneyFmt(vpn)} a TMAR ${pctFmt(i)}. ${
        irr.rate == null ? '' : `La TIR ${pctFmt(irr.rate)} ${irr.rate >= i ? 'supera' : 'no alcanza'} la TMAR.`
      } Relación B/C = ${bc.toFixed(3)}. El CAUE de ${moneyFmt(caue)} permite comparar con alternativas de distinta vida.`,
      points,
    };

    this.output.set(result);
    this.session.store(result);
    this.session.update({ extraFlows: flows, seriesType: 'single', presentValue: 0, futureValue: 0, annuity: 0 });
  }

  private parseFlows(text: string): CashFlow[] {
    return text
      .split(/\n+/)
      .map((line) => line.split(/[,\t;]/).map((part) => part.trim()))
      .filter((parts) => parts.length >= 2 && parts[0] !== '')
      .map((parts) => ({ period: Number(parts[0]), amount: Number(parts[1]) }))
      .filter((flow) => Number.isFinite(flow.period) && Number.isFinite(flow.amount));
  }
}
