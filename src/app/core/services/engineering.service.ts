import { Injectable } from '@angular/core';
import {
  CalcOutput,
  CashFlow,
  FactorRow,
  FrequencyKey,
  RateBreakdown,
  Scenario,
  TimelinePoint,
  frequencyOf,
} from '../models/engineering.models';
import { factorFmt, moneyFmt, numFmt, pctFmt } from '../utils/format';

@Injectable({ providedIn: 'root' })
export class EngineeringService {
  periodsPerYear(key: FrequencyKey): number {
    return frequencyOf(key).periodsPerYear;
  }

  effectiveAnnual(nominal: number, capitalization: FrequencyKey, type: Scenario['interestType']): number {
    if (type === 'simple') {
      return nominal;
    }
    if (type === 'continuous' || capitalization === 'continuous') {
      return Math.expm1(nominal);
    }
    const m = this.periodsPerYear(capitalization);
    return (1 + nominal / m) ** m - 1;
  }

  periodRate(effectiveAnnual: number, paymentFrequency: FrequencyKey, type: Scenario['interestType']): number {
    if (type === 'simple') {
      const m = this.finitePeriods(paymentFrequency);
      return effectiveAnnual / m;
    }
    if (type === 'continuous' || paymentFrequency === 'continuous') {
      return Math.log(1 + effectiveAnnual);
    }
    const m = this.finitePeriods(paymentFrequency);
    return (1 + effectiveAnnual) ** (1 / m) - 1;
  }

  resolveRates(scenario: Scenario): RateBreakdown {
    const nominal = scenario.nominalAnnualPercent / 100;
    const effective = this.effectiveAnnual(nominal, scenario.capitalization, scenario.interestType);
    const period = this.periodRate(effective, scenario.paymentFrequency, scenario.interestType);
    const payM = this.finitePeriods(scenario.paymentFrequency);
    const periods =
      scenario.periodsOverride && scenario.periodsOverride > 0
        ? Math.round(scenario.periodsOverride)
        : Math.max(1, Math.round(scenario.years * payM));

    return {
      nominalAnnual: nominal,
      capitalization: scenario.capitalization,
      paymentFrequency: scenario.paymentFrequency,
      interestType: scenario.interestType,
      effectiveAnnual: effective,
      periodRate: period,
      periods,
      capitalizationPeriods: this.finitePeriods(scenario.capitalization),
    };
  }

  factorFP(i: number, n: number): number {
    if (n === 0) return 1;
    return (1 + i) ** n;
  }

  factorPF(i: number, n: number): number {
    return 1 / this.factorFP(i, n);
  }

  factorFA(i: number, n: number): number {
    if (Math.abs(i) < 1e-12) return n;
    return ((1 + i) ** n - 1) / i;
  }

  factorAF(i: number, n: number): number {
    return 1 / this.factorFA(i, n);
  }

  factorPA(i: number, n: number): number {
    if (Math.abs(i) < 1e-12) return n;
    return ((1 + i) ** n - 1) / (i * (1 + i) ** n);
  }

  factorAP(i: number, n: number): number {
    return 1 / this.factorPA(i, n);
  }

  factorPG(i: number, n: number): number {
    if (Math.abs(i) < 1e-12) return (n * (n - 1)) / 2;
    return ((1 + i) ** n - i * n - 1) / (i ** 2 * (1 + i) ** n);
  }

  factorAG(i: number, n: number): number {
    if (Math.abs(i) < 1e-12) return (n - 1) / 2;
    return 1 / i - n / ((1 + i) ** n - 1);
  }

  factorFG(i: number, n: number): number {
    if (Math.abs(i) < 1e-12) return (n * (n - 1)) / 2;
    return ((1 + i) ** n - i * n - 1) / i ** 2;
  }

  factorPGeometric(i: number, g: number, n: number): number {
    if (Math.abs(i - g) < 1e-12) {
      return n / (1 + i);
    }
    return (1 - ((1 + g) / (1 + i)) ** n) / (i - g);
  }

  factorFGeometric(i: number, g: number, n: number): number {
    return this.factorPGeometric(i, g, n) * this.factorFP(i, n);
  }

  simpleFuture(P: number, i: number, n: number): number {
    return P * (1 + i * n);
  }

