import { nombreBonito } from '../lib/formato.js';
import InsigniaTipo from './InsigniaTipo.jsx';
import Ilustracion from './Ilustracion.jsx';

export const TAMANO_EQUIPO = 6;

/**
 * Equipo de expedición: hasta 6 Pokémon de cualquier tipo, guardado en localStorage.
 * Todas las cifras (huecos, media, tipos cubiertos) se derivan de `equipo` en cada render.
 */
export default function Equipo({ equipo, onQuitar, onVaciar }) {
  if (equipo.length === 0) {
    return (
      <p className="estado estado--vacio">
        Tu equipo está vacío. Pulsa «+ Al equipo» en cualquier tarjeta para reclutar hasta {TAMANO_EQUIPO} Pokémon.
      </p>
    );
  }

  const huecos = TAMANO_EQUIPO - equipo.length;
  const mediaTotal = Math.round(equipo.reduce((suma, p) => suma + p.total, 0) / equipo.length);
  const tiposCubiertos = [...new Set(equipo.flatMap((p) => p.tipos))];

  return (
    <div className="equipo">
      <ul className="equipo__miembros">
        {equipo.map((p) => (
          <li key={p.id} className="miembro">
            <Ilustracion src={p.imagen} nombre={p.nombre} tamano={64} />
            <span className="miembro__nombre">{nombreBonito(p.nombre)}</span>
            <button
              type="button"
              className="miembro__quitar"
              aria-label={`Quitar a ${nombreBonito(p.nombre)} del equipo`}
              onClick={() => onQuitar(p.id)}
            >
              ×
            </button>
          </li>
        ))}
        {Array.from({ length: huecos }, (_, i) => (
          <li key={`hueco-${i}`} className="miembro miembro--hueco" aria-hidden="true" />
        ))}
      </ul>
      <div className="equipo__datos">
        <p>
          <strong>{equipo.length}</strong>/{TAMANO_EQUIPO} reclutados · media de stats <strong>{mediaTotal}</strong>
        </p>
        <p className="equipo__tipos">
          Tipos cubiertos ({tiposCubiertos.length}):{' '}
          {tiposCubiertos.map((t) => (
            <InsigniaTipo key={t} tipo={t} />
          ))}
        </p>
        <button type="button" className="boton boton--secundario" onClick={onVaciar}>
          Disolver equipo
        </button>
      </div>
    </div>
  );
}
