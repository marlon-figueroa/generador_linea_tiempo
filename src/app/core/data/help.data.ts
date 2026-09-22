export interface HelpTopic {
  id: string;
  term: string;
  category: string;
  summary: string;
  detail: string;
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'vp',
    term: 'Valor presente (P)',
    category: 'Equivalencias',
    summary: 'Cantidad equivalente hoy de un flujo futuro, descontada a la tasa de interés.',
    detail:
      'El valor presente traduce dinero de distintos momentos a t = 0. Un peso hoy no es igual a un peso mañana porque puede invertirse. Se obtiene con (P/F) para un pago único o (P/A) y (P/G) para series.',
  },
  {
    id: 'vf',
    term: 'Valor futuro (F)',
    category: 'Equivalencias',
    summary: 'Monto acumulado al final del horizonte si el capital gana interés.',
    detail:
      'F responde a “¿cuánto tendré en n períodos?”. Con interés compuesto F = P(1+i)^n. Con interés simple F = P(1+i·n). El último pago de una anualidad ordinaria coincide con F.',
  },
  {
    id: 'simple',
    term: 'Interés simple',
    category: 'Interés',
    summary: 'El interés se calcula siempre sobre el capital original.',
    detail:
      'I = P·i·t y F = P(1+i·t). No hay capitalización: los intereses no generan nuevos intereses. Se usa en descuentos cortos, pagarés y algunos créditos de consumo.',
  },
  {
    id: 'compuesto',
    term: 'Interés compuesto',
    category: 'Interés',
    summary: 'Los intereses se suman al capital y generan más intereses.',
    detail:
      'Cada período el saldo se multiplica por (1+i). A más capitalizaciones por año, mayor tasa efectiva para la misma nominal. Es el modelo estándar de ingeniería económica.',
  },
  {
    id: 'continuo',
    term: 'Capitalización continua',
    category: 'Interés',
    summary: 'Límite cuando el número de capitalizaciones tiende a infinito.',
    detail:
      'F = P e^{r t} e i_e = e^r − 1. Es útil como cota teórica y en modelos financieros de tiempo continuo. r es la fuerza de interés.',
  },
  {
    id: 'nominal',
    term: 'Tasa nominal (j)',
    category: 'Tasas',
    summary: 'Tasa anual anunciada que debe acompañarse de su período de capitalización.',
    detail:
      'Decir “12% anual” es incompleto. “12% anual capitalizable mensualmente” implica i = 1% mensual y i_e = (1.01)^12 − 1 ≈ 12.68%.',
  },
  {
    id: 'efectiva',
    term: 'Tasa efectiva (i_e)',
    category: 'Tasas',
    summary: 'Rendimiento real en un año, ya incorporada la capitalización.',
    detail:
      'i_e = (1 + j/m)^m − 1. Permite comparar créditos o inversiones con distintas frecuencias. Toda comparación de alternativas debe hacerse con tasas equivalentes.',
  },
  {
    id: 'cap',
    term: 'Capitalización',
    category: 'Tasas',
    summary: 'Frecuencia con la que el interés se incorpora al saldo.',
    detail:
      'Anual, semestral, cuatrimestral, trimestral, bimestral, mensual, semanal, diaria o continua. No debe confundirse con la frecuencia de pago de la serie, aunque a menudo coinciden.',
  },
  {
    id: 'pago',
    term: 'Frecuencia de pago',
    category: 'Series',
    summary: 'Cada cuánto ocurre el movimiento de efectivo (A, G o cuota).',
    detail:
      'Si la capitalización y el pago no coinciden, se convierte la tasa a una equivalente del período de pago. Ejemplo: nominal mensual y pagos trimestrales.',
  },
  {
    id: 'anualidad',
    term: 'Anualidad o serie uniforme (A)',
    category: 'Series',
    summary: 'Pagos de igual monto al final (ordinaria) o al inicio (anticipada) de cada período.',
    detail:
      'La ordinaria es la convención de las tablas. La anticipada vale (1+i) veces más en valor presente. El fondo de amortización (A/F) acumula un F; la recuperación de capital (A/P) paga un P.',
  },
  {
    id: 'diferida',
    term: 'Anualidad diferida',
    category: 'Series',
    summary: 'La serie empieza después de k períodos de gracia.',
    detail:
      'P = A[(P/A, i, n+k) − (P/A, i, k)]. Durante la gracia no hay pagos de la serie, aunque el tiempo sí descuenta.',
  },
  {
    id: 'perp',
    term: 'Perpetuidad',
    category: 'Series',
    summary: 'Serie infinita. P = A/i, o A/(i−g) si crece a tasa g < i.',
    detail:
      'Modela terrenos, fondos patrimoniales y costos capitalizados de obras de vida muy larga. El costo capitalizado es CC = P + A/i.',
  },
  {
    id: 'garit',
    term: 'Gradiente aritmético (G)',
    category: 'Gradientes',
    summary: 'Los pagos aumentan (o disminuyen) en una cantidad constante G.',
    detail:
      'Convención: el pago en t=1 es A, en t=2 es A+G, en t=3 es A+2G… El factor (P/G) convierte solo el triángulo de incrementos. El flujo completo es A(P/A)+G(P/G).',
  },
  {
    id: 'ggeom',
    term: 'Gradiente geométrico (g)',
    category: 'Gradientes',
    summary: 'Los pagos crecen a una tasa porcentual constante g.',
    detail:
      'Útil para inflación, salarios o demanda creciente. Si i ≠ g, P = A[1−((1+g)/(1+i))^n]/(i−g). Si i = g, P = A n/(1+i).',
  },
  {
    id: 'vpn',
    term: 'VPN o VP net',
    category: 'Evaluación',
    summary: 'Suma de flujos descontados a la TMAR. Se acepta si VPN ≥ 0.',
    detail:
      'Mide la creación de valor en pesos de hoy. Es el criterio más robusto cuando hay una tasa de descuento clara. No depende de la escala de la misma forma que la TIR.',
  },
  {
    id: 'tmar',
    term: 'TMAR',
    category: 'Evaluación',
    summary: 'Tasa mínima atractiva de retorno: el costo de oportunidad del capital.',
    detail:
      'Incluye costo de capital, riesgo e inflación según se defina. Es la i con la que se calcula el VPN, el CAUE y el B/C.',
  },
  {
    id: 'tir',
    term: 'TIR',
    category: 'Evaluación',
    summary: 'Tasa que hace VPN = 0. Se acepta el proyecto si TIR ≥ TMAR.',
    detail:
      'Se obtiene por métodos numéricos. Si hay más de un cambio de signo (flujos no convencionales) pueden existir varias TIR. En esos casos use VPN o TIRM.',
  },
  {
    id: 'tirm',
    term: 'TIRM',
    category: 'Evaluación',
    summary: 'TIR modificada: reinversión y financiamiento a tasas explícitas.',
    detail:
      'Los flujos positivos se llevan a F con la tasa de reinversión; los negativos a P con la de financiamiento. TIRM = (FV⁺/|PV⁻|)^{1/n} − 1. Evita la hipótesis de reinversión a la propia TIR.',
  },
  {
    id: 'caue',
    term: 'CAUE / CAE',
    category: 'Evaluación',
    summary: 'Costo o beneficio anual uniforme equivalente.',
    detail:
      'CAUE = VPN(A/P, i, n). Permite comparar máquinas o proyectos con vidas útiles distintas sin forzar un horizonte común, bajo el supuesto de repetibilidad.',
  },
  {
    id: 'bc',
    term: 'Relación beneficio/costo',
    category: 'Evaluación',
    summary: 'VP de beneficios entre VP de costos. Aceptar si B/C ≥ 1.',
    detail:
      'Muy usada en sector público. Para elegir entre mutuamente excluyentes se analiza el incremental ΔB/ΔC, no el B/C mayor en valor absoluto.',
  },
  {
    id: 'payback',
    term: 'Período de recuperación',
    category: 'Evaluación',
    summary: 'Tiempo en que el flujo acumulado recupera la inversión.',
    detail:
      'El simple ignora el valor del dinero en el tiempo; el descontado sí lo incorpora. Es un indicador de liquidez y riesgo, no de rentabilidad total.',
  },
  {
    id: 'dep',
    term: 'Depreciación',
    category: 'Depreciación',
    summary: 'Reparto sistemático del costo depreciable (C−S) a lo largo de la vida N.',
    detail:
      'Línea recta: cargo constante. Suma de dígitos y saldo decreciente: aceleradas. Unidades de producción: según uso. No es salida de efectivo, pero afecta impuestos y valor en libros.',
  },
  {
    id: 'tablas',
    term: 'Tablas de factores',
    category: 'Herramientas',
    summary: 'Valores tabulares de (F/P), (P/F), (P/A), (A/P), (F/A), (A/F), (P/G) y (A/G).',
    detail:
      'El catálogo de esta aplicación las genera para cualquier i y n, con más decimales que un libro. Sirven para verificar cálculos y para exámenes que piden interpolar.',
  },
  {
    id: 'linea',
    term: 'Línea de tiempo',
    category: 'Herramientas',
    summary: 'Diagrama de flujos en el eje temporal: P en 0, F en n, A y G en cada período.',
    detail:
      'Convención visual: flechas hacia arriba son entradas (beneficios) y hacia abajo salidas (costos). La escala y la frecuencia de pago determinan cuántos nodos se dibujan.',
  },
  {
    id: 'equiv-principio',
    term: 'Principio de equivalencia',
    category: 'Equivalencias',
    summary: 'Dos cantidades son equivalentes si, a la misma tasa, tienen el mismo valor en un instante.',
    detail:
      'Toda la ingeniería económica se reduce a mover dinero en el tiempo con factores consistentes. No se suman pesos de distintos períodos sin traerlos a un mismo punto.',
  },
];
