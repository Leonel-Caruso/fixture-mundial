# Fixture radial Mundial 1930-2026

Versión del fixture con selector de mundiales integrado en el título.

## Qué incluye

- Menú desplegable en **Mundial 2026** para elegir mundiales desde **1930 hasta 2026**.
- La misma página y estética radial dorada del proyecto original.
- Vista **Fixture** con cuadro circular dinámico según el formato de cada mundial.
- Vista **Grupos** con tablas calculadas desde los partidos de cada torneo.
- Vista **Predicción** reutilizada para poder tocar equipos y avanzar llaves cuando haya partidos sin definir.
- Panel derecho adaptado:
  - En 2026 muestra partidos de hoy.
  - En mundiales anteriores muestra resumen con campeón y final.

## Fuente de datos histórica

Los mundiales históricos se cargan desde el repositorio público `openfootball/worldcup.json` mediante el backend local:

```txt
/api/worldcup/:year
```

Ese endpoint descarga el JSON correspondiente desde:

```txt
https://raw.githubusercontent.com/openfootball/worldcup.json/master/{year}/worldcup.json
```

Por eso, para cambiar entre mundiales históricos, la PC necesita conexión a internet.

## Cómo correr

```bash
npm install
npm start
```

Luego abrir:

```txt
http://localhost:3000
```

## Nota importante sobre 2026

El Mundial 2026 se toma de `openfootball/worldcup.json`, que es una fuente abierta actualizada manualmente. No es una API live segundo a segundo. Si necesitás resultados en vivo exactos al instante, conviene seguir usando un proveedor live/API y mapearlo sobre el fixture.

## Archivos principales modificados

- `index.html`: se mantiene la estructura, el título se transforma por JS en selector desplegable.
- `script.js`: reescrito para soportar múltiples mundiales y fixture radial dinámico.
- `style.css`: agregados estilos para selector, resumen y estados de carga.
- `server/server.js`: agregado endpoint `/api/worldcup/:year`.
