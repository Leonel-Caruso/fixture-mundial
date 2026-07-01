# Fixture Radial World Cup

Proyecto frontend + backend local para fixture circular con:

- modo **Fixture**: solo resultados oficiales, sin permitir tocar el bracket.
- modo **Predicción**: permite elegir ganadores y guarda la predicción en `localStorage`. La predicción se guarda por navegador/dispositivo, no en el servidor.
- panel derecho con partidos del día: pendientes, en vivo y horarios.
- botón **Grupos** con tablas completas de fase de grupos: PTS, PJ, PG, PE, PP, GF, GC y DG.
- partículas doradas animadas de fondo, sin bloquear la interacción.
- backend local `/api/matches` para consumir resultados desde una API externa o desde mock.

## Cómo ejecutarlo

1. Abrí la carpeta en Visual Studio Code.
2. Instalá dependencias:

```bash
npm install
```

3. Copiá `.env.example` como `.env`.
4. Ejecutá:

```bash
npm start
```

5. Abrí en el navegador:

```txt
http://localhost:3000
```

## Modo mock

Por defecto el proyecto usa:

```env
API_PROVIDER=mock
```

Eso lee el archivo:

```txt
data/mock-live-results.json
```

Sirve para probar la interfaz sin API key.

## Modo API real

Para que se actualice solo con resultados reales:

1. Conseguí una API key de API-Football / API-SPORTS.
2. En `.env` configurá:

```env
API_PROVIDER=api-football
API_FOOTBALL_KEY=TU_API_KEY
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
```

3. Reiniciá el servidor.

El frontend llama cada 30 segundos a:

```txt
/api/matches
```

Si un partido terminó, el backend devuelve `winnerId` y el fixture oficial avanza automáticamente.

## Importante

El archivo `index.html` solo no puede actualizar resultados reales. Para eso hay que correr el backend con `npm start`, porque el backend es el que consulta la API externa.


## Editar grupos

Los grupos se cargan desde la constante `GROUPS` en `script.js`.

Cada fila usa este formato:

```js
groupTeam("arg", PJ, PG, PE, PP, GF, GC, PTS)
```

La diferencia de gol se calcula automáticamente como `GF - GC`.


## Cambios de esta versión

- Se agregó un selector visual de torneo **Mundial 2026** con flecha, preparado para sumar otros mundiales más adelante.
- Se ordenó la navegación lateral para que todos los botones mantengan el mismo ancho y alto.
- Se achicó y desplazó la vista de grupos para que no moleste los botones laterales.
- Se aplicó scrollbar dorado al panel de grupos, tablas y scroll general.
- Se corrigió México vs Ecuador a las **23:00 hs**. Además, el frontend ya no muestra un partido como “EN VIVO” antes de su horario de inicio, aunque llegue un estado externo prematuro.
- Se corrigió la tabla de grupos para mostrar columnas completas y ordenadas: PTS, PJ, PG, PE, PP, GF, GC y DG.


## Cambios responsive finales

- En pantallas chicas la navegación pasa a menú hamburguesa para no tapar el fixture circular.
- El fixture queda limpio arriba y el panel de partidos aparece debajo.
- El panel de partidos muestra los encuentros del día y también partidos que siguen en vivo aunque hayan cruzado la medianoche.
- La predicción sigue guardándose por dispositivo/navegador mediante `localStorage`.

## Nota para URL pública

Para una URL pública con actualización automática, desplegar como Web Service Node/Express y configurar las variables de entorno en el hosting. El frontend consulta `/api/matches` cada 30 segundos. La predicción de cada usuario se guarda en el navegador con `localStorage`, por lo tanto cada PC o celular mantiene su propia predicción.

En producción se recomienda usar `API_PROVIDER=api-football` y cargar `API_FOOTBALL_KEY` como variable de entorno, no dentro del repositorio.


## Ajuste de partido en vivo

Esta versión vuelve a activar un fallback visual: si el horario de inicio ya pasó y la API todavía no informó el estado `live`, el partido se muestra como **EN VIVO** con marcador **0 - 0** hasta que llegue el dato real de la API. Si la API informa goles, minuto o final, esos datos reemplazan al fallback automáticamente.

También se cambió el título superior a **Fixture** y se agregó un ícono visual de pelota dorada hecho con CSS, sin depender de imágenes externas.
