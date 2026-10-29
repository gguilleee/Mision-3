import { infoTipo } from '../data/tipos.js';

/** Etiqueta de color con el nombre del tipo en español. */
export default function InsigniaTipo({ tipo }) {
  const { es, color, claro } = infoTipo(tipo);
  return (
    <span className={`insignia${claro ? ' insignia--clara' : ''}`} style={{ '--color-tipo': color }}>
      {es}
    </span>
  );
}