  simplePresent(F: number, i: number, n: number): number {
    return F / (1 + i * n);
  }

  continuousFuture(P: number, r: number, n: number): number {
    return P * Math.exp(r * n);
  }

  adjustAnnuity(amount: number, i: number, timing: Scenario['paymentTiming']): number {
    return timing === 'due' ? amount * (1 + i) : amount;
  }

  npv(rate: number, flows: CashFlow[]): number {
    return flows.reduce((sum, flow) => sum + flow.amount / (1 + rate) ** flow.period, 0);
  }

  irr(flows: CashFlow[]): { rate: number | null; iterations: number; warning?: string } {
    const signs = new Set(flows.filter((f) => f.amount !== 0).map((f) => Math.sign(f.amount)));
    const warning = signs.size < 2 ? 'Los flujos no cambian de signo; la TIR puede no existir.' : undefined;
    let i = 0.1;
    for (let k = 0; k < 80; k += 1) {
      const { value, derivative } = this.npvAndDerivative(i, flows);
      if (Math.abs(value) < 1e-10) {
        return { rate: i, iterations: k + 1, warning };
      }
      if (Math.abs(derivative) < 1e-14) {
        break;
      }
      i -= value / derivative;
      if (i <= -0.999) {
        i = -0.9;
      }
    }
    const bracket = this.bisectionIrr(flows);
    return { rate: bracket, iterations: 80, warning };
  }

  mirr(flows: CashFlow[], financeRate: number, reinvestRate: number): number | null {
    const n = Math.max(...flows.map((f) => f.period), 0);
    if (n === 0) {
      return null;
    }
    const pvNeg = flows
      .filter((f) => f.amount < 0)
      .reduce((sum, f) => sum + f.amount / (1 + financeRate) ** f.period, 0);
    const fvPos = flows
      .filter((f) => f.amount > 0)
      .reduce((sum, f) => sum + f.amount * (1 + reinvestRate) ** (n - f.period), 0);
    if (pvNeg === 0 || fvPos <= 0) {
      return null;
    }
    return (fvPos / Math.abs(pvNeg)) ** (1 / n) - 1;
  }

  payback(flows: CashFlow[]): { periods: number | null; discounted: number | null } {
    const ordered = [...flows].sort((a, b) => a.period - b.period);
    let acc = 0;
    let simple: number | null = null;
    for (const flow of ordered) {
      const prev = acc;
      acc += flow.amount;
      if (prev < 0 && acc >= 0) {
        const need = -prev;
        simple = flow.period - 1 + need / Math.max(flow.amount, 1e-9);
        break;
      }
    }
    return { periods: simple, discounted: null };
  }

  discountedPayback(flows: CashFlow[], rate: number): number | null {
    const ordered = [...flows].sort((a, b) => a.period - b.period);
    let acc = 0;
    for (const flow of ordered) {
      const prev = acc;
      const discounted = flow.amount / (1 + rate) ** flow.period;
      acc += discounted;
      if (prev < 0 && acc >= 0) {
        return flow.period - 1 + -prev / Math.max(discounted, 1e-9);
      }
    }
    return null;
  }

  benefitCost(benefits: CashFlow[], costs: CashFlow[], rate: number): number {
    const pwB = this.npv(rate, benefits);
    const pwC = Math.abs(this.npv(rate, costs));
    return pwC === 0 ? Number.POSITIVE_INFINITY : pwB / pwC;
  }

  factorTable(i: number, nMax: number): FactorRow[] {
    const rows: FactorRow[] = [];
    for (let n = 1; n <= nMax; n += 1) {
      rows.push({
        n,
        fp: this.factorFP(i, n),
        pf: this.factorPF(i, n),
        fa: this.factorFA(i, n),
        af: this.factorAF(i, n),
        pa: this.factorPA(i, n),
        ap: this.factorAP(i, n),
        pg: this.factorPG(i, n),
        ag: this.factorAG(i, n),
        fg: this.factorFG(i, n),
      });
    }
    return rows;
  }

