# Fixture Mundial 2026

Versión corregida para que el fixture no quede detenido al terminar los 16avos.

## Cambios incluidos

- Se agregaron partidos de **octavos**, **cuartos**, **semifinales** y **final**.
- El panel lateral **Partidos Hoy** ya no mira solamente los 16avos: también revisa los cruces posteriores.
- Los cruces futuros se muestran aunque todavía falte definir algún equipo, usando textos tipo `Ganador Octavos 1`.
- Cuando la API o `data/manual-results.json` informa un ganador de octavos/cuartos/semis/final, el equipo avanza automáticamente en el gráfico.
- El backend `server/match-map.js` ahora tiene mapeo para todas las rondas posteriores, con candidatos por rama del cuadro.

## Ejecutar localmente

```bash
npm install
npm start
```

Abrir:

```txt
http://localhost:3000
```

## Resultados manuales de respaldo

Si la API gratuita tarda o no devuelve un partido, agregá/actualizá el partido en:

```txt
data/manual-results.json
```

Ejemplo para octavos:

```json
{
  "id": "r16-1",
  "status": "finished",
  "scoreA": "2",
  "scoreB": "1",
  "winnerId": "can",
  "minute": null
}
```

IDs disponibles:

- 16avos: `rsa-can`, `ned-mar`, `ger-par`, `fra-swe`, `bel-sen`, `usa-bih`, `esp-aut`, `por-cro`, `bra-jpn`, `civ-nor`, `mex-ecu`, `eng-cod`, `sui-alg`, `col-gha`, `aus-egy`, `arg-cpv`
- Octavos: `r16-1` a `r16-8`
- Cuartos: `qf-1` a `qf-4`
- Semifinales: `sf-1`, `sf-2`
- Final: `final`

## Proveedores

El servidor mantiene soporte para:

- `mock`
- `football-data`
- `worldcup26`
- `espn`
- `api-football`

Verificar configuración:

```txt
/api/health
/api/matches
/api/debug/config
```
