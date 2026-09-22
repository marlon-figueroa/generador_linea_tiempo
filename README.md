# Ingeniería económica · Línea de tiempo

Aplicación en **Angular 22**, **Bootstrap 5.3** y **JointJS** para equivalencias, tasas, series, gradientes, VPN/TIR, depreciación, tablas de factores, generador de fórmulas y diagrama de línea de tiempo.

## Desarrollo local

```bash
npm install
npm start
```

Abra [http://localhost:4200/](http://localhost:4200/). El enrutado usa hash (`/#/equivalencias`) para que las rutas funcionen también en GitHub Pages.

## Publicar en GitHub Pages

El sitio se construye con `baseHref` relativo (`./`) y se publica el contenido de `dist/ie-economica/browser`.

1. Cree un repositorio en GitHub y suba **esta carpeta** como raíz del repo (no el directorio padre).
2. En el repositorio: **Settings → Pages → Source: GitHub Actions**.
3. Haga push a `main` (o `master`), o ejecute el workflow **Deploy GitHub Pages** a mano.

La URL quedará:

`https://<usuario>.github.io/<nombre-del-repo>/`

Ejemplo, si el repo se llama `generador_linea_tiempo`:

`https://<usuario>.github.io/generador_linea_tiempo/`

### Publicar en local (vista previa del artefacto)

```bash
npm run build:gh-pages
```

Eso genera `dist/ie-economica/browser` con `index.html`, `404.html` y `.nojekyll`. Puede servir esa carpeta con cualquier servidor estático.

El workflow está en `.github/workflows/deploy-pages.yml`. Usa Node 24, `npm ci` y `actions/deploy-pages`.