  equivalentRateMatrix(nominal: number, type: Scenario['interestType']): { frequency: string; periodic: number; effective: number }[] {
    return frequencyOf
      ? [
          ...(['annual', 'semiannual', 'fourMonth', 'quarterly', 'bimonthly', 'monthly', 'weekly', 'daily', 'continuous'] as FrequencyKey[]).map(
            (key) => {
              const ie = this.effectiveAnnual(nominal, key, type === 'simple' ? 'compound' : type);
              const iPeriod = this.periodRate(ie, key, type === 'simple' ? 'compound' : type);
              return {
                frequency: frequencyOf(key).label,
                periodic: Number.isFinite(iPeriod) ? iPeriod : ie,
                effective: ie,
              };
            },
          ),
        ]
      : [];
  }

  inflationReal(nominal: number, inflation: number): number {
    return (nominal - inflation) / (1 + inflation);
  }

  capitalizedCost(A: number, i: number, P = 0): number {
    if (Math.abs(i) < 1e-12) {
      return Number.POSITIVE_INFINITY;
    }
    return P + A / i;
  }

  straightLine(cost: number, salvage: number, life: number) {
    const dep = (cost - salvage) / life;
    return Array.from({ length: life }, (_, idx) => {
      const year = idx + 1;
      const accumulated = dep * year;
      return {
        year,
        depreciation: dep,
        accumulated,
        book: cost - accumulated,
      };
    });
  }

  sumOfYears(cost: number, salvage: number, life: number) {
    const soyd = (life * (life + 1)) / 2;
    const base = cost - salvage;
    let accumulated = 0;
    return Array.from({ length: life }, (_, idx) => {
      const year = idx + 1;
      const depreciation = base * ((life - year + 1) / soyd);
      accumulated += depreciation;
      return { year, depreciation, accumulated, book: cost - accumulated };
    });
  }

  decliningBalance(cost: number, salvage: number, life: number, multiplier = 2, switchToSl = true) {
    const rate = multiplier / life;
    let book = cost;
    let accumulated = 0;
    const rows = [];
    for (let year = 1; year <= life; year += 1) {
      const remainingYears = life - year + 1;
      const sl = (book - salvage) / remainingYears;
      let depreciation = book * rate;
      if (switchToSl && sl > depreciation) {
        depreciation = sl;
      }
      depreciation = Math.min(depreciation, Math.max(book - salvage, 0));
      accumulated += depreciation;
      book -= depreciation;
      rows.push({ year, depreciation, accumulated, book, rate });
    }
    return rows;
  }

  unitsOfProduction(cost: number, salvage: number, totalUnits: number, units: number[]) {
    const perUnit = totalUnits === 0 ? 0 : (cost - salvage) / totalUnits;
    let accumulated = 0;
    return units.map((qty, idx) => {
      const depreciation = perUnit * qty;
      accumulated += depreciation;
      return {
        year: idx + 1,
        units: qty,
        depreciation,
        accumulated,
        book: cost - accumulated,
      };
    });
  }

  buildTimeline(scenario: Scenario): TimelinePoint[] {
    const rates = this.resolveRates(scenario);
    const { periods: n, periodRate: i } = rates;
    const points: TimelinePoint[] = [];
    const signP = scenario.presentValue;
    const signF = scenario.futureValue;
    const A = scenario.annuity;
    const G = scenario.gradient;
    const g = scenario.geometricRatePercent / 100;
    const delay = Math.max(0, scenario.deferredPeriods);

    if (signP) {
      points.push({ period: 0, amount: signP, kind: 'present', label: 'P' });
    }

    if (scenario.seriesType === 'single' && signF) {
      points.push({ period: n, amount: signF, kind: 'future', label: 'F' });
    }

    if (scenario.seriesType === 'uniform' || scenario.seriesType === 'deferred' || scenario.seriesType === 'perpetuity') {
      const start = scenario.seriesType === 'deferred' ? delay + 1 : scenario.paymentTiming === 'due' ? 0 : 1;
      const end = scenario.seriesType === 'perpetuity' ? Math.min(n, 12) : n;
      for (let t = start; t <= end; t += 1) {
        if (A) {
          points.push({ period: t, amount: A, kind: 'annuity', label: 'A' });
        }
      }
      if (scenario.seriesType === 'perpetuity') {
        points.push({ period: end, amount: 0, kind: 'annuity', label: '⋯' });
      }
    }

    if (scenario.seriesType === 'arithmetic') {
      const start = scenario.paymentTiming === 'due' ? 0 : 1;
      for (let t = start; t <= n; t += 1) {
        const k = t - start;
        const amount = A + G * k;
        points.push({ period: t, amount, kind: 'gradient', label: k === 0 ? 'A' : `A+${k}G` });
      }
    }

    if (scenario.seriesType === 'geometric') {
      const start = scenario.paymentTiming === 'due' ? 0 : 1;
      for (let t = start; t <= n; t += 1) {
        const k = t - start;
        const amount = A * (1 + g) ** k;
        points.push({ period: t, amount, kind: 'gradient', label: k === 0 ? 'A' : `A(1+g)^${k}` });
      }
    }

    if (signF && scenario.seriesType !== 'single') {
      points.push({ period: n, amount: signF, kind: 'future', label: 'F' });
    }

    for (const extra of scenario.extraFlows) {
      points.push({
        period: extra.period,
        amount: extra.amount,
        kind: 'custom',
        label: extra.label || 'CF',
      });
    }

    return points.sort((a, b) => a.period - b.period || a.amount - b.amount);
  }

