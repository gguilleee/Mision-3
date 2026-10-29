# Reactor Core · Bitácora de tipos

> «Todo es un componente.»

Misión 3 de **Web Development I, the Client** (U-tad, 2026–2027).

Reconstrucción en **React 19** (con Vite) de mi app de la Misión 2. Sigue siendo un **cuaderno de
campo** sobre la [PokeAPI](https://pokeapi.co): eliges un tipo (Fuego, Agua, Fantasma…) y sales de
expedición a ese territorio. Ahora la interfaz reacciona al estado en vez de pintarse a mano.

- **Ficha del tipo**: contra qué tipos es fuerte, ante cuáles es débil y a cuáles es inmune.
- **Tarjetas** de cada especie con ilustración, medidas y barras de estadísticas.
- **Resumen calculado** de lo que hay en pantalla y con qué otros tipos se combina el explorado.
- **Búsqueda** por nombre o número, **ordenación** y paginación con **"Cargar más"** (24 por página).
- **Novedad: equipo de expedición.** Puedes reclutar hasta 6 Pokémon de cualquier tipo desde sus
  tarjetas. El equipo se guarda en `localStorage`, sobrevive a recargar la página y muestra su
  media de stats y los tipos que cubre.
- Caché de respuestas en `localStorage` con contador red/caché y botón para vaciarla.
- Se puede abrir un tipo por URL, por ejemplo `http://localhost:5173/#ghost`.

## Cómo probarlo

Requisitos: Node.js 20.19+ o 22.12+.

```bash
npm install
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # versión de producción en /dist
npm run preview   # sirve el build para probarlo
```

## Estructura

```
src/
├── main.jsx                 # Punto de entrada: monta <App /> en StrictMode
├── App.jsx                  # Tipo elegido (sincronizado con el #hash) y equipo
├── style.css
├── components/
│   ├── Expedicion.jsx       # Diario de campo de un tipo: búsqueda, orden, páginas
│   ├── SelectorTipos.jsx    # Botones de tipo
│   ├── FichaTipo.jsx        # Relaciones de daño
│   ├── Controles.jsx        # Buscador, orden y "Vaciar caché" (componente controlado)
│   ├── BarraEstado.jsx      # "Mostrando X de Y · N red, M caché · ⚠ fallos"
│   ├── Resumen.jsx          # Cifras derivadas de la lista visible
│   ├── ListaPokemon.jsx     # Rejilla de tarjetas
│   ├── TarjetaPokemon.jsx   # Una tarjeta, con botón para el equipo
│   ├── BarraStat.jsx, InsigniaTipo.jsx, Ilustracion.jsx
│   ├── Equipo.jsx           # Panel del equipo de expedición
│   └── Estados.jsx          # Cargando, MensajeError y Vacio
├── hooks/
│   ├── useFetch.js          # Peticiones con estados y cancelación (bonus)
│   ├── useLocalStorage.js   # useState persistente (bonus)
│   └── useDebounce.js       # Retrasa un valor 300 ms
├── api/
│   ├── http.js              # Único sitio con fetch: response.ok, timeout, caché, errores
│   └── pokeapi.js           # Endpoints y carga en paralelo con allSettled
├── lib/
│   ├── adaptadores.js       # JSON crudo → objetos pequeños, y validación de la caché
│   ├── transform.js         # Ordenar, filtrar, resumir, agrupar (funciones puras)
│   ├── cache.js             # Caché con caducidad de 24 h
│   └── formato.js           # Nombres y números para mostrar
└── data/
    └── tipos.js             # Nombre en español y color de cada tipo
```

Los componentes no hacen `fetch`: piden los datos a través de `useFetch` y las funciones de `api/`.
`lib/` son funciones puras sin React, que se pueden probar por separado.

## Cómo cumple cada criterio

### Componentización
- Componentes pequeños con una responsabilidad y props con nombre claro: `TarjetaPokemon` recibe
  `pokemon`, `enEquipo`, `equipoLleno` y `onAlternarEquipo`, y no sabe nada de la API ni de dónde
  se guarda el equipo.
- Los estados de carga, error y vacío son componentes reutilizables (`Estados.jsx`) que se usan
  tanto para la lista de tipos como para la expedición.
- `App` solo coordina; la lógica de un tipo vive en `Expedicion`.

### Gestión de estado
- **Estado mínimo**: en `Expedicion` solo hay `busqueda`, `orden`, `limite` y `aviso`. Todo lo
  demás (Pokémon visibles, lista ordenada, resumen, "quedan N", fallos) se **deriva** en cada render.
- **Lifting state up**: el equipo vive en `App`, porque lo necesitan las tarjetas (para marcar
  quién está dentro) y el panel `Equipo`. Los hijos solo avisan con callbacks.
- **Reinicio con `key`**: `App` monta `<Expedicion key={tipo} />`, así al cambiar de tipo React
  crea una expedición nueva y la búsqueda, el orden y la página vuelven a su valor inicial.
- Las actualizaciones que dependen del valor anterior usan la forma funcional
  (`setLimite((actual) => actual + 24)`, `setEquipo((actual) => …)`).

### Efectos
Solo hay `useEffect` para sincronizar con sistemas externos, cada uno con sus dependencias:
- `useFetch`: lanza la petición y su **cleanup la aborta con `AbortController`** si cambian las
  dependencias o se desmonta el componente.
- `useDebounce`: temporizador con cleanup `clearTimeout`.
- `useLocalStorage`: escribe en `localStorage` cuando cambia el valor.
- `App`: escribe el tipo en el `#hash` y escucha `hashchange` (cleanup con `removeEventListener`).

Filtrar, ordenar y calcular el resumen **no** usan efectos: se calculan durante el render.

### Listas y condicionales
- Keys estables: el id de Pokédex en tarjetas y equipo, el nombre del tipo en botones e insignias.
- Condicionales legibles: cada vista decide con una cadena `if / else if` antes del `return`
  (error → cargando → vacío → contenido), sin ternarios anidados en el JSX.
- Eventos: inputs controlados (`value` + `onChange`) y botones con `aria-pressed` para el equipo
  y el tipo activo.

### Robustez (heredada de la Misión 2 y mejorada)
- `http.js` comprueba `response.ok`, lanza un `ErrorHttp` legible, corta a los 8 s y distingue
  timeout, sin conexión y fallo de red.
- `Promise.allSettled`: si un Pokémon falla, el resto se muestra y se avisa con "reintentar".
- Lo que se lee de la caché se **valida** (`esPokemonValido`, `esTipoValido`): una entrada con
  forma rara se ignora y se vuelve a pedir a la red.
- Imágenes rotas → marcador "?". Todo el texto se pinta con JSX, que escapa el contenido.

### Bonus: custom hooks
`useFetch` (genérico: recibe cualquier función que devuelva una promesa), `useLocalStorage` y
`useDebounce`.

## Uso de IA

Usé un asistente de IA. La IA generó el código de esta versión en React (componentes, hooks,
estilos nuevos) y este README, partiendo del código de mi Misión 2.

Prompts relevantes:

- Le pasé una captura con el enunciado y la rúbrica de la Misión 3 y le pedí: *"como
  instrucciones te digo de sacar en torno a un 90"*.
- Elegí la opción de que pasara mi app de la Misión 2 a React 19 cuidando la rúbrica:
  componentes pequeños, estado mínimo con valores derivados, `useEffect` con cleanup, keys
  estables y el bonus de un hook `useFetch`.

Cómo se verificó:

- `npm run build` compila sin errores.
- Se ejecutó una prueba automática en un navegador (Playwright) con respuestas simuladas de la
  PokeAPI: carga del tipo, Pokémon que falla (aviso "1 no se pudieron cargar"), "Cargar más",
  ordenación, búsqueda con y sin resultados, equipo guardado tras recargar, segunda carga desde
  la caché, error 404 legible al abrir un tipo que no existe, reinicio de la búsqueda al cambiar
  de tipo y entrada corrupta en la caché ignorada.
- Probé la app en el navegador con `npm run dev` contra la PokeAPI real.

Mi trabajo: decidir rehacer la Misión 2 en React en lugar de empezar otra app, darle la rúbrica,
subir el proyecto en commits por fases, probarlo en el navegador y revisar el código para poder
defenderlo.

## Autopsia

1. **El estado de la expedición se reinicia con `key`, no con un efecto.** Al cambiar de tipo, la
   búsqueda, el orden y la página tienen que volver a empezar. Descarté un
   `useEffect(() => { setBusqueda(''); … }, [tipo])`: provoca un render extra con el estado viejo
   (se vería un instante el filtro del tipo anterior) y es fácil olvidar reiniciar algún campo.
   Con `<Expedicion key={tipo} />` React desmonta la expedición anterior, aborta sus peticiones
   por el cleanup de `useFetch` y monta una nueva con el estado inicial.

2. **Las peticiones viejas ahora se cancelan con `AbortController`.** En la Misión 2 usaba un
   contador `turno` para ignorar respuestas tardías, y la corrección señalaba que no se
   cancelaban de verdad. En React el sitio natural es el cleanup de `useFetch`: cada vez que
   cambia la página o el tipo se aborta la petición anterior. Para que una cancelación no se
   muestre como "No se pudo conectar", `http.js` deja pasar el `AbortError` sin traducirlo y
   `useFetch` lo ignora. El coste es pasar la señal por `pokeapi.js` y `http.js`.

3. **El equipo vive en `App` y baja por props, sin Context.** Solo lo usan dos ramas (el panel
   `Equipo` y las tarjetas de `Expedicion`), así que subir el estado al padre común basta. Un
   Context sería más cómodo si muchos componentes lo necesitaran, pero aquí escondería de dónde
   viene el dato.

## Créditos

Datos e imágenes: [PokeAPI](https://pokeapi.co) y su repositorio de sprites. Pokémon y sus nombres
son marcas de Nintendo / Game Freak / The Pokémon Company. Proyecto con fines exclusivamente
educativos.
