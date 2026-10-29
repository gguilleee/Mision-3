import { useEffect, useState } from 'react';
import { obtenerTipos } from './api/pokeapi.js';
import { useFetch } from './hooks/useFetch.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { Cargando, MensajeError, Vacio } from './components/Estados.jsx';
import SelectorTipos from './components/SelectorTipos.jsx';
import Equipo, { TAMANO_EQUIPO } from './components/Equipo.jsx';
import Expedicion from './components/Expedicion.jsx';

const leerHash = () => decodeURIComponent(window.location.hash.slice(1));

export default function App() {
  const tipos = useFetch((signal) => obtenerTipos(signal), []);
  const [tipoActivo, setTipoActivo] = useState(leerHash);
  // El equipo vive aquí (lifting state up): lo usan las tarjetas de Expedicion y el panel Equipo.
  const [equipo, setEquipo] = useLocalStorage('reactor-core:equipo', []);

  // Sincroniza el tipo elegido con la URL (#ghost) para poder compartir el enlace.
  useEffect(() => {
    if (tipoActivo) window.history.replaceState(null, '', `#${tipoActivo}`);
  }, [tipoActivo]);

  // Si el usuario edita el hash a mano o usa atrás/adelante, la app lo sigue. Cleanup al desmontar.
  useEffect(() => {
    const alCambiarHash = () => setTipoActivo(leerHash());
    window.addEventListener('hashchange', alCambiarHash);
    return () => window.removeEventListener('hashchange', alCambiarHash);
  }, []);

  // Valores derivados: no se guardan en estado porque se calculan a partir de otros.
  const tipoValido = tipos.datos?.includes(tipoActivo) ? tipoActivo : null;
  const idsEquipo = new Set(equipo.map((p) => p.id));
  const equipoLleno = equipo.length >= TAMANO_EQUIPO;

  function alternarEnEquipo(pokemon) {
    setEquipo((actual) => {
      if (actual.some((p) => p.id === pokemon.id)) return actual.filter((p) => p.id !== pokemon.id);
      if (actual.length >= TAMANO_EQUIPO) return actual;
      return [...actual, pokemon];
    });
  }

  let selector;
  if (tipos.error) selector = <MensajeError mensaje={tipos.error.message} onReintentar={tipos.recargar} />;
  else if (!tipos.datos) selector = <Cargando mensaje="Cargando el mapa de tipos…" esqueletos={0} />;
  else if (tipos.datos.length === 0) selector = <Vacio mensaje="La API no ha devuelto ningún tipo." />;
  else selector = <SelectorTipos tipos={tipos.datos} activo={tipoValido} onElegir={setTipoActivo} />;

  return (
    <>
      <header className="cabecera">
        <p className="cabecera__antetitulo">Reactor Core · Misión 3</p>
        <h1 className="cabecera__titulo">Bitácora de tipos</h1>
        <p className="cabecera__lema">
          «Todo es un componente.» Elige un tipo, sal de expedición y recluta tu equipo de seis.
        </p>
      </header>

      <main className="contenido">
        <section aria-labelledby="titulo-tipos">
          <h2 id="titulo-tipos" className="seccion__titulo">1 · Elige destino</h2>
          {selector}
        </section>

        <section aria-labelledby="titulo-equipo">
          <h2 id="titulo-equipo" className="seccion__titulo">2 · Equipo de expedición</h2>
          <Equipo
            equipo={equipo}
            onQuitar={(id) => setEquipo((actual) => actual.filter((p) => p.id !== id))}
            onVaciar={() => setEquipo([])}
          />
        </section>

        {tipoValido && (
          <section aria-labelledby="titulo-expedicion">
            <h2 id="titulo-expedicion" className="seccion__titulo">3 · Diario de campo</h2>
            <Expedicion
              key={tipoValido}
              nombre={tipoValido}
              idsEquipo={idsEquipo}
              equipoLleno={equipoLleno}
              onAlternarEquipo={alternarEnEquipo}
            />
          </section>
        )}
      </main>

      <footer className="pie">
        Datos de{' '}
        <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer">
          PokeAPI
        </a>
        . Proyecto académico · U-tad · Web Development I.
      </footer>
    </>
  );
}
