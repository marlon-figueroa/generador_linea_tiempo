const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

const number = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 6,
});

const percent = new Intl.NumberFormat('es-MX', {
  style: 'percent',
  maximumFractionDigits: 4,
});

export function moneyFmt(value: number): string {
  return money.format(value);
}

export function numFmt(value: number, digits = 6): string {
  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function pctFmt(rate: number): string {
  return percent.format(rate);
}

export function plainNumber(value: number, digits = 6): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return number.format(Number(value.toFixed(digits)));
}

export function factorFmt(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return value.toFixed(6);
}

export function copyText(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function tableToTsv(headers: string[], rows: (string | number)[][]): string {
  const line = (cells: (string | number)[]) => cells.map((cell) => String(cell)).join('\t');
  return [line(headers), ...rows.map(line)].join('\n');
}
