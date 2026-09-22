import { TestBed } from '@angular/core/testing';
import { EngineeringService } from './engineering.service';

describe('EngineeringService', () => {
  let service: EngineeringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EngineeringService);
  });

  it('computes classic discrete factors at 10% and n=5', () => {
    const i = 0.1;
    const n = 5;
    expect(service.factorFP(i, n)).toBeCloseTo(1.61051, 4);
    expect(service.factorPF(i, n)).toBeCloseTo(0.620921, 4);
    expect(service.factorPA(i, n)).toBeCloseTo(3.79079, 4);
    expect(service.factorAP(i, n)).toBeCloseTo(0.263797, 4);
    expect(service.factorFA(i, n)).toBeCloseTo(6.1051, 3);
    expect(service.factorPG(i, n)).toBeCloseTo(6.8618, 3);
    expect(service.factorAG(i, n)).toBeCloseTo(1.8101, 3);
  });

  it('handles zero interest series', () => {
    expect(service.factorPA(0, 8)).toBe(8);
    expect(service.factorFA(0, 8)).toBe(8);
  });

  it('converts nominal monthly 12% to effective annual', () => {
    const ie = service.effectiveAnnual(0.12, 'monthly', 'compound');
    expect(ie).toBeCloseTo(0.126825, 5);
  });

  it('finds IRR of a conventional project', () => {
    const result = service.irr([
      { period: 0, amount: -1000 },
      { period: 1, amount: 600 },
      { period: 2, amount: 600 },
    ]);
    expect(result.rate).not.toBeNull();
    expect(result.rate!).toBeCloseTo(0.1306, 3);
  });

  it('computes geometric present when i equals g', () => {
    expect(service.factorPGeometric(0.08, 0.08, 5)).toBeCloseTo(5 / 1.08, 6);
  });
});
