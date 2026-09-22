import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { dia, shapes } from '@joint/core';
import { TimelinePoint } from '../../core/models/engineering.models';
import { moneyFmt } from '../../core/utils/format';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-timeline-board',
  templateUrl: './timeline-board.html',
  styleUrl: './timeline-board.scss',
})
export class TimelineBoard implements AfterViewInit, OnDestroy {
  readonly points = input<TimelinePoint[]>([]);
  readonly host = viewChild<ElementRef<HTMLDivElement>>('paperHost');
  private readonly theme = inject(ThemeService);

  private graph?: dia.Graph;
  private paper?: dia.Paper;
  private ready = false;

  constructor() {
    effect(() => {
      this.points();
      this.theme.theme();
      if (this.ready) {
        this.draw();
      }
    });
  }

  ngAfterViewInit(): void {
    const el = this.host()?.nativeElement;
    if (!el) {
      return;
    }
    const namespace = { ...shapes };
    this.graph = new dia.Graph({}, { cellNamespace: namespace });
    this.paper = new dia.Paper({
      el,
      model: this.graph,
      width: '100%',
      height: 420,
      gridSize: 1,
      async: true,
      sorting: dia.Paper.sorting.APPROX,
      background: { color: 'transparent' },
      interactive: false,
      cellViewNamespace: namespace,
    });
    this.ready = true;
    this.draw();
  }

  ngOnDestroy(): void {
    this.paper?.remove();
    this.graph = undefined;
    this.paper = undefined;
  }

  private draw(): void {
    if (!this.graph || !this.paper) {
      return;
    }
    this.graph.clear();
    const dark = this.theme.theme() === 'dark';
    const axis = dark ? '#93c5fd' : '#1d4ed8';
    const tick = dark ? '#dbeafe' : '#1e3a8a';
    const inflow = '#2563eb';
    const outflow = '#b91c1c';
    const label = dark ? '#e8eeff' : '#14233f';
    const muted = dark ? '#9db0d4' : '#4b5d86';

    const grouped = this.groupByPeriod(this.points());
    const periods = grouped.length ? grouped.map((g) => g.period) : [0, 1, 2, 3, 4, 5];
    const minP = Math.min(...periods);
    const maxP = Math.max(...periods);
    const span = Math.max(maxP - minP, 1);
    const width = this.paper.el.clientWidth || 960;
    const left = 70;
    const right = width - 40;
    const usable = Math.max(right - left, 200);
    const step = usable / span;
    const y0 = 210;
    const maxAbs = Math.max(...this.points().map((p) => Math.abs(p.amount)), 1);
    const xOf = (period: number) => left + (period - minP) * step;

    const axisLink = new shapes.standard.Link();
    axisLink.source({ x: left - 20, y: y0 });
    axisLink.target({ x: right + 10, y: y0 });
    axisLink.attr({
      line: {
        stroke: axis,
        strokeWidth: 2,
        targetMarker: { type: 'path', d: 'M 12 -6 0 0 12 6 z', fill: axis },
      },
    });
    axisLink.addTo(this.graph);

    const title = new shapes.standard.TextBlock();
    title.position(left - 20, 16);
    title.resize(280, 28);
    title.attr({
      body: { fill: 'transparent', stroke: 'transparent' },
      label: {
        text: 'Línea de tiempo de flujos',
        fill: label,
        fontFamily: 'PT Sans',
        fontSize: 16,
        fontWeight: '700',
        textAnchor: 'start',
        textVerticalAnchor: 'top',
      },
    });
    title.addTo(this.graph);

    for (const period of periods) {
      const x = xOf(period);
      const node = new shapes.standard.Circle();
      node.position(x - 7, y0 - 7);
      node.resize(14, 14);
      node.attr({
        body: { fill: tick, stroke: axis, strokeWidth: 1.5 },
      });
      node.addTo(this.graph);

      const nLabel = new shapes.standard.TextBlock();
      nLabel.position(x - 18, y0 + 14);
      nLabel.resize(36, 20);
      nLabel.attr({
        body: { fill: 'transparent', stroke: 'transparent' },
        label: { text: String(period), fill: muted, fontSize: 12, fontFamily: 'PT Sans' },
      });
      nLabel.addTo(this.graph);
    }

    const tLabel = new shapes.standard.TextBlock();
    tLabel.position(right - 10, y0 + 28);
    tLabel.resize(40, 20);
    tLabel.attr({
      body: { fill: 'transparent', stroke: 'transparent' },
      label: { text: 't', fill: muted, fontSize: 13, fontWeight: '700', fontFamily: 'PT Sans' },
    });
    tLabel.addTo(this.graph);

    for (const group of grouped) {
      const x = xOf(group.period);
      group.items.forEach((point, index) => {
        const up = point.amount >= 0;
        const magnitude = 40 + (Math.abs(point.amount) / maxAbs) * 110;
        const offset = index * 10;
        const yEnd = up ? y0 - magnitude - offset : y0 + magnitude + offset;
        const color = up ? inflow : outflow;
        const arrow = new shapes.standard.Link();
        arrow.source({ x, y: y0 });
        arrow.target({ x, y: yEnd });
        arrow.attr({
          line: {
            stroke: color,
            strokeWidth: 2.4,
            targetMarker: { type: 'path', d: 'M 10 -5 0 0 10 5 z', fill: color },
          },
        });
        arrow.addTo(this.graph!);

        const boxY = up ? yEnd - 46 : yEnd + 8;
        const box = new shapes.standard.Rectangle();
        box.position(x - 46, boxY);
        box.resize(92, 38);
        box.attr({
          body: {
            fill: dark ? '#10192e' : '#ffffff',
            stroke: color,
            strokeWidth: 1.2,
            rx: 8,
            ry: 8,
          },
          label: {
            text: `${point.label}\n${moneyFmt(point.amount)}`,
            fill: label,
            fontSize: 10,
            fontWeight: '700',
            fontFamily: 'PT Sans',
          },
        });
        box.addTo(this.graph!);
      });
    }
  }

  private groupByPeriod(points: TimelinePoint[]): { period: number; items: TimelinePoint[] }[] {
    const map = new Map<number, TimelinePoint[]>();
    for (const point of points) {
      const list = map.get(point.period) ?? [];
      list.push(point);
      map.set(point.period, list);
    }
    if (!map.size) {
      return Array.from({ length: 6 }, (_, period) => ({ period, items: [] }));
    }
    const min = Math.min(...map.keys());
    const max = Math.max(...map.keys());
    const groups: { period: number; items: TimelinePoint[] }[] = [];
    for (let period = min; period <= max; period += 1) {
      groups.push({ period, items: map.get(period) ?? [] });
    }
    return groups;
  }
}