  evaluateEquivalence(scenario: Scenario): CalcOutput {
    const rates = this.resolveRates(scenario);
    const i = rates.periodRate;
    const n = rates.periods;
    const points = this.buildTimeline(scenario);
    const timingNote = scenario.paymentTiming === 'due' ? 'anticipada' : 'ordinaria (vencida)';

    let P = scenario.presentValue;
    let F = scenario.futureValue;
    let A = scenario.annuity;
    const G = scenario.gradient;
    const g = scenario.geometricRatePercent / 100;
    const formulaParts: string[] = [];
    const steps: string[] = [];

    steps.push(
      `Tasa nominal ${pctFmt(rates.nominalAnnual)} con capitalización ${frequencyOf(scenario.capitalization).label.toLowerCase()} (${scenario.interestType}).`,
    );
    steps.push(`Tasa efectiva anual ie = ${pctFmt(rates.effectiveAnnual)}.`);
    steps.push(
      `Tasa del período de pago (${frequencyOf(scenario.paymentFrequency).label.toLowerCase()}): i = ${pctFmt(i)}. n = ${n} períodos.`,
    );

    if (scenario.interestType === 'simple') {
      if (!F && P) {
        F = this.simpleFuture(P, rates.nominalAnnual, scenario.years);
        formulaParts.push('F = P(1 + i·t)');
        steps.push(`F = ${moneyFmt(P)}(1 + ${pctFmt(rates.nominalAnnual)}·${scenario.years}) = ${moneyFmt(F)}.`);
      } else if (!P && F) {
        P = this.simplePresent(F, rates.nominalAnnual, scenario.years);
        formulaParts.push('P = F / (1 + i·t)');
        steps.push(`P = ${moneyFmt(F)} / (1 + ${pctFmt(rates.nominalAnnual)}·${scenario.years}) = ${moneyFmt(P)}.`);
      }
    } else if (scenario.interestType === 'continuous') {
      if (!F && P) {
        F = this.continuousFuture(P, rates.nominalAnnual, scenario.years);
        formulaParts.push('F = P e^{r t}');
        steps.push(`F = ${moneyFmt(P)} e^{${numFmt(rates.nominalAnnual, 4)}·${scenario.years}} = ${moneyFmt(F)}.`);
      } else if (!P && F) {
        P = F * Math.exp(-rates.nominalAnnual * scenario.years);
        formulaParts.push('P = F e^{-r t}');
      }
    } else {
      switch (scenario.seriesType) {
        case 'single': {
          if (!F && P) {
            F = P * this.factorFP(i, n);
            formulaParts.push(`F = P(F/P, i, n) = P(1+i)^n`);
            steps.push(`(F/P, ${pctFmt(i)}, ${n}) = ${factorFmt(this.factorFP(i, n))}`);
            steps.push(`F = ${moneyFmt(P)} × ${factorFmt(this.factorFP(i, n))} = ${moneyFmt(F)}`);
          } else if (!P && F) {
            P = F * this.factorPF(i, n);
            formulaParts.push(`P = F(P/F, i, n) = F(1+i)^{-n}`);
            steps.push(`(P/F, ${pctFmt(i)}, ${n}) = ${factorFmt(this.factorPF(i, n))}`);
            steps.push(`P = ${moneyFmt(F)} × ${factorFmt(this.factorPF(i, n))} = ${moneyFmt(P)}`);
          }
          break;
        }
        case 'uniform': {
          const factorDue = scenario.paymentTiming === 'due' ? 1 + i : 1;
          if (A && !P) {
            P = A * this.factorPA(i, n) * factorDue;
            formulaParts.push(
              scenario.paymentTiming === 'due'
                ? 'P = A(P/A, i, n)(1+i)'
                : 'P = A(P/A, i, n)',
            );
            steps.push(`(P/A, ${pctFmt(i)}, ${n}) = ${factorFmt(this.factorPA(i, n))}`);
          }
          if (A && !F) {
            F = A * this.factorFA(i, n) * factorDue;
            formulaParts.push(
              scenario.paymentTiming === 'due'
                ? 'F = A(F/A, i, n)(1+i)'
                : 'F = A(F/A, i, n)',
            );
            steps.push(`(F/A, ${pctFmt(i)}, ${n}) = ${factorFmt(this.factorFA(i, n))}`);
          }
          if (!A && P) {
            A = (P / factorDue) * this.factorAP(i, n);
            formulaParts.push('A = P(A/P, i, n)');
            steps.push(`(A/P, ${pctFmt(i)}, ${n}) = ${factorFmt(this.factorAP(i, n))}`);
          } else if (!A && F) {
            A = (F / factorDue) * this.factorAF(i, n);
            formulaParts.push('A = F(A/F, i, n)');
          }
          break;
        }
        case 'deferred': {
          const k = scenario.deferredPeriods;
          if (A) {
            P = A * (this.factorPA(i, n + k) - this.factorPA(i, k));
            F = A * this.factorFA(i, n);
            formulaParts.push('P = A[(P/A, i, n+k) − (P/A, i, k)]');
            steps.push(`Diferida ${k} períodos, serie ${timingNote}, n=${n}.`);
            steps.push(`P = ${moneyFmt(A)} × [${factorFmt(this.factorPA(i, n + k))} − ${factorFmt(this.factorPA(i, k))}] = ${moneyFmt(P)}`);
          }
          break;
        }
        case 'perpetuity': {
          if (A) {
            P = i === 0 ? Number.POSITIVE_INFINITY : A / i;
            if (g > 0 && g < i) {
              P = A / (i - g);
              formulaParts.push('P = A / (i − g)');
            } else {
              formulaParts.push('P = A / i');
            }
            steps.push(`Perpetuidad ${timingNote}: P = ${moneyFmt(P)}`);
          }
          break;
        }
        case 'arithmetic': {
          const pUniform = A * this.factorPA(i, n);
          const pGrad = G * this.factorPG(i, n);
          P = this.adjustAnnuity(pUniform + pGrad, i, scenario.paymentTiming === 'due' ? 'due' : 'ordinary');
          F = P * this.factorFP(i, n);
          formulaParts.push('P = A(P/A, i, n) + G(P/G, i, n)');
          steps.push(`(P/A) = ${factorFmt(this.factorPA(i, n))}, (P/G) = ${factorFmt(this.factorPG(i, n))}`);
          steps.push(`P = ${moneyFmt(A)}(${factorFmt(this.factorPA(i, n))}) + ${moneyFmt(G)}(${factorFmt(this.factorPG(i, n))}) = ${moneyFmt(P)}`);
          break;
        }
        case 'geometric': {
          const factor = this.factorPGeometric(i, g, n);
          P = A * factor;
          if (scenario.paymentTiming === 'due') {
            P *= 1 + i;
          }
          F = P * this.factorFP(i, n);
          formulaParts.push(Math.abs(i - g) < 1e-12 ? 'P = A · n / (1+i)' : 'P = A [1 − ((1+g)/(1+i))^n] / (i − g)');
          steps.push(`g = ${pctFmt(g)}, factor geométrico = ${factorFmt(factor)}`);
          steps.push(`P = ${moneyFmt(A)} × ${factorFmt(factor)} = ${moneyFmt(P)}`);
          break;
        }
      }
    }

    const conclusion = this.composeConclusion(scenario, rates, P, F, A, G, g);
    return {
      title: scenario.title,
      formula: formulaParts.join('  ·  ') || 'Seleccione valores conocidos para generar la fórmula.',
      steps,
      highlights: [
        { label: 'Valor presente P', value: moneyFmt(P), tone: 'primary' },
        { label: 'Valor futuro F', value: moneyFmt(F), tone: 'success' },
        { label: 'Serie A', value: moneyFmt(A) },
        { label: 'Tasa del período i', value: pctFmt(i), tone: 'warning' },
        { label: 'Períodos n', value: String(n) },
        { label: 'Tasa efectiva anual', value: pctFmt(rates.effectiveAnnual) },
      ],
      tables: [
        {
          title: 'Factores de interés usados',
          headers: ['Factor', 'Notación', 'Valor'],
          rows: [
            ['Cantidad compuesta', `(F/P, ${pctFmt(i)}, ${n})`, factorFmt(this.factorFP(i, n))],
            ['Valor presente', `(P/F, ${pctFmt(i)}, ${n})`, factorFmt(this.factorPF(i, n))],
            ['Serie a futuro', `(F/A, ${pctFmt(i)}, ${n})`, factorFmt(this.factorFA(i, n))],
            ['Fondo de amortización', `(A/F, ${pctFmt(i)}, ${n})`, factorFmt(this.factorAF(i, n))],
            ['Serie a presente', `(P/A, ${pctFmt(i)}, ${n})`, factorFmt(this.factorPA(i, n))],
            ['Recuperación de capital', `(A/P, ${pctFmt(i)}, ${n})`, factorFmt(this.factorAP(i, n))],
            ['Gradiente aritmético P', `(P/G, ${pctFmt(i)}, ${n})`, factorFmt(this.factorPG(i, n))],
            ['Gradiente a serie', `(A/G, ${pctFmt(i)}, ${n})`, factorFmt(this.factorAG(i, n))],
            ['Gradiente a futuro', `(F/G, ${pctFmt(i)}, ${n})`, factorFmt(this.factorFG(i, n))],
          ],
        },
        {
          title: 'Flujos de la línea de tiempo',
          headers: ['Período', 'Etiqueta', 'Monto'],
          rows: points.map((p) => [p.period, p.label, moneyFmt(p.amount)]),
        },
      ],
      conclusion,
      points,
      scenario,
    };
  }

