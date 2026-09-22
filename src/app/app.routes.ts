import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
      {
        path: 'equivalencias',
        loadComponent: () => import('./pages/equivalencias/equivalencias').then((m) => m.Equivalencias),
      },
      { path: 'tasas', loadComponent: () => import('./pages/tasas/tasas').then((m) => m.Tasas) },
      { path: 'series', loadComponent: () => import('./pages/series/series').then((m) => m.Series) },
      {
        path: 'gradientes',
        loadComponent: () => import('./pages/gradientes/gradientes').then((m) => m.Gradientes),
      },
      {
        path: 'evaluacion',
        loadComponent: () => import('./pages/evaluacion/evaluacion').then((m) => m.Evaluacion),
      },
      {
        path: 'depreciacion',
        loadComponent: () => import('./pages/depreciacion/depreciacion').then((m) => m.Depreciacion),
      },
      {
        path: 'linea-tiempo',
        loadComponent: () => import('./pages/linea-tiempo/linea-tiempo').then((m) => m.LineaTiempo),
      },
      { path: 'catalogo', loadComponent: () => import('./pages/catalogo/catalogo').then((m) => m.Catalogo) },
      { path: 'formulas', loadComponent: () => import('./pages/formulas/formulas').then((m) => m.Formulas) },
      { path: 'ayuda', loadComponent: () => import('./pages/ayuda/ayuda').then((m) => m.Ayuda) },
    ],
  },
  { path: '**', redirectTo: '' },
];
