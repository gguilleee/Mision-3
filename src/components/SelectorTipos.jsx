import { infoTipo } from '../data/tipos.js';

/** Botones para elegir el tipo a explorar. El estado vive en App: aquí solo se avisa con onElegir. */
export default function SelectorTipos({ tipos, activo, onElegir }) {
  return (
    <div className="tipos">
      {tipos.map((tipo) => (
        <button
          key={tipo}
          type="button"
          className="tipo"
          aria-pressed={tipo === activo}
          style={{ '--color-tipo': infoTipo(tipo).color }}
          onClick={() => onElegir(tipo)}
        >
          {infoTipo(tipo).es}
        </button>
      ))}
    </div>
  );
}