  solveUnknown(
    unknown: 'P' | 'F' | 'A' | 'i' | 'n',
    values: { P?: number; F?: number; A?: number; i?: number; n?: number },
  ): { value: number | null; formula: string; steps: string[] } {
    const { P, F, A, i, n } = values;
    if (unknown === 'F' && P != null && i != null && n != null) {
      return {
        value: P * this.factorFP(i, n),
        formula: 'F = P(1+i)^n',
        steps: [`(F/P, ${pctFmt(i)}, ${n}) = ${factorFmt(this.factorFP(i, n))}`],
      };
    }
    if (unknown === 'P' && F != null && i != null && n != null) {
      return {
        value: F * this.factorPF(i, n),
        formula: 'P = F(1+i)^{-n}',
        steps: [`(P/F, ${pctFmt(i)}, ${n}) = ${factorFmt(this.factorPF(i, n))}`],
      };
    }
    if (unknown === 'P' && A != null && i != null && n != null) {
      return {
        value: A * this.factorPA(i, n),
        formula: 'P = A(P/A, i, n)',
        steps: [`(P/A, ${pctFmt(i)}, ${n}) = ${factorFmt(this.factorPA(i, n))}`],
      };
    }
    if (unknown === 'A' && P != null && i != null && n != null) {
      return {
        value: P * this.factorAP(i, n),
        formula: 'A = P(A/P, i, n)',
        steps: [`(A/P, ${pctFmt(i)}, ${n}) = ${factorFmt(this.factorAP(i, n))}`],
      };
    }
    if (unknown === 'A' && F != null && i != null && n != null) {
      return {
        value: F * this.factorAF(i, n),
        formula: 'A = F(A/F, i, n)',
        steps: [`(A/F, ${pctFmt(i)}, ${n}) = ${factorFmt(this.factorAF(i, n))}`],
      };
    }
    if (unknown === 'F' && A != null && i != null && n != null) {
      return {
        value: A * this.factorFA(i, n),
        formula: 'F = A(F/A, i, n)',
        steps: [`(F/A, ${pctFmt(i)}, ${n}) = ${factorFmt(this.factorFA(i, n))}`],
      };
    }
    if (unknown === 'i' && P != null && F != null && n != null && P !== 0) {
      const rate = (F / P) ** (1 / n) - 1;
      return { value: rate, formula: 'i = (F/P)^{1/n} − 1', steps: [`i = ${pctFmt(rate)}`] };
    }
    if (unknown === 'n' && P != null && F != null && i != null && i > -1 && P !== 0) {
      const periods = Math.log(F / P) / Math.log(1 + i);
      return { value: periods, formula: 'n = ln(F/P) / ln(1+i)', steps: [`n = ${numFmt(periods, 4)}`] };
    }
    return { value: null, formula: 'Datos insuficientes o inconsistentes', steps: [] };
  }

