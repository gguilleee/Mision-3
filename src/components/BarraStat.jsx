import { ETIQUETAS_STATS } from '../data/tipos.js';

const STAT_MAXIMA = 255;

export default function BarraStat({ clave, valor }) {
  const porcentaje = Math.min(100, (valor / STAT_MAXIMA) * 100);
  return (
    <div className="stat">
      <span className="stat__nombre">{ETIQUETAS_STATS[clave] ?? clave}</span>
      <span className="stat__barra">
        <span className="stat__relleno" style={{ width: `${porcentaje}%` }} />
      </span>
      <span className="stat__valor">{valor}</span>
    </div>
  );
}
