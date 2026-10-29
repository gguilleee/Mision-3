import { useMemo, useState } from 'react';
import { obtenerTipo, obtenerVariosPokemon } from '../api/pokeapi.js';
import { tomarMetricas } from '../api/http.js';
import { vaciarCache } from '../lib/cache.js';
import { ordenar, filtrarPorNombre } from '../lib/transform.js';
import { infoTipo } from '../data/tipos.js';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { Cargando, MensajeError, Vacio } from './Estados.jsx';
import FichaTipo from './FichaTipo.jsx';
import Controles from './Controles.jsx';
import BarraEstado from './BarraEstado.jsx';
import Resumen from './Resumen.jsx';
import ListaPokemon from './ListaPokemon.jsx';

const POR_PAGINA = 24;

/**
 * Diario de campo de UN tipo. App lo monta con key={nombre}: al cambiar de tipo,
 * React crea una Expedicion nueva y búsqueda, orden y página vuelven a su valor inicial
 * sin ningún useEffect que los reinicie.
 */
export default function Expedicion({ nombre, idsEquipo, equipoLleno, onAlternarEquipo }) {
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('id');
  const [limite, setLimite] = useState(POR_PAGINA);
  const [aviso, setAviso] = useState('');

  const tipo = useFetch((signal) => obtenerTipo(nombre, signal), [nombre]);

  // El filtrado espera 300 ms sin teclear: así no se lanza una carga por cada letra.
  const busquedaAplicada = useDebounce(busqueda, 300);
  const referencias = useMemo(
    () => filtrarPorNombre(tipo.datos?.pokemon ?? [], busquedaAplicada),
    [tipo.datos, busquedaAplicada],
  );

  // Ids de la página actual. La clave en texto es la dependencia del efecto de carga.
  const idsPagina = referencias.slice(0, limite).map((ref) => ref.id);
  const clavePagina = idsPagina.join(',');

  const detalles = useFetch(async (signal) => {
    if (idsPagina.length === 0) return { pokemon: [], perdidos: 0, metricas: tomarMetricas() };
    const resultado = await obtenerVariosPokemon(idsPagina, signal);
    return { ...resultado, metricas: tomarMetricas() };
  }, [clavePagina]);

  // Valor derivado: los Pokémon cargados que pertenecen a la página actual, ya ordenados.
  // Mientras llega una página nueva se siguen viendo los que ya estaban.
  const enPagina = new Set(idsPagina);
  const lista = ordenar((detalles.datos?.pokemon ?? []).filter((p) => enPagina.has(p.id)), orden);
  const perdidos = detalles.cargando ? 0 : (detalles.datos?.perdidos ?? 0);

  function buscar(texto) {
    setBusqueda(texto);
    setLimite(POR_PAGINA);
    setAviso('');
  }

  function borrarCache() {
    const borradas = vaciarCache();
    setAviso(`Caché vaciada: ${borradas} respuestas eliminadas. Las próximas cargas irán a la red.`);
  }

  const { es } = infoTipo(nombre);

  if (tipo.error) return <MensajeError mensaje={tipo.error.message} onReintentar={tipo.recargar} />;
  if (!tipo.datos) return <Cargando mensaje={`Preparando la expedición al tipo ${es}…`} />;
  if (tipo.datos.pokemon.length === 0) {
    return (
      <>
        <FichaTipo tipo={tipo.datos} />
        <Vacio mensaje="Este territorio está desierto: no hay Pokémon de este tipo." />
      </>
    );
  }

  let resultados;
  if (referencias.length === 0) {
    resultados = <Vacio mensaje={`Ningún Pokémon de tipo ${es} coincide con «${busquedaAplicada}».`} />;
  } else if (lista.length > 0) {
    resultados = (
      <ListaPokemon lista={lista} idsEquipo={idsEquipo} equipoLleno={equipoLleno} onAlternarEquipo={onAlternarEquipo} />
    );
  } else if (detalles.cargando) {
    resultados = <Cargando mensaje={`Avistando ${idsPagina.length} Pokémon…`} />;
  } else {
    resultados = <MensajeError mensaje="No se pudo cargar ningún Pokémon de esta página." onReintentar={detalles.recargar} />;
  }

  const quedan = referencias.length - Math.min(limite, referencias.length);

  return (
    <>
      <FichaTipo tipo={tipo.datos} />
      <Controles
        busqueda={busqueda}
        onBuscar={buscar}
        orden={orden}
        onOrdenar={setOrden}
        onVaciarCache={borrarCache}
      />
      <BarraEstado
        mostrados={lista.length}
        coincidencias={referencias.length}
        perdidos={perdidos}
        metricas={detalles.datos?.metricas}
        aviso={aviso}
        onReintentar={detalles.recargar}
      />
      <Resumen lista={lista} tipoActual={nombre} />
      <div className="resultados">{resultados}</div>
      {quedan > 0 && lista.length > 0 && (
        <div className="mas">
          <button
            className="boton"
            type="button"
            disabled={detalles.cargando}
            onClick={() => setLimite((actual) => actual + POR_PAGINA)}
          >
            {detalles.cargando ? 'Avistando…' : `Cargar más (${quedan} restantes)`}
          </button>
        </div>
      )}
    </>
  );
}