  private finitePeriods(key: FrequencyKey): number {
    const value = this.periodsPerYear(key);
    return Number.isFinite(value) ? value : 365;
  }

  private npvAndDerivative(rate: number, flows: CashFlow[]): { value: number; derivative: number } {
    return flows.reduce(
      (acc, flow) => {
        const base = 1 + rate;
        acc.value += flow.amount / base ** flow.period;
        acc.derivative += (-flow.period * flow.amount) / base ** (flow.period + 1);
        return acc;
      },
      { value: 0, derivative: 0 },
    );
  }

  private bisectionIrr(flows: CashFlow[]): number | null {
    let lo = -0.9;
    let hi = 10;
    let vlo = this.npv(lo, flows);
    let vhi = this.npv(hi, flows);
    if (vlo * vhi > 0) {
      return null;
    }
    for (let k = 0; k < 80; k += 1) {
      const mid = (lo + hi) / 2;
      const vm = this.npv(mid, flows);
      if (Math.abs(vm) < 1e-10) {
        return mid;
      }
      if (vlo * vm < 0) {
        hi = mid;
        vhi = vm;
      } else {
        lo = mid;
        vlo = vm;
      }
    }
    return (lo + hi) / 2;
  }

  private composeConclusion(
    scenario: Scenario,
    rates: RateBreakdown,
    P: number,
    F: number,
    A: number,
    G: number,
    g: number,
  ): string {
    const typeLabel =
      scenario.interestType === 'simple'
        ? 'interés simple'
        : scenario.interestType === 'continuous'
          ? 'interés continuo'
          : 'interés compuesto';
    const seriesLabel: Record<Scenario['seriesType'], string> = {
      single: 'un pago único',
      uniform: 'una serie uniforme',
      arithmetic: 'un gradiente aritmético',
      geometric: 'un gradiente geométrico',
      deferred: 'una anualidad diferida',
      perpetuity: 'una perpetuidad',
    };
    const parts = [
      `Bajo ${typeLabel} con capitalización ${frequencyOf(scenario.capitalization).label.toLowerCase()} y pagos ${frequencyOf(scenario.paymentFrequency).label.toLowerCase()}s,`,
      `la tasa efectiva anual es ${pctFmt(rates.effectiveAnnual)} y la tasa por período de análisis es ${pctFmt(rates.periodRate)} durante ${rates.periods} períodos.`,
      `El esquema corresponde a ${seriesLabel[scenario.seriesType]}.`,
      `El valor presente equivalente es ${moneyFmt(P)} y el valor futuro equivalente es ${moneyFmt(F)}.`,
    ];
    if (A) {
      parts.push(`La cuota uniforme de referencia es ${moneyFmt(A)}.`);
    }
    if (G) {
      parts.push(`El gradiente aritmético G es ${moneyFmt(G)} por período.`);
    }
    if (g) {
      parts.push(`El crecimiento geométrico g es ${pctFmt(g)}.`);
    }
    parts.push('Estos equivalentes permiten comparar alternativas en el mismo instante del tiempo.');
    return parts.join(' ');
  }
}
