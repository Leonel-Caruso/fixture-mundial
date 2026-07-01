# Fixture Mundial 2026

## Proveedor gratis recomendado

Esta versión agrega soporte para `worldcup26.ir`, una API gratuita del Mundial 2026 sin API key.

En Render usá:

```env
API_PROVIDER=worldcup26
WORLDCUP26_BASE_URL=https://worldcup26.ir/get/games
```

Después hacé **Manual Deploy → Deploy latest commit**.

Endpoints útiles:

```txt
/api/health
/api/matches
/api/debug/worldcup26
```

---

# Fixture Mundial 2026

Proyecto frontend + backend Node/Express para un fixture circular con:

- modo **Fixture** oficial.
- modo **Grupos** con tablas completas.
- modo **Predicción**, guardado por navegador/dispositivo con `localStorage`.
- panel de **Partidos Hoy**.
- backend `/api/matches` para usar datos mock, ESPN o API-FOOTBALL.
- favicon de pelota dorada de contorno.

## Proveedor recomendado para este proyecto

Para usar datos gratis, configurar:

```env
API_PROVIDER=espn
```

ESPN no requiere API key. El backend consulta el scoreboard público de ESPN y lo normaliza al formato que usa el frontend.

## Ejecutar localmente

```bash
npm install
```

Copiar `.env.example` como `.env`:

```bash
cp .env.example .env
```

En Windows también podés hacerlo manualmente: duplicá `.env.example` y renombralo a `.env`.

Luego ejecutar:

```bash
npm start
```

Abrir:

```txt
http://localhost:3000
```

## Variables recomendadas en Render

En Render, dejar una sola variable principal:

```env
API_PROVIDER=espn
```

Opcionales:

```env
TOURNAMENT_START_DATE=2026-06-28
LOOKAHEAD_DAYS=30
ESPN_LIMIT=950
```

No hace falta `API_FOOTBALL_KEY` si usás ESPN.

## Verificar proveedor activo

Abrir:

```txt
https://tu-url.onrender.com/api/health
```

Debe devolver:

```json
{"provider":"espn"}
```

Luego revisar:

```txt
https://tu-url.onrender.com/api/matches
```

Si un partido aparece ahí con goles, el frontend lo va a mostrar y actualizar.

## Diagnóstico ESPN

Abrir:

```txt
https://tu-url.onrender.com/api/debug/espn
```

Devuelve:

- cantidad de eventos recibidos.
- partidos mapeados al fixture local.
- muestra de eventos que llegaron desde ESPN.

## Modo mock

Si usás:

```env
API_PROVIDER=mock
```

el backend lee solamente:

```txt
data/mock-live-results.json
```

Eso sirve para probar la interfaz, pero no consulta internet.

## API-FOOTBALL

También sigue existiendo soporte para:

```env
API_PROVIDER=api-football
API_FOOTBALL_KEY=TU_API_KEY
```

Pero el plan gratis de API-FOOTBALL puede no tener acceso a temporada 2026.


## Proveedor football-data.org

Esta versión permite usar:

```env
API_PROVIDER=football-data
FOOTBALL_DATA_KEY=TU_TOKEN_DE_FOOTBALL_DATA
FOOTBALL_DATA_BASE_URL=https://api.football-data.org/v4
FOOTBALL_DATA_COMPETITION=WC
TOURNAMENT_START_DATE=2026-06-28
LOOKAHEAD_DAYS=30
```

Endpoints de diagnóstico:

- `/api/health`
- `/api/matches`
- `/api/debug/football-data`

Importante: el plan gratuito de football-data.org incluye fixtures, tablas y scores demorados. Para marcador en vivo real hace falta el plan con livescores.


## Ajuste marcador football-data.org

Esta versión evita mostrar `2 (0) - 0 (0)` cuando football-data.org informa penalties en cero.
Solo muestra penales cuando realmente hubo definición por penales.

También evita inventar el minuto del partido usando la hora de inicio. Si el proveedor no informa minuto real,
la tarjeta muestra `EN VIVO` sin minuto para no mostrar un dato incorrecto cuando hay demoras o retrasos.
