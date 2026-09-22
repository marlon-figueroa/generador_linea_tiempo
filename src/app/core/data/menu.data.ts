export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
}

export const APP_MENU: NavItem[] = [
  { id: 'home', label: 'Inicio', icon: 'bi-house-door', route: '/' },
  {
    id: 'equiv',
    label: 'Equivalencias',
    icon: 'bi-arrow-left-right',
    children: [
      { id: 'vpvf', label: 'Valor presente y futuro', icon: 'bi-cash-stack', route: '/equivalencias' },
      { id: 'tasas', label: 'Tasas y capitalización', icon: 'bi-percent', route: '/tasas' },
    ],
  },
  {
    id: 'series',
    label: 'Series de pagos',
    icon: 'bi-repeat',
    children: [
      { id: 'anualidades', label: 'Anualidades y perpetuidades', icon: 'bi-calendar3', route: '/series' },
      { id: 'gradientes', label: 'Gradientes A y G', icon: 'bi-graph-up-arrow', route: '/gradientes' },
    ],
  },
  {
    id: 'eval',
    label: 'Evaluación de proyectos',
    icon: 'bi-clipboard-data',
    children: [
      { id: 'vpn-tir', label: 'VPN, TIR y TIRM', icon: 'bi-calculator', route: '/evaluacion' },
      { id: 'dep', label: 'Depreciación', icon: 'bi-building-down', route: '/depreciacion' },
    ],
  },
  {
    id: 'tools',
    label: 'Herramientas',
    icon: 'bi-tools',
    children: [
      { id: 'timeline', label: 'Línea de tiempo', icon: 'bi-bezier2', route: '/linea-tiempo' },
      { id: 'catalog', label: 'Catálogo de tablas', icon: 'bi-table', route: '/catalogo' },
      { id: 'formulas', label: 'Generador de fórmulas', icon: 'bi-sigma', route: '/formulas' },
    ],
  },
  { id: 'help', label: 'Índice de ayuda', icon: 'bi-journal-text', route: '/ayuda' },
];
